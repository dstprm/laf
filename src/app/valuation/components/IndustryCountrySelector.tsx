import React, { useState, useEffect } from 'react';
import { Globe, Building, Calculator, TrendingUp, ChevronDown, ChevronUp, Lock, HelpCircle } from 'lucide-react';
import { betasStatic } from '../betasStatic';
import { countryRiskPremiumStatic } from '../countryRiskPremiumStatic';
import { useModelStore } from '../store/modelStore';
import { Tooltip } from '@/components/ui/tooltip';
import { calculateWacc } from '@/utils/wacc-calculator';

interface IndustryCountrySelectorProps {
  className?: string;
  waccExpanded?: boolean;
  readOnly?: boolean;
}

export const IndustryCountrySelector: React.FC<IndustryCountrySelectorProps> = ({
  className = '',
  waccExpanded = true,
  readOnly = false,
}) => {
  const { model, updateRiskProfile, updateSelectedIndustry } = useModelStore();

  // Helper functions
  const formatPercent = (value: number): string => (value * 100).toFixed(2);
  const parsePercent = (value: string): number => parseFloat(value) / 100;

  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(model.riskProfile?.selectedIndustry || null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(model.riskProfile?.selectedCountry || null);
  const [isWaccExpanded, setIsWaccExpanded] = useState<boolean>(waccExpanded);
  const isSyncingRef = React.useRef<boolean>(false); // Use ref to prevent circular updates

  // Risk profile inputs - store as strings to allow proper typing
  const [unleveredBetaStr, setUnleveredBetaStr] = useState<string>(model.riskProfile?.unleveredBeta?.toString() || '0');
  const [leveredBetaStr, setLeveredBetaStr] = useState<string>(model.riskProfile?.leveredBeta?.toString() || '0');
  const [equityRiskPremiumStr, setEquityRiskPremiumStr] = useState<string>(
    formatPercent(model.riskProfile?.equityRiskPremium || 0),
  );
  const [countryRiskPremiumStr, setCountryRiskPremiumStr] = useState<string>(
    formatPercent(model.riskProfile?.countryRiskPremium || 0),
  );
  const [deRatioStr, setDeRatioStr] = useState<string>(model.riskProfile?.deRatio?.toString() || '0');
  const [adjustedDefaultSpreadStr, setAdjustedDefaultSpreadStr] = useState<string>(
    formatPercent(model.riskProfile?.adjustedDefaultSpread || 0),
  );
  const [companySpreadStr, setCompanySpreadStr] = useState<string>(
    formatPercent(model.riskProfile?.companySpread || 0),
  );
  const [riskFreeRateStr, setRiskFreeRateStr] = useState<string>(
    formatPercent(model.riskProfile?.riskFreeRate || 0.0444),
  );
  const [corporateTaxRateStr, setCorporateTaxRateStr] = useState<string>(
    formatPercent(model.riskProfile?.corporateTaxRate || 0),
  );
  const [waccPremiumStr, setWaccPremiumStr] = useState<string>(
    formatPercent(model.riskProfile?.waccPremium || 0),
  );

  // Parse numeric values for calculations
  const unleveredBeta = parseFloat(unleveredBetaStr) || 0;
  const leveredBeta = parseFloat(leveredBetaStr) || 0;
  const equityRiskPremium = parsePercent(equityRiskPremiumStr) || 0;
  const countryRiskPremium = parsePercent(countryRiskPremiumStr) || 0;
  const deRatio = parseFloat(deRatioStr) || 0;
  const adjustedDefaultSpread = parsePercent(adjustedDefaultSpreadStr) || 0;
  const companySpread = parsePercent(companySpreadStr) || 0;
  const riskFreeRate = parsePercent(riskFreeRateStr) || 0;
  const corporateTaxRate = parsePercent(corporateTaxRateStr) || 0;
  const waccPremium = parsePercent(waccPremiumStr) || 0;

  // Get available industries and countries
  const industries = Object.keys(betasStatic);
  const countries = Object.keys(countryRiskPremiumStatic);

  // Get industry average D/E ratio for reference
  const industryAvgDeRatio = selectedIndustry
    ? (betasStatic[selectedIndustry as keyof typeof betasStatic]?.dERatio ?? null)
    : null;

  // Force sync on mount and when riskProfile changes (important for when loading saved data)
  useEffect(() => {
    console.log('[IndustryCountrySelector] Sync effect triggered', {
      hasRiskProfile: !!model.riskProfile,
      industry: model.riskProfile?.selectedIndustry,
      country: model.riskProfile?.selectedCountry,
    });

    if (!model.riskProfile) {
      console.log('[IndustryCountrySelector] No riskProfile yet, skipping sync');
      return;
    }

    const newIndustry = model.riskProfile.selectedIndustry || null;
    const newCountry = model.riskProfile.selectedCountry || null;

    console.log('[IndustryCountrySelector] Syncing with store:', { newIndustry, newCountry });

    // Set isSyncing to prevent the update effect from triggering
    isSyncingRef.current = true;

    // Force update even if values appear the same
    setSelectedIndustry(newIndustry);
    setSelectedCountry(newCountry);

    // Update all WACC fields
    setUnleveredBetaStr(model.riskProfile.unleveredBeta?.toString() || '0');
    setLeveredBetaStr(model.riskProfile.leveredBeta?.toString() || '0');
    setEquityRiskPremiumStr(formatPercent(model.riskProfile.equityRiskPremium || 0));
    setCountryRiskPremiumStr(formatPercent(model.riskProfile.countryRiskPremium || 0));
    setDeRatioStr(model.riskProfile.deRatio?.toString() || '0');
    setAdjustedDefaultSpreadStr(formatPercent(model.riskProfile.adjustedDefaultSpread || 0));
    setCompanySpreadStr(formatPercent(model.riskProfile.companySpread || 0.05));
    setRiskFreeRateStr(formatPercent(model.riskProfile.riskFreeRate || 0.0444));
    setCorporateTaxRateStr(formatPercent(model.riskProfile.corporateTaxRate || 0.25));
    setWaccPremiumStr(formatPercent(model.riskProfile.waccPremium || 0));

    // Reset isSyncing after a short delay to ensure state updates have completed
    setTimeout(() => {
      isSyncingRef.current = false;
    }, 100);

    console.log('[IndustryCountrySelector] ✅ Sync complete');
  }, [model.riskProfile]); // Re-run when riskProfile changes

  // Sync with model when it changes (important for when loading saved data)
  useEffect(() => {
    if (!model.riskProfile) return;

    // Batch all state updates together to avoid race conditions
    const updates: (() => void)[] = [];

    const newIndustry = model.riskProfile.selectedIndustry || null;
    const newCountry = model.riskProfile.selectedCountry || null;

    if (selectedIndustry !== newIndustry) {
      updates.push(() => setSelectedIndustry(newIndustry));
    }
    if (selectedCountry !== newCountry) {
      updates.push(() => setSelectedCountry(newCountry));
    }

    // Update all numeric fields
    const newUnleveredBeta = model.riskProfile.unleveredBeta?.toString() || '0';
    const newLeveredBeta = model.riskProfile.leveredBeta?.toString() || '0';
    const newEquityRiskPremium = formatPercent(model.riskProfile.equityRiskPremium || 0);
    const newCountryRiskPremium = formatPercent(model.riskProfile.countryRiskPremium || 0);
    const newDeRatio = model.riskProfile.deRatio?.toString() || '0';
    const newAdjustedDefaultSpread = formatPercent(model.riskProfile.adjustedDefaultSpread || 0);
    const newCompanySpread = formatPercent(model.riskProfile.companySpread || 0.05);
    const newRiskFreeRate = formatPercent(model.riskProfile.riskFreeRate || 0.0444);
    const newCorporateTaxRate = formatPercent(model.riskProfile.corporateTaxRate || 0.25);

    if (unleveredBetaStr !== newUnleveredBeta) updates.push(() => setUnleveredBetaStr(newUnleveredBeta));
    if (leveredBetaStr !== newLeveredBeta) updates.push(() => setLeveredBetaStr(newLeveredBeta));
    if (equityRiskPremiumStr !== newEquityRiskPremium)
      updates.push(() => setEquityRiskPremiumStr(newEquityRiskPremium));
    if (countryRiskPremiumStr !== newCountryRiskPremium)
      updates.push(() => setCountryRiskPremiumStr(newCountryRiskPremium));
    if (deRatioStr !== newDeRatio) updates.push(() => setDeRatioStr(newDeRatio));
    if (adjustedDefaultSpreadStr !== newAdjustedDefaultSpread)
      updates.push(() => setAdjustedDefaultSpreadStr(newAdjustedDefaultSpread));
    if (companySpreadStr !== newCompanySpread) updates.push(() => setCompanySpreadStr(newCompanySpread));
    if (riskFreeRateStr !== newRiskFreeRate) updates.push(() => setRiskFreeRateStr(newRiskFreeRate));
    if (corporateTaxRateStr !== newCorporateTaxRate) updates.push(() => setCorporateTaxRateStr(newCorporateTaxRate));

    // Execute all updates if there are any changes
    if (updates.length > 0) {
      console.log(`Syncing ${updates.length} risk profile fields from store to UI`);
      isSyncingRef.current = true;
      updates.forEach((update) => update());
      // Reset sync flag after updates complete
      setTimeout(() => {
        isSyncingRef.current = false;
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    model.riskProfile?.selectedIndustry,
    model.riskProfile?.selectedCountry,
    model.riskProfile?.unleveredBeta,
    model.riskProfile?.leveredBeta,
    model.riskProfile?.equityRiskPremium,
    model.riskProfile?.countryRiskPremium,
    model.riskProfile?.deRatio,
    model.riskProfile?.adjustedDefaultSpread,
    model.riskProfile?.companySpread,
    model.riskProfile?.riskFreeRate,
    model.riskProfile?.corporateTaxRate,
  ]); // Sync when any risk profile value changes

  // Update suggestions when industry or country changes (but not during sync from saved data)
  useEffect(() => {
    // Skip if we're syncing from saved data
    if (isSyncingRef.current) {
      return;
    }

    if (selectedIndustry && selectedCountry) {
      const industryData = betasStatic[selectedIndustry as keyof typeof betasStatic];
      const countryData = countryRiskPremiumStatic[selectedCountry as keyof typeof countryRiskPremiumStatic];

      if (industryData && countryData) {
        setUnleveredBetaStr(industryData.unleveredBeta.toString());
        setLeveredBetaStr(industryData.beta.toString());
        setEquityRiskPremiumStr(formatPercent(countryData.equityRiskPremium));
        setCountryRiskPremiumStr(formatPercent(countryData.countryRiskPremium));
        setDeRatioStr(industryData.dERatio.toString());
        setAdjustedDefaultSpreadStr(formatPercent(countryData.adjDefaultSpread));
      }
    }
  }, [selectedIndustry, selectedCountry]);

  // Update risk profile when country selection changes to populate tax rate (but not during sync from saved data)
  useEffect(() => {
    // Skip if we're syncing from saved data
    if (isSyncingRef.current) {
      return;
    }

    if (selectedCountry && countryRiskPremiumStatic[selectedCountry as keyof typeof countryRiskPremiumStatic]) {
      const countryData = countryRiskPremiumStatic[selectedCountry as keyof typeof countryRiskPremiumStatic];
      setEquityRiskPremiumStr(formatPercent(countryData.equityRiskPremium));
      setCountryRiskPremiumStr(formatPercent(countryData.countryRiskPremium));
      setAdjustedDefaultSpreadStr(formatPercent(countryData.adjDefaultSpread));
      setCorporateTaxRateStr(formatPercent(countryData.corporateTaxRate));
    }
  }, [selectedCountry]);

  // Update risk profile when industry selection changes (but not during sync from saved data)
  useEffect(() => {
    // Skip if we're syncing from saved data
    if (isSyncingRef.current) {
      return;
    }

    if (selectedIndustry && betasStatic[selectedIndustry as keyof typeof betasStatic]) {
      const industryData = betasStatic[selectedIndustry as keyof typeof betasStatic];
      setUnleveredBetaStr(industryData.unleveredBeta.toString());
      setDeRatioStr(industryData.dERatio.toString());
    }
  }, [selectedIndustry]);

  // Auto-calculate levered beta when unlevered beta, D/E ratio, or tax rate changes
  useEffect(() => {
    const calculatedLeveredBeta = unleveredBeta * (1 + (1 - corporateTaxRate) * deRatio);
    setLeveredBetaStr(calculatedLeveredBeta.toFixed(4));
  }, [unleveredBeta, deRatio, corporateTaxRate]);

  // Update store whenever any value changes (but not during sync)
  useEffect(() => {
    if (!isSyncingRef.current) {
      console.log('[IndustryCountrySelector] Updating store with local changes');
      // Update both the risk profile and global selectedIndustry for DCF suggestions
      updateSelectedIndustry(selectedIndustry);
      updateRiskProfile({
        selectedIndustry,
        selectedCountry,
        unleveredBeta,
        leveredBeta,
        equityRiskPremium,
        countryRiskPremium,
        deRatio,
        adjustedDefaultSpread,
        companySpread,
        riskFreeRate,
        corporateTaxRate,
        waccPremium,
      });
    } else {
      console.log('[IndustryCountrySelector] Skipping store update (syncing from store)');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedIndustry,
    selectedCountry,
    unleveredBeta,
    leveredBeta,
    equityRiskPremium,
    countryRiskPremium,
    deRatio,
    adjustedDefaultSpread,
    companySpread,
    riskFreeRate,
    corporateTaxRate,
    waccPremium,
    // Don't include updateRiskProfile and updateSelectedIndustry to avoid infinite loops
  ]);

  // Calculate Cost of Equity and Cost of Debt using utility functions
  const costOfEquity = riskFreeRate + leveredBeta * (equityRiskPremium + countryRiskPremium);
  const costOfDebt = riskFreeRate + adjustedDefaultSpread + companySpread;

  // Calculate WACC using utility function
  const wacc = model.riskProfile 
    ? calculateWacc(model.riskProfile)
    : (1 / (1 + deRatio)) * costOfEquity + (deRatio / (1 + deRatio)) * costOfDebt * (1 - corporateTaxRate);

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Risk Profile & WACC</h3>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {readOnly
            ? 'Industry and country are locked for this valuation. You can still modify all WACC parameters below.'
            : 'Select industry and country to configure discount rate'}
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Industry and Country Selection - Always Visible */}
        <div>
          <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600" />
            Industry & Country Selection
          </h4>
          {readOnly ? (
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px]">
                <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-3 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-green-700" />
                    <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Country</span>
                  </div>
                  <div className="text-base font-bold text-green-900 text-center">
                    {selectedCountry || 'Not specified'}
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-[200px]">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-3 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="w-4 h-4 text-blue-700" />
                    <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Industry</span>
                  </div>
                  <div className="text-base font-bold text-blue-900 text-center">
                    {selectedIndustry || 'Not specified'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <Building className="inline w-3 h-3 mr-1" />
                  Industry
                </label>
                <select
                  value={selectedIndustry || ''}
                  onChange={(e) => setSelectedIndustry(e.target.value || null)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Industry</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <Globe className="inline w-3 h-3 mr-1" />
                  Country
                </label>
                <select
                  value={selectedCountry || ''}
                  onChange={(e) => setSelectedCountry(e.target.value || null)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* WACC Inputs Section - Collapsible */}
        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={() => setIsWaccExpanded(!isWaccExpanded)}
            className="flex items-center justify-between w-full hover:bg-gray-50 p-2 rounded-md transition-colors"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <h4 className="text-sm font-semibold text-gray-800">WACC Calculation Inputs</h4>
            </div>
            {isWaccExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isWaccExpanded ? 'max-h-[2000px] opacity-100 mt-3' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="space-y-3">
              {/* Beta Section */}
              <div>
                <h4 className="text-xs font-medium text-gray-800 mb-2 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Beta Parameters
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Unlevered Beta*</label>
                    <input
                      type="number"
                      step="0.01"
                      value={unleveredBetaStr}
                      onChange={(e) => setUnleveredBetaStr(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
                      D/E Ratio*
                      <Tooltip content="D/E Ratio = Total Debt ÷ Total Equity. Enter as a ratio (not percentage). Examples: 0.5 = $0.50 debt per $1 equity, 1.0 = equal debt and equity, 2.0 = $2 debt per $1 equity.">
                        <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                      </Tooltip>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={deRatioStr}
                      onChange={(e) => setDeRatioStr(e.target.value)}
                      className={`w-full px-2 py-1.5 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
                        parseFloat(deRatioStr) > 5
                          ? 'border-amber-500 focus:ring-amber-500 bg-amber-50'
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      placeholder="0.00"
                    />
                    {industryAvgDeRatio !== null && (
                      <div className="mt-0.5 text-[10px] text-gray-500">
                        Industry avg: {industryAvgDeRatio.toFixed(2)}
                      </div>
                    )}
                    {parseFloat(deRatioStr) > 5 && (
                      <div className="mt-1 text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded border border-amber-200">
                        ⚠️ Very high leverage (&gt; 5). Please verify.
                      </div>
                    )}
                    <div className="mt-0.5 text-[10px] text-gray-500">
                      Enter as ratio: 0.5 = moderate, 1.0 = equal, 2.0 = high
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Corporate Tax Rate (%)*</label>
                    <input
                      type="number"
                      step="0.01"
                      value={corporateTaxRateStr}
                      onChange={(e) => setCorporateTaxRateStr(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="25.00"
                    />
                  </div>

                  {/* Calculated Levered Beta - Compact Inline */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      <span className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                        Levered Beta
                      </span>
                    </label>
                    <div className="px-2 py-1.5 text-sm bg-blue-50 border border-blue-200 rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-blue-700">
                          {(unleveredBeta * (1 + (1 - corporateTaxRate) * deRatio)).toFixed(4)}
                        </div>
                        <div className="text-xs text-blue-600 ml-2">βU × (1 + (1-T) × D/E)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk Premiums Section */}
              <div>
                <h4 className="text-xs font-medium text-gray-800 mb-2 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  Risk Premiums & Rates
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Risk-Free Rate (%) [US 10-Year Treasury]
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={riskFreeRateStr}
                      onChange={(e) => setRiskFreeRateStr(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="4.44"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Equity Risk Premium (%)*</label>
                    <input
                      type="number"
                      step="0.01"
                      value={equityRiskPremiumStr}
                      onChange={(e) => setEquityRiskPremiumStr(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Country Risk Premium (%)*</label>
                    <input
                      type="number"
                      step="0.01"
                      value={countryRiskPremiumStr}
                      onChange={(e) => setCountryRiskPremiumStr(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Company Spread (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={companySpreadStr}
                      onChange={(e) => setCompanySpreadStr(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="5.00"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Adjusted Default Spread (%)*</label>
                    <input
                      type="number"
                      step="0.01"
                      value={adjustedDefaultSpreadStr}
                      onChange={(e) => setAdjustedDefaultSpreadStr(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
                      WACC Premium (%)
                      <Tooltip content="Additional premium added directly to the final WACC calculation. Use this to account for company-specific risks or other adjustments.">
                        <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                      </Tooltip>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={waccPremiumStr}
                      onChange={(e) => setWaccPremiumStr(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Cost Calculations */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-md p-3 border border-green-200 mt-4">
                <div className="flex items-center gap-1 mb-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <h4 className="text-xs font-medium text-green-900">Calculated Costs</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-white rounded-md p-2 border border-green-200">
                    <div className="text-xs text-gray-600 mb-1">Cost of Equity (Re)</div>
                    <div className="text-lg font-semibold text-green-700">{formatPercent(costOfEquity)}%</div>
                    <div className="text-xs text-gray-500 mt-1">Rf + Levered Beta × (ERP + CRP)</div>
                  </div>
                  <div className="bg-white rounded-md p-2 border border-blue-200">
                    <div className="text-xs text-gray-600 mb-1">Cost of Debt (Rd)</div>
                    <div className="text-lg font-semibold text-blue-700">{formatPercent(costOfDebt)}%</div>
                    <div className="text-xs text-gray-500 mt-1">Rf + Adj. Default Spread + Company Spread</div>
                  </div>
                  <div className="bg-white rounded-md p-2 border border-purple-200">
                    <div className="text-xs text-gray-600 mb-1">WACC</div>
                    <div className="text-lg font-semibold text-purple-700">{formatPercent(wacc)}%</div>
                    <div className="text-xs text-gray-500 mt-1">
                      (E/V × CoE) + (D/V × CoD × (1-Tax))
                      {waccPremium !== 0 && <span> + Premium</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Source */}
              <div className="bg-gray-50 rounded-md p-2 border-t border-gray-200 mt-3">
                <p className="text-xs text-gray-600">
                  <span className="font-medium">* Data Source:</span> Professor Aswath Damodaran, NYU Stern School of
                  Business
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Information - Always Visible */}
        {selectedIndustry && selectedCountry && (
          <div className="bg-blue-50 rounded-md p-3 border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs font-medium text-blue-900">
                Selected: {selectedIndustry} in {selectedCountry}
              </h4>
            </div>
            <p className="text-xs text-blue-700">
              Initial WACC parameters populated from industry averages and country risk data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
