import { auth } from '@clerk/nextjs/server';
import { isUserAdmin } from '@/utils/database/user';
import { NextResponse } from 'next/server';

/**
 * GET /api/user/admin-status
 *
 * Returns whether the current user is an admin
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminStatus = await isUserAdmin(userId);

    return NextResponse.json({
      isAdmin: adminStatus,
    });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
