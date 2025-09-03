import React, { useState, useEffect } from 'react';
import { Globe, Building, Calculator, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { betasStatic } from '../betasStatic';
import { countryRiskPremiumStatic } from '../countryRiskPremiumStatic';
import { useModelStore } from '../store/modelStore';

interface IndustryCountrySelectorProps {
  className?: string;
}

export const IndustryCountrySelector: React.FC<IndustryCountrySelectorProps> = ({ className = '' }) => {
  const { model, updateRiskProfile, updateSelectedIndustry } = useModelStore();

  // Helper functions
  const formatPercent = (value: number): string => (value * 100).toFixed(2);
  const parsePercent = (value: string): number => parseFloat(value) / 100;

  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(model.riskProfile?.selectedIndustry || null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(model.riskProfile?.selectedCountry || null);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

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

  // Get available industries and countries
  const industries = Object.keys(betasStatic);
  const countries = Object.keys(countryRiskPremiumStatic);

  // Update suggestions when industry or country changes
  useEffect(() => {
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

  // Update risk profile when country selection changes to populate tax rate
  useEffect(() => {
    if (selectedCountry && countryRiskPremiumStatic[selectedCountry as keyof typeof countryRiskPremiumStatic]) {
      const countryData = countryRiskPremiumStatic[selectedCountry as keyof typeof countryRiskPremiumStatic];
      setEquityRiskPremiumStr(formatPercent(countryData.equityRiskPremium));
      setCountryRiskPremiumStr(formatPercent(countryData.countryRiskPremium));
      setAdjustedDefaultSpreadStr(formatPercent(countryData.adjDefaultSpread));
      setCorporateTaxRateStr(formatPercent(countryData.corporateTaxRate));
    }
  }, [selectedCountry]);

  // Update risk profile when industry selection changes
  useEffect(() => {
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

  // Update store whenever any value changes
  useEffect(() => {
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
    });
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
    updateRiskProfile,
    updateSelectedIndustry,
  ]);

  // Calculate Cost of Equity and Cost of Debt
  const costOfEquity = riskFreeRate + leveredBeta * (equityRiskPremium + countryRiskPremium);
  const costOfDebt = riskFreeRate + adjustedDefaultSpread + companySpread;

  // Calculate WACC
  const equityWeight = 1 / (1 + deRatio); // E/V
  const debtWeight = deRatio / (1 + deRatio); // D/V
  const wacc = equityWeight * costOfEquity + debtWeight * costOfDebt * (1 - corporateTaxRate);

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Risk Profile</h3>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2 py-1 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                <span>Collapse</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                <span>Expand</span>
              </>
            )}
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">Select industry and country to get initial risk parameters</p>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 space-y-4">
          {/* Industry and Country Selection */}
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

          {/* Risk Parameters */}
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
                  <label className="block text-xs font-medium text-gray-700 mb-1">D/E Ratio*</label>
                  <input
                    type="number"
                    step="0.01"
                    value={deRatioStr}
                    onChange={(e) => setDeRatioStr(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
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
              </div>
            </div>
          </div>

          {/* Cost Calculations */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-md p-3 border border-green-200">
            <div className="flex items-center gap-1 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
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
                <div className="text-xs text-gray-500 mt-1">(E/V × CoE) + (D/V × CoD × (1-Tax))</div>
              </div>
            </div>
          </div>

          {/* Summary Information */}
          {selectedIndustry && selectedCountry && (
            <div className="bg-blue-50 rounded-md p-2">
              <h4 className="text-xs font-medium text-blue-900 mb-1">
                Selected: {selectedIndustry} in {selectedCountry}
              </h4>
              <p className="text-xs text-blue-700">
                Initial values populated from industry averages and country risk data. *Data Source: Professor Aswath
                Damodaran, NYU Stern School of Business
              </p>
            </div>
          )}

          {/* Data Source */}
          <div className="bg-gray-50 rounded-md p-2 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              <span className="font-medium">* Data Source:</span> Professor Aswath Damodaran, NYU Stern School of
              Business
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
