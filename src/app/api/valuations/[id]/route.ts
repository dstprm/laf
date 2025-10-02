import { NextResponse } from 'next/server';
import { validateUserSession } from '@/utils/database/auth';
import { deleteValuation, getValuationById } from '@/utils/database/valuation';
import { getUserByClerkId } from '@/utils/database/user';

/**
 * DELETE /api/valuations/[id]
 *
 * Delete a specific valuation for the authenticated user
 */
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const clerkUserId = await validateUserSession();

    // Get the local user ID
    const user = await getUserByClerkId(clerkUserId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = params;

    // Verify the valuation exists and belongs to the user
    const valuation = await getValuationById(id, user.id);
    if (!valuation) {
      return NextResponse.json({ error: 'Valuation not found' }, { status: 404 });
    }

    // Delete the valuation
    await deleteValuation(id, user.id);

    return NextResponse.json({ message: 'Valuation deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting valuation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete valuation' },
      { status: 500 },
    );
  }
}
