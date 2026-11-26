// Reads the original Gurukrupa workbook without SheetJS.
// SheetJS follows the stale used-range (column AMK) and also inflates
// "A.C BOOK", which is hundreds of megabytes of cash-book grid. The
// property ledger lives only on MAIN SHEET, columns A–T.

import { normalizeDate, parseAmount } from '@/utils/dataUtils';

export interface GurukrupaLedgerRow {
  r_no: string | null;
  society_name: string | null;
  client_name: string | null;
  contact_no: string | null;
  plot_no: string | null;
  plot_size: string | null;
  emi_paid_date: string | null;
  plot_amount: string | null;
  emi_amount: string | null;
  paid_amount: string | null;
  amount_in_word: string | null;
  emi_time: string | null;
  "broker's_name": string | null;
  cheque_cash: string | null;
  remarks: string | null;
  emi_no: string | null;
  month_and_year: string | null;
  yes: string | null;
  policy_number: string | null;
  date: string | null;
  cancel_date: string | null;
  plot_amount_num: number | null;
  paid_amount_num: number | null;
  emi_amount_num: number | null;
  emi_paid_date_iso: string | null;
  ledgerKey: string;
  stableKey: string;
  sourceRow: number;
}

export interface SocietyCount {
  name: string;
  rows: number;
}

export interface GurukrupaParseResult {
  sheetName: string;
  societies: SocietyCount[];
  rows: GurukrupaLedgerRow[];
  skipped: { row: number; reason: string }[];
  warnings: string[];
}

const MASTER_SHEET = 'MAIN SHEET';
const COLS = 'ABCDEFGHIJKLMNOPQRST';

function textDecoder() {
  return new TextDecoder('utf-8');
}

async function inflateRaw(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function findEocd(bytes: Uint8Array): number {
  const min = Math.max(0, bytes.length - (22 + 65535));
  for (let i = bytes.length - 22; i >= min; i--) {
    if (bytes[i] === 0x50 && bytes[i + 1] === 0x4b && bytes[i + 2] === 0x05 && bytes[i + 3] === 0x06) {
      return i;
    }
  }
  throw new Error('This file is not a valid Excel workbook');
}

function u16(bytes: Uint8Array, offset: number) {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

function u32(bytes: Uint8Array, offset: number) {
  return (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0;
}

interface ZipEntry {
  name: string;
  method: number;
  compressedSize: number;
  localOffset: number;
}

function listEntries(bytes: Uint8Array): ZipEntry[] {
  const eocd = findEocd(bytes);
  const count = u16(bytes, eocd + 10);
  let cursor = u32(bytes, eocd + 16);
  const entries: ZipEntry[] = [];
  const decoder = textDecoder();
  for (let i = 0; i < count; i++) {
    if (u32(bytes, cursor) !== 0x02014b50) break;
    const method = u16(bytes, cursor + 10);
    const compressedSize = u32(bytes, cursor + 20);
    const nameLen = u16(bytes, cursor + 28);
    const extraLen = u16(bytes, cursor + 30);
    const commentLen = u16(bytes, cursor + 32);
    const localOffset = u32(bytes, cursor + 42);
    const name = decoder.decode(bytes.subarray(cursor + 46, cursor + 46 + nameLen));
    entries.push({ name, method, compressedSize, localOffset });
    cursor += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

async function readEntry(bytes: Uint8Array, entry: ZipEntry): Promise<Uint8Array> {
  const local = entry.localOffset;
  if (u32(bytes, local) !== 0x04034b50) throw new Error(`Could not read ${entry.name}`);
  const nameLen = u16(bytes, local + 26);
  const extraLen = u16(bytes, local + 28);
  const start = local + 30 + nameLen + extraLen;
  const slice = bytes.subarray(start, start + entry.compressedSize);
  if (entry.method === 0) return slice;
  if (entry.method === 8) return inflateRaw(slice);
  throw new Error(`Unsupported compression in ${entry.name}`);
}

async function readNamed(bytes: Uint8Array, entries: ZipEntry[], name: string): Promise<string | null> {
  const entry = entries.find((item) => item.name === name);
  if (!entry) return null;
  return textDecoder().decode(await readEntry(bytes, entry));
}

function decodeXml(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function loadSharedStrings(xml: string): string[] {
  const strings: string[] = [];
  const siRe = /<si\b[^>]*>([\s\S]*?)<\/si>/g;
  let match: RegExpExecArray | null;
  while ((match = siRe.exec(xml))) {
    const texts: string[] = [];
    const tRe = /<t\b[^>]*>([\s\S]*?)<\/t>/g;
    let text: RegExpExecArray | null;
    while ((text = tRe.exec(match[1]))) texts.push(decodeXml(text[1]));
    strings.push(texts.join(''));
  }
  return strings;
}

function sheetNameMap(workbookXml: string, relsXml: string): Map<string, string> {
  const rels = new Map<string, string>();
  const relRe = /Id="([^"]+)"[^>]*Target="([^"]+)"/g;
  let rel: RegExpExecArray | null;
  while ((rel = relRe.exec(relsXml))) {
    const target = rel[2].replace(/^\//, '');
    rels.set(rel[1], target.startsWith('xl/') ? target : `xl/${target}`);
  }
  const names = new Map<string, string>();
  const sheetRe = /<sheet\b[^>]*name="([^"]+)"[^>]*r:id="([^"]+)"/g;
  let sheet: RegExpExecArray | null;
  while ((sheet = sheetRe.exec(workbookXml))) {
    const path = rels.get(sheet[2]);
    if (path) names.set(decodeXml(sheet[1]).trim(), path);
  }
  return names;
}

export async function readWorkbookSheetNames(buffer: ArrayBuffer): Promise<string[]> {
  const bytes = new Uint8Array(buffer);
  const entries = listEntries(bytes);
  const workbook = await readNamed(bytes, entries, 'xl/workbook.xml');
  const rels = await readNamed(bytes, entries, 'xl/_rels/workbook.xml.rels');
  if (!workbook || !rels) return [];
  return [...sheetNameMap(workbook, rels).keys()];
}

function cellMap(rowXml: string, strings: string[]): Record<string, string> {
  const cells: Record<string, string> = {};
  const cRe = /<c\b([^>]*?)r="([A-Z]+)\d+"([^>]*)>([\s\S]*?)<\/c>|<c\b([^>]*?)r="([A-Z]+)\d+"([^>]*)\/>/g;
  let cell: RegExpExecArray | null;
  while ((cell = cRe.exec(rowXml))) {
    const col = cell[2] || cell[6];
    if (!col || !COLS.includes(col) || col.length !== 1) continue;
    if (!cell[4]) {
      cells[col] = '';
      continue;
    }
    const attrs = `${cell[1] || ''}${cell[3] || ''}`;
    const type = (attrs.match(/\bt="([^"]+)"/) || [])[1] || '';
    if (type === 'e') {
      cells[col] = '';
      continue;
    }
    if (type === 'inlineStr') {
      const texts: string[] = [];
      const tRe = /<t\b[^>]*>([\s\S]*?)<\/t>/g;
      let text: RegExpExecArray | null;
      while ((text = tRe.exec(cell[4]))) texts.push(decodeXml(text[1]));
      cells[col] = texts.join('').trim();
      continue;
    }
    const raw = decodeXml((cell[4].match(/<v>([\s\S]*?)<\/v>/) || [])[1] || '').trim();
    if (type === 's') cells[col] = (strings[Number(raw)] || '').trim();
    else if (raw === '#VALUE!' || raw === '#REF!' || raw === '#N/A') cells[col] = '';
    else cells[col] = raw;
  }
  return cells;
}

function clean(value: string | undefined): string | null {
  const text = (value || '').replace(/\s+/g, ' ').trim();
  if (!text || text === 'ॐ' || text === '#VALUE!') return null;
  return text;
}

function isOmToken(value: string | null): boolean {
  if (!value) return false;
  return /^(ॐ|om)$/i.test(value);
}

function amountText(value: string | undefined): string | null {
  const text = clean(value);
  if (!text || isOmToken(text)) return null;
  if (!/[\d]/.test(text)) return null;
  return text;
}

function amountNum(value: string | null): number | null {
  if (!value) return null;
  const n = parseAmount(value);
  return n > 0 ? n : null;
}

function monthYear(value: string | undefined): string | null {
  const text = clean(value);
  if (!text) return null;
  if (/^\d{5,6}$/.test(text)) {
    const year = text.slice(-4);
    const month = Number(text.slice(0, text.length - 4));
    if ((year.startsWith('19') || year.startsWith('20')) && month >= 1 && month <= 12) {
      return `${month}/${year}`;
    }
  }
  return normalizeDate(text) || text;
}

function normKeyPart(value: string | null | undefined): string {
  return (value || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

export function ledgerKey(row: {
  r_no?: string | null;
  society_name?: string | null;
  plot_no?: string | null;
  emi_no?: string | null;
  emi_paid_date?: string | null;
  paid_amount?: string | null;
  client_name?: string | null;
}): string {
  const paid = amountText(row.paid_amount || '') || '';
  const paidNorm = paid ? String(parseAmount(paid) || paid).toLowerCase() : '';
  return [
    normKeyPart(row.r_no),
    normKeyPart(row.society_name),
    normKeyPart(row.plot_no),
    normKeyPart(row.emi_no),
    normalizeDate(row.emi_paid_date) || normKeyPart(row.emi_paid_date),
    paidNorm,
    normKeyPart(row.client_name),
  ].join('|');
}

/** Identity of one instalment. Paid amount and date can change, so they are not part of this key. */
export function stableLedgerKey(row: {
  r_no?: string | null;
  society_name?: string | null;
  plot_no?: string | null;
  emi_no?: string | null;
  client_name?: string | null;
}): string {
  if (!normKeyPart(row.r_no)) return '';
  return [
    normKeyPart(row.r_no),
    normKeyPart(row.society_name),
    normKeyPart(row.plot_no),
    normKeyPart(row.emi_no),
    normKeyPart(row.client_name),
  ].join('|');
}

function toRow(cells: Record<string, string>, sourceRow: number): { row: GurukrupaLedgerRow | null; reason?: string } {
  const society = clean(cells.B);
  const client = clean(cells.C);
  const plot = clean(cells.E);
  if (isOmToken(society) || isOmToken(client) || (society === null && isOmToken(clean(cells.A)))) {
    return { row: null, reason: 'Template or placeholder row' };
  }
  if (!society && !client && !plot) {
    return { row: null, reason: 'Empty row' };
  }
  if (!client && !plot) {
    return { row: null, reason: 'Missing client and plot' };
  }
  if (society && /^\d+$/.test(society) && !client) {
    return { row: null, reason: 'Shifted numeric society with no client' };
  }

  const paid = amountText(cells.J);
  const plotAmount = amountText(cells.H);
  const emiAmount = amountText(cells.I);
  const emiDate = normalizeDate(cells.G);
  const formDate = normalizeDate(cells.T);
  const remarks = clean(cells.O);
  const cancelled = remarks ? /\bcancel/i.test(remarks) : false;

  const row: GurukrupaLedgerRow = {
    r_no: clean(cells.A),
    society_name: society,
    client_name: client,
    contact_no: clean(cells.D),
    plot_no: plot,
    plot_size: clean(cells.F),
    emi_paid_date: emiDate,
    plot_amount: plotAmount,
    emi_amount: emiAmount,
    paid_amount: paid,
    amount_in_word: clean(cells.K),
    emi_time: clean(cells.L),
    "broker's_name": clean(cells.M),
    cheque_cash: clean(cells.N),
    remarks,
    emi_no: clean(cells.P),
    month_and_year: monthYear(cells.Q),
    yes: clean(cells.R),
    policy_number: clean(cells.S),
    date: formDate,
    cancel_date: cancelled ? (formDate || emiDate) : null,
    plot_amount_num: amountNum(plotAmount),
    paid_amount_num: amountNum(paid),
    emi_amount_num: amountNum(emiAmount),
    emi_paid_date_iso: emiDate,
    ledgerKey: '',
    stableKey: '',
    sourceRow,
  };
  row.ledgerKey = ledgerKey(row);
  row.stableKey = stableLedgerKey(row);
  return { row };
}

export async function parseGurukrupaMaster(buffer: ArrayBuffer): Promise<GurukrupaParseResult | null> {
  const bytes = new Uint8Array(buffer);
  const entries = listEntries(bytes);
  const workbook = await readNamed(bytes, entries, 'xl/workbook.xml');
  const rels = await readNamed(bytes, entries, 'xl/_rels/workbook.xml.rels');
  if (!workbook || !rels) return null;
  const sheets = sheetNameMap(workbook, rels);
  const sheetPath = sheets.get(MASTER_SHEET);
  if (!sheetPath) return null;

  const sharedXml = await readNamed(bytes, entries, 'xl/sharedStrings.xml');
  const strings = sharedXml ? loadSharedStrings(sharedXml) : [];
  const sheetXml = await readNamed(bytes, entries, sheetPath);
  if (!sheetXml) throw new Error('MAIN SHEET could not be read');

  const rows: GurukrupaLedgerRow[] = [];
  const skipped: { row: number; reason: string }[] = [];
  const seen = new Set<string>();
  const societies = new Map<string, number>();
  let headerChecked = false;
  let cursor = 0;

  while (cursor < sheetXml.length) {
    const start = sheetXml.indexOf('<row ', cursor);
    if (start === -1) break;
    const end = sheetXml.indexOf('</row>', start);
    if (end === -1) break;
    const rowXml = sheetXml.slice(start, end);
    const rowNo = Number((rowXml.match(/\br="(\d+)"/) || [])[1] || 0);
    cursor = end + 6;
    const cells = cellMap(rowXml, strings);
    if (!headerChecked) {
      headerChecked = true;
      const header = `${cells.B || ''} ${cells.C || ''}`.toUpperCase();
      if (!header.includes('SOC') && !header.includes('CLIENT')) {
        throw new Error('MAIN SHEET headers do not match the Gurukrupa ledger');
      }
      continue;
    }
    const built = toRow(cells, rowNo);
    if (!built.row) {
      if (built.reason && built.reason !== 'Empty row') skipped.push({ row: rowNo, reason: built.reason });
      continue;
    }
    if (seen.has(built.row.ledgerKey)) {
      skipped.push({ row: rowNo, reason: 'Duplicate of an earlier row in this workbook' });
      continue;
    }
    seen.add(built.row.ledgerKey);
    rows.push(built.row);
    const society = built.row.society_name || 'Unassigned';
    societies.set(society, (societies.get(society) || 0) + 1);
  }

  const warnings: string[] = [];
  if (skipped.length) warnings.push(`${skipped.length.toLocaleString('en-IN')} workbook rows were placeholders, blanks, or repeats, and are not part of the import.`);

  return {
    sheetName: MASTER_SHEET,
    societies: [...societies.entries()]
      .map(([name, count]) => ({ name, rows: count }))
      .sort((a, b) => b.rows - a.rows || a.name.localeCompare(b.name)),
    rows,
    skipped,
    warnings,
  };
}
