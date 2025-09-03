/**
 * Auth helpers
 *
 * validateUserSession: throws if no authenticated Clerk session; returns clerk user id otherwise.
 * Add additional helpers here to centralize permission/ownership checks.
 */
import { auth } from '@clerk/nextjs/server';

export async function validateUserSession() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('You are not allowed to perform this action.');
  }

  return userId;
}
