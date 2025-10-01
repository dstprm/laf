import { NextResponse } from 'next/server';
import { validateUserSession } from '@/utils/database/auth';
import { getValuationById, updateValuation, deleteValuation } from '@/utils/database/valuation';
import { getUserByClerkId } from '@/utils/database/user';

/**
 * GET /api/valuations/[id]
 *
 * Get a single valuation by ID (must belong to authenticated user)
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const clerkUserId = await validateUserSession();

    // Get the local user ID
    const user = await getUserByClerkId(clerkUserId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;
    const valuation = await getValuationById(id, user.id);

    if (!valuation) {
      return NextResponse.json({ error: 'Valuation not found' }, { status: 404 });
    }

    return NextResponse.json(valuation);
  } catch (error) {
    console.error('Error fetching valuation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch valuation' },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/valuations/[id]
 *
 * Update a valuation (currently supports updating name only)
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const clerkUserId = await validateUserSession();

    // Get the local user ID
    const user = await getUserByClerkId(clerkUserId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name } = body;

    const valuation = await updateValuation(id, user.id, { name });

    return NextResponse.json(valuation);
  } catch (error) {
    console.error('Error updating valuation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update valuation' },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/valuations/[id]
 *
 * Delete a valuation (must belong to authenticated user)
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const clerkUserId = await validateUserSession();

    // Get the local user ID
    const user = await getUserByClerkId(clerkUserId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;
    await deleteValuation(id, user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting valuation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete valuation' },
      { status: 500 },
    );
  }
}
