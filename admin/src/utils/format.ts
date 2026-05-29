/**
 * Formats a raw numeric string with Indian locale commas (e.g. 150000 → 1,50,000).
 * Returns the original value unchanged if it cannot be parsed as a number.
 * Returns '—' for null / undefined.
 */
export function formatIndianNumber(value: string | null | undefined): string {
  if (value == null || value === '') return '—';
  const stripped = String(value).replace(/[^0-9.]/g, '');
  const num = parseFloat(stripped);
  if (isNaN(num)) return value;
  return new Intl.NumberFormat('en-IN').format(num);
}
