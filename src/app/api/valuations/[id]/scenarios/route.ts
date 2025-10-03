import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getUserByClerkId } from '@/utils/database/user';
import { getValuationById } from '@/utils/database/valuation';
import { createScenario, getValuationScenarios } from '@/utils/database/scenario';
import type { CreateScenarioInput } from '@/lib/valuation.types';

/**
 * GET /api/valuations/[id]/scenarios
 * Get all scenarios for a valuation
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserByClerkId(clerkUserId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id: valuationId } = await params;

    // Verify user owns the valuation
    const valuation = await getValuationById(valuationId, user.id);
    if (!valuation) {
      return NextResponse.json({ error: 'Valuation not found' }, { status: 404 });
    }

    const scenarios = await getValuationScenarios(valuationId);
    return NextResponse.json(scenarios);
  } catch (error) {
    console.error('Failed to fetch scenarios:', error);
    return NextResponse.json({ error: 'Failed to fetch scenarios' }, { status: 500 });
  }
}

/**
 * POST /api/valuations/[id]/scenarios
 * Create a new scenario for a valuation
 */
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

    const { id: valuationId } = await params;

    // Verify user owns the valuation
    const valuation = await getValuationById(valuationId, user.id);
    if (!valuation) {
      return NextResponse.json({ error: 'Valuation not found' }, { status: 404 });
    }

    const body: CreateScenarioInput = await req.json();

    // Validate required fields
    if (!body.name || body.minValue === undefined || body.maxValue === undefined) {
      return NextResponse.json({ error: 'Name, minValue, and maxValue are required' }, { status: 400 });
    }

    // Validate min < max
    if (body.minValue >= body.maxValue) {
      return NextResponse.json({ error: 'minValue must be less than maxValue' }, { status: 400 });
    }

    const scenario = await createScenario({
      valuationId,
      name: body.name,
      description: body.description,
      minValue: body.minValue,
      maxValue: body.maxValue,
      minModelData: body.minModelData,
      maxModelData: body.maxModelData,
      minResultsData: body.minResultsData,
      maxResultsData: body.maxResultsData,
    });

    return NextResponse.json(scenario, { status: 201 });
  } catch (error) {
    console.error('Failed to create scenario:', error);
    return NextResponse.json({ error: 'Failed to create scenario' }, { status: 500 });
  }
}
