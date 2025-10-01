import { NextResponse } from 'next/server';
import { validateUserSession } from '@/utils/database/auth';
import { createValuation, getUserValuations } from '@/utils/database/valuation';
import { getUserByClerkId } from '@/utils/database/user';

/**
 * POST /api/valuations
 *
 * Create a new valuation for the authenticated user
 */
export async function POST(req: Request) {
  try {
    const clerkUserId = await validateUserSession();

    // Get the local user ID
    const user = await getUserByClerkId(clerkUserId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const {
      name,
      modelData,
      resultsData,
      enterpriseValue,
      industry,
      country,
      companyName,
      companyWebsite,
      companyPhone,
    } = body;

    if (!modelData || !resultsData) {
      return NextResponse.json({ error: 'modelData and resultsData are required' }, { status: 400 });
    }

    const valuation = await createValuation({
      userId: user.id,
      name,
      modelData,
      resultsData,
      enterpriseValue,
      industry,
      country,
      companyName,
      companyWebsite,
      companyPhone,
    });

    return NextResponse.json(valuation, { status: 201 });
  } catch (error) {
    console.error('Error creating valuation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create valuation' },
      { status: 500 },
    );
  }
}

/**
 * GET /api/valuations
 *
 * Get all valuations for the authenticated user
 */
export async function GET() {
  try {
    const clerkUserId = await validateUserSession();

    // Get the local user ID
    const user = await getUserByClerkId(clerkUserId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const valuations = await getUserValuations(user.id);

    return NextResponse.json(valuations);
  } catch (error) {
    console.error('Error fetching valuations:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch valuations' },
      { status: 500 },
    );
  }
}
