import { Resend } from 'resend';

const hasResendKey = Boolean(process.env.RESEND_API_KEY);

export const resend = hasResendKey ? new Resend(process.env.RESEND_API_KEY) : ({} as Resend);

// Email configuration
export const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
  replyTo: process.env.EMAIL_REPLY_TO || 'support@yourdomain.com',
} as const;

export function ensureEmailConfigured(): void {
  if (process.env.NODE_ENV === 'production' && !hasResendKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }
}

// Email types for tracking
export enum EmailType {
  WELCOME = 'welcome',
  PAYMENT_SUCCESS = 'payment_success',
  PLAN_CHANGE = 'plan_change',
  PLAN_CANCELLATION = 'plan_cancellation',
  PLAN_RESUME = 'plan_resume',
  BILLING_FAILURE = 'billing_failure',
  CONTACT_NOTIFICATION = 'contact_notification',
}

export interface EmailData {
  to: string;
  subject: string;
  type: EmailType;
  data?: Record<string, unknown>;
}

export const CONTACT_ADMIN_EMAIL = process.env.CONTACT_ADMIN_EMAIL || process.env.SUPPORT_EMAIL || '';
