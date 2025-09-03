# Next.js SaaS Template

A minimal, unopinionated SaaS template built with Next.js, featuring Clerk authentication and Paddle billing.

## Features

- 🔐 **Clerk Authentication** - Complete auth solution with email/password and social logins
- 💳 **Paddle Billing** - Subscription management and payment processing
- 🎨 **Clean UI** - Built with Tailwind CSS and shadcn/ui components
- 📱 **Responsive Design** - Works on desktop and mobile
- 🚀 **Next.js 15** - Latest Next.js with app router
- 🔒 **Protected Routes** - Middleware-based route protection
- 📊 **Dashboard** - Basic user dashboard with subscription management
- 🗄️ **Prisma Integration** - Database layer

## Quick Start

1. **Create a new repository for your project**

   ```bash
   # Option A: start fresh
   mkdir my-app && cd my-app
   git init

   # Option B: if you've already copied this template, just set your own remote
   # git remote add origin git@github.com:<your-org>/<your-repo>.git
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with the following:

   ```bash
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   CLERK_WEBHOOK_SECRET=your_clerk_webhook_signing_secret

   # Paddle Billing
   NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=your_paddle_client_token
   NEXT_PUBLIC_PADDLE_ENV=sandbox # or production
   PADDLE_API_KEY=your_paddle_api_key
   PADDLE_NOTIFICATION_WEBHOOK_SECRET=your_paddle_webhook_private_key

   # Database (Prisma/Postgres)
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   DIRECT_URL=postgresql://user:password@host:5432/dbname

   # Emails (Resend)
   RESEND_API_KEY=your_resend_api_key
   EMAIL_FROM=noreply@yourdomain.com
   EMAIL_REPLY_TO=support@yourdomain.com

   # App
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up Clerk**
   - Create account at [clerk.com](https://clerk.com)
   - Create new application
   - Get your API keys
   - Configure authentication settings

5. **Set up Paddle**
   - Create account at [paddle.com](https://paddle.com)
   - Set up your products and pricing
   - Get your API keys and webhook secret
   - Configure webhook endpoints

6. **Set up Database**
   - Provision Postgres (e.g., Neon, Supabase Postgres, RDS)
   - Configure `DATABASE_URL` and `DIRECT_URL`
   - Run Prisma migrations: `npx prisma migrate dev`

7. **Run the development server**
   ```bash
   npm run dev
   ```

## Test a full sandbox checkout (Paddle)

1. Ensure envs are set: `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`, `PADDLE_API_KEY`, `NEXT_PUBLIC_PADDLE_ENV=sandbox`, `PADDLE_NOTIFICATION_WEBHOOK_SECRET`.
2. In Paddle sandbox, create Products and Prices that match `src/constants/pricing-tier.ts` price IDs.
3. Start the app and log in (Clerk dev instance).
4. Go to pricing → choose a plan → complete sandbox checkout.
5. Verify:
   - Dashboard → Subscriptions shows the new subscription
   - Payments show the latest transaction
   - Emails (Resend) receive test messages if configured

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── dashboard/         # Protected dashboard pages
│   ├── login/            # Authentication pages
│   ├── signup/
│   └── checkout/         # Billing and checkout
├── components/           # React components
│   ├── dashboard/        # Dashboard components
│   ├── home/            # Landing page components
│   ├── checkout/        # Billing components
│   └── ui/              # shadcn/ui components
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
├── utils/               # Utility functions
│   ├── paddle/          # Paddle integration
│   └── database/        # DB helpers (Prisma)
└── styles/              # CSS styles
docs/
├── ai-context/          # AI-ready context, generated docs
├── guides/              # Setup and feature guides
├── internal/            # Internal audits/notes
├── history/             # Migration notes and changelogs
└── policies/            # Security and other policies
```

## Core Functionality

### Authentication

- Email/password and social login
- Protected routes with middleware
- User session management
- Sign up/sign in flows

### Billing

- Multiple pricing tiers
- Subscription management
- Payment processing with Paddle
- Webhook handling for payment events
- Customer portal access

### Dashboard

- User subscription overview
- Usage tracking
- Subscription management
- Payment history

## Documentation

- AI context: see `.ai/base-prompt.md` and `docs/ai-context/`
- Setup guides: `docs/guides/` (Clerk, Resend, themes, user sync, plan changes)`

### Using AI (Cursor/Claude) with this repo

- Fill in `.ai/base-prompt.md` → add your business description and domain specifics.
- Implement a small, scoped feature with Cursor based on that context (specify exact files to edit and acceptance criteria). This produces the code changes that `ai:docs` will summarize.
- Generate fresh context docs: `npm run ai:docs` (updates `docs/ai-context/` from the current code). Re-run after future edits.
- When prompting, specify exactly which files/areas to modify and ask to follow existing code patterns.

Example prompt for the implementation step (before running `ai:docs`):

```
Implement a minimal Notes feature.
- Prisma: add model Note { id, userId, title, body?, createdAt } and relation to User
- API: create POST /api/notes in src/app/api/notes/route.ts
  - Validate { title: string, body?: string }
  - Return JSON matching existing route style
- UI (optional): add notes page at src/app/(dashboard)/notes/page.tsx with a simple form
- Emails: on successful POST, send a "note-created" email using src/utils/email/send-email.ts and a new component under src/components/emails/
- Constraints: follow existing patterns, small functions, minimal TSDoc, do not touch unrelated files
- After editing prisma, I will run: npx prisma generate && npx prisma migrate dev
- After you finish, list changed files and a short test plan. Do not run commands.
```

What to tell the AI

- Goal and constraints (tiers, auth, billing rules).
- Affected layers: Prisma schema, API under `src/app/api`, UI under `src/app/(dashboard)`, emails under `src/components/emails`, webhooks under `/api/*/webhook`.
- Ask it to: use scaffolds in `scaffolds/`, match existing API response style, add minimal TSDoc, keep functions small, and update docs if needed.

Checklist the AI should follow

- Prisma change → edit `prisma/schema.prisma` → run `npm run db:generate`.
- API route → create `src/app/api/<feature>/route.ts` returning JSON like current routes.
- Email → add component in `src/components/emails/` and send via `src/utils/email/send-email.ts`.
- Webhooks → endpoints at `/api/paddle/webhook` and `/api/clerk-webhook`.
- Local webhook testing → see `docs/guides/local-webhooks.md`.

Example prompts

```
Add an API endpoint POST /api/notes that creates a note for the current user.
- Follow existing API response style in current routes
- Validate { title: string, body?: string }
- Save to Prisma (new Note model) and link to User
- Update docs as needed and show changed files only
```

```
Add a "notes" field to User:
- Update prisma/schema.prisma (User.notes: Json?)
- Run db generate
- Expose GET /api/user/notes that returns notes for the logged-in user
- Include minimal TSDoc on new functions
```

```
Send a “note-created” email:
- Create email component under src/components/emails/
- Reuse sendEmail utility
- Trigger on successful POST /api/notes
```

## Customization

This template is designed to be minimal and unopinionated. You can:

- Modify the pricing tiers in `src/constants/pricing-tier.ts`
- Customize the UI components and styling
- Add your own pages and features
- Extend the database schema
- Add additional authentication providers
- Integrate other payment processors

## Deployment

The template is ready for deployment on:

- Vercel (recommended)
- Netlify
- Any platform supporting Next.js

## Environment Setup

1. Set up your production environment variables
2. Configure your Paddle webhook endpoints
3. Set up your production Supabase database
4. Configure Clerk for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Attribution and Licensing

This project derives from the PaddleHQ starter kit.

- Original work: PaddleHQ/paddle-nextjs-starter-kit (Apache-2.0)
- Copyright (c) 2024 Paddle.com Market Limited
- Modifications copyright (c) 2025 Ronin SpA

Licensed under the Apache License, Version 2.0. See `LICENSE` for the full license text and `NOTICE` for attribution details. If you distribute modified versions, keep the `LICENSE`, retain attribution, and note your changes.
