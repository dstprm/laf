import { NextResponse } from 'next/server';
import { validateUserSession } from '@/utils/database/auth';
import { deleteValuation, getValuationById, updateValuation, parseValuationRecord } from '@/utils/database/valuation';
import { getUserByClerkId } from '@/utils/database/user';
import {
  getValuationScenarios,
  getScenarioById,
  updateScenario,
  parseScenarioRecord,
  upsertAutoScenarios,
} from '@/utils/database/scenario';
import type { UpdateValuationInput, UpdateValuationResponse } from '@/lib/valuation.types';
import type { FinancialModel, CalculatedFinancials } from '@/lib/valuation.types';
import { isFinancialModel, isCalculatedFinancials } from '@/lib/valuation.types';
import { calculateScenarioValues } from '@/lib/scenario-calculator';
import { SCENARIO_VARIABLES, getVariableBaseValue } from '@/lib/scenario-variables';
import type { VariableAdjustment } from '@/lib/scenario-variables';

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
    // Convert Prisma JSON fields to typed data before returning
    const responseData = parseValuationRecord(updatedValuation);

    // Best-effort: Recalculate scenarios based on the new base model
    // Only recalculates scenarios that have stored min/max model data
    try {
      await recalculateScenariosForValuation(id, responseData.modelData, responseData.resultsData);
      // Also ensure auto scenarios exist and are updated
      await upsertAutoScenarios(id, responseData.modelData, responseData.resultsData);
    } catch (recalcError) {
      console.error('Scenario recalculation failed (non-fatal):', recalcError);
    }

    return NextResponse.json<UpdateValuationResponse>(responseData, { status: 200 });
  } catch (error) {
    console.error('Error updating valuation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update valuation' },
      { status: 500 },
    );
  }
}

// Helper: recompute all scenarios for a valuation using stored variable adjustments inferred
// from each scenario's min/max model data. Scenarios without model data are skipped.
async function recalculateScenariosForValuation(
  valuationId: string,
  baseModel: FinancialModel,
  baseResults: CalculatedFinancials,
) {
  const list = await getValuationScenarios(valuationId);
  for (const item of list) {
    const raw = await getScenarioById(item.id, valuationId);
    if (!raw) continue;
    const scenario = parseScenarioRecord(raw);

    if (!scenario.minModelData || !scenario.maxModelData) {
      // Cannot infer adjustments without stored models; leave as-is
      continue;
    }

    // Infer adjustments by reading variable values from stored min/max models
    const adjustments = SCENARIO_VARIABLES.map((v) => {
      const baseVal = getVariableBaseValue(v.id, baseModel, baseResults);
      const minVal = getVariableBaseValue(v.id, scenario.minModelData, scenario.minResultsData);
      const maxVal = getVariableBaseValue(v.id, scenario.maxModelData, scenario.maxResultsData);
      return { variableId: v.id, baseVal, minVal, maxVal } as const;
    })
      .filter((a) => a.minVal !== null && a.maxVal !== null)
      .map((a) => ({
        variableId: a.variableId,
        minValue: a.minVal as number,
        maxValue: a.maxVal as number,
        baseValue: typeof a.baseVal === 'number' ? a.baseVal : undefined,
      }));

    if (adjustments.length === 0) continue;

    const result = calculateScenarioValues(baseModel, adjustments as VariableAdjustment[]);

    await updateScenario(item.id, valuationId, {
      minValue: result.minValue,
      maxValue: result.maxValue,
      minModelData: result.minModel,
      maxModelData: result.maxModel,
      minResultsData: result.minResults,
      maxResultsData: result.maxResults,
    });
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
