import * as React from 'react';
import { BaseEmail, EmailHeader } from '@/components/emails/base-email';

interface ContactNotificationEmailProps {
  name: string;
  email: string;
  subject?: string;
  message: string;
  source?: string;
}

export function ContactNotificationEmail({ name, email, subject, message, source }: ContactNotificationEmailProps) {
  return (
    <BaseEmail preview={`New contact request from ${name}`}>
      <EmailHeader title="New Contact Request" subtitle={source ? `Source: ${source}` : undefined} />
      <div>
        <p>
          <strong>Name:</strong> {name}
        </p>
        <p>
          <strong>Email:</strong> {email}
        </p>
        {subject && (
          <p>
            <strong>Subject:</strong> {subject}
          </p>
        )}
        <p style={{ whiteSpace: 'pre-wrap', marginTop: 16 }}>{message}</p>
      </div>
    </BaseEmail>
  );
}
