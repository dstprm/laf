import { NextResponse } from 'next/server';
import { validateUserSession } from '@/utils/database/auth';
import { publishValuation, unpublishValuation } from '@/utils/database/valuation';
import { getUserByClerkId } from '@/utils/database/user';

/**
 * POST /api/valuations/[id]/publish
 *
 * Publish a valuation report (make it publicly accessible)
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const clerkUserId = await validateUserSession();

    // Get the local user ID
    const user = await getUserByClerkId(clerkUserId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;

    // Publish the valuation
    const valuation = await publishValuation(id, user.id);

    return NextResponse.json(
      {
        id: valuation.id,
        isPublished: valuation.isPublished,
        shareToken: valuation.shareToken,
        shareUrl: valuation.shareToken ? `/reports/${valuation.shareToken}` : null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error publishing valuation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to publish valuation' },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/valuations/[id]/publish
 *
 * Unpublish a valuation report (make it private)
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

    // Unpublish the valuation
    const valuation = await unpublishValuation(id, user.id);

    return NextResponse.json(
      {
        id: valuation.id,
        isPublished: valuation.isPublished,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error unpublishing valuation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to unpublish valuation' },
      { status: 500 },
    );
  }
}
