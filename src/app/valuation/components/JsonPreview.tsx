'use client';

import React, { useState } from 'react';
import { useModelStore } from '../store/modelStore';
import { Copy, Eye, EyeOff } from 'lucide-react';

export const JsonPreview: React.FC = () => {
  const { exportModel } = useModelStore();
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportModel());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Model JSON</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsVisible(!isVisible)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              {isVisible ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Show
                </>
              )}
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy JSON'}
            </button>
          </div>
        </div>
      </div>

      {isVisible && (
        <div className="p-4">
          <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto max-h-96 text-gray-800">{exportModel()}</pre>
        </div>
      )}

      {!isVisible && (
        <div className="p-4 text-center text-gray-500">
          <p className="text-sm">Click &quot;Show&quot; to preview your model assumptions</p>
        </div>
      )}
    </div>
  );
};
