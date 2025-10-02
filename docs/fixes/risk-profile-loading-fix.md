# Risk Profile Loading Fix

## Issue

When editing a saved valuation in the dashboard (`/dashboard/valuations/[id]`), the risk profile data was not loading properly. Only the financial data (revenue, expenses, etc.) was loading, but the industry, country, and risk-related fields were missing.

## Root Cause

The issue was in `/src/components/dashboard/valuations/valuation-edit-client.tsx`:

1. **Type coercion with `as any`**: The saved model data was being loaded with `as any`, which could cause type information loss:

```typescript
useModelStore.setState({
  model: initialModelData as any, // ❌ Type information lost
  calculatedFinancials: initialResultsData as any,
});
```

2. **No fallback for missing riskProfile**: If `riskProfile` was missing or undefined in the saved data, there was no fallback logic to populate it.

3. **Weak typing in save payload**: The `free-valuation` page was using `unknown` types for `modelData` and `resultsData`, which didn't enforce the correct structure.

## Solution

### 1. Fixed ValuationEditClient Loading (Primary Fix)

**File**: `/src/components/dashboard/valuations/valuation-edit-client.tsx`

```typescript
// Before
useModelStore.setState({
  model: initialModelData as any,
  calculatedFinancials: initialResultsData as any,
});

// After
useModelStore.setState({
  model: {
    ...initialModelData,
    // Ensure riskProfile is properly set, fallback to defaults if missing
    riskProfile: initialModelData.riskProfile || {
      selectedIndustry: industry || null,
      selectedCountry: country || null,
      unleveredBeta: 0,
      leveredBeta: 0,
      equityRiskPremium: 0,
      countryRiskPremium: 0,
      deRatio: 0,
      adjustedDefaultSpread: 0,
      companySpread: 0.05,
      riskFreeRate: 0.0444,
      corporateTaxRate: 0.25,
    },
  },
  calculatedFinancials: initialResultsData,
});
```

**Key improvements:**

- ✅ Removed `as any` type coercion
- ✅ Added fallback logic for missing riskProfile
- ✅ Uses industry and country from props if riskProfile is missing
- ✅ Added console logging for debugging

### 2. Improved Type Safety in Save Function

**File**: `/src/app/free-valuation/page.tsx`

```typescript
// Before
const payload: {
  name: string;
  modelData: unknown;  // ❌ Weak typing
  resultsData: unknown;
  // ...
} = { ... };

// After
import type { CreateValuationInput } from '@/lib/valuation.types';

const payload: CreateValuationInput = {
  name: valuationDisplayName,
  modelData: model,  // ✅ Strongly typed as FinancialModel
  resultsData: calculatedFinancials,  // ✅ Strongly typed as CalculatedFinancials
  // ...
};
```

**Key improvements:**

- ✅ Uses proper `CreateValuationInput` type
- ✅ Ensures correct structure at compile time
- ✅ Added console logging to verify riskProfile is included

## Testing

To verify the fix works:

1. **Create a new valuation** in `/free-valuation`:
   - Select an industry and country
   - Complete the valuation
   - Save it
   - Check console: "Saving valuation with riskProfile: { ... }"

2. **Edit the saved valuation** in `/dashboard/valuations/[id]`:
   - Click "Edit" button
   - Check console: "Loading valuation data into store: { hasRiskProfile: true, riskProfile: { ... } }"
   - Check console: "Model loaded. Current riskProfile: { ... }"
   - Verify the Industry/Country Selector shows the saved values
   - Verify risk-related calculations use the saved data

3. **Verify fallback logic**:
   - For old valuations that might not have riskProfile saved
   - The editor should still load with default values
   - Industry and country from props should populate if available

## Debug Console Logs

When editing a valuation, you should see:

```
Loading valuation data into store: {
  hasRiskProfile: true,
  riskProfile: {
    selectedIndustry: "Technology",
    selectedCountry: "United States",
    unleveredBeta: 1.23,
    leveredBeta: 1.45,
    // ... other fields
  }
}

Model loaded. Current riskProfile: {
  selectedIndustry: "Technology",
  selectedCountry: "United States",
  // ... all fields populated
}
```

When saving a valuation from free-valuation:

```
Saving valuation with riskProfile: {
  selectedIndustry: "Technology",
  selectedCountry: "United States",
  unleveredBeta: 1.23,
  // ... other fields
}
```

## Files Modified

1. ✅ `/src/components/dashboard/valuations/valuation-edit-client.tsx`
   - Fixed model loading logic
   - Added riskProfile fallback
   - Added debug logging

2. ✅ `/src/app/free-valuation/page.tsx`
   - Updated to use `CreateValuationInput` type
   - Added debug logging

## Related Types

The risk profile structure is defined in `/src/app/valuation/types/financial.ts`:

```typescript
export interface RiskProfile {
  selectedIndustry: string | null;
  selectedCountry: string | null;
  unleveredBeta: number;
  leveredBeta: number;
  equityRiskPremium: number;
  countryRiskPremium: number;
  deRatio: number;
  adjustedDefaultSpread: number;
  companySpread: number;
  riskFreeRate: number;
  corporateTaxRate: number;
}
```

## Prevention

To prevent similar issues in the future:

1. **Always use proper types** instead of `as any` or `unknown`
2. **Add fallback logic** for optional fields when loading from database
3. **Use type guards** at API boundaries to validate structure
4. **Add console logging** during development to verify data flow
5. **Test the full cycle**: Create → Save → Load → Edit

## Benefits

After this fix:

- ✅ Risk profile data loads correctly when editing valuations
- ✅ WACC calculations use saved industry/country data
- ✅ Industry Country Selector shows correct values
- ✅ Fallback ensures old valuations still work
- ✅ Type safety prevents future issues
- ✅ Debug logs help troubleshoot any issues

## Backward Compatibility

This fix is backward compatible:

- Old valuations without riskProfile will use defaults
- Industry/country from database fields will be used as fallback
- No migration needed
- Existing valuations continue to work
