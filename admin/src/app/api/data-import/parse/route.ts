import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

/**
 * POST /api/data-import/parse
 *
 * Accepts a multipart form upload with a single file field named "file".
 * Returns: { sheets: string[], preview: { headers: string[], rows: any[][] }, totalRows: number }
 *
 * Query params:
 *   - sheet (optional): which sheet name to preview. Defaults to the first sheet.
 *   - previewRows (optional): how many rows to return for preview. Defaults to 50.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const name = file.name.toLowerCase();
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const ext = validExtensions.find((e) => name.endsWith(e));
    if (!ext) {
      return NextResponse.json(
        { error: `Unsupported file type. Accepted: ${validExtensions.join(', ')}` },
        { status: 400 }
      );
    }

    // Size guard — 10 MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10 MB.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });

    const sheets = workbook.SheetNames;
    if (sheets.length === 0) {
      return NextResponse.json({ error: 'Workbook contains no sheets' }, { status: 400 });
    }

    // Which sheet to preview?
    const url = new URL(req.url);
    const requestedSheet = url.searchParams.get('sheet') || sheets[0];
    const previewLimit = Math.min(200, Math.max(1, parseInt(url.searchParams.get('previewRows') || '50')));
    const requestedHeaderRow = Math.max(1, parseInt(url.searchParams.get('headerRow') || '1'));

    const sheetName = sheets.includes(requestedSheet) ? requestedSheet : sheets[0];
    const worksheet = workbook.Sheets[sheetName];

    // Parse all data (no header) first to detect the header row
    const allRows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      blankrows: false,
    });

    if (allRows.length === 0) {
      return NextResponse.json({
        sheets,
        selectedSheet: sheetName,
        fileName: file.name,
        fileSize: file.size,
        headerRow: 1,
        rawSampleRows: [],
        preview: { headers: [], rows: [] },
        totalRows: 0,
      });
    }

    // Clamp header row
    const headerRow = Math.min(allRows.length, requestedHeaderRow);
    const headerIndex = headerRow - 1;

    // Headers derived from selected row
    const headers: string[] = (allRows[headerIndex] || []).map((h: any, i: number) =>
      h != null && String(h).trim() !== '' ? String(h).trim() : `Column ${i + 1}`
    );

    // Data rows following header row
    const dataRows = allRows.slice(headerRow, headerRow + previewLimit);

    // Provide first 12 raw rows for the interactive "Pick your header & data rows" UI
    const rawSampleRows = allRows.slice(0, 12).map((row, idx) => ({
      rowNumber: idx + 1,
      cells: (row || []).map((c) => (c == null ? '' : String(c).trim())),
    }));

    return NextResponse.json({
      sheets,
      selectedSheet: sheetName,
      fileName: file.name,
      fileSize: file.size,
      headerRow,
      rawSampleRows,
      preview: {
        headers,
        rows: dataRows,
      },
      totalRows: Math.max(0, allRows.length - headerRow),
    });
  } catch (err: any) {
    console.error('Data import parse error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to parse file' },
      { status: 500 }
    );
  }
}
