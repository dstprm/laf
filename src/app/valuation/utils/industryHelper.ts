import { industries } from '../staticIndustries';

export interface IndustrySuggestion {
  name: string;
  factors?: string[];
  method?: string;
}

export interface IndustrySuggestions {
  revenue: IndustrySuggestion[];
  cogs: IndustrySuggestion[];
  opex: IndustrySuggestion[];
  otherIncome: IndustrySuggestion[];
  otherExpenses: IndustrySuggestion[];
}

// Normalize key names from different industries (some use uppercase, some lowercase, some have underscores)
const normalizeKey = (key: string): string => {
  return key.toLowerCase().replace(/[_\s]/g, '');
};

const getSegmentType = (normalizedKey: string): keyof IndustrySuggestions | null => {
  if (normalizedKey.includes('revenue')) return 'revenue';
  if (normalizedKey.includes('cogs')) return 'cogs';
  if (normalizedKey.includes('operat')) return 'opex'; // catches "operating" or "operatingexpenses"
  if (normalizedKey.includes('otherincome')) return 'otherIncome';
  if (normalizedKey.includes('otherexpenses')) return 'otherExpenses';
  return null;
};

export const getIndustrySuggestions = (industryName: string): IndustrySuggestions | null => {
  const industry = industries[industryName as keyof typeof industries];
  if (!industry) return null;

  const suggestions: IndustrySuggestions = {
    revenue: [],
    cogs: [],
    opex: [],
    otherIncome: [],
    otherExpenses: [],
  };

  // Process each section of the industry data
  Object.entries(industry).forEach(([sectionKey, sectionData]) => {
    const normalizedSectionKey = normalizeKey(sectionKey);
    const segmentType = getSegmentType(normalizedSectionKey);

    if (segmentType && sectionData) {
      // Handle array-based structure (Retail, Airlines)
      if (Array.isArray(sectionData)) {
        sectionData.forEach((item) => {
          if (item && typeof item === 'object' && 'name' in item) {
            const suggestion: IndustrySuggestion = {
              name: item.name as string,
            };

            // Extract factors if they exist
            if ('factors' in item && Array.isArray(item.factors)) {
              suggestion.factors = item.factors as string[];
            }

            // Extract method if it exists
            if ('method' in item && typeof item.method === 'string') {
              suggestion.method = item.method;
            }

            suggestions[segmentType].push(suggestion);
          }
        });
      }
      // Handle object-based structure (Automotive Manufacturing, Construction)
      else if (typeof sectionData === 'object') {
        Object.entries(sectionData).forEach(([itemName, itemData]) => {
          if (itemData && typeof itemData === 'object') {
            const suggestion: IndustrySuggestion = {
              name: itemName,
            };

            // Extract factors if they exist
            if ('factors' in itemData && Array.isArray(itemData.factors)) {
              suggestion.factors = itemData.factors as string[];
            }

            // Extract method if it exists
            if ('method' in itemData && typeof itemData.method === 'string') {
              suggestion.method = itemData.method;
            }

            suggestions[segmentType].push(suggestion);
          }
        });
      }
    }
  });

  return suggestions;
};

export const hasIndustrySuggestions = (industryName: string | null): boolean => {
  if (!industryName) return false;
  const suggestions = getIndustrySuggestions(industryName);
  if (!suggestions) return false;

  return Object.values(suggestions).some((sectionSuggestions) => sectionSuggestions.length > 0);
};

export const hasSuggestionsForSection = (industryName: string | null, section: keyof IndustrySuggestions): boolean => {
  if (!industryName) return false;
  const suggestions = getIndustrySuggestions(industryName);
  return suggestions ? suggestions[section].length > 0 : false;
};
