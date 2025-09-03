import { Text } from '@react-email/components';
import * as React from 'react';
import { BaseEmail, EmailButton, EmailHeader } from './base-email';

interface BillingFailureEmailProps {
  firstName?: string;
  planName: string;
  amount: string;
  currency: string;
  retryDate?: string;
  failureReason?: string;
  isFirstFailure?: boolean;
}

export function BillingFailureEmail({
  firstName,
  planName,
  amount,
  currency,
  retryDate,
  failureReason = 'Payment method declined',
  isFirstFailure = true,
}: BillingFailureEmailProps) {
  const displayName = firstName || 'there';
  const subscriptionsUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/subscriptions`;
  const paymentsUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/payments`;

  const urgencyColor = isFirstFailure ? '#f6ad55' : '#fc8181';
  const urgencyBg = isFirstFailure ? '#fffaf0' : '#fff5f5';
  const urgencyBorder = isFirstFailure ? '#fbd38d' : '#fed7d7';

  return (
    <BaseEmail preview={`Payment failed for your ${planName} subscription - Action required`}>
      <EmailHeader title="Payment Failed ⚠️" subtitle="Action required to continue your subscription" />

      <Text style={paragraph}>Hi {displayName},</Text>

      <Text style={paragraph}>
        We were unable to process the payment for your <strong>{planName}</strong> subscription.
        {isFirstFailure
          ? " Don't worry - this happens sometimes and is usually easy to fix."
          : ' This is a follow-up notice about your failed payment.'}
      </Text>

      <div style={{ ...failureCard, backgroundColor: urgencyBg, borderColor: urgencyBorder }}>
        <Text style={{ ...cardTitle, color: urgencyColor }}>
          {isFirstFailure ? '💳 Payment Issue' : '🚨 Urgent: Account At Risk'}
        </Text>

        <div style={detailRow}>
          <Text style={detailLabel}>Plan:</Text>
          <Text style={detailValue}>{planName}</Text>
        </div>

        <div style={detailRow}>
          <Text style={detailLabel}>Amount:</Text>
          <Text style={detailValue}>
            {amount} {currency.toUpperCase()}
          </Text>
        </div>

        <div style={detailRow}>
          <Text style={detailLabel}>Reason:</Text>
          <Text style={detailValue}>{failureReason}</Text>
        </div>

        {retryDate && (
          <div style={detailRow}>
            <Text style={detailLabel}>Next Retry:</Text>
            <Text style={detailValue}>{retryDate}</Text>
          </div>
        )}
      </div>

      {!isFirstFailure && (
        <div style={warningSection}>
          <Text style={warningTitle}>🚨 Important: Subscription Suspension Risk</Text>
          <Text style={warningText}>
            Multiple payment attempts have failed. To avoid service interruption, please update your payment method
            immediately. Your access may be suspended if payment is not resolved soon.
          </Text>
        </div>
      )}

      <Text style={paragraph}>
        <strong>How to fix this:</strong>
      </Text>

      <ul style={solutionsList}>
        <li style={solutionItem}>
          <strong>Check your payment method:</strong> Ensure your card hasn&apos;t expired and has sufficient funds
        </li>
        <li style={solutionItem}>
          <strong>Update billing information:</strong> Add a new payment method or update your existing one
        </li>
        <li style={solutionItem}>
          <strong>Contact your bank:</strong> Some banks block recurring payments - ask them to approve charges from our
          service
        </li>
        <li style={solutionItem}>
          <strong>Try a different card:</strong> Use an alternative payment method if available
        </li>
      </ul>

      <EmailButton href={subscriptionsUrl}>Update Payment Method</EmailButton>

      <Text style={paragraph}>
        If you continue to experience issues or need assistance, please contact our support team. We&apos;re here to
        help ensure your service continues uninterrupted.
      </Text>

      {isFirstFailure && retryDate && (
        <Text style={paragraph}>
          <strong>No action needed right now?</strong> We&apos;ll automatically retry the payment on {retryDate}.
          However, updating your payment method now will ensure uninterrupted service.
        </Text>
      )}

      <Text style={paragraph}>
        Thank you for your prompt attention to this matter.
        <br />
        The Your SaaS Template Team
      </Text>

      <Text style={footerNote}>
        View your{' '}
        <a href={paymentsUrl} style={link}>
          payment history
        </a>{' '}
        or{' '}
        <a href={subscriptionsUrl} style={link}>
          manage your subscription
        </a>{' '}
        anytime.
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

const failureCard = {
  border: '1px solid',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const cardTitle = {
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
  color: '#4a5568',
  fontSize: '14px',
  margin: '0',
};

const detailValue = {
  color: '#2d3748',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
};

const warningSection = {
  backgroundColor: '#fff5f5',
  border: '1px solid #feb2b2',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
};

const warningTitle = {
  color: '#c53030',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 8px',
};

const warningText = {
  color: '#742a2a',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

const solutionsList = {
  color: '#4a5568',
  fontSize: '15px',
  lineHeight: '22px',
  margin: '0 0 24px',
  paddingLeft: '20px',
};

const solutionItem = {
  margin: '8px 0',
};

const footerNote = {
  color: '#718096',
  fontSize: '14px',
  lineHeight: '20px',
  textAlign: 'center' as const,
  margin: '32px 0 0',
  padding: '16px',
  backgroundColor: '#f7fafc',
  borderRadius: '6px',
};

const link = {
  color: '#3182ce',
  textDecoration: 'none',
};
