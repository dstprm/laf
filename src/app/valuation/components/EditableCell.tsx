'use client';

import React, { useState, useEffect } from 'react';
import { Pencil, X } from 'lucide-react';

interface EditableCellProps {
  value: number | string;
  format: 'currency' | 'percentage' | 'number';
  isEditable: boolean;
  isOverridden: boolean;
  onSave: (value: number) => void;
  onClear: () => void;
  rowId?: string;
  cellIndex?: number;
}

export const EditableCell: React.FC<EditableCellProps> = ({
  value,
  format,
  isEditable,
  isOverridden,
  onSave,
  onClear,
  rowId,
  cellIndex,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const isActuallyEditable = isEditable && !(rowId === 'revenueGrowth' && cellIndex === 0);

  useEffect(() => {
    if (isEditing && typeof value === 'number') {
      setEditValue(value.toString());
    }
  }, [isEditing, value]);

  const formatValue = (val: number | string): string => {
    if (typeof val === 'string') return val;

    switch (format) {
      case 'currency':
        return val === 0 ? '-' : val.toFixed(1);
      case 'percentage':
        return val === 0 ? (rowId === 'revenueGrowth' && cellIndex === 0 ? 'Base' : '-') : `${val.toFixed(1)}%`;
      case 'number':
        return val === 0 ? '-' : val.toFixed(1);
      default:
        return val.toString();
    }
  };

  const handleDoubleClick = () => {
    if (isActuallyEditable) {
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    const numValue = parseFloat(editValue);
    if (!isNaN(numValue)) {
      onSave(numValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleClearOverride = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClear();
  };

  const getTooltipText = (): string => {
    if (rowId === 'revenueGrowth' && cellIndex === 0) {
      return 'Base year - no growth rate';
    }
    if (isActuallyEditable) {
      return isOverridden ? 'Double-click to edit (manually set)' : 'Double-click to edit';
    }
    return 'Calculated value';
  };

  if (isEditing) {
    return (
      <div className="relative">
        <input
          type="number"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="w-full px-1 py-0.5 text-xs border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-center font-mono"
          autoFocus
          step="0.1"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative group cursor-pointer px-1 py-0.5 rounded transition-colors ${
        isActuallyEditable ? 'hover:bg-blue-50' : ''
      } ${isOverridden ? 'bg-yellow-50 border border-yellow-200' : ''} ${
        !isActuallyEditable && rowId === 'revenueGrowth' && cellIndex === 0 ? 'bg-gray-50' : ''
      }`}
      onDoubleClick={handleDoubleClick}
      title={getTooltipText()}
    >
      <div className="flex items-center justify-center">
        <span
          className={`font-mono text-xs ${
            !isActuallyEditable && rowId === 'revenueGrowth' && cellIndex === 0 ? 'text-gray-500' : ''
          }`}
        >
          {formatValue(value)}
        </span>

        {isActuallyEditable && (
          <div className="absolute inset-0 flex items-center justify-end pr-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <Pencil className="w-2.5 h-2.5 text-gray-400" />
          </div>
        )}

        {isOverridden && (
          <button
            onClick={handleClearOverride}
            className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
            title="Clear manual override"
          >
            <X className="w-2.5 h-2.5 text-yellow-600 hover:text-red-600" />
          </button>
        )}
      </div>

      {isOverridden && (
        <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-yellow-400 rounded-full border border-yellow-600"></div>
      )}
    </div>
  );
};
