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
    <BaseEmail preview={`¡Te damos la bienvenida a ValuPro, ${displayName}!`}>
      <EmailHeader
        title={`¡Te damos la bienvenida a ValuPro, ${displayName}! 🎉`}
        subtitle="Tu plataforma para valoraciones financieras simples y precisas"
      />

      <Text style={paragraph}>
        Gracias por registrarte. Ya puedes acceder a tu panel y comenzar a crear valoraciones en minutos.
      </Text>

      <Text style={paragraph}>Esto es lo que puedes hacer ahora:</Text>

      <ul style={list}>
        <li style={listItem}>Crear tu primera valoración</li>
        <li style={listItem}>Explorar el panel y las funcionalidades disponibles</li>
        <li style={listItem}>Probar escenarios y ajustar variables de valoración</li>
        <li style={listItem}>Solicitar asesoría profesional</li>
      </ul>

      <EmailButton href={dashboardUrl}>Ir al panel</EmailButton>

      <Text style={paragraph}>
        ¡Gracias por unirte a ValuPro!
        <br />
        Equipo de ValuPro
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
