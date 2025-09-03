import { Text } from '@react-email/components';
import * as React from 'react';
import { BaseEmail, EmailButton, EmailHeader } from './base-email';

interface PaymentSuccessEmailProps {
  firstName?: string;
  planName: string;
  amount: string;
  currency: string;
  isInitial?: boolean;
  nextBillingDate?: string;
}

export function PaymentSuccessEmail({
  firstName,
  planName,
  amount,
  currency,
  isInitial = false,
  nextBillingDate,
}: PaymentSuccessEmailProps) {
  const displayName = firstName || 'there';
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`;
  const subscriptionsUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/subscriptions`;

  const title = isInitial ? `Welcome to ${planName}! Payment Confirmed 🎉` : `Payment Successful - ${planName}`;

  const subtitle = isInitial ? 'Your subscription is now active' : 'Your subscription has been renewed';

  return (
    <BaseEmail preview={`Payment confirmed for ${planName} - ${amount} ${currency}`}>
      <EmailHeader title={title} subtitle={subtitle} />

      <Text style={paragraph}>Hi {displayName},</Text>

      <Text style={paragraph}>
        {isInitial
          ? `Thank you for subscribing to ${planName}! Your payment has been successfully processed and your subscription is now active.`
          : `Your subscription to ${planName} has been successfully renewed. Thank you for your continued support!`}
      </Text>

      <div style={paymentCard}>
        <Text style={cardTitle}>Payment Details</Text>
        <div style={detailRow}>
          <Text style={detailLabel}>Plan: </Text>
          <Text style={detailValue}>{planName}</Text>
        </div>
        <div style={detailRow}>
          <Text style={detailLabel}>Amount: </Text>
          <Text style={detailValue}>
            {amount} {currency.toUpperCase()}
          </Text>
        </div>
        {nextBillingDate && (
          <div style={detailRow}>
            <Text style={detailLabel}>Next billing:</Text>
            <Text style={detailValue}>{nextBillingDate}</Text>
          </div>
        )}
      </div>

      {isInitial && (
        <>
          <Text style={paragraph}>Here&apos;s what you can do now:</Text>
          <ul style={list}>
            <li style={listItem}>Access all premium features in your dashboard</li>
            <li style={listItem}>Explore your new capabilities</li>
            <li style={listItem}>Review your subscription details</li>
            <li style={listItem}>Contact support if you have any questions</li>
          </ul>
        </>
      )}

      <EmailButton href={isInitial ? dashboardUrl : subscriptionsUrl}>
        {isInitial ? 'Explore Dashboard' : 'View Subscription'}
      </EmailButton>

      <Text style={paragraph}>
        If you have any questions about your subscription or billing, feel free to reach out to our support team.
      </Text>

      <Text style={paragraph}>
        Thank you for your business!
        <br />
        The Your SaaS Template Team
      </Text>
    </BaseEmail>
  );
}

// Styles
const paragraph = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
  margin: '0 0 16px',
};

const paymentCard = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #e9ecef',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const cardTitle = {
  color: '#212529',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px',
};

const detailRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px',
};

const detailLabel = {
  color: '#6c757d',
  fontSize: '14px',
  margin: '0',
};

const detailValue = {
  color: '#212529',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
};

const list = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
  margin: '16px 0',
  paddingLeft: '20px',
};

const listItem = {
  margin: '8px 0',
};
