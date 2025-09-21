SaaS Boilerplate AI Context

Purpose: Give an AI assistant (e.g., Cursor, Claude) the minimum context needed to safely add business logic.

How this repo is organized

- UI: `src/app/(dashboard)/**`, `src/components/**`
- API routes: `src/app/api/**/route.ts`
- Auth: Clerk via `src/middleware.ts` and usage in pages/components
- Database: Prisma schema at `prisma/schema.prisma`
- Emails: React Email templates in `src/components/emails/**`, sender util in `src/utils/email/send-email.ts`
- Payments (Paddle): Helpers in `src/utils/paddle/**`, webhooks at `src/app/api/paddle/webhook/route.ts`, payment endpoints in `src/app/api/payments/**`
- Common utils: `src/lib/**`, constants in `src/constants/**`

Conventions

- API routes export HTTP handlers: `export async function GET/POST/PUT/DELETE()` and return `Response` JSON.
- Database access uses Prisma Client from `src/lib/prisma.ts`.
- Payment logic is isolated under `src/utils/paddle/**` and consumed by API routes/webhooks.
- Emails are React components rendered and sent through Resend from `src/utils/email/send-email.ts`.
- Keep functions small, pure, and named by intent (e.g., `sendWelcomeEmail`, `syncPaddleSubscription`).

Common tasks

- Add API endpoint: Create `src/app/api/<feature>/route.ts`. See scaffold at `scaffolds/api-route/route.ts.tmpl`.
- Add DB model: Edit `prisma/schema.prisma`, then run `npm run db:generate`. See scaffold at `scaffolds/database-model/model.prisma.tmpl`.
- Add UI component: Place in `src/components/<area>/`. See scaffold at `scaffolds/ui-component/Component.tsx.tmpl`.
- Add email: Add React email to `src/components/emails/` and send via `sendEmail`. See `scaffolds/email-template/Email.tsx.tmpl`.
- Add webhook: Create under `src/app/api/<provider>/webhook/route.ts`. See `scaffolds/webhook-handler/route.ts.tmpl`.

Domain map (simplified)

- Entities: `User`, `Customer`, `Subscription`, `Payment`, `ContactRequest`.
- Relationships: `User` 1–1 `Customer`; `Customer` 1–N `Subscription` and 1–N `Payment`.
- Auth: Clerk user links to local `User` via `clerkUserId`.
- Billing: Paddle syncs via webhook and login-time sync; amounts normalized in `Payment`.

AI tips

- Prefer reusing helpers in `src/utils/paddle/**`, `src/utils/database/**`, and `src/lib/**`.
- Follow existing response patterns in current API routes.
- Update or create docs via `npm run ai:docs`. See `docs/` for guides and AI context.

[Project-specific business description]

- This project is the initial version of an AI enabled investment bank like offdeal.io. For now, the only thing i am offering is the free valuation module. I want it to have just a landing page, dashboard and free-valuation tool. I wish however for it to have a very clear value proposition of just the company valuation tool (for now).
