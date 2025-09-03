'use client';

import React from 'react';
import { ChevronDownIcon, ChevronRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface InputCardProps {
  title: string;
  description: string;
  isCompleted: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  summary?: string;
}

export const InputCard: React.FC<InputCardProps> = ({
  title,
  description,
  isCompleted,
  isExpanded,
  onToggle,
  children,
  summary,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <div
        className="p-6 cursor-pointer flex items-center justify-between"
        onClick={onToggle}
      >
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {isCompleted && (
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
          {summary && !isExpanded && (
            <p className="text-sm text-blue-600 mt-2 font-medium">{summary}</p>
          )}
        </div>
        <div className="ml-4">
          {isExpanded ? (
            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <div className="pt-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}; 