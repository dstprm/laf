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

    // Build valuation data object, only including optional fields if they exist
    const valuationData: {
      userId: string;
      name: string;
      modelData: unknown;
      resultsData: unknown;
      enterpriseValue?: number;
      industry?: string;
      country?: string;
      companyName?: string;
      companyWebsite?: string;
      companyPhone?: string;
    } = {
      userId: user.id,
      name: name || `Valuation - ${new Date().toLocaleDateString()}`,
      modelData,
      resultsData,
    };

    // Add optional fields only if they have values
    if (enterpriseValue !== undefined) valuationData.enterpriseValue = enterpriseValue;
    if (industry) valuationData.industry = industry;
    if (country) valuationData.country = country;
    if (companyName) valuationData.companyName = companyName;
    if (companyWebsite) valuationData.companyWebsite = companyWebsite;
    if (companyPhone) valuationData.companyPhone = companyPhone;

    const valuation = await createValuation(valuationData);

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
