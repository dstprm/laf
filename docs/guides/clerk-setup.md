# Clerk Authentication Setup

Follow these steps to configure Clerk authentication.

> For local development with real webhooks, see `docs/guides/local-webhooks.md`.

## 1. Environment Variables

Add to `.env.local`:

```bash
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Clerk Webhook (signature verification)
CLERK_WEBHOOK_SECRET=your_clerk_webhook_signing_secret
```

## 2. Clerk Dashboard

1. Create an application at clerk.com and copy your publishable/secret keys
2. Ensure URLs match those above

## 3. Configure Clerk Webhook

1. Clerk Dashboard → Webhooks → Add endpoint
2. URL: `https://yourdomain.com/api/clerk-webhook` (or `http://localhost:3000/api/clerk-webhook` in dev)
3. Subscribe to events: `user.created`, `user.updated`, `session.created`
4. Copy the signing secret and set `CLERK_WEBHOOK_SECRET`

## 4. Notes

- Auth middleware is configured in `src/middleware.ts`
- Prefer using the `@clerk/nextjs` hooks/components in UI

## Move to Production

1. Create a production instance in Clerk Dashboard and connect your custom domain
2. Replace keys with live credentials:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` → production
   - `CLERK_SECRET_KEY` → production
   - Regenerate and set `CLERK_WEBHOOK_SECRET` for the production webhook endpoint
3. Configure OAuth provider credentials (own client IDs/secrets) for production
4. Set allowed origins and URLs to your production domain
5. Review session, email, and security settings per production needs

## References

- Development / Environments: [Clerk Instances & Environments](https://clerk.com/docs/deployments/environments)
- Production deployment: [Deploy to Production](https://clerk.com/docs/deployments/overview)
- Webhooks overview: [Clerk Webhooks](https://clerk.com/docs/webhooks)
