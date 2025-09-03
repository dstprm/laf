import { Text } from '@react-email/components';
import * as React from 'react';
import { BaseEmail, EmailButton, EmailHeader } from './base-email';

interface PlanCancellationEmailProps {
  firstName?: string;
  planName: string;
  cancellationDate: string;
  accessEndDate?: string;
  refundAmount?: string;
  currency?: string;
}

export function PlanCancellationEmail({
  firstName,
  planName,
  cancellationDate,
  accessEndDate,
  refundAmount,
  currency,
}: PlanCancellationEmailProps) {
  const displayName = firstName || 'there';
  const subscriptionsUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/subscriptions`;
  const supportUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/settings`;

  return (
    <BaseEmail preview={`Your ${planName} subscription has been canceled`}>
      <EmailHeader title="Subscription Canceled" subtitle="We're sorry to see you go" />

      <Text style={paragraph}>Hi {displayName},</Text>

      <Text style={paragraph}>
        We&apos;ve successfully processed your cancellation request for your <strong>{planName}</strong> subscription.
      </Text>

      <div style={cancellationCard}>
        <Text style={cardTitle}>Cancellation Details</Text>

        <div style={detailRow}>
          <Text style={detailLabel}>Plan:</Text>
          <Text style={detailValue}>{planName}</Text>
        </div>

        <div style={detailRow}>
          <Text style={detailLabel}>Cancellation Date:</Text>
          <Text style={detailValue}>{cancellationDate}</Text>
        </div>

        {accessEndDate && (
          <div style={detailRow}>
            <Text style={detailLabel}>Access Until:</Text>
            <Text style={detailValue}>{accessEndDate}</Text>
          </div>
        )}

        {refundAmount && currency && (
          <div style={detailRow}>
            <Text style={detailLabel}>Refund Amount:</Text>
            <Text style={detailValue}>
              {refundAmount} {currency.toUpperCase()}
            </Text>
          </div>
        )}
      </div>

      {accessEndDate && (
        <div style={importantNotice}>
          <Text style={noticeTitle}>📅 Important Notice</Text>
          <Text style={noticeText}>
            You&apos;ll continue to have access to all {planName} features until <strong>{accessEndDate}</strong>. After
            this date, your account will be downgraded to our free plan.
          </Text>
        </div>
      )}

      <Text style={paragraph}>
        <strong>Changed your mind?</strong> You can resume your subscription anytime before{' '}
        {accessEndDate || 'your next billing date'}
        without losing any data or settings.
      </Text>

      <EmailButton href={subscriptionsUrl}>Resume Subscription</EmailButton>

      <Text style={paragraph}>
        We&apos;d love to hear about your experience and how we can improve. If you have a moment, please let us know
        what led to your cancellation.
      </Text>

      <Text style={paragraph}>
        Thank you for being part of our community. We hope to see you again soon!
        <br />
        The Your SaaS Template Team
      </Text>

      <Text style={footerNote}>
        Need help?{' '}
        <a href={supportUrl} style={link}>
          Contact our support team
        </a>{' '}
        - we&apos;re here to help.
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

const cancellationCard = {
  backgroundColor: '#fff5f5',
  border: '1px solid #fed7d7',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const cardTitle = {
  color: '#c53030',
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
  color: '#718096',
  fontSize: '14px',
  margin: '0',
};

const detailValue = {
  color: '#2d3748',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
};

const importantNotice = {
  backgroundColor: '#fffaf0',
  border: '1px solid #fbd38d',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
};

const noticeTitle = {
  color: '#c05621',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 8px',
};

const noticeText = {
  color: '#744210',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
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
