import { auth } from '@clerk/nextjs/server';
import { isUserAdmin } from './user';

/**
 * Middleware function to check if the current user is an admin
 * Throws an error if the user is not authenticated or not an admin
 */
export async function requireAdmin() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Authentication required');
  }

  const isAdmin = await isUserAdmin(userId);

  if (!isAdmin) {
    throw new Error('Admin access required');
  }

  return userId;
}

/**
 * Check if the current user is admin without throwing
 * Returns false if not authenticated or not admin
 */
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const { userId } = await auth();
    if (!userId) return false;

    return await isUserAdmin(userId);
  } catch {
    return false;
  }
}
