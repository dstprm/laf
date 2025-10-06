'use client';

import React from 'react';
import { PhoneCountryCodeSelect } from '@/components/shared/phone-country-code-select';

interface BusinessInfoFormProps {
  companyName: string;
  setCompanyName: (value: string) => void;
  companyWebsite: string;
  setCompanyWebsite: (value: string) => void;
  companyPhone: string;
  setCompanyPhone: (value: string) => void;
  phoneCountryCode: string;
  setPhoneCountryCode: (value: string) => void;
  className?: string;
}

export function BusinessInfoForm({
  companyName,
  setCompanyName,
  companyWebsite,
  setCompanyWebsite,
  companyPhone,
  setCompanyPhone,
  phoneCountryCode,
  setPhoneCountryCode,
  className = '',
}: BusinessInfoFormProps) {
  return (
    <div className={`border-b border-gray-200 pb-4 mb-4 ${className}`}>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Información de la empresa (Opcional)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la empresa</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Example Company"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sitio web</label>
          <input
            type="url"
            value={companyWebsite}
            onChange={(e) => setCompanyWebsite(e.target.value)}
            placeholder="www.example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <div className="flex gap-2">
            <PhoneCountryCodeSelect value={phoneCountryCode} onChange={setPhoneCountryCode} className="w-28" />
            <input
              type="tel"
              value={companyPhone}
              onChange={(e) => setCompanyPhone(e.target.value)}
              placeholder="234 567 8900"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
