import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { industries } from '../staticIndustries';

interface IndustrySelectorProps {
  selectedIndustry: string | null;
  onIndustrySelect: (industry: string) => void;
}

export const IndustrySelector: React.FC<IndustrySelectorProps> = ({ selectedIndustry, onIndustrySelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const industryKeys = Object.keys(industries);

  const handleSelect = (industry: string) => {
    onIndustrySelect(industry);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-w-[200px]"
      >
        <span>{selectedIndustry || 'Select Industry'}</span>
        <ChevronDownIcon
          className={`w-4 h-4 ml-2 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          {/* Overlay to close dropdown when clicking outside */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

          {/* Dropdown menu */}
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
            <div className="py-1 max-h-60 overflow-y-auto">
              {/* Option to clear selection */}
              <button
                onClick={() => handleSelect('')}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                <span className="text-gray-500 italic">No Industry Selected</span>
              </button>

              {industryKeys.map((industry) => (
                <button
                  key={industry}
                  onClick={() => handleSelect(industry)}
                  className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 hover:text-gray-900 ${
                    selectedIndustry === industry ? 'bg-blue-50 text-blue-900 font-medium' : 'text-gray-700'
                  }`}
                >
                  {industry}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
