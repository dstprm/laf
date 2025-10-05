'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { RevenueEbitdaChart } from '@/components/dashboard/valuations/revenue-ebitda-chart';
import { FootballFieldChart } from '@/components/dashboard/valuations/football-field-chart';
import { ScenarioList } from '@/components/dashboard/valuations/scenario-list';
import { ScenarioListLocal } from '@/components/dashboard/valuations/scenario-list-local';
import type { FinancialModel, CalculatedFinancials } from '@/lib/valuation.types';

interface LocalScenario {
  name: string;
  description?: string;
  minValue: number;
  maxValue: number;
}

interface ResultData {
  id: string;
  name: string;
  enterpriseValue: number;
  ebitdaMarginPct: number;
  revenueGrowthPct: number;
}

interface ValuationResultsDisplayProps {
  results: ResultData[] | null;
  model: FinancialModel;
  calculatedFinancials: CalculatedFinancials;
  localScenarios: LocalScenario[];
  setLocalScenarios: (scenarios: LocalScenario[]) => void;
  savedValuationId: string | null;
  isSignedIn: boolean | undefined;
  isSaving: boolean;
  onSave?: () => void;
  onNavigateToDashboard?: () => void;
  showYears?: number;
  chartTitle?: string;
}

const currency = (v: number) =>
  v.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function ValuationResultsDisplay({
  results,
  model,
  calculatedFinancials,
  localScenarios,
  setLocalScenarios,
  savedValuationId,
  isSignedIn,
  isSaving,
  onSave,
  onNavigateToDashboard,
  showYears = 5,
  chartTitle,
}: ValuationResultsDisplayProps) {
  // Track database scenarios separately when valuation is saved
  const [dbScenarios, setDbScenarios] = React.useState<LocalScenario[]>([]);

  // Debug logging
  React.useEffect(() => {
    console.log('ValuationResultsDisplay: localScenarios updated', {
      count: localScenarios.length,
      scenarios: localScenarios,
    });
  }, [localScenarios]);

  React.useEffect(() => {
    console.log('ValuationResultsDisplay: dbScenarios updated', {
      count: dbScenarios.length,
      scenarios: dbScenarios,
    });
  }, [dbScenarios]);

  if (!results) {
    return null;
  }

  const baseValue = results?.find((r) => r.id === 'base')?.enterpriseValue || calculatedFinancials.enterpriseValue || 0;

  // Use dbScenarios if valuation is saved, otherwise use localScenarios
  const scenariosForChart = savedValuationId ? dbScenarios : localScenarios;

  return (
    <>
      {/* Results Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {results.map((r) => (
          <div key={r.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600">{r.name} scenario</div>
            <div className="text-2xl font-semibold text-gray-900 mt-1">{currency(r.enterpriseValue)}</div>
            <div className="text-xs text-gray-600 mt-2">
              <div>EBITDA margin: {r.ebitdaMarginPct}%</div>
              <div>Revenue growth: {r.revenueGrowthPct}%/yr</div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue & EBITDA Margin Chart */}
      {calculatedFinancials.revenue.length > 0 && (
        <div className="mt-6">
          <RevenueEbitdaChart
            revenues={calculatedFinancials.revenue.slice(0, showYears)}
            ebitdaMargins={calculatedFinancials.ebitdaMargin.slice(0, showYears)}
            years={model.periods.periodLabels.slice(0, showYears)}
            title={chartTitle || `Revenue & EBITDA Margin Projection (${showYears}-Year)`}
          />
        </div>
      )}

      {/* Football Field Valuation Chart */}
      {scenariosForChart.length > 0 && (
        <div className="mt-6">
          <FootballFieldChart
            ranges={scenariosForChart.map((s) => ({
              scenario: s.name,
              min: s.minValue,
              max: s.maxValue,
              base: baseValue,
            }))}
            title="Valuation Sensitivity Analysis"
          />
        </div>
      )}

      {/* Scenario Management */}
      {!savedValuationId ? (
        <div className="mt-6">
          <ScenarioListLocal
            scenarios={localScenarios}
            onChange={setLocalScenarios}
            baseModel={model}
            baseResults={calculatedFinancials}
            baseValue={baseValue}
          />
        </div>
      ) : (
        <div className="mt-6">
          <ScenarioList
            valuationId={savedValuationId}
            baseValue={baseValue}
            baseModel={model}
            baseResults={calculatedFinancials}
            onScenariosChange={(scenarios) => {
              // Convert database scenarios to LocalScenario format
              const localScenarioFormat = scenarios.map((s) => ({
                name: s.name,
                description: s.description || undefined,
                minValue: s.minValue,
                maxValue: s.maxValue,
              }));
              console.log('ValuationResultsDisplay: Received scenarios from ScenarioList', localScenarioFormat);
              setDbScenarios(localScenarioFormat);
            }}
          />
        </div>
      )}

      {/* Action Buttons */}
      {isSignedIn && onNavigateToDashboard && (
        <div className="mt-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onNavigateToDashboard}>
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Go to Dashboard
          </Button>
          {savedValuationId && onSave && (
            <Button onClick={onSave} disabled={isSaving}>
              {isSaving ? 'Updating...' : 'Update Valuation'}
            </Button>
          )}
        </div>
      )}
    </>
  );
}
