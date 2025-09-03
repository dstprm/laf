## Getting Started

Follow this sequence to configure your local environment. Order matters: Paddle → Clerk → Database (recommended: Supabase Postgres) → Resend.

### 0) Install and boot the app

- Clone and install

```bash
git clone git@github.com:readytosaas/ready-to-saas.git
cd nextjs-saas-template
npm install
```

- Create `.env.local` in the repo root. You will fill it as you go through each step below.

### 1) Configure Paddle (billing)

- Create a Paddle account and a Sandbox environment.
- Set the following in `.env.local`:

```bash
# Paddle (client)
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=your_paddle_client_token
NEXT_PUBLIC_PADDLE_ENV=sandbox # or production later

# Paddle (server)
PADDLE_API_KEY=your_paddle_api_key
PADDLE_NOTIFICATION_WEBHOOK_SECRET=your_paddle_webhook_private_key
```

- In Paddle Dashboard → Developers → Webhooks, add endpoint URL:
  - Local: `https://<your-ngrok>.ngrok-free.app/api/paddle/webhook`
  - Prod: add later when deploying

Notes: Webhook handler lives at `src/app/api/paddle/webhook/route.ts`.

### 2) Configure Clerk (authentication)

- Create a Clerk application and copy keys.
- Add to `.env.local`:

```bash
# Clerk keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Clerk webhook (svix)
CLERK_WEBHOOK_SECRET=your_clerk_webhook_signing_secret
```

- In Clerk Dashboard → Webhooks, add endpoint URL:
  - Local: `https://<your-ngrok>.ngrok-free.app/api/clerk-webhook`

Notes: Webhook handler at `src/app/api/clerk-webhook/route.ts`. Auth middleware at `src/middleware.ts`.

### 3) Configure the Database (Prisma + Postgres)

Recommended: Supabase Postgres (free tier works for dev).

1. Create a Supabase project → Database → Connection Info.
2. Copy the full connection URL (non-pooled) and the pooled URL.
3. Add to `.env.local`:

```bash
# Database (Prisma/Postgres)
DATABASE_URL=postgresql://user:password@host:5432/dbname
DIRECT_URL=postgresql://user:password@host:5432/dbname
```

4. Run migrations:

```bash
npx prisma migrate dev
```

Docs: see `docs/guides/database-setup.md` for Supabase details and production notes.

### 4) Configure Resend (emails)

- Create a Resend account and an API key.
- Add to `.env.local`:

```bash
# Emails (Resend)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com
EMAIL_REPLY_TO=support@yourdomain.com

# App base URL (used in emails/links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Templates live under `src/components/emails/**`, sender utility is `src/utils/email/send-email.ts`.

### 5) Run the app

```bash
npm run dev
```

Log in via Clerk, pick a plan, and complete a Paddle sandbox checkout. You should see subscriptions and payments in the dashboard. If Resend is configured, transactional emails will be sent.

### 6) Use Cursor to implement your first feature (before generating AI docs)

`ai:docs` generates docs from current code. It won’t change until you make edits. After filling `.ai/base-prompt.md`, implement a small, scoped feature with Cursor (schema/API/UI/emails/webhooks) and then regenerate docs.

Example prompt to run in Cursor:

```
Add a minimal Notes feature.
- Prisma: add model Note { id, userId, title, body?, createdAt } with relation to User
- API: create POST /api/notes in src/app/api/notes/route.ts
  - Validate { title: string, body?: string }
  - Return JSON matching existing route style
- Emails: on successful POST, send a "note-created" email via src/utils/email/send-email.ts and a new component in src/components/emails/
- Constraints: follow existing patterns, small functions, minimal TSDoc, edit only the files listed
- After prisma edits, I will run: npx prisma generate && npx prisma migrate dev
- After you finish, list changed files and a short test plan. Do not run commands.
```

### 7) Generate AI context docs (after code changes)

Produce or refresh AI-ready docs from your codebase:

```bash
npm run ai:docs
```

This updates files in `docs/ai-context/` such as `database-schema.md`, `api-endpoints.md`, and `component-library.md`. Re-run after future feature edits.

### Local webhook testing with ngrok (recommended)

Use a public tunnel to receive real webhooks locally. Quick steps:

```bash
ngrok http 3000
```

- Copy the HTTPS URL and set these endpoints in the vendor dashboards:
  - Clerk → Webhooks → `https://<your-ngrok>.ngrok-free.app/api/clerk-webhook`
  - Paddle → Webhooks → `https://<your-ngrok>.ngrok-free.app/api/paddle/webhook`
- If you want links inside emails to point to your tunnel, temporarily set:

```bash
NEXT_PUBLIC_APP_URL=https://<your-ngrok>.ngrok-free.app
```

See `docs/guides/local-webhooks.md` for detailed steps.

### Move to Production (overview)

- Paddle: switch `NEXT_PUBLIC_PADDLE_ENV=production`, replace client token and API key with live credentials, set a production webhook on your domain.
- Clerk: use your production publishable/secret keys, set allowed origins and production URLs, add a production webhook, rotate `CLERK_WEBHOOK_SECRET`.
- Database: provision a production Postgres (Supabase/Neon/RDS), set `DATABASE_URL` and `DIRECT_URL`, run `npx prisma migrate deploy`, enable pooling and backups.
- Resend: verify a sending domain, set `EMAIL_FROM` to that domain, use a production API key, keep `NEXT_PUBLIC_APP_URL` to your production URL.

Refer to the individual guides in `docs/guides/` for specifics.
