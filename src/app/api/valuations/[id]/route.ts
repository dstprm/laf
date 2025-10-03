import { NextResponse } from 'next/server';
import { validateUserSession } from '@/utils/database/auth';
import { deleteValuation, getValuationById, updateValuation, parseValuationRecord } from '@/utils/database/valuation';
import { getUserByClerkId } from '@/utils/database/user';
import type { UpdateValuationInput, UpdateValuationResponse, GetValuationResponse } from '@/lib/valuation.types';
import { isFinancialModel, isCalculatedFinancials } from '@/lib/valuation.types';

/**
 * PUT /api/valuations/[id]
 *
 * Update a specific valuation for the authenticated user
 */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const clerkUserId = await validateUserSession();

    // Get the local user ID
    const user = await getUserByClerkId(clerkUserId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;
    const body: UpdateValuationInput = await req.json();

    // Verify the valuation exists and belongs to the user
    const existingValuation = await getValuationById(id, user.id);
    if (!existingValuation) {
      return NextResponse.json({ error: 'Valuation not found' }, { status: 404 });
    }

    // Validate data structure if provided
    if (body.modelData && !isFinancialModel(body.modelData)) {
      return NextResponse.json({ error: 'Invalid modelData structure' }, { status: 400 });
    }

    if (body.resultsData && !isCalculatedFinancials(body.resultsData)) {
      return NextResponse.json({ error: 'Invalid resultsData structure' }, { status: 400 });
    }

    // Update the valuation
    const updatedValuation = await updateValuation(id, user.id, body);

    return NextResponse.json<UpdateValuationResponse>(updatedValuation, { status: 200 });
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
 * Delete a specific valuation for the authenticated user
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
