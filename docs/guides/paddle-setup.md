# Paddle Setup

This project uses Paddle Billing for subscriptions and payments.

> For local development with real webhooks, see `docs/guides/local-webhooks.md`.

## 1. Environment Variables

```bash
# Public (client)
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=your_paddle_client_token
NEXT_PUBLIC_PADDLE_ENV=sandbox # or production

# Server
PADDLE_API_KEY=your_paddle_api_key
PADDLE_NOTIFICATION_WEBHOOK_SECRET=your_paddle_webhook_private_key
```

## 2. Configure Webhook Endpoint (Paddle Dashboard)

1. Paddle Dashboard → Developers → Webhooks
2. Add endpoint URL: `https://yourdomain.com/api/paddle/webhook` (or `http://localhost:3000/api/paddle/webhook` in dev)
3. Copy the private key and set `PADDLE_NOTIFICATION_WEBHOOK_SECRET`
4. Ensure events for transactions and subscriptions are enabled

## 3. Notes

- Webhook handler: `src/app/api/paddle/webhook/route.ts`
- Server-side Paddle client: `src/utils/paddle/get-paddle-instance.ts`
- Webhook processing: `src/utils/paddle/process-webhook.ts`
- Pricing IDs should align with `src/constants/pricing-tier.ts`

## Move to Production

1. Switch environment and credentials:
   - Set `NEXT_PUBLIC_PADDLE_ENV=production`
   - Replace `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` and `PADDLE_API_KEY` with live (production) keys
2. Configure a production webhook URL on your domain:
   - `https://yourdomain.com/api/paddle/webhook`
   - Update `PADDLE_NOTIFICATION_WEBHOOK_SECRET` with the production private key
3. Align live product/price IDs with your app’s `pricing-tier` configuration
4. Rotate any sandbox secrets and remove them from your deployment environment

## References

- Development
  - Paddle Sandbox testing: [How do I test my checkout integration?](https://www.paddle.com/help/start/set-up-paddle/how-do-i-test-my-checkout-integration)
  - Paddle Node SDK (server): [developer.paddle.com](https://developer.paddle.com/)
- Webhooks
  - Webhook simulator: [Paddle Webhook Simulator](https://www.paddle.com/blog/dx-updates-webhook-simulator)
  - Webhooks overview and verification: [developer.paddle.com](https://developer.paddle.com/)
- Production
  - Billing and environments overview: [developer.paddle.com](https://developer.paddle.com/)
