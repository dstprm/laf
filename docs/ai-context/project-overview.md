Project Overview (AI Context)

Tech stack

- Next.js App Router, TypeScript, Tailwind + shadcn/ui
- Clerk auth, Prisma ORM
- Paddle payments (webhook + sync), Resend transactional emails

Key directories

- `src/app/(dashboard)/**`: dashboard UI
- `src/app/api/**`: API routes and webhooks
- `src/components/**`: reusable components and emails
- `src/utils/**`: payments, database, and helpers
- `src/lib/**`: prisma client, email, rate limit, utils
- `prisma/schema.prisma`: database schema

Core flows

- Auth via Clerk; user synced to local `User` record
- Paddle subscription lifecycle via webhook and login sync
- Emails (welcome, payment success/failure, plan changes) via Resend

Entities

- `User`, `Customer`, `Subscription`, `Payment`, `ContactRequest`
