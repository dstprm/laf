# Valuation Types Usage Guide

This guide explains how to use the centralized type definitions for valuation data throughout the application.

## Overview

All valuation-related types are now centralized in `/src/lib/valuation.types.ts`. This ensures type safety and consistency across:

- Frontend state (modelStore)
- API endpoints
- Database operations
- Component props

## Core Types

### FinancialModel

Represents the complete financial model with all assumptions and inputs:

```typescript
import type { FinancialModel } from '@/lib/valuation.types';

const model: FinancialModel = {
  periods: {
    startYear: 2025,
    numberOfYears: 5,
    periodLabels: ['2025E', '2026E', '2027E', '2028E', '2029E'],
  },
  riskProfile: {
    selectedIndustry: 'Technology',
    selectedCountry: 'United States',
    unleveredBeta: 1.2,
    // ... other risk profile fields
  },
  revenue: {
    inputType: 'consolidated',
    consolidated: {
      inputMethod: 'growth',
      baseValue: 1000000,
      growthRate: 15,
      // ... other revenue fields
    },
  },
  // ... other financial model fields
};
```

### CalculatedFinancials

Represents the calculated results from a financial model:

```typescript
import type { CalculatedFinancials } from '@/lib/valuation.types';

const results: CalculatedFinancials = {
  revenue: [1000000, 1150000, 1322500, 1520875, 1749006],
  cogs: [400000, 460000, 529000, 608350, 699603],
  grossProfit: [600000, 690000, 793500, 912525, 1049404],
  // ... all other calculated arrays
  enterpriseValue: 12500000,
  equityValue: 12000000,
  // ... other calculated values
};
```

### ValuationRecord

Represents a complete valuation record from the database:

```typescript
import type { ValuationRecord } from '@/lib/valuation.types';

const valuation: ValuationRecord = {
  id: 'cuid123',
  userId: 'user123',
  name: 'Q4 2024 Valuation',
  modelData: {
    /* FinancialModel */
  },
  resultsData: {
    /* CalculatedFinancials */
  },
  enterpriseValue: 12500000,
  industry: 'Technology',
  country: 'United States',
  companyName: 'Acme Corp',
  companyWebsite: 'https://acme.com',
  companyPhone: '+1 555-0100',
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

## Usage in Different Parts of the Application

### 1. In API Routes

```typescript
// src/app/api/valuations/route.ts
import type {
  CreateValuationInput,
  CreateValuationResponse,
  isFinancialModel,
  isCalculatedFinancials,
} from '@/lib/valuation.types';

export async function POST(req: Request) {
  const body: CreateValuationInput = await req.json();

  // Validate the data structure
  if (!isFinancialModel(body.modelData)) {
    return NextResponse.json({ error: 'Invalid modelData structure' }, { status: 400 });
  }

  if (!isCalculatedFinancials(body.resultsData)) {
    return NextResponse.json({ error: 'Invalid resultsData structure' }, { status: 400 });
  }

  const valuation = await createValuation(body);
  return NextResponse.json<CreateValuationResponse>(valuation);
}
```

### 2. In Database Utilities

```typescript
// src/utils/database/valuation.ts
import type { FinancialModel, CalculatedFinancials, ValuationRecord } from '@/lib/valuation.types';

interface CreateValuationData {
  userId: string;
  modelData: FinancialModel; // Strongly typed!
  resultsData: CalculatedFinancials; // Strongly typed!
  // ... other fields
}

export async function createValuation(data: CreateValuationData) {
  return prisma.valuation.create({
    data: {
      userId: data.userId,
      modelData: data.modelData as Prisma.InputJsonValue,
      resultsData: data.resultsData as Prisma.InputJsonValue,
      // ... other fields
    },
  });
}

// Helper to parse database records with proper types
export function parseValuationRecord(record: any): ValuationRecord {
  return {
    ...record,
    modelData: record.modelData as FinancialModel,
    resultsData: record.resultsData as CalculatedFinancials,
  };
}
```

### 3. In Server Components

```typescript
// src/app/dashboard/valuations/[id]/page.tsx
import type { ValuationRecord } from '@/lib/valuation.types';
import { getValuationById, parseValuationRecord } from '@/utils/database/valuation';

export default async function ValuationDetailPage({ params }) {
  const rawValuation = await getValuationById(id, user.id);

  if (!rawValuation) {
    notFound();
  }

  // Parse to get properly typed modelData and resultsData
  const valuation: ValuationRecord = parseValuationRecord(rawValuation);

  // Now you can access typed fields
  const numberOfYears = valuation.modelData.periods.numberOfYears;
  const revenue = valuation.resultsData.revenue;
  const enterpriseValue = valuation.resultsData.enterpriseValue;

  return (
    <div>
      <h1>{valuation.name}</h1>
      <p>Enterprise Value: ${enterpriseValue.toLocaleString()}</p>
      {/* Component receives typed data */}
      <ValuationChart
        modelData={valuation.modelData}
        resultsData={valuation.resultsData}
      />
    </div>
  );
}
```

### 4. In Client Components

```typescript
// src/components/dashboard/valuations/valuation-detail-client.tsx
'use client';

import type { FinancialModel, CalculatedFinancials } from '@/lib/valuation.types';

interface ValuationDetailProps {
  valuationId: string;
  initialModelData: FinancialModel;
  initialResultsData: CalculatedFinancials;
  companyName: string | null;
}

export default function ValuationDetailClient({
  valuationId,
  initialModelData,
  initialResultsData,
  companyName,
}: ValuationDetailProps) {
  // All data is now properly typed
  const revenue = initialResultsData.revenue;
  const periods = initialModelData.periods.periodLabels;

  return (
    <div>
      <h2>{companyName}</h2>
      <table>
        {periods.map((period, i) => (
          <tr key={i}>
            <td>{period}</td>
            <td>${revenue[i].toLocaleString()}</td>
          </tr>
        ))}
      </table>
    </div>
  );
}
```

### 5. In the Model Store

The model store already uses these types from `@/app/valuation/types/financial`:

```typescript
// src/app/valuation/store/modelStore.ts
import type { FinancialModel, CalculatedFinancials } from '../types/financial';

interface ModelStore {
  model: FinancialModel;
  calculatedFinancials: CalculatedFinancials;
  // ... actions
}
```

## Type Guards

Use the provided type guards to validate data at runtime:

```typescript
import { isFinancialModel, isCalculatedFinancials } from '@/lib/valuation.types';

// Validate model data
if (isFinancialModel(data)) {
  // data is now typed as FinancialModel
  console.log(data.periods.numberOfYears);
} else {
  throw new Error('Invalid model data');
}

// Validate results data
if (isCalculatedFinancials(data)) {
  // data is now typed as CalculatedFinancials
  console.log(data.enterpriseValue);
} else {
  throw new Error('Invalid results data');
}
```

## Saving Valuations

When saving valuations from the frontend:

```typescript
'use client';

import { useModelStore } from '@/app/valuation/store/modelStore';
import type { CreateValuationInput } from '@/lib/valuation.types';

export function SaveValuationButton() {
  const { model, calculatedFinancials } = useModelStore();

  async function handleSave() {
    const payload: CreateValuationInput = {
      name: 'My Valuation',
      modelData: model,
      resultsData: calculatedFinancials,
      enterpriseValue: calculatedFinancials.enterpriseValue,
      companyName: 'Acme Corp',
      // ... other optional fields
    };

    const response = await fetch('/api/valuations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const valuation = await response.json();
      // valuation is typed as CreateValuationResponse
      console.log('Saved:', valuation.id);
    }
  }

  return <button onClick={handleSave}>Save Valuation</button>;
}
```

## Best Practices

1. **Always use the centralized types** from `/src/lib/valuation.types.ts` instead of `unknown` or `any`

2. **Validate data at API boundaries** using the type guards:

   ```typescript
   if (!isFinancialModel(data)) {
     return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
   }
   ```

3. **Parse database records** before using them:

   ```typescript
   const valuation = parseValuationRecord(rawValuation);
   ```

4. **Use proper types in function signatures**:

   ```typescript
   // Good
   function calculateMetrics(model: FinancialModel): CalculatedFinancials {}

   // Bad
   function calculateMetrics(model: any): any {}
   ```

5. **Leverage TypeScript's inference** but be explicit at boundaries:

   ```typescript
   // Explicit at API boundary
   const body: CreateValuationInput = await req.json();

   // Inference is fine within the function
   const name = body.name || 'Default Name';
   ```

## Migrating Existing Code

To migrate existing code to use these types:

1. Import the types:

   ```typescript
   import type { FinancialModel, CalculatedFinancials, ValuationRecord } from '@/lib/valuation.types';
   ```

2. Replace `unknown` or `any` with the proper types:

   ```typescript
   // Before
   const modelData: unknown = valuation.modelData;

   // After
   const modelData: FinancialModel = valuation.modelData as FinancialModel;
   // Or better, use parseValuationRecord
   const { modelData } = parseValuationRecord(valuation);
   ```

3. Add validation at API boundaries:

   ```typescript
   if (!isFinancialModel(data)) {
     throw new Error('Invalid model data');
   }
   ```

4. Update component props to use proper types:

   ```typescript
   // Before
   interface Props {
     modelData: any;
   }

   // After
   interface Props {
     modelData: FinancialModel;
   }
   ```

## Troubleshooting

### "Type 'unknown' is not assignable to type 'FinancialModel'"

Use a type assertion or the `parseValuationRecord` helper:

```typescript
// Option 1: Type assertion
const model = valuation.modelData as FinancialModel;

// Option 2: Use helper (preferred)
const { modelData } = parseValuationRecord(valuation);
```

### "Property does not exist on type 'Json'"

This means you're using the raw Prisma type. Parse it first:

```typescript
// Before
const years = valuation.modelData.periods.numberOfYears; // Error!

// After
const { modelData } = parseValuationRecord(valuation);
const years = modelData.periods.numberOfYears; // Works!
```

### "Argument of type '{ ... }' is not assignable to parameter..."

Make sure all required fields are present and properly typed:

```typescript
const payload: CreateValuationInput = {
  modelData: model, // Must be FinancialModel
  resultsData: results, // Must be CalculatedFinancials
  // Optional fields are fine to omit
};
```

## Related Files

- `/src/lib/valuation.types.ts` - Main type definitions
- `/src/app/valuation/types/financial.ts` - Core financial types
- `/src/utils/database/valuation.ts` - Database utilities
- `/src/app/api/valuations/route.ts` - API endpoints
- `/src/app/valuation/store/modelStore.ts` - State management
