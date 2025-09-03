# Resend Email Setup

This project uses Resend for transactional emails.

## 1. Environment Variables

```bash
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com
EMAIL_REPLY_TO=support@yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## 2. Email Types Implemented

- Welcome
- Payment success/failure
- Plan change/cancellation/resume
- Contact notification

Templates: `src/components/emails/**` — sender: `src/utils/email/send-email.ts`.

## Move to Production

1. Verify a sending domain in Resend and add DNS records (SPF, DKIM)
2. Set `EMAIL_FROM` to an address on your verified domain (e.g., `noreply@yourdomain.com`)
3. Use a production `RESEND_API_KEY` and keep it secret
4. Ensure `NEXT_PUBLIC_APP_URL` points to your production site for correct links in emails

## References

- Getting started: https://resend.com/docs/getting-started
- Domain authentication: https://resend.com/docs/domain-authentication
- API reference: https://resend.com/docs/api-reference
