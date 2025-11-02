# Testing Guide

This project includes comprehensive testing capabilities for both logic and frontend components.

## Overview

The testing suite includes:

- **Logic Tests**: Unit tests for DCF calculations and scenario calculations
- **Component Tests**: Tests for chart components and valuation results display
- **Coverage**: Tests ensure calculations output correctly and UI renders properly

## Setup

Install dependencies:

```bash
pnpm install
```

## Running Tests

### Run all tests

```bash
pnpm test
```

### Run tests in watch mode

```bash
pnpm test:watch
```

### Run tests with coverage report

```bash
pnpm test:coverage
```

### Run only logic tests (DCF and scenario calculations)

```bash
pnpm test:logic
```

### Run only frontend/component tests

```bash
pnpm test:frontend
```

## Test Structure

```
src/
  __tests__/
    logic/
      dcf-calculations.test.ts      # DCF calculation unit tests
      scenario-calculations.test.ts  # Scenario calculation unit tests
    components/
      charts.test.tsx                # Chart component tests
      valuation-results-display.test.tsx  # Valuation results display tests
```

## Logic Tests

### DCF Calculation Tests (`dcf-calculations.test.ts`)

Tests verify that DCF calculations output correctly:

- **Revenue Calculation**: Tests uniform and individual growth rates
- **EBITDA Calculation**: Tests EBITDA and margin calculations
- **Free Cash Flow**: Tests FCF calculation (Net Income + D&A - CAPEX - Change in NWC)
- **Terminal Value**: Tests both growth and multiples methods
- **Discounted Cash Flows**: Tests DCF discounting with WACC
- **Enterprise Value**: Tests EV calculation (sum of DCFs + PV of terminal value)
- **Equity Value**: Tests equity value calculation (EV - Net Debt + Cash)
- **WACC Calculation**: Tests WACC calculation with and without debt
- **Edge Cases**: Tests zero revenue, negative FCF, etc.

### Scenario Calculation Tests (`scenario-calculations.test.ts`)

Tests verify that scenario calculations output correctly:

- **Variable Adjustments**: Tests all variable types (WACC, revenue growth, EBITDA margin, terminal values, etc.)
- **Scenario Values**: Tests min/max scenario value calculation
- **Multiple Adjustments**: Tests scenarios with multiple variable adjustments
- **Edge Cases**: Tests empty adjustments, extreme values, etc.

## Component Tests

### Chart Component Tests (`charts.test.tsx`)

Tests verify that charts render and display data correctly:

- **FootballFieldChart**: Tests rendering with various data ranges, currency formatting, summary statistics
- **RevenueEbitdaChart**: Tests rendering with revenue and margin data, year labels, custom heights

### Valuation Results Display Tests (`valuation-results-display.test.tsx`)

Tests verify that valuation results are displayed correctly:

- **Results Cards**: Tests display of enterprise values with proper currency formatting
- **Charts**: Tests conditional rendering of charts based on data availability
- **Scenarios**: Tests scenario display and management
- **Data Handling**: Tests handling of missing data, empty arrays, zero values

## Test Coverage

The test suite aims for:

- **Logic Tests**: High coverage of calculation functions (>90%)
- **Component Tests**: Coverage of rendering and data display logic

Run `pnpm test:coverage` to see detailed coverage reports.

## Writing New Tests

### Adding Logic Tests

1. Create a test file in `src/__tests__/logic/`
2. Import the functions you want to test
3. Use the helper functions (`createTestModel`) to create test data
4. Write test cases using `describe` and `it` blocks

Example:

```typescript
import { calculateEnterpriseValue } from '@/lib/scenario-calculator';

describe('My Calculation', () => {
  it('should calculate correctly', () => {
    const model = createTestModel({
      /* overrides */
    });
    const result = calculateEnterpriseValue(model);
    expect(result.enterpriseValue).toBeGreaterThan(0);
  });
});
```

### Adding Component Tests

1. Create a test file in `src/__tests__/components/`
2. Import React Testing Library utilities
3. Mock any dependencies if needed
4. Render components and test their behavior

Example:

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from '@/components/my-component';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent data={mockData} />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## Best Practices

1. **Test Business Logic**: Focus on testing calculation logic, not implementation details
2. **Use Descriptive Names**: Test names should clearly describe what is being tested
3. **Test Edge Cases**: Include tests for zero values, empty arrays, negative numbers, etc.
4. **Keep Tests Independent**: Each test should be able to run independently
5. **Mock External Dependencies**: Mock API calls, database queries, and external services
6. **Test User Interactions**: For components, test what users see and can interact with

## Debugging Tests

- Use `console.log` in tests if needed (will be suppressed unless the test fails)
- Use `--no-coverage` flag to speed up test runs during development
- Use `--verbose` flag to see detailed test output

## Continuous Integration

Tests should be run:

- Before committing code (use pre-commit hooks)
- On pull requests
- Before deploying to production

## Troubleshooting

### Tests fail with "Cannot find module"

- Make sure you've run `pnpm install`
- Check that `tsconfig.json` paths are correctly configured

### Tests fail with "window is not defined"

- Make sure you're using `jest-environment-jsdom` in your test file
- Check `jest.setup.js` for proper configuration

### Component tests fail with styling errors

- Mock CSS imports if needed: `jest.mock('*.css', {})`
- Check that Tailwind classes are properly configured

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
