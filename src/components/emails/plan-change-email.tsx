import { Text } from '@react-email/components';
import * as React from 'react';
import { BaseEmail, EmailButton, EmailHeader } from './base-email';

interface PlanChangeEmailProps {
  firstName?: string;
  oldPlan: string;
  newPlan: string;
  isUpgrade?: boolean;
  effectiveDate?: string;
  nextBillingDate?: string;
  proratedAmount?: string;
  currency?: string;
}

export function PlanChangeEmail({
  firstName,
  oldPlan,
  newPlan,
  isUpgrade = true,
  effectiveDate,
  nextBillingDate,
  proratedAmount,
  currency,
}: PlanChangeEmailProps) {
  const displayName = firstName || 'there';
  const subscriptionsUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/subscriptions`;
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`;

  const changeType = isUpgrade ? 'upgraded' : 'changed';
  const changeEmoji = isUpgrade ? '🚀' : '✨';

  return (
    <BaseEmail preview={`Plan ${changeType} from ${oldPlan} to ${newPlan}`}>
      <EmailHeader
        title={`Plan ${changeType.charAt(0).toUpperCase() + changeType.slice(1)} ${changeEmoji}`}
        subtitle={`Your subscription has been updated`}
      />

      <Text style={paragraph}>Hi {displayName},</Text>

      <Text style={paragraph}>
        Great news! Your subscription has been successfully {changeType} from <strong>{oldPlan}</strong> to{' '}
        <strong>{newPlan}</strong>.
      </Text>

      <div style={changeCard}>
        <Text style={cardTitle}>Plan Change Details</Text>

        <div style={planRow}>
          <div style={planItem}>
            <Text style={planLabel}>Previous Plan</Text>
            <Text style={oldPlanText}>{oldPlan}</Text>
          </div>
          <div style={arrow}>→</div>
          <div style={planItem}>
            <Text style={planLabel}>New Plan</Text>
            <Text style={newPlanText}>{newPlan}</Text>
          </div>
        </div>

        {effectiveDate && (
          <div style={detailRow}>
            <Text style={detailLabel}>Effective Date:</Text>
            <Text style={detailValue}>{effectiveDate}</Text>
          </div>
        )}

        {nextBillingDate && (
          <div style={detailRow}>
            <Text style={detailLabel}>Next Billing Date:</Text>
            <Text style={detailValue}>{nextBillingDate}</Text>
          </div>
        )}

        {proratedAmount && currency && (
          <div style={detailRow}>
            <Text style={detailLabel}>Prorated Amount:</Text>
            <Text style={detailValue}>
              {proratedAmount} {currency.toUpperCase()}
            </Text>
          </div>
        )}
      </div>

      {isUpgrade && (
        <>
          <Text style={paragraph}>With your new {newPlan} plan, you now have access to:</Text>
          <ul style={list}>
            <li style={listItem}>Enhanced features and capabilities</li>
            <li style={listItem}>Increased usage limits</li>
            <li style={listItem}>Priority customer support</li>
            <li style={listItem}>Advanced analytics and insights</li>
          </ul>
        </>
      )}

      <EmailButton href={isUpgrade ? dashboardUrl : subscriptionsUrl}>
        {isUpgrade ? 'Explore New Features' : 'View Subscription'}
      </EmailButton>

      <Text style={paragraph}>
        You can view your updated subscription details and manage your plan anytime from your dashboard.
      </Text>

      <Text style={paragraph}>
        Thank you for choosing {newPlan}!
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

const changeCard = {
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
  margin: '0 0 20px',
  textAlign: 'center' as const,
};

const planRow = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '20px',
};

const planItem = {
  textAlign: 'center' as const,
  flex: 1,
};

const planLabel = {
  color: '#6c757d',
  fontSize: '12px',
  textTransform: 'uppercase' as const,
  fontWeight: '600',
  margin: '0 0 4px',
};

const oldPlanText = {
  color: '#dc3545',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
  textDecoration: 'line-through',
};

const newPlanText = {
  color: '#28a745',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
};

const arrow = {
  color: '#6c757d',
  fontSize: '20px',
  fontWeight: '600',
  margin: '0 20px',
};

const detailRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px',
  paddingTop: '8px',
  borderTop: '1px solid #e9ecef',
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
