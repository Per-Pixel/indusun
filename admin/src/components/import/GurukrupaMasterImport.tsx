'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Building2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import {
  parseGurukrupaMaster,
  type GurukrupaLedgerRow,
  type GurukrupaParseResult,
} from '@/lib/gurukrupaWorkbook';

const BATCH = 300;

interface ImportStats {
  imported: number;
  skipped: number;
  failed: number;
  total: number;
}

export default function GurukrupaMasterImport({
  file,
  onUseGeneric,
}: {
  file: File;
  onUseGeneric: () => void;
}) {
  const [parsed, setParsed] = useState<GurukrupaParseResult | null>(null);
  const [reading, setReading] = useState(true);
  const [readError, setReadError] = useState('');
  const [society, setSociety] = useState('__all__');
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportStats | null>(null);
  const [failures, setFailures] = useState<{ row: number; message: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    setReading(true);
    setReadError('');
    setParsed(null);
    setResult(null);
    setSociety('__all__');
    file.arrayBuffer().then(async (buffer) => {
      const book = await parseGurukrupaMaster(buffer);
      if (cancelled) return;
      if (!book) {
        setReadError('This workbook does not contain the Gurukrupa MAIN SHEET.');
        return;
      }
      setParsed(book);
    }).catch((err: unknown) => {
      if (!cancelled) setReadError(err instanceof Error ? err.message : 'Could not read the workbook');
    }).finally(() => {
      if (!cancelled) setReading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [file]);

  const selectedRows = useMemo(() => {
    if (!parsed) return [] as GurukrupaLedgerRow[];
    if (society === '__all__') return parsed.rows;
    return parsed.rows.filter((row) => (row.society_name || 'Unassigned') === society);
  }, [parsed, society]);

  const runImport = async () => {
    if (!parsed || selectedRows.length === 0) return;
    setRunning(true);
    setResult(null);
    setFailures([]);
    const totals: ImportStats = { imported: 0, skipped: 0, failed: 0, total: selectedRows.length };
    const errors: { row: number; message: string }[] = [];
    try {
      for (let i = 0; i < selectedRows.length; i += BATCH) {
        const batch = selectedRows.slice(i, i + BATCH);
        const res = await fetch('/api/data-import/gurukrupa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scope: society === '__all__' ? 'all' : 'property',
            society: society === '__all__' ? '' : society,
            rows: batch,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Import failed');
        totals.imported += data.stats?.imported || 0;
        totals.skipped += data.stats?.skipped || 0;
        totals.failed += data.stats?.failed || 0;
        if (Array.isArray(data.errors)) errors.push(...data.errors);
        setProgress(Math.min(selectedRows.length, i + batch.length));
        setResult({ ...totals });
      }
      setFailures(errors.slice(0, 40));
      toast.success(`Imported ${totals.imported.toLocaleString('en-IN')} rows`);
    } catch (err: unknown) {
      setResult({ ...totals });
      setFailures(errors.slice(0, 40));
      toast.error(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setRunning(false);
    }
  };

  if (reading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 flex items-center gap-3 text-slate-600">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        Reading the Gurukrupa master ledger. The cash-book sheets are skipped on purpose.
      </div>
    );
  }

  if (readError || !parsed) {
    return (
      <div className="bg-white border border-red-200 rounded-xl p-6 space-y-3">
        <p className="text-sm text-red-700">{readError || 'Could not read this workbook.'}</p>
        <button type="button" onClick={onUseGeneric} className="text-sm font-medium text-blue-700">
          Try the column mapper instead
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
      <div className="flex items-start gap-3">
        <Building2 className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Gurukrupa master workbook</h2>
          <p className="text-sm text-slate-500 mt-1">
            {parsed.rows.length.toLocaleString('en-IN')} receipt rows across {parsed.societies.length} properties
            from {parsed.sheetName}. Existing receipts are skipped, not overwritten.
          </p>
        </div>
      </div>

      <ul className="text-sm text-slate-600 space-y-1">
        {parsed.warnings.map((warning) => (
          <li key={warning}>{warning}</li>
        ))}
      </ul>

      <label className="block text-sm font-medium text-slate-800">
        Property
        <select
          value={society}
          onChange={(event) => {
            setSociety(event.target.value);
            setResult(null);
            setProgress(0);
          }}
          className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          disabled={running}
        >
          <option value="__all__">Import everything ({parsed.rows.length.toLocaleString('en-IN')} rows, all properties)</option>
          {parsed.societies.map((item) => (
            <option key={item.name} value={item.name}>
              {item.name} ({item.rows.toLocaleString('en-IN')})
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={runImport}
          disabled={running || selectedRows.length === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          Import {selectedRows.length.toLocaleString('en-IN')} rows
        </button>
        <button type="button" onClick={onUseGeneric} disabled={running} className="text-sm text-slate-500 hover:text-slate-800">
          Use the column mapper instead
        </button>
      </div>

      {running && (
        <p className="text-sm text-slate-600">
          {progress.toLocaleString('en-IN')} of {selectedRows.length.toLocaleString('en-IN')} checked
        </p>
      )}

      {result && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 space-y-1">
          <p><strong>{result.imported.toLocaleString('en-IN')}</strong> imported</p>
          <p><strong>{result.skipped.toLocaleString('en-IN')}</strong> skipped (already stored, or outside the chosen property)</p>
          <p><strong>{result.failed.toLocaleString('en-IN')}</strong> failed</p>
        </div>
      )}

      {failures.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 space-y-1">
          <p className="font-medium flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Rows that failed</p>
          {failures.map((failure, index) => (
            <p key={`${failure.row}-${index}`}>Row {failure.row}: {failure.message}</p>
          ))}
        </div>
      )}
    </div>
  );
}
