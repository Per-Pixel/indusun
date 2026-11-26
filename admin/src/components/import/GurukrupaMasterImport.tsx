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
  updated: number;
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
  const [storedKeys, setStoredKeys] = useState<Set<string>>(new Set());
  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState(false);
  const [checkProgress, setCheckProgress] = useState(0);
  const [checkError, setCheckError] = useState('');

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
      setStoredKeys(new Set());
      setChecked(false);
      setCheckProgress(0);
      setCheckError('');
    }).catch((err: unknown) => {
      if (!cancelled) setReadError(err instanceof Error ? err.message : 'Could not read the workbook');
    }).finally(() => {
      if (!cancelled) setReading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [file]);

  useEffect(() => {
    if (!parsed) return;
    let cancelled = false;
    const found = new Set<string>();
    setChecking(true);
    setChecked(false);
    setCheckError('');
    setCheckProgress(0);
    (async () => {
      const size = 500;
      const batches: GurukrupaLedgerRow[][] = [];
      for (let i = 0; i < parsed.rows.length; i += size) batches.push(parsed.rows.slice(i, i + size));
      let cursor = 0;
      let checkedCount = 0;
      const worker = async () => {
        while (!cancelled) {
          const index = cursor;
          cursor += 1;
          const slice = batches[index];
          if (!slice) return;
          const res = await fetch('/api/data-import/gurukrupa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'match',
              rows: slice.map((row) => ({
                ledgerKey: row.ledgerKey,
                stableKey: row.stableKey,
                r_no: row.r_no,
                society_name: row.society_name,
                plot_no: row.plot_no,
                emi_no: row.emi_no,
                client_name: row.client_name,
              })),
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Could not check stored receipts');
          for (const key of data.existing || []) found.add(key);
          checkedCount += slice.length;
          if (!cancelled) setCheckProgress(Math.min(parsed.rows.length, checkedCount));
        }
      };
      await Promise.all([worker(), worker(), worker(), worker()]);
      if (!cancelled) {
        setStoredKeys(found);
        setChecked(true);
      }
    })().catch((err: unknown) => {
      if (!cancelled) setCheckError(err instanceof Error ? err.message : 'Could not check stored receipts');
    }).finally(() => {
      if (!cancelled) setChecking(false);
    });
    return () => {
      cancelled = true;
    };
  }, [parsed]);

  const selectedRows = useMemo(() => {
    if (!parsed) return [] as GurukrupaLedgerRow[];
    if (society === '__all__') return parsed.rows;
    return parsed.rows.filter((row) => (row.society_name || 'Unassigned') === society);
  }, [parsed, society]);

  const newRows = useMemo(
    () => selectedRows.filter((row) => !storedKeys.has(row.ledgerKey)),
    [selectedRows, storedKeys]
  );
  const alreadyStored = selectedRows.length - newRows.length;

  const runImport = async () => {
    if (!parsed || selectedRows.length === 0) return;
    setRunning(true);
    setResult(null);
    setFailures([]);
    const totals: ImportStats = { imported: 0, updated: 0, skipped: 0, failed: 0, total: selectedRows.length };
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
        totals.updated += data.stats?.updated || 0;
        totals.skipped += data.stats?.skipped || 0;
        totals.failed += data.stats?.failed || 0;
        if (Array.isArray(data.errors)) errors.push(...data.errors);
        setProgress(Math.min(selectedRows.length, i + batch.length));
        setResult({ ...totals });
      }
      setFailures(errors.slice(0, 40));
      if (totals.failed === 0) {
        setStoredKeys((prev) => {
          const next = new Set(prev);
          for (const row of selectedRows) next.add(row.ledgerKey);
          return next;
        });
      }
      const parts = [
        totals.updated > 0 ? `Updated ${totals.updated.toLocaleString('en-IN')} receipts` : '',
        totals.imported > 0 ? `imported ${totals.imported.toLocaleString('en-IN')} new receipts` : '',
      ].filter(Boolean);
      toast.success(parts.length > 0 ? parts.join(' and ') : 'No receipts to import');
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
            {parsed.rows.length.toLocaleString('en-IN')} receipts in {parsed.sheetName} across {parsed.societies.length} properties.
            Receipts already stored are updated from this file. New receipts are added.
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
          <option value="__all__">All properties</option>
          {parsed.societies.map((item) => (
            <option key={item.name} value={item.name}>
              {item.name} ({item.rows.toLocaleString('en-IN')})
            </option>
          ))}
        </select>
      </label>

      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        {checking && (
          <p>
            Checking stored receipts… {checkProgress.toLocaleString('en-IN')} of {parsed.rows.length.toLocaleString('en-IN')}
          </p>
        )}
        {checkError && <p className="text-red-700">{checkError}</p>}
        {checked && (
          <p>
            <strong>{alreadyStored.toLocaleString('en-IN')}</strong> will be updated from the file.
            {' '}
            <strong>{newRows.length.toLocaleString('en-IN')}</strong> will be added.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={runImport}
          disabled={running || checking || !checked || selectedRows.length === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          {checking || !checked
            ? 'Checking stored receipts'
            : selectedRows.length === 0
              ? 'Nothing to import'
              : alreadyStored > 0 && newRows.length > 0
                ? `Update ${alreadyStored.toLocaleString('en-IN')} and import ${newRows.length.toLocaleString('en-IN')}`
                : alreadyStored > 0
                  ? `Update ${alreadyStored.toLocaleString('en-IN')} receipts from this file`
                  : `Import ${newRows.length.toLocaleString('en-IN')} new receipts`}
        </button>
        <button type="button" onClick={onUseGeneric} disabled={running} className="text-sm text-slate-500 hover:text-slate-800">
          Use the column mapper instead
        </button>
      </div>

      {running && (
        <p className="text-sm text-slate-600">
          {progress.toLocaleString('en-IN')} of {selectedRows.length.toLocaleString('en-IN')} receipts sent
        </p>
      )}

      {result && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 space-y-1">
          <p><strong>{result.updated.toLocaleString('en-IN')}</strong> updated from the file</p>
          <p><strong>{result.imported.toLocaleString('en-IN')}</strong> added</p>
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
