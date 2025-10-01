# Fixing Clerk Redirects for Free Valuation Page

## Problem

After signing in via the modal on `/free-valuation`, Clerk redirects to the home page instead of staying on the valuation page.

## Solution

### 1. Configure Clerk Dashboard

Go to your Clerk Dashboard → **Configure** → **Paths**:

1. Set **Sign-in fallback redirect URL** to: `/`
2. Set **Sign-up fallback redirect URL** to: `/`

This prevents Clerk from redirecting to `/dashboard` or other default paths.

### 2. Add Environment Variables

Add these to your `.env.local` file:

```bash
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

### 3. How It Works Now

1. User fills out valuation form on `/free-valuation`
2. User clicks "Estimate" → Modal appears with sign-in
3. User signs in/up → Component uses `forceRedirectUrl="/free-valuation"`
4. Page stays on `/free-valuation` (or redirects back to it)
5. Calculation automatically runs via React effect
6. Results appear + Save dialog shows

### Alternative: If Still Redirecting

If you're still experiencing redirects, check:

1. **Clerk Dashboard** → Configure → Paths → Remove any hardcoded redirect URLs
2. **Your deployment environment variables** → Make sure the env vars are set
3. **Browser cache** → Try in incognito mode or clear cache

## Testing

1. Log out of your app completely
2. Go to `/free-valuation`
3. Fill out the form (don't need to complete it)
4. Click "Estimate"
5. Sign in via the modal
6. You should stay on `/free-valuation` and see the calculation run

If it still redirects to home, you may need to check the Clerk Dashboard settings more carefully.
