/**
 * Auth middleware
 *
 * Public routes: marketing pages and webhooks (Clerk, Paddle)
 * Private routes: dashboard and API except the above
 */
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/signup(.*)',
  '/contact',
  '/privacy',
  '/terms',
  '/docs(.*)',
  '/api/paddle/webhook',
  '/api/clerk-webhook',
  '/free-valuation',
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    const session = await auth();
    if (!session.userId) {
      return session.redirectToSignIn();
    }
  }
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Video files (mp4, webm, mov)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|m4v|webm|mov)$).*)',
  ],
};
