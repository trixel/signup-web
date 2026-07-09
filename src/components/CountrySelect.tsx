"use client";

import { COUNTRIES_SORTED } from "@/data/countries";
import { prefixSelectClassName } from "@/components/FormField";

interface CountrySelectProps {
  value: string;
  onChange: (dial: string) => void;
  className?: string;
}

export function CountrySelect({ value, onChange, className }: CountrySelectProps) {
  return (
    <select
      className={className ?? prefixSelectClassName}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Prefijo telefónico"
    >
      {COUNTRIES_SORTED.map((country) => (
        <option key={`${country.code}-${country.dial}`} value={country.dial}>
          {country.flag} {country.dial}
        </option>
      ))}
    </select>
  );
}
