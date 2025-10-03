import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getUserByClerkId } from '@/utils/database/user';
import { getValuationById } from '@/utils/database/valuation';
import { getScenarioById, updateScenario, deleteScenario, parseScenarioRecord } from '@/utils/database/scenario';
import type { UpdateScenarioInput } from '@/lib/valuation.types';

/**
 * GET /api/valuations/[id]/scenarios/[scenarioId]
 * Get a single scenario
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string; scenarioId: string }> }) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserByClerkId(clerkUserId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id: valuationId, scenarioId } = await params;

    // Verify user owns the valuation
    const valuation = await getValuationById(valuationId, user.id);
    if (!valuation) {
      return NextResponse.json({ error: 'Valuation not found' }, { status: 404 });
    }

    const rawScenario = await getScenarioById(scenarioId, valuationId);
    if (!rawScenario) {
      return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
    }

    const scenario = parseScenarioRecord(rawScenario);
    return NextResponse.json(scenario);
  } catch (error) {
    console.error('Failed to fetch scenario:', error);
    return NextResponse.json({ error: 'Failed to fetch scenario' }, { status: 500 });
  }
}

/**
 * PATCH /api/valuations/[id]/scenarios/[scenarioId]
 * Update a scenario
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; scenarioId: string }> }) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserByClerkId(clerkUserId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id: valuationId, scenarioId } = await params;

    // Verify user owns the valuation
    const valuation = await getValuationById(valuationId, user.id);
    if (!valuation) {
      return NextResponse.json({ error: 'Valuation not found' }, { status: 404 });
    }

    // Verify scenario exists
    const existingScenario = await getScenarioById(scenarioId, valuationId);
    if (!existingScenario) {
      return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
    }

    const body: UpdateScenarioInput = await req.json();

    // Validate min < max if both are provided
    if (body.minValue !== undefined && body.maxValue !== undefined) {
      if (body.minValue >= body.maxValue) {
        return NextResponse.json({ error: 'minValue must be less than maxValue' }, { status: 400 });
      }
    }

    const scenario = await updateScenario(scenarioId, valuationId, body);
    return NextResponse.json(scenario);
  } catch (error) {
    console.error('Failed to update scenario:', error);
    return NextResponse.json({ error: 'Failed to update scenario' }, { status: 500 });
  }
}

/**
 * DELETE /api/valuations/[id]/scenarios/[scenarioId]
 * Delete a scenario
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; scenarioId: string }> }) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserByClerkId(clerkUserId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id: valuationId, scenarioId } = await params;

    // Verify user owns the valuation
    const valuation = await getValuationById(valuationId, user.id);
    if (!valuation) {
      return NextResponse.json({ error: 'Valuation not found' }, { status: 404 });
    }

    // Verify scenario exists
    const existingScenario = await getScenarioById(scenarioId, valuationId);
    if (!existingScenario) {
      return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
    }

    await deleteScenario(scenarioId, valuationId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete scenario:', error);
    return NextResponse.json({ error: 'Failed to delete scenario' }, { status: 500 });
  }
}
