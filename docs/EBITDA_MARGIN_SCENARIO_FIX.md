# EBITDA Margin Scenario Calculation Fix

## Problem

The previous EBITDA margin scenario implementation had a critical flaw: it would calculate the **average** EBITDA margin across all forecast years, then apply a **uniform** margin adjustment to achieve the min/max scenario values.

### Why This Was Wrong

Due to the time value of money (discounting), this approach could produce scenario ranges where the **base case enterprise value fell outside** the min-max range. Here's why:

1. Different years have different discount factors (exponentials)
2. A uniform margin change across all years doesn't preserve the relative impact of year-by-year variations
3. If base case has varying margins (e.g., 30%, 35%, 40%, 45%, 50%), the average might be 40%
4. Applying uniform 35% and 45% margins could produce a different valuation range than the base case

**Example:**
- Base case: Margins of [30%, 35%, 40%, 45%, 50%] → EV = $10M
- Old approach: Apply uniform 35% and 45% → Range might be [$9M, $11.5M]
- Problem: Base EV ($10M) is in range, but due to timing of cash flows, it could fall outside

## Solution

The new implementation applies the **margin adjustment to each year individually**, preserving year-over-year variation:

1. Calculate base EBITDA margins for each year: [30%, 35%, 40%, 45%, 50%]
2. Calculate average: 40%
3. Calculate adjustment: Target (45%) - Average (40%) = +5%
4. Apply +5% to **each year**: [35%, 40%, 45%, 50%, 55%]

### Mathematical Formula

To correctly adjust EBITDA margins while accounting for COGS and other items:

```
EBITDA = GrossProfit - OpEx + OtherIncome - OtherExpenses
EBITDA_Margin = (EBITDA / Revenue) * 100

To achieve target EBITDA margin by adjusting OpEx:
OpEx% = GrossProfit% + OtherIncome% - OtherExpenses% - Target_EBITDA_Margin%
```

## Implementation Details

### Changes in `scenario-calculator.ts`

The `applyVariableAdjustments` function for `ebitda_margin` case now:

1. Calculates base financials to get year-by-year EBITDA margins
2. Computes the average base margin
3. Determines the adjustment amount (target - average)
4. For each year:
   - Applies the adjustment to that year's base margin
   - Calculates required OpEx% using the formula above
   - Stores in `individualPercents` object
5. Sets OpEx to use `individual` percent method instead of `uniform`

### Key Code Section

```typescript
case 'ebitda_margin':
  // Calculate base financials
  const baseMargins = baseFinancials.ebitdaMargin || [];
  const avgBaseMargin = baseMargins.reduce((sum, m) => sum + m, 0) / baseMargins.length;
  const adjustmentAmount = value - avgBaseMargin;
  
  // Apply adjustment to each year individually
  for (let i = 0; i < baseMargins.length; i++) {
    const adjustedMargin = baseMargin[i] + adjustmentAmount;
    const opexPercent = grossProfitPercent + otherIncomePercent 
                       - otherExpensesPercent - adjustedMargin;
    individualPercents[i] = opexPercent;
  }
  
  // Use individual percents instead of uniform
  model.opex.consolidated.percentMethod = 'individual';
  model.opex.consolidated.individualPercents = individualPercents;
```

## Testing

Added comprehensive test case to verify the fix:

```typescript
it('should ensure base case EV falls within EBITDA margin scenario range', () => {
  // Create model with varying margins: 35%, 40%, 45%, 50%, 55%
  // Apply +/- 5% scenario adjustment
  // Assert: baseEV >= minValue && baseEV <= maxValue ✓
});
```

This test ensures that with the new approach, the base case enterprise value **always** falls within the scenario range, as it mathematically should.

## Benefits

1. **Correct valuation ranges**: Base case always falls within min-max scenarios
2. **Preserves year-over-year trends**: If margins improve over time, scenarios maintain that trend
3. **Proper discounting impact**: Each year's adjustment is discounted with the correct time factor
4. **More intuitive**: "+5% EBITDA margin" now means "add 5 percentage points to each year's margin"

## Migration Notes

- Existing scenarios using EBITDA margin adjustments will automatically use the new logic
- No database schema changes required
- Old scenarios will calculate correctly with the new approach
- Users may notice slightly different scenario ranges (more accurate)

## Related Files

- `/src/lib/scenario-calculator.ts` - Core logic implementation
- `/src/__tests__/logic/scenario-calculations.test.ts` - Updated tests
- `/src/lib/scenario-variables.ts` - Variable definitions (no changes)

