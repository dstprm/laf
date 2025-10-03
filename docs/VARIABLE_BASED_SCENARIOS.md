# Variable-Based Scenario System

## Overview

The improved scenario system allows users to create sensitivity analyses by selecting financial variables and setting min/max values. The system automatically calculates the resulting enterprise value range, storing complete model data for reproducibility.

## Key Improvement

**Before**: Users manually entered min/max enterprise values
**Now**: Users select variables (WACC, growth, margins, etc.) → System auto-calculates EVs

## How It Works

### 1. User Selects Variables

From the "Create Scenario" dialog, users can add one or more variables:

- **WACC (Discount Rate)**: 9.5% → 7.5% to 11.5%
- **Revenue Growth Rate**: 10% → 5% to 15%
- **EBITDA Margin**: 15% → 10% to 20%
- **Terminal Growth Rate**: 2.5% → 1.5% to 3.5%
- **Terminal EBITDA Multiple**: 10x → 8x to 12x
- **CAPEX (% of Revenue)**: 5% → 3% to 7%
- **Net Working Capital (% of Revenue)**: 10% → 5% to 15%
- **Tax Rate**: 25% → 20% to 30%

### 2. System Calculates EVs

For each variable combination:

1. Clone base financial model
2. Apply min values → Calculate EV (min scenario)
3. Apply max values → Calculate EV (max scenario)
4. Store both models and results

### 3. Display on Football Field Chart

Each scenario appears as a horizontal bar showing the valuation range.

## Example Workflows

### WACC Sensitivity (±2%)

**Goal**: See how changing the discount rate affects valuation

**Steps**:

1. Click "Create Scenario"
2. Click "Add Variable"
3. Select "WACC (Discount Rate)"
4. Current base: 9.5% (auto-detected)
5. Set min: 11.5% (higher WACC = lower value)
6. Set max: 7.5% (lower WACC = higher value)
7. System calculates:
   - Min EV: $8.2M (at 11.5% WACC)
   - Max EV: $11.8M (at 7.5% WACC)
8. Name: "WACC Sensitivity ±2%"
9. Save

**Result**: Bar on chart showing $8.2M - $11.8M range

### Multi-Variable Optimistic Case

**Goal**: Model best-case scenario with multiple assumptions

**Steps**:

1. Click "Create Scenario"
2. Add "Revenue Growth Rate": Min 10%, Max 15%
3. Add "EBITDA Margin": Min 15%, Max 20%
4. Add "Terminal Growth Rate": Min 2%, Max 3%
5. System calculates combined effect
6. Name: "Optimistic Growth Case"

**Result**: Shows enterprise value range when all assumptions are favorable

### Conservative Downturn Scenario

**Goal**: Stress test under pessimistic conditions

**Steps**:

1. Add "Revenue Growth Rate": Min 0%, Max 3%
2. Add "EBITDA Margin": Min 8%, Max 12%
3. Add "CAPEX (% of Revenue)": Min 6%, Max 10% (higher = worse)
4. System calculates pessimistic range
5. Name: "Downturn Scenario"

## Technical Implementation

### Variable Configuration

**File**: `/src/lib/scenario-variables.ts`

```typescript
export type ScenarioVariableType =
  | 'wacc'
  | 'revenue_growth'
  | 'ebitda_margin'
  | 'terminal_growth'
  | 'terminal_multiple'
  | 'capex_percent'
  | 'nwc_percent'
  | 'tax_rate';

export const SCENARIO_VARIABLES: ScenarioVariable[] = [
  {
    id: 'wacc',
    label: 'WACC (Discount Rate)',
    description: 'Weighted Average Cost of Capital',
    unit: 'percentage',
    step: 0.1,
  },
  // ... more variables
];
```

### Calculation Engine

**File**: `/src/lib/scenario-calculator.ts`

```typescript
// Apply variable adjustments to base model
export function applyVariableAdjustments(
  baseModel: FinancialModel,
  adjustments: VariableAdjustment[],
  useMinValues: boolean,
): FinancialModel;

// Calculate EV using modelStore
export function calculateEnterpriseValue(model: FinancialModel): {
  enterpriseValue: number;
  calculatedFinancials: CalculatedFinancials;
};

// Main function: calculate scenario values
export function calculateScenarioValues(
  baseModel: FinancialModel,
  adjustments: VariableAdjustment[],
): {
  minValue: number;
  maxValue: number;
  minModel: FinancialModel;
  maxModel: FinancialModel;
  minResults: CalculatedFinancials;
  maxResults: CalculatedFinancials;
};
```

### UI Components

**CreateScenarioDialog** (`/src/components/dashboard/valuations/create-scenario-dialog.tsx`):

- Variable selection dropdowns
- Base/Min/Max value inputs
- Real-time EV calculation preview
- Auto-generated descriptions

**ScenarioList** (`/src/components/dashboard/valuations/scenario-list.tsx`):

- Display all scenarios
- Show calculated ranges
- Delete functionality

## Data Storage

Each scenario stores:

- **Name & Description**: User-defined
- **minValue, maxValue**: Calculated enterprise values
- **minModelData, maxModelData**: Complete FinancialModel for each case
- **minResultsData, maxResultsData**: Complete CalculatedFinancials for each case

This ensures:
✅ **Reproducibility**: Can recreate exact calculation
✅ **Transparency**: See what assumptions led to each value
✅ **Analysis**: Compare detailed financials between scenarios

## Advantages Over Manual Entry

1. **More Intuitive**: Users think in terms of assumptions, not outcomes
2. **More Accurate**: Calculations are consistent and use the same engine
3. **Reproducible**: Full model data is stored
4. **Flexible**: Can combine multiple variables
5. **Transparent**: See exactly what drives the range

## Future Enhancements

1. **Quick Templates**: One-click scenarios
   - "Standard WACC ±2%"
   - "Growth Sensitivity ±5%"
   - "Margin Sensitivity ±3%"

2. **Preset Ranges**: Suggested ranges per variable
   - Based on industry standards
   - Historical volatility
   - User's past scenarios

3. **Variable Correlation**: Model dependent variables
   - Higher growth → Higher CAPEX
   - Lower margins → Higher OpEx

4. **Monte Carlo**: Probabilistic scenarios
   - Define probability distributions
   - Run thousands of simulations
   - Show confidence intervals

5. **Tornado Diagram**: Rank variable sensitivity
   - Which variables matter most?
   - Visual sensitivity ranking

## Related Files

- `/src/lib/scenario-variables.ts` - Variable definitions
- `/src/lib/scenario-calculator.ts` - Calculation engine
- `/src/components/dashboard/valuations/create-scenario-dialog.tsx` - Create UI
- `/src/components/dashboard/valuations/scenario-list.tsx` - Display UI
- `/src/utils/database/scenario.ts` - Database operations
- `/src/app/api/valuations/[id]/scenarios/route.ts` - API endpoints
