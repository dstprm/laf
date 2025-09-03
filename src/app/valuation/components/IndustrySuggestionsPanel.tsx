import React, { useState } from 'react';
import { Plus, Lightbulb } from 'lucide-react';
import { getIndustrySuggestions, IndustrySuggestions } from '../utils/industryHelper';
import { useModelStore } from '../store/modelStore';
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';

interface IndustrySuggestionsPanelProps {
  industryName: string;
  sectionType: keyof IndustrySuggestions;
  isOpen: boolean;
  onClose: () => void;
}

export const IndustrySuggestionsPanel: React.FC<IndustrySuggestionsPanelProps> = ({
  industryName,
  sectionType,
  isOpen,
  onClose,
}) => {
  const { updateRevenue, updateCOGS, updateOpEx, updateOtherIncome, updateOtherExpenses, model } = useModelStore();
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const suggestions = getIndustrySuggestions(industryName);
  if (!suggestions) return null;

  const sectionSuggestions = suggestions[sectionType];
  if (sectionSuggestions.length === 0) return null;

  const getSectionTitle = (section: keyof IndustrySuggestions): string => {
    switch (section) {
      case 'revenue':
        return 'Revenue';
      case 'cogs':
        return 'Cost of Goods Sold';
      case 'opex':
        return 'Operating Expenses';
      case 'otherIncome':
        return 'Other Income';
      case 'otherExpenses':
        return 'Other Expenses';
      default:
        return section;
    }
  };

  const toggleSuggestion = (suggestionName: string) => {
    const newSelected = new Set(selectedSuggestions);
    if (newSelected.has(suggestionName)) {
      newSelected.delete(suggestionName);
    } else {
      newSelected.add(suggestionName);
    }
    setSelectedSuggestions(newSelected);
  };

  const addSelectedSuggestions = () => {
    const selectedSuggestionsList = sectionSuggestions.filter((suggestion) => selectedSuggestions.has(suggestion.name));

    // Create all segments first
    const newSegments = selectedSuggestionsList.map((suggestion) => {
      const segmentId = uuidv4();

      // Create base segment with multiplication type if factors exist, otherwise consolidated
      const baseSegment = {
        id: segmentId,
        name: suggestion.name,
        segmentType: suggestion.factors ? ('multiplication' as const) : ('consolidated' as const),
        inputMethod: 'growth' as const, // Default to growth method
      };

      if (suggestion.factors) {
        // Create multiplication segment with factor rows
        const factorRows = suggestion.factors.map((factor) => ({
          id: uuidv4(),
          name: factor,
          inputMethod: 'growth' as const,
          baseValue: 0,
          growthMethod: 'uniform' as const,
          growthRate: 0,
        }));

        return {
          ...baseSegment,
          rows: factorRows,
        };
      } else {
        // Create consolidated segment
        const consolidatedRow = {
          id: uuidv4(),
          name: suggestion.name,
          inputMethod: 'growth' as const,
          baseValue: 0,
          growthMethod: 'uniform' as const,
          growthRate: 0,
        };

        return {
          ...baseSegment,
          consolidatedRow,
        };
      }
    });

    // Add all segments to the appropriate section in a single update
    switch (sectionType) {
      case 'revenue':
        updateRevenue({
          inputType: 'segments',
          segments: [...(model.revenue.segments || []), ...newSegments],
        });
        break;
      case 'cogs':
        updateCOGS({
          inputType: 'segments',
          segments: [...(model.cogs.segments || []), ...newSegments],
        });
        break;
      case 'opex':
        updateOpEx({
          inputType: 'segments',
          segments: [...(model.opex.segments || []), ...newSegments],
        });
        break;
      case 'otherIncome':
        updateOtherIncome({
          inputType: 'segments',
          segments: [...(model.otherIncome.segments || []), ...newSegments],
        });
        break;
      case 'otherExpenses':
        updateOtherExpenses({
          inputType: 'segments',
          segments: [...(model.otherExpenses.segments || []), ...newSegments],
        });
        break;
    }

    // Clear selections and close panel
    setSelectedSuggestions(new Set());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            {getSectionTitle(sectionType)} Suggestions
          </DialogTitle>
          <DialogDescription>
            Based on <strong>{industryName}</strong> industry best practices
          </DialogDescription>
        </DialogHeader>

        {/* Suggestions list */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-3">
            {sectionSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                  selectedSuggestions.has(suggestion.name)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleSuggestion(suggestion.name)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{suggestion.name}</h4>

                    {suggestion.factors && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600 mb-1">Value Drivers:</p>
                        <div className="flex flex-wrap gap-1">
                          {suggestion.factors.map((factor, factorIndex) => (
                            <span
                              key={factorIndex}
                              className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md"
                            >
                              {factor}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {suggestion.method && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600">
                          Method: <span className="text-gray-800">{suggestion.method}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="ml-3">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedSuggestions.has(suggestion.name) ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}
                    >
                      {selectedSuggestions.has(suggestion.name) && <Plus className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between pt-4">
          <p className="text-sm text-gray-600">{selectedSuggestions.size} selected</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={addSelectedSuggestions} disabled={selectedSuggestions.size === 0}>
              Add Selected
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
