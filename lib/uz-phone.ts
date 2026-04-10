const UZBEK_COUNTRY_CODE = "998";

export function normalizeUzbekPhoneDigits(value: string) {
  const digitsOnly = value.replace(/\D/g, "");
  const withoutCountryCode = digitsOnly.startsWith(UZBEK_COUNTRY_CODE)
    ? digitsOnly.slice(UZBEK_COUNTRY_CODE.length)
    : digitsOnly;

  return withoutCountryCode.slice(0, 9);
}

export function formatUzbekPhoneDigits(digits: string) {
  const normalized = normalizeUzbekPhoneDigits(digits);
  const chunks = [
    normalized.slice(0, 2),
    normalized.slice(2, 5),
    normalized.slice(5, 7),
    normalized.slice(7, 9),
  ].filter(Boolean);

  return chunks.join(" ");
}

export function toUzbekPhoneE164(digits: string) {
  return `+${UZBEK_COUNTRY_CODE}${normalizeUzbekPhoneDigits(digits)}`;
}
