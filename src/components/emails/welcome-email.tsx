import { Text } from '@react-email/components';
import * as React from 'react';
import { BaseEmail, EmailButton, EmailHeader } from './base-email';

interface WelcomeEmailProps {
  firstName?: string;
}

export function WelcomeEmail({ firstName }: WelcomeEmailProps) {
  const displayName = firstName || 'there';
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`;

  return (
    <BaseEmail preview={`Welcome to Your SaaS Template, ${displayName}!`}>
      <EmailHeader
        title={`Welcome to Your SaaS Template, ${displayName}! 🎉`}
        subtitle="We're excited to have you on board"
      />

      <Text style={paragraph}>
        Thank you for signing up! Your account has been successfully created and you can now access your dashboard.
      </Text>

      <Text style={paragraph}>Here&apos;s what you can do next:</Text>

      <ul style={list}>
        <li style={listItem}>Explore your dashboard and available features</li>
        <li style={listItem}>Check out our pricing plans to unlock premium features</li>
        <li style={listItem}>Update your profile settings</li>
        <li style={listItem}>Get familiar with our platform</li>
      </ul>

      <EmailButton href={dashboardUrl}>Go to Dashboard</EmailButton>

      <Text style={paragraph}>
        If you have any questions or need help getting started, don&apos;t hesitate to reach out to our support team.
      </Text>

      <Text style={paragraph}>
        Welcome aboard!
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
