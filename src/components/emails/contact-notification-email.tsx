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
    <BaseEmail preview={`Nuevo contacto de ${name}`}>
      <EmailHeader title="Nuevo contacto" subtitle={source ? `Fuente: ${source}` : undefined} />
      <div>
        <p>
          <strong>Nombre:</strong> {name}
        </p>
        <p>
          <strong>Email:</strong> {email}
        </p>
        {subject && (
          <p>
            <strong>Asunto:</strong> {subject}
          </p>
        )}
        <p style={{ whiteSpace: 'pre-wrap', marginTop: 16 }}>{message}</p>
      </div>
    </BaseEmail>
  );
}
