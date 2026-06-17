/**
 * Shared data-parsing utilities used across sales, billing, invoices,
 * and transactions API routes.
 *
 * Centralised here to eliminate copy-paste duplication and to ensure
 * a single bug-fix point.
 */

/**
 * Parse any amount string/number into a float.
 * Strips currency symbols, commas, and whitespace.
 */
export function parseAmount(v: any): number {
  if (v === null || v === undefined || v === '') return 0;
  return parseFloat(String(v).replace(/[^0-9.]/g, '')) || 0;
}

/**
 * Normalise a date value from any of the formats found in the
 * "Master Data Of Gurukrupa" Supabase table into an ISO date string
 * (YYYY-MM-DD).
 *
 * Supported input formats (in order of detection):
 *  1. Excel serial date integers  e.g. 44927  (Jan 1 2023)
 *  2. Indian format DD/MM/YYYY or DD-MM-YYYY  e.g. 15/05/2023
 *  3. ISO 8601 and anything else parseable by Date()
 *
 * Returns null for empty, null, or truly un-parseable values.
 */
export function normalizeDate(d: any): string | null {
  if (d === null || d === undefined) return null;
  const s = String(d).trim();
  if (!s) return null;

  // ── 1. Excel serial date (4-5 digit integer, plausible modern range) ──────
  // Excel epoch starts 1900-01-01; JS Date epoch starts 1970-01-01.
  // Offset: 25569 days. Typical post-2000 dates fall in the 36526–60000 range.
  if (/^\d{4,5}$/.test(s)) {
    const serial = parseInt(s, 10);
    if (serial > 25569 && serial < 60000) {
      const jsDate = new Date((serial - 25569) * 86400 * 1000);
      if (!isNaN(jsDate.getTime())) return jsDate.toISOString().split('T')[0];
    }
  }

  // ── 2. Indian format  DD/MM/YYYY  or  DD-MM-YYYY ─────────────────────────
  const indianMatch = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (indianMatch) {
    const iso = `${indianMatch[3]}-${indianMatch[2].padStart(2, '0')}-${indianMatch[1].padStart(2, '0')}`;
    const dt = new Date(iso);
    if (!isNaN(dt.getTime())) return dt.toISOString().split('T')[0];
  }

  // ── 3. ISO 8601 / anything else Date() can parse ─────────────────────────
  try {
    const dt = new Date(s);
    if (!isNaN(dt.getTime())) return dt.toISOString().split('T')[0];
  } catch {
    // intentionally swallowed
  }

  return null;
}

/**
 * Returns true when the row has a non-empty emi_paid_date, indicating
 * the EMI / instalment has actually been paid.
 */
export function isPaid(emiDate: any): boolean {
  return !!(emiDate && String(emiDate).trim());
}
