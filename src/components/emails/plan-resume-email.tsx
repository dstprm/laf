import { Text } from '@react-email/components';
import * as React from 'react';
import { BaseEmail, EmailButton, EmailHeader } from './base-email';

interface PlanResumeEmailProps {
  firstName?: string;
  planName: string;
  resumeDate?: string;
  nextBillingDate?: string;
  nextBillingAmount?: string;
  currency?: string;
}

export function PlanResumeEmail({
  firstName,
  planName,
  resumeDate,
  nextBillingDate,
  nextBillingAmount,
  currency,
}: PlanResumeEmailProps) {
  const displayName = firstName || 'there';
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`;
  const subscriptionsUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/subscriptions`;

  return (
    <BaseEmail preview={`Welcome back! Your ${planName} subscription has been resumed`}>
      <EmailHeader title="Welcome Back! 🎉" subtitle="Your subscription has been resumed" />

      <Text style={paragraph}>Hi {displayName},</Text>

      <Text style={paragraph}>
        Great news! Your <strong>{planName}</strong> subscription has been successfully resumed. We&apos;re thrilled to
        have you back!
      </Text>

      <div style={resumeCard}>
        <Text style={cardTitle}>Subscription Details</Text>

        <div style={detailRow}>
          <Text style={detailLabel}>Plan:</Text>
          <Text style={detailValue}>{planName}</Text>
        </div>

        {resumeDate && (
          <div style={detailRow}>
            <Text style={detailLabel}>Resumed On:</Text>
            <Text style={detailValue}>{resumeDate}</Text>
          </div>
        )}

        {nextBillingDate && (
          <div style={detailRow}>
            <Text style={detailLabel}>Next Billing Date:</Text>
            <Text style={detailValue}>{nextBillingDate}</Text>
          </div>
        )}

        {nextBillingAmount && currency && (
          <div style={detailRow}>
            <Text style={detailLabel}>Next Billing Amount:</Text>
            <Text style={detailValue}>
              {nextBillingAmount} {currency.toUpperCase()}
            </Text>
          </div>
        )}
      </div>

      <div style={benefitsSection}>
        <Text style={benefitsTitle}>🚀 You now have full access to:</Text>
        <ul style={benefitsList}>
          <li style={benefitItem}>All premium features and tools</li>
          <li style={benefitItem}>Priority customer support</li>
          <li style={benefitItem}>Advanced analytics and insights</li>
          <li style={benefitItem}>Increased usage limits</li>
          <li style={benefitItem}>Latest updates and new features</li>
        </ul>
      </div>

      <EmailButton href={dashboardUrl}>Explore Your Dashboard</EmailButton>

      <Text style={paragraph}>
        All your previous data, settings, and configurations have been preserved exactly as you left them. You can pick
        up right where you left off!
      </Text>

      <Text style={paragraph}>
        If you have any questions or need assistance getting back up to speed, don&apos;t hesitate to reach out to our
        support team.
      </Text>

      <Text style={paragraph}>
        Thank you for choosing to continue your journey with us!
        <br />
        The Your SaaS Template Team
      </Text>

      <Text style={footerNote}>
        Manage your subscription anytime in your{' '}
        <a href={subscriptionsUrl} style={link}>
          subscription settings
        </a>
        .
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

const resumeCard = {
  backgroundColor: '#f0fff4',
  border: '1px solid #9ae6b4',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const cardTitle = {
  color: '#22543d',
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
  color: '#22543d',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
};

const benefitsSection = {
  backgroundColor: '#f7fafc',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const benefitsTitle = {
  color: '#2d3748',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px',
};

const benefitsList = {
  color: '#4a5568',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
  paddingLeft: '20px',
};

const benefitItem = {
  margin: '6px 0',
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
