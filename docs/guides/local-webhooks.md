# Local Webhook Tunneling (ngrok)

Use this to receive Clerk and Paddle webhooks on your local Next.js dev server.

## Prerequisites

- Dev server running on port 3000 (`npm run dev`)
- ngrok installed (`brew install ngrok` or from ngrok.com)

## Start the tunnel

```bash
ngrok http 3000
```

Copy the HTTPS forwarding URL (e.g., `https://<subdomain>.ngrok-free.app`).

## Configure Clerk (Dashboard)

1. Clerk → Webhooks → Add endpoint
2. URL: `https://<your-ngrok>.ngrok-free.app/api/clerk-webhook`
3. Subscribe to: `user.created`, `user.updated`, `session.created`
4. Copy the signing secret and set in `.env.local`:

```bash
CLERK_WEBHOOK_SECRET=... # from Clerk webhook endpoint
```

Handler in repo: `src/app/api/clerk-webhook/route.ts`

## Configure Paddle (Dashboard)

1. Paddle → Developers → Webhooks
2. URL: `https://<your-ngrok>.ngrok-free.app/api/paddle/webhook`
3. Copy the private key and set in `.env.local`:

```bash
PADDLE_NOTIFICATION_WEBHOOK_SECRET=... # from Paddle webhook settings
```

Handler in repo: `src/app/api/paddle/webhook/route.ts`

## Test

- From Clerk/Paddle dashboards, send a test event to the configured endpoint
- Watch your terminal logs and ngrok inspector (http://127.0.0.1:4040)

## Tips

- Update secrets if you recreate webhook endpoints; old secrets will fail signature checks
- If you see 429 in logs, local rate limiting may be triggered (see `src/lib/rate-limit.ts`)
- For a stable URL across sessions, consider ngrok reserved domains (paid)

## References

- ngrok docs: https://ngrok.com/docs
- Clerk webhooks: https://clerk.com/docs/webhooks
- Paddle sandbox testing: https://www.paddle.com/help/start/set-up-paddle/how-do-i-test-my-checkout-integration
- Paddle webhook simulator: https://www.paddle.com/blog/dx-updates-webhook-simulator
