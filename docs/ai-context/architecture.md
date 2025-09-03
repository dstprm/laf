Architecture (High Level)

Auth

- Clerk middleware protects dashboard routes; local `User` links via `clerkUserId`.

Database

- Prisma models in `prisma/schema.prisma`. Access via `src/lib/prisma.ts`.

Payments

- Paddle webhook handler at `src/app/api/paddle/webhook/route.ts` delegates to `src/utils/paddle/process-webhook.ts`.
- Login-time sync fetches subscriptions/transactions under `src/utils/paddle/**`.

Emails

- React Email templates in `src/components/emails/**` rendered and sent via Resend using `src/utils/email/send-email.ts`.

API

- RESTful handlers in `src/app/api/**/route.ts`. Handlers return JSON `Response`.
