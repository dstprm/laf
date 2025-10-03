# Scenario System Documentation

## Overview

The scenario system allows users to create custom sensitivity analyses for their valuations. Users select one or more financial variables (WACC, growth rate, margins, etc.), set min/max values for each, and the system automatically calculates the resulting enterprise value range. Each scenario appears as a bar on the football field chart.

## Architecture

### Database Schema

**Scenario Model** (`scenarios` table):

- `id`: Unique identifier
- `valuationId`: Reference to parent valuation
- `name`: Display name (e.g., "WACC Sensitivity ±2%", "Optimistic Case")
- `description`: Optional description
- `minValue`: Lower bound enterprise value
- `maxValue`: Upper bound enterprise value
- `minModelData`: Optional JSON - FinancialModel that produced minValue
- `maxModelData`: Optional JSON - FinancialModel that produced maxValue
- `minResultsData`: Optional JSON - CalculatedFinancials for min case
- `maxResultsData`: Optional JSON - CalculatedFinancials for max case
- `createdAt`, `updatedAt`: Timestamps

### Key Design Decisions

1. **Separate Table**: Scenarios are stored in their own table instead of as a JSON column on valuations
   - Better queryability and indexing
   - Easier to manage individual scenarios
   - Follows relational database best practices

2. **Range-Based**: Each scenario stores both a min and max value
   - Allows flexible representation of sensitivity analysis
   - Can display as bars on football field chart
   - Supports asymmetric ranges (e.g., optimistic case with +50% upside, -20% downside)

3. **Optional Model Data**: Can optionally store the model inputs that generated each value
   - Useful for reproducibility
   - Not required for basic scenarios
   - Allows recreation of the exact calculation if needed

## API Endpoints

### Get Scenarios for a Valuation

```
GET /api/valuations/[id]/scenarios
```

Returns all scenarios for a valuation, ordered by creation date.

### Create a Scenario

```
POST /api/valuations/[id]/scenarios
```

Body:

```json
{
  "name": "WACC Sensitivity ±2%",
  "description": "Sensitivity analysis varying WACC by ±2%",
  "minValue": 8000000,
  "maxValue": 12000000,
  "minModelData": { ... },  // Optional
  "maxModelData": { ... }   // Optional
}
```

### Get Single Scenario

```
GET /api/valuations/[id]/scenarios/[scenarioId]
```

### Update Scenario

```
PATCH /api/valuations/[id]/scenarios/[scenarioId]
```

### Delete Scenario

```
DELETE /api/valuations/[id]/scenarios/[scenarioId]
```

## UI Components

### ScenarioList

Located at: `src/components/dashboard/valuations/scenario-list.tsx`

Displays all scenarios for a valuation with:

- Scenario name and description
- Min/Max value range
- Value spread
- Delete action
- Create scenario button

Props:

- `valuationId`: The valuation ID
- `baseValue`: Base enterprise value for reference
- `onScenariosChange`: Callback when scenarios are updated

### CreateScenarioDialog

Located at: `src/components/dashboard/valuations/create-scenario-dialog.tsx`

Modal dialog for creating new scenarios with:

- Name input (required)
- Description textarea (optional)
- Min/Max value inputs (required)
- Quick suggestion buttons (±10%, ±20%, ±30% of base value)

### Football Field Chart Integration

Located at: `src/components/dashboard/valuations/valuation-edit-client.tsx`

The football field chart now displays saved scenarios instead of hardcoded sensitivity ranges. Each scenario appears as a horizontal bar showing the min/max range with the base valuation marked with a red line.

## Usage Examples

### Creating a Basic Scenario

```typescript
// User creates a scenario manually
const scenario = {
  name: 'Conservative Case',
  minValue: 7500000,
  maxValue: 9000000,
};
```

### Creating a WACC Sensitivity Scenario

```typescript
// Calculate min/max by varying WACC
const baseValue = 10000000;
const waccDelta = 0.02; // ±2%

// Calculate new EVs with adjusted WACC
const minValue = calculateEV(wacc + waccDelta);
const maxValue = calculateEV(wacc - waccDelta);

const scenario = {
  name: 'WACC Sensitivity ±2%',
  description: 'Enterprise value sensitivity to 2% change in WACC',
  minValue,
  maxValue,
  minModelData: modelWithHigherWacc,
  maxModelData: modelWithLowerWacc,
};
```

### Creating Multiple Scenarios

Users can create multiple scenarios for the same valuation:

- WACC Sensitivity
- Growth Rate Sensitivity
- EBITDA Multiple Sensitivity
- Optimistic Case
- Conservative Case
- Base Case Variations

All scenarios will appear together on the football field chart.

## Migration from Old System

The previous system stored scenario data as a JSON column (`scenarioAnalysis`) on the valuations table. This has been removed and replaced with the new scenarios table.

Migration: `20251003015649_refactor_scenarios_to_separate_table`

- Drops `scenario_analysis` column from `valuations` table
- Creates `scenarios` table with proper structure
- Adds foreign key constraint and indexes

## Future Enhancements

Potential improvements:

1. **Scenario Templates**: Pre-built scenario types (WACC ±X%, Growth ±Y%, etc.)
2. **Automatic Calculation**: Auto-generate scenarios from sensitivity parameters
3. **Scenario Comparison**: Side-by-side comparison of different scenarios
4. **Export**: Export scenarios to Excel/PDF reports
5. **Scenario Groups**: Group related scenarios together
6. **Historical Tracking**: Track how scenarios evolve over time
7. **Sharing**: Share specific scenarios with team members

## Best Practices

1. **Naming Convention**: Use descriptive names that clearly indicate what the scenario represents
   - Good: "WACC Sensitivity ±2%", "Optimistic Growth Case"
   - Bad: "Scenario 1", "Test"

2. **Range Selection**: Choose realistic ranges based on:
   - Historical volatility
   - Industry benchmarks
   - Management guidance
   - Market conditions

3. **Documentation**: Use the description field to explain:
   - What parameters were varied
   - Why these ranges were chosen
   - Key assumptions

4. **Number of Scenarios**: Keep the football field chart readable
   - Recommended: 3-6 scenarios
   - Too many scenarios can make the chart cluttered

## Related Documentation

- [Football Field Chart Component](../src/components/dashboard/valuations/football-field-chart.tsx)
- [Valuation Types](../src/lib/valuation.types.ts)
- [Database Schema](../prisma/schema.prisma)
