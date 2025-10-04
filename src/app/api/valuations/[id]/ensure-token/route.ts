/**
 * API endpoint to ensure a valuation has a share token
 * POST /api/valuations/[id]/ensure-token
 */
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/utils/database/user';
import { ensureShareToken } from '@/utils/database/valuation';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserByClerkId(clerkUserId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;

    // Ensure the valuation has a share token
    const valuation = await ensureShareToken(id, user.id);

    return NextResponse.json({
      shareToken: valuation.shareToken,
    });
  } catch (error) {
    console.error('Error ensuring share token:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
