"use client";

import { formatUzbekPhoneDigits, normalizeUzbekPhoneDigits } from "@/lib/uz-phone";

type UzPhoneFieldProps = {
  id?: string;
  label: string;
  value: string;
  onChange: (digits: string) => void;
};

export function UzPhoneField({
  id = "phone",
  label,
  value,
  onChange,
}: UzPhoneFieldProps) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-bold text-[var(--navy)]">
        {label}
      </label>
      <div className="flex overflow-hidden rounded-[1.15rem] border border-[rgba(23,32,51,0.1)] bg-white/82 focus-within:border-[rgba(45,143,139,0.5)] focus-within:shadow-[0_0_0_4px_rgba(45,143,139,0.12)]">
        <div className="flex items-center border-r border-[rgba(23,32,51,0.08)] bg-[rgba(23,32,51,0.04)] px-4 text-sm font-bold text-[var(--navy)]">
          +998
        </div>
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={formatUzbekPhoneDigits(value)}
          onChange={(event) => onChange(normalizeUzbekPhoneDigits(event.target.value))}
          className="min-h-[3.5rem] w-full bg-transparent px-4 py-3 text-[var(--navy)] outline-none"
          placeholder="90 123 45 67"
          aria-describedby={`${id}-hint`}
        />
      </div>
    </div>
  );
}
