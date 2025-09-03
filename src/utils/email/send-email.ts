/**
 * Email sending utilities using Resend and React Email templates.
 *
 * Env: configured via `src/lib/email.ts` (from, replyTo, API key)
 * Errors: surfaces send errors (caught at call sites where appropriate)
 */
import { render } from '@react-email/render';
import { resend, EMAIL_CONFIG, EmailType, ensureEmailConfigured } from '@/lib/email';
import { ContactNotificationEmail } from '@/components/emails/contact-notification-email';
import { WelcomeEmail } from '@/components/emails/welcome-email';
import { PaymentSuccessEmail } from '@/components/emails/payment-success-email';
import { PlanChangeEmail } from '@/components/emails/plan-change-email';
import { PlanCancellationEmail } from '@/components/emails/plan-cancellation-email';
import { PlanResumeEmail } from '@/components/emails/plan-resume-email';
import { BillingFailureEmail } from '@/components/emails/billing-failure-email';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  type: EmailType;
}

export async function sendEmail({ to, subject, html, type }: SendEmailOptions) {
  try {
    ensureEmailConfigured();
    const result = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to,
      subject,
      html,
      replyTo: EMAIL_CONFIG.replyTo,
      tags: [
        {
          name: 'type',
          value: type,
        },
      ],
    });

    console.log(`✅ Email sent successfully:`, {
      id: result.data?.id,
      to,
      subject,
      type,
    });

    return result;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
}

// Welcome email
interface WelcomeEmailData {
  to: string;
  firstName?: string;
}

export async function sendWelcomeEmail({ to, firstName }: WelcomeEmailData) {
  const html = await render(
    WelcomeEmail({
      firstName,
    }),
  );

  return sendEmail({
    to,
    subject: `Welcome to Your SaaS Template${firstName ? `, ${firstName}` : ''}!`,
    html,
    type: EmailType.WELCOME,
  });
}

// Payment success email
interface PaymentSuccessEmailData {
  to: string;
  firstName?: string;
  planName: string;
  amount: string;
  currency: string;
  isInitial?: boolean;
  nextBillingDate?: string;
}

export async function sendPaymentSuccessEmail({
  to,
  firstName,
  planName,
  amount,
  currency,
  isInitial = false,
  nextBillingDate,
}: PaymentSuccessEmailData) {
  const html = await render(
    PaymentSuccessEmail({
      firstName,
      planName,
      amount,
      currency,
      isInitial,
      nextBillingDate,
    }),
  );

  const subject = isInitial ? `Welcome to ${planName}! Payment Confirmed` : `Payment Successful - ${planName}`;

  return sendEmail({
    to,
    subject,
    html,
    type: EmailType.PAYMENT_SUCCESS,
  });
}

// Plan change email
interface PlanChangeEmailData {
  to: string;
  firstName?: string;
  oldPlan: string;
  newPlan: string;
  isUpgrade?: boolean;
  effectiveDate?: string;
  nextBillingDate?: string;
  proratedAmount?: string;
  currency?: string;
}

export async function sendPlanChangeEmail({
  to,
  firstName,
  oldPlan,
  newPlan,
  isUpgrade = true,
  effectiveDate,
  nextBillingDate,
  proratedAmount,
  currency,
}: PlanChangeEmailData) {
  const html = await render(
    PlanChangeEmail({
      firstName,
      oldPlan,
      newPlan,
      isUpgrade,
      effectiveDate,
      nextBillingDate,
      proratedAmount,
      currency,
    }),
  );

  const changeType = isUpgrade ? 'Upgraded' : 'Changed';
  const subject = `Plan ${changeType}: ${oldPlan} → ${newPlan}`;

  return sendEmail({
    to,
    subject,
    html,
    type: EmailType.PLAN_CHANGE,
  });
}

// Plan cancellation email
interface PlanCancellationEmailData {
  to: string;
  firstName?: string;
  planName: string;
  cancellationDate: string;
  accessEndDate?: string;
  refundAmount?: string;
  currency?: string;
}

export async function sendPlanCancellationEmail({
  to,
  firstName,
  planName,
  cancellationDate,
  accessEndDate,
  refundAmount,
  currency,
}: PlanCancellationEmailData) {
  const html = await render(
    PlanCancellationEmail({
      firstName,
      planName,
      cancellationDate,
      accessEndDate,
      refundAmount,
      currency,
    }),
  );

  const subject = `Subscription Canceled - ${planName}`;

  return sendEmail({
    to,
    subject,
    html,
    type: EmailType.PLAN_CANCELLATION,
  });
}

// Plan resume email
interface PlanResumeEmailData {
  to: string;
  firstName?: string;
  planName: string;
  resumeDate?: string;
  nextBillingDate?: string;
  nextBillingAmount?: string;
  currency?: string;
}

export async function sendPlanResumeEmail({
  to,
  firstName,
  planName,
  resumeDate,
  nextBillingDate,
  nextBillingAmount,
  currency,
}: PlanResumeEmailData) {
  const html = await render(
    PlanResumeEmail({
      firstName,
      planName,
      resumeDate,
      nextBillingDate,
      nextBillingAmount,
      currency,
    }),
  );

  const subject = `Welcome Back! ${planName} Subscription Resumed`;

  return sendEmail({
    to,
    subject,
    html,
    type: EmailType.PLAN_RESUME,
  });
}

// Billing failure email
interface BillingFailureEmailData {
  to: string;
  firstName?: string;
  planName: string;
  amount: string;
  currency: string;
  retryDate?: string;
  failureReason?: string;
  isFirstFailure?: boolean;
}

export async function sendBillingFailureEmail({
  to,
  firstName,
  planName,
  amount,
  currency,
  retryDate,
  failureReason,
  isFirstFailure = true,
}: BillingFailureEmailData) {
  const html = await render(
    BillingFailureEmail({
      firstName,
      planName,
      amount,
      currency,
      retryDate,
      failureReason,
      isFirstFailure,
    }),
  );

  const urgency = isFirstFailure ? 'Payment Failed' : 'Urgent: Payment Failed';
  const subject = `${urgency} - ${planName} Subscription`;

  return sendEmail({
    to,
    subject,
    html,
    type: EmailType.BILLING_FAILURE,
  });
}

// Contact form notification email
interface ContactNotificationEmailData {
  to: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  source?: string;
}

export async function sendContactNotificationEmail({
  to,
  name,
  email,
  subject,
  message,
  source,
}: ContactNotificationEmailData) {
  const html = await render(ContactNotificationEmail({ name, email, subject, message, source }));

  return sendEmail({
    to,
    subject: `New contact request${subject ? `: ${subject}` : ''}`,
    html,
    type: EmailType.CONTACT_NOTIFICATION,
  });
}
