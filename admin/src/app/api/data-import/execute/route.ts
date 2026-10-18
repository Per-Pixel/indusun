import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { createServiceClient } from '@/utils/supabase/service';
import { normalizeDate } from '@/utils/dataUtils';

/**
 * POST /api/data-import/execute
 *
 * Accepts a multipart form with:
 *   - file:            the Excel/CSV file
 *   - entityType:      "customer" | "broker" | "bill" | "property" | "staff"
 *   - sheetName:       which sheet to use
 *   - columnMapping:   JSON string mapping our field names → Excel column headers
 *                      e.g. { "client_name": "Name", "contact_no": "Phone" }
 *   - skipDuplicates:  "true" | "false"
 *   - headerRow:       1-indexed row number to use as headers (default 1)
 *
 * Returns: { success: true, stats: { imported, skipped, errors, total }, errorRows: [] }
 */

// ── Entity configs ──────────────────────────────────────────────────────────

interface EntityConfig {
  tableName: string;
  requiredFields: string[];
  fields: { key: string; label: string; type: 'text' | 'number' | 'date' }[];
  duplicateCheck?: string; // which field to check for duplicates
}

const ENTITY_CONFIGS: Record<string, EntityConfig> = {
  property: {
    tableName: 'Master Data Of Gurukrupa',
    requiredFields: ['society_name', 'plot_no'],
    duplicateCheck: 'plot_no',
    fields: [
      { key: 'society_name', label: 'Society Name / Project', type: 'text' },
      { key: 'plot_no', label: 'Plot No', type: 'text' },
      { key: 'plot_size', label: 'Plot Size', type: 'text' },
      { key: 'plot_amount', label: 'Plot Price / Amount', type: 'text' },
      { key: 'client_name', label: 'Client / Buyer Name', type: 'text' },
      { key: 'contact_no', label: 'Contact No', type: 'text' },
      { key: 'paid_amount', label: 'Paid Amount', type: 'text' },
      { key: 'emi_amount', label: 'EMI Amount', type: 'text' },
      { key: 'emi_time', label: 'EMI Time', type: 'text' },
      { key: "broker's_name", label: "Broker's Name", type: 'text' },
      { key: 'date_of_form', label: 'Date of Form / Added', type: 'text' },
      { key: 'remarks', label: 'Remarks / Notes', type: 'text' },
    ],
  },
  customer: {
    tableName: 'Master Data Of Gurukrupa',
    requiredFields: ['client_name'],
    duplicateCheck: 'client_name',
    fields: [
      { key: 'client_name', label: 'Client Name', type: 'text' },
      { key: 'contact_no', label: 'Contact No', type: 'text' },
      { key: 'society_name', label: 'Society Name', type: 'text' },
      { key: 'plot_no', label: 'Plot No', type: 'text' },
      { key: 'plot_size', label: 'Plot Size', type: 'text' },
      { key: 'plot_amount', label: 'Plot Amount', type: 'text' },
      { key: 'paid_amount', label: 'Paid Amount', type: 'text' },
      { key: 'emi_amount', label: 'EMI Amount', type: 'text' },
      { key: 'emi_time', label: 'EMI Time', type: 'text' },
      { key: 'emi_no', label: 'EMI No', type: 'text' },
      { key: 'emi_paid_date', label: 'EMI Paid Date', type: 'text' },
      { key: "broker's_name", label: "Broker's Name", type: 'text' },
      { key: 'date_of_form', label: 'Date of Form', type: 'text' },
      { key: 'remarks', label: 'Remarks', type: 'text' },
      { key: 'r_no', label: 'R. No', type: 'text' },
      { key: 'policy_number', label: 'Policy Number', type: 'text' },
      { key: 'cheque_cash', label: 'Cheque/Cash', type: 'text' },
      { key: 'month_and_year', label: 'Month & Year', type: 'text' },
    ],
  },
  broker: {
    tableName: 'brokers',
    requiredFields: ['name'],
    duplicateCheck: 'name',
    fields: [
      { key: 'name', label: 'Broker Name', type: 'text' },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'commission_rate', label: 'Commission %', type: 'number' },
      { key: 'rera_number', label: 'RERA Number', type: 'text' },
    ],
  },
  bill: {
    tableName: 'bills',
    requiredFields: ['client_name', 'amount'],
    duplicateCheck: 'bill_number',
    fields: [
      { key: 'bill_number', label: 'Bill Number', type: 'text' },
      { key: 'client_name', label: 'Client Name', type: 'text' },
      { key: 'client_phone', label: 'Client Phone', type: 'text' },
      { key: 'client_address', label: 'Client Address', type: 'text' },
      { key: 'description', label: 'Description', type: 'text' },
      { key: 'amount', label: 'Amount', type: 'number' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'notes', label: 'Notes', type: 'text' },
      { key: 'payment_method', label: 'Payment Method', type: 'text' },
      { key: 'status', label: 'Status', type: 'text' },
    ],
  },
  payment: {
    tableName: 'Master Data Of Gurukrupa',
    requiredFields: ['client_name'],
    duplicateCheck: 'client_name',
    fields: [
      { key: 'client_name', label: 'Client Name', type: 'text' },
      { key: 'paid_amount', label: 'Paid Amount', type: 'text' },
      { key: 'emi_amount', label: 'EMI Amount', type: 'text' },
      { key: 'emi_time', label: 'EMI Time', type: 'text' },
      { key: 'emi_no', label: 'EMI No', type: 'text' },
      { key: 'emi_paid_date', label: 'EMI Paid Date', type: 'text' },
      { key: 'cheque_cash', label: 'Cheque/Cash', type: 'text' },
      { key: 'month_and_year', label: 'Month & Year', type: 'text' },
    ],
  },
  // NOTE: no "staff" entity — admin_users.id is a FK to auth.users, so plain
  // row inserts can never succeed. Staff accounts must be created via /admin-users.
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function coerceValue(raw: any, type: 'text' | 'number' | 'date'): any {
  if (raw == null || raw === '') return null;
  const s = String(raw).trim();
  if (s === '') return null;

  switch (type) {
    case 'number': {
      const cleaned = s.replace(/[₹,\s]/g, '');
      const n = parseFloat(cleaned);
      return isNaN(n) ? null : n;
    }
    case 'date': {
      if (raw instanceof Date) return raw.toISOString().split('T')[0];
      // normalizeDate handles DD/MM/YYYY, Excel serials, and ISO correctly —
      // a bare `new Date(s)` silently flips Indian-format dates (01/02 → Jan 2).
      return normalizeDate(s) ?? s;
    }
    default:
      return s;
  }
}

// ── Main handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const entityType = formData.get('entityType') as string;
    const sheetName = formData.get('sheetName') as string;
    const mappingJson = formData.get('columnMapping') as string;
    const skipDuplicates = formData.get('skipDuplicates') === 'true';
    const headerRow = Math.max(1, parseInt(formData.get('headerRow') as string || '1'));
    // 1-based data-row indices the user unticked in the preview step
    let excludedRows = new Set<number>();
    try {
      const ex = formData.get('excludeRows');
      if (ex) excludedRows = new Set(JSON.parse(ex as string));
    } catch { /* ignore malformed value */ }

    // Validation
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    if (!entityType || !ENTITY_CONFIGS[entityType]) {
      return NextResponse.json(
        { error: `Invalid entity type. Supported: ${Object.keys(ENTITY_CONFIGS).join(', ')}` },
        { status: 400 }
      );
    }
    if (!mappingJson) {
      return NextResponse.json({ error: 'Column mapping is required' }, { status: 400 });
    }

    const config = ENTITY_CONFIGS[entityType];
    const mapping: Record<string, string> = JSON.parse(mappingJson);

    // Check required fields are mapped
    const missingRequired = config.requiredFields.filter((f) => !mapping[f]);
    if (missingRequired.length > 0) {
      return NextResponse.json(
        { error: `Required fields not mapped: ${missingRequired.join(', ')}` },
        { status: 400 }
      );
    }

    // Parse file
    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
    const worksheet = workbook.Sheets[sheetName || workbook.SheetNames[0]];
    if (!worksheet) {
      return NextResponse.json({ error: `Sheet "${sheetName}" not found` }, { status: 400 });
    }

    const allRows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      blankrows: false,
    });

    if (allRows.length < headerRow + 1) {
      return NextResponse.json({ error: 'Not enough rows in the selected sheet' }, { status: 400 });
    }

    // Build header → column index map
    const headers: string[] = (allRows[headerRow - 1] || []).map((h: any) => String(h).trim());
    const dataRows = allRows.slice(headerRow);

    // Reverse mapping: our field key → column index in Excel
    const fieldToColIndex: Record<string, number> = {};
    for (const [fieldKey, excelHeader] of Object.entries(mapping)) {
      const idx = headers.findIndex(
        (h) => h.toLowerCase() === excelHeader.toLowerCase()
      );
      if (idx !== -1) fieldToColIndex[fieldKey] = idx;
    }

    // Build field type lookup
    const fieldTypes: Record<string, 'text' | 'number' | 'date'> = {};
    for (const f of config.fields) {
      fieldTypes[f.key] = f.type;
    }

    // Transform rows
    const stats = { total: dataRows.length, imported: 0, skipped: 0, errors: 0 };
    const errorRows: { row: number; data: any; error: string }[] = [];
    const insertBatch: Record<string, any>[] = [];
    let excludedCount = 0;

    for (let i = 0; i < dataRows.length; i++) {
      if (excludedRows.has(i + 1)) {
        excludedCount++;
        continue;
      }

      const rawRow = dataRows[i];
      const record: Record<string, any> = {};

      // Map each field
      for (const [fieldKey, colIdx] of Object.entries(fieldToColIndex)) {
        const rawValue = rawRow[colIdx];
        const type = fieldTypes[fieldKey] || 'text';
        record[fieldKey] = coerceValue(rawValue, type);
      }

      // Normalise bill status so "paid", "PAID", etc. land consistently
      if (entityType === 'bill' && record.status != null) {
        record.status = String(record.status).trim().toLowerCase() === 'paid' ? 'Paid' : 'Pending';
      }

      // Validate required fields
      const missing = config.requiredFields.filter(
        (f) => record[f] == null || String(record[f]).trim() === ''
      );
      if (missing.length > 0) {
        stats.errors++;
        errorRows.push({
          row: headerRow + i + 1,
          data: record,
          error: `Missing required: ${missing.join(', ')}`,
        });
        continue;
      }

      insertBatch.push(record);
    }

    // Insert into Supabase
    const supabase = createServiceClient();
    let duplicateCount = 0;

    // Batch insert (chunks of 500)
    const BATCH_SIZE = 500;
    for (let i = 0; i < insertBatch.length; i += BATCH_SIZE) {
      const chunk = insertBatch.slice(i, i + BATCH_SIZE);

      if (skipDuplicates && config.duplicateCheck) {
        // Check for existing records
        const checkField = config.duplicateCheck;
        const checkValues = chunk
          .map((r) => r[checkField])
          .filter(Boolean);

        if (checkValues.length > 0) {
          const { data: existing } = await supabase
            .from(config.tableName)
            .select(checkField)
            .in(checkField, checkValues);

          const existingSet = new Set(
            (existing || []).map((r: any) => String(r[checkField]).toLowerCase())
          );

          const newRecords = chunk.filter(
            (r) => !existingSet.has(String(r[checkField] || '').toLowerCase())
          );
          duplicateCount += chunk.length - newRecords.length;

          if (newRecords.length > 0) {
            const { error } = await supabase
              .from(config.tableName)
              .insert(newRecords);

            if (error) {
              // Try inserting one by one to isolate errors
              for (const record of newRecords) {
                const { error: singleError } = await supabase
                  .from(config.tableName)
                  .insert(record);

                if (singleError) {
                  stats.errors++;
                  errorRows.push({
                    row: headerRow + insertBatch.indexOf(record) + 1,
                    data: record,
                    error: singleError.message,
                  });
                } else {
                  stats.imported++;
                }
              }
            } else {
              stats.imported += newRecords.length;
            }
          }
        }
      } else {
        // Direct insert without duplicate check
        const { error } = await supabase
          .from(config.tableName)
          .insert(chunk);

        if (error) {
          // Try one by one
          for (const record of chunk) {
            const { error: singleError } = await supabase
              .from(config.tableName)
              .insert(record);

            if (singleError) {
              stats.errors++;
              errorRows.push({
                row: headerRow + insertBatch.indexOf(record) + 1,
                data: record,
                error: singleError.message,
              });
            } else {
              stats.imported++;
            }
          }
        } else {
          stats.imported += chunk.length;
        }
      }
    }

    stats.skipped = duplicateCount + excludedCount;

    return NextResponse.json({
      success: true,
      stats,
      errorRows: errorRows.slice(0, 50), // Cap error details at 50
    });
  } catch (err: any) {
    console.error('Data import execute error:', err);
    return NextResponse.json(
      { error: err.message || 'Import failed' },
      { status: 500 }
    );
  }
}

// ── GET: Return entity configs for the wizard UI ────────────────────────────

export async function GET() {
  const entities = Object.entries(ENTITY_CONFIGS).map(([key, config]) => ({
    key,
    tableName: config.tableName,
    fields: config.fields,
    requiredFields: config.requiredFields,
    duplicateCheck: config.duplicateCheck,
  }));

  return NextResponse.json({ entities });
}
