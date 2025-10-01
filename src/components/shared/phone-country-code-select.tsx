import React from 'react';
import { getUniquePhoneCountryCodes } from '@/constants/phone-country-codes';

interface PhoneCountryCodeSelectProps {
  value: string;
  onChange: (code: string) => void;
  className?: string;
}

/**
 * Reusable phone country code selector component
 */
export function PhoneCountryCodeSelect({ value, onChange, className = '' }: PhoneCountryCodeSelectProps) {
  const countryCodes = getUniquePhoneCountryCodes();

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`px-3 py-2 border border-gray-300 rounded-md bg-white ${className}`}
      aria-label="Country code"
    >
      {countryCodes.map((entry) => (
        <option key={`${entry.code}-${entry.name}`} value={entry.code}>
          {entry.flag} {entry.code}
        </option>
      ))}
    </select>
  );
}
