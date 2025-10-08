import { Html, Head, Preview, Body, Container, Section, Img, Text, Button, Hr, Link } from '@react-email/components';
import * as React from 'react';

interface BaseEmailProps {
  preview?: string;
  children: React.ReactNode;
}

export function BaseEmail({ preview, children }: BaseEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const logoSrc = `${appUrl}/logo.svg`;
  const logoWidth = 200;
  return (
    <Html>
      <Head />
      {preview && <Preview>{preview}</Preview>}
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img src={logoSrc} width={logoWidth} alt="ValuPro" style={logo} />
          </Section>

          <Section style={content}>{children}</Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>© 2025 ValuPro.</Text>
            <Text style={footerText}>
              {' · '}
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}`} style={footerLink}>
                Ir al sitio
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Reusable email components
interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function EmailButton({ href, children, style = {} }: EmailButtonProps) {
  return (
    <Button
      href={href}
      style={{
        ...button,
        ...style,
      }}
    >
      {children}
    </Button>
  );
}

interface EmailHeaderProps {
  title: string;
  subtitle?: string;
}

export function EmailHeader({ title, subtitle }: EmailHeaderProps) {
  return (
    <>
      <Text style={heading}>{title}</Text>
      {subtitle && <Text style={subheading}>{subtitle}</Text>}
    </>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const header = {
  padding: '32px 20px',
  textAlign: 'center' as const,
};

const logo = {
  margin: '0 auto',
};

const content = {
  padding: '0 20px',
};

const heading = {
  fontSize: '32px',
  lineHeight: '1.3',
  fontWeight: '700',
  color: '#484848',
  margin: '0 0 16px',
  textAlign: 'center' as const,
};

const subheading = {
  fontSize: '18px',
  lineHeight: '1.4',
  color: '#666666',
  margin: '0 0 24px',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#000000',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: 'fit-content',
  padding: '12px 24px',
  margin: '24px auto',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '40px 0',
};

const footer = {
  padding: '0 20px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '4px 0',
};

const footerLink = {
  color: '#8898aa',
  textDecoration: 'underline',
};
