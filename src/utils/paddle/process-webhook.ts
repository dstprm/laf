import {
  CustomerCreatedEvent,
  CustomerUpdatedEvent,
  EventEntity,
  EventName,
  SubscriptionCreatedEvent,
  SubscriptionUpdatedEvent,
  TransactionCompletedEvent,
  TransactionPaymentFailedEvent,
  TransactionPastDueEvent,
} from '@paddle/paddle-node-sdk';
import { createCustomer } from '@/utils/database/customer';
import { getUserByEmail } from '@/utils/database/user';
import { upsertSubscription } from '@/utils/database/subscription';
import { sendPaymentSuccessEmail, sendBillingFailureEmail, sendPlanCancellationEmail } from '@/utils/email/send-email';
import { prisma } from '@/lib/prisma';
import { convertAmountFromLowestUnit } from '@/utils/paddle/parse-money';

/**
 * Processes Paddle webhooks into local side effects.
 *
 * Responsibilities:
 * - Sync Subscription status and items
 * - Create/Update Customer link to User (when possible)
 * - Upsert Payment analytics (idempotent by paddleTransactionId)
 * - Send transactional emails on key events
 */
export class ProcessWebhook {
  async processEvent(eventData: EventEntity) {
    console.log(`🔄 Processing event: ${eventData.eventType}`);
    switch (eventData.eventType) {
      case EventName.SubscriptionCreated:
      case EventName.SubscriptionUpdated:
        await this.updateSubscriptionData(eventData);
        break;
      case EventName.CustomerCreated:
      case EventName.CustomerUpdated:
        await this.updateCustomerData(eventData);
        break;
      case EventName.TransactionCompleted:
        await this.handleTransactionCompleted(eventData);
        break;
      case EventName.TransactionPaymentFailed:
        await this.handlePaymentFailed(eventData);
        break;
      case EventName.TransactionPastDue:
        await this.handleTransactionPastDue(eventData);
        break;
    }
  }

  private async updateSubscriptionData(eventData: SubscriptionCreatedEvent | SubscriptionUpdatedEvent) {
    console.log(`🔄 Subscription ${eventData.eventType}: ${eventData.data.id} (status: ${eventData.data.status})`);

    // Check if subscription was canceled due to billing failures
    if (eventData.data.status === 'canceled' && eventData.eventType === EventName.SubscriptionUpdated) {
      console.log(
        `🚫 Subscription ${eventData.data.id} automatically canceled by Paddle (likely due to payment failures)`,
      );

      try {
        // Send cancellation email for automatic cancellations
        await this.sendAutomaticCancellationNotification(eventData);
      } catch (emailError) {
        console.error('❌ Error sending automatic cancellation email:', emailError);
        // Don't fail the webhook for email errors
      }
    }

    await upsertSubscription({
      subscriptionId: eventData.data.id,
      subscriptionStatus: eventData.data.status,
      priceId: eventData.data.items[0].price?.id ?? '',
      productId: eventData.data.items[0].price?.productId ?? '',
      scheduledChange: eventData.data.scheduledChange?.effectiveAt,
      paddleCustomerId: eventData.data.customerId,
    });

    // No local scheduling logic enabled by default; we follow Paddle's immediate-swap semantics.
  }

  private async updateCustomerData(eventData: CustomerCreatedEvent | CustomerUpdatedEvent) {
    // Check if we already have this user in our system (from Clerk)
    const existingUser = await getUserByEmail(eventData.data.email);

    if (existingUser) {
      // User exists, create customer record if it doesn't exist
      if (!existingUser.customer) {
        await createCustomer({
          userId: existingUser.id,
          paddleCustomerId: eventData.data.id,
        });
        console.log(`✅ Created customer record for user: ${existingUser.email}`);
      }
    } else {
      // This is a customer who paid without signing up first (edge case)
      // We'll skip creating anything - they'll get synced when they sign up
      console.log(`⚠️ Paddle customer ${eventData.data.id} has no corresponding user account`);
    }
  }

  private async handleTransactionCompleted(eventData: TransactionCompletedEvent) {
    console.log(`💰 Transaction completed: ${eventData.data.id}`);

    // If this transaction is for a subscription, update the subscription data
    if (eventData.data.subscriptionId) {
      console.log(`🔄 Transaction for subscription: ${eventData.data.subscriptionId}`);

      try {
        // Send payment success email
        await this.sendPaymentSuccessNotification(eventData);
      } catch (emailError) {
        console.error('❌ Error sending payment success email:', emailError);
        // Don't fail the webhook for email errors
      }

      console.log(
        `✅ Trial conversion completed - subscription ${eventData.data.subscriptionId} now has successful payment`,
      );
    }

    // Persist payment for analytics
    try {
      const paddleCustomerId = eventData.data.customerId;
      if (!paddleCustomerId) return;

      const customer = await prisma.customer.findUnique({
        where: { paddleCustomerId },
        select: { id: true },
      });

      // Normalize amount in major units (e.g., USD dollars)
      const currency = eventData.data.currencyCode || 'USD';
      const rawTotal = eventData.data.details?.totals?.total || '0';
      const rawSubtotal = eventData.data.details?.totals?.subtotal || '0';
      const rawTax = eventData.data.details?.totals?.tax || '0';
      const amountNumber = convertAmountFromLowestUnit(rawTotal, currency);
      const subtotalNumber = convertAmountFromLowestUnit(rawSubtotal, currency);
      const taxNumber = convertAmountFromLowestUnit(rawTax, currency);

      await prisma.payment.upsert({
        where: { paddleTransactionId: eventData.data.id },
        update: {
          amount: amountNumber,
          subtotal: subtotalNumber,
          tax: taxNumber,
          currency,
          status: eventData.data.status || 'completed',
          subscriptionId: eventData.data.subscriptionId || null,
          paddleCustomerId,
          customerId: customer?.id ?? null,
        },
        create: {
          paddleTransactionId: eventData.data.id,
          paddleCustomerId,
          customerId: customer?.id ?? null,
          subscriptionId: eventData.data.subscriptionId || null,
          amount: amountNumber,
          subtotal: subtotalNumber,
          tax: taxNumber,
          currency,
          status: eventData.data.status || 'completed',
        },
      });
    } catch (persistError) {
      console.error('❌ Error persisting payment analytics:', persistError);
    }
  }

  private async handlePaymentFailed(eventData: TransactionPaymentFailedEvent) {
    console.log(`❌ Payment failed for transaction: ${eventData.data.id}`);

    if (eventData.data.subscriptionId) {
      console.log(`💳 Payment failed for subscription: ${eventData.data.subscriptionId}`);

      try {
        // Send billing failure email
        await this.sendBillingFailureNotification(eventData);
      } catch (emailError) {
        console.error('❌ Error sending billing failure email:', emailError);
        // Don't fail the webhook for email errors
      }

      console.log(
        `⚠️ Subscription ${eventData.data.subscriptionId} has a failed payment - customer may lose access soon`,
      );
    }
  }

  private async handleTransactionPastDue(eventData: TransactionPastDueEvent) {
    console.log(`⏰ Transaction past due: ${eventData.data.id}`);

    if (eventData.data.subscriptionId) {
      console.log(`📅 Subscription ${eventData.data.subscriptionId} has a past due transaction`);

      try {
        // Send billing failure email for past due as well
        await this.sendBillingFailureNotification(eventData);
      } catch (emailError) {
        console.error('❌ Error sending past due email:', emailError);
        // Don't fail the webhook for email errors
      }

      console.log(
        `🔔 Subscription ${eventData.data.subscriptionId} is past due - may be canceled soon if not resolved`,
      );
    }
  }

  private async sendPaymentSuccessNotification(eventData: TransactionCompletedEvent) {
    if (!eventData.data.customerId) return;

    try {
      // Find user by Paddle customer ID through our database relationship
      const userWithCustomer = await prisma.user.findFirst({
        where: {
          customer: {
            paddleCustomerId: eventData.data.customerId,
          },
        },
      });

      if (!userWithCustomer) {
        console.log('User not found for payment success email');
        return;
      }

      // Extract plan information (limited data available in webhook)
      const planName = 'Premium Plan'; // Transaction webhook has limited product info
      const currency = eventData.data.currencyCode || 'USD';
      const rawAmount = eventData.data.details?.totals?.total || '0';
      const amountNumber = convertAmountFromLowestUnit(rawAmount, currency);
      const decimals = currency === 'JPY' || currency === 'KRW' ? 0 : 2;
      const amount = amountNumber.toFixed(decimals);

      // Check if this is an initial payment
      const isInitial = eventData.data.origin === 'subscription_recurring';

      await sendPaymentSuccessEmail({
        to: userWithCustomer.email,
        firstName: userWithCustomer.firstName || undefined,
        planName,
        amount,
        currency,
        isInitial,
      });

      console.log(`✅ Payment success email sent to: ${userWithCustomer.email}`);
    } catch (error) {
      console.error('Error sending payment success notification:', error);
    }
  }

  private async sendBillingFailureNotification(eventData: TransactionPaymentFailedEvent | TransactionPastDueEvent) {
    if (!eventData.data.customerId) return;

    try {
      // Find user by Paddle customer ID through our database relationship
      const userWithCustomer = await prisma.user.findFirst({
        where: {
          customer: {
            paddleCustomerId: eventData.data.customerId,
          },
        },
      });

      if (!userWithCustomer) {
        console.log('User not found for billing failure email');
        return;
      }

      // Extract plan information (limited data available in webhook)
      const planName = 'Premium Plan'; // Transaction webhook has limited product info
      const currency = eventData.data.currencyCode || 'USD';
      const rawAmount = eventData.data.details?.totals?.total || '0';
      const amountNumber = convertAmountFromLowestUnit(rawAmount, currency);
      const decimals = currency === 'JPY' || currency === 'KRW' ? 0 : 2;
      const amount = amountNumber.toFixed(decimals);

      await sendBillingFailureEmail({
        to: userWithCustomer.email,
        firstName: userWithCustomer.firstName || undefined,
        planName,
        amount,
        currency,
      });

      console.log(`✅ Billing failure email sent to: ${userWithCustomer.email}`);
    } catch (error) {
      console.error('Error sending billing failure notification:', error);
    }
  }

  private async sendAutomaticCancellationNotification(eventData: SubscriptionUpdatedEvent) {
    if (!eventData.data.customerId) return;

    try {
      // Find user by Paddle customer ID through our database relationship
      const userWithCustomer = await prisma.user.findFirst({
        where: {
          customer: {
            paddleCustomerId: eventData.data.customerId,
          },
        },
      });

      if (!userWithCustomer) {
        console.log('User not found for automatic cancellation email');
        return;
      }

      // Extract plan information
      const planName = 'Premium Plan'; // Subscription webhook doesn't include product details
      const cancellationDate = new Date().toLocaleDateString();

      await sendPlanCancellationEmail({
        to: userWithCustomer.email,
        firstName: userWithCustomer.firstName || undefined,
        planName,
        cancellationDate,
        // For automatic cancellations, access typically ends immediately
        accessEndDate: cancellationDate,
      });

      console.log(`✅ Automatic cancellation email sent to: ${userWithCustomer.email}`);
    } catch (error) {
      console.error('Error sending automatic cancellation notification:', error);
    }
  }
}
