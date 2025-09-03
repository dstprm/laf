## Database Setup (Supabase + Prisma)

This project uses Prisma with a Postgres database. Supabase Postgres is recommended for development and production.

### 1) Provision a database (Supabase)

1. Create a project at supabase.com
2. Go to Project Settings → Database → Connection Info
3. Copy the non-pooled connection string and the pooled (pgbouncer) connection string

Add to `.env.local`:

```bash
# Database (Prisma/Postgres)
DATABASE_URL=postgresql://user:password@host:5432/dbname
DIRECT_URL=postgresql://user:password@host:5432/dbname
```

For Supabase, `DATABASE_URL` can be the pooled or non-pooled connection; `DIRECT_URL` should be the non-pooled connection.

### 2) Generate client and run migrations

```bash
npx prisma generate
npx prisma migrate dev
```

This will create the schema and generate the Prisma Client used in the app (`src/lib/prisma.ts`).

### 3) Verify connectivity

- Start the app: `npm run dev`
- Sign in with Clerk and navigate to Dashboard → Subscriptions;
  the app should read/write via Prisma without errors.

### 4) Move to production

1. Create a production Supabase project
2. Set production `DATABASE_URL` and `DIRECT_URL` with your production credentials
3. Run migrations during deploy:

```bash
npx prisma migrate deploy
```

4. Enable connection pooling and set `DATABASE_URL` to the pooled connection (recommended)
5. Ensure backups and monitoring are enabled in Supabase

### References

- Prisma migrate deploy: https://www.prisma.io/docs/orm/prisma-migrate/workflows/deploy-your-database-changes
- Supabase production checklist: https://supabase.com/docs/guides/going-to-production
