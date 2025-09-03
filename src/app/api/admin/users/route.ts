import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/utils/database/admin';
import { getAllUsers, updateUserAdmin, deleteUser } from '@/utils/database/user';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/users
 *
 * Returns paginated list of all users (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const q = searchParams.get('q') || undefined;

    const result = await getAllUsers(page, limit, q);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching users:', error);

    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'Admin access required') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/users
 *
 * Update user admin status (admin only)
 */
export async function PATCH(request: NextRequest) {
  try {
    const currentClerkUserId = await requireAdmin();

    const body = await request.json();
    const { userId, isAdmin } = body;

    if (!userId || typeof isAdmin !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Prevent admin from removing their own admin privileges
    const currentUser = await prisma.user.findUnique({
      where: { clerkUserId: currentClerkUserId },
      select: { id: true },
    });

    if (currentUser?.id === userId && isAdmin === false) {
      return NextResponse.json({ error: "You can't remove admin permissions from your own account" }, { status: 400 });
    }

    const updatedUser = await updateUserAdmin(userId, isAdmin);

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);

    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'Admin access required') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/users
 *
 * Delete a user (admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    const currentClerkUserId = await requireAdmin();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Prevent admin from deleting their own account
    const currentUser = await prisma.user.findUnique({
      where: { clerkUserId: currentClerkUserId },
      select: { id: true },
    });

    if (currentUser?.id === userId) {
      return NextResponse.json({ error: "You can't delete your own account" }, { status: 400 });
    }

    await deleteUser(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);

    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'Admin access required') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
