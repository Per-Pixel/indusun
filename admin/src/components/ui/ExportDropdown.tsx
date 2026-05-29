'use client';

import { useRef, useState, useEffect } from 'react';
import { Download, ChevronDown, CheckCircle2 } from 'lucide-react';

export interface ExportColumn {
  header: string;
  key: string; // keyof row object — cast at call-site
}

export interface ExportDropdownProps {
  /** Display label for the trigger button. Defaults to "Export". */
  label?: string;
  /** Human-readable filename prefix, e.g. "properties" → "properties.csv" */
  filename?: string;
  /** Column definitions — header label + data key */
  columns: ExportColumn[];
  /** Rows to export — array of plain objects */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: Record<string, any>[];
  /** Disable the button when no data is available */
  disabled?: boolean;
  /** Extra Tailwind classes on the trigger button */
  className?: string;
}

/* ─── helpers ──────────────────────────────────────────────────────────── */

function triggerDownload(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ExportDropdown({
  label = 'Export',
  filename = 'export',
  columns,
  rows,
  disabled = false,
  className = '',
}: ExportDropdownProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null); // which format is loading
  const ref = useRef<HTMLDivElement>(null);

  /* close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const headers = columns.map((c) => c.header);
  const getRow = (row: Record<string, unknown>) =>
    columns.map((c) => String(row[c.key] ?? ''));

  /* ── CSV ──────────────────────────────────────────────────────────────── */
  const exportCSV = () => {
    setOpen(false);
    const body = rows.map(getRow);
    const csv = [headers, ...body]
      .map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');
    triggerDownload(new Blob([csv], { type: 'text/csv' }), `${filename}.csv`);
  };

  /* ── TXT ──────────────────────────────────────────────────────────────── */
  const exportTXT = () => {
    setOpen(false);
    const body = rows.map(getRow);
    const colWidths = headers.map((h, i) =>
      Math.max(h.length, ...body.map((r) => r[i].length))
    );
    const pad = (s: string, w: number) => s.padEnd(w);
    const sep = colWidths.map((w) => '-'.repeat(w)).join('-+-');
    const header = headers.map((h, i) => pad(h, colWidths[i])).join(' | ');
    const lines = body.map((r) => r.map((cell, i) => pad(cell, colWidths[i])).join(' | '));
    const txt = [header, sep, ...lines].join('\n');
    triggerDownload(new Blob([txt], { type: 'text/plain' }), `${filename}.txt`);
  };

  /* ── PDF ──────────────────────────────────────────────────────────────── */
  const exportPDF = async () => {
    setOpen(false);
    setBusy('pdf');
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      const doc = new jsPDF({ orientation: 'landscape' });
      doc.setFontSize(13);
      doc.text(filename, 14, 15);
      doc.setFontSize(9);
      doc.text(`Exported: ${new Date().toLocaleString()}`, 14, 22);
      autoTable(doc, {
        head: [headers],
        body: rows.map(getRow),
        startY: 27,
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [37, 99, 235] },
        alternateRowStyles: { fillColor: [241, 245, 249] },
      });
      doc.save(`${filename}.pdf`);
    } finally {
      setBusy(null);
    }
  };

  /* ── Word ─────────────────────────────────────────────────────────────── */
  const exportWord = async () => {
    setOpen(false);
    setBusy('docx');
    try {
      const {
        Document, Paragraph, Table, TableRow, TableCell,
        TextRun, WidthType, HeadingLevel, Packer,
      } = await import('docx');

      const makeCell = (text: string, isHeader = false) =>
        new TableCell({
          children: [new Paragraph({
            children: [new TextRun({ text, bold: isHeader, size: isHeader ? 20 : 18 })],
          })],
          width: { size: Math.floor(10000 / columns.length), type: WidthType.DXA },
        });

      const tableRows = [
        new TableRow({ children: headers.map((h) => makeCell(h, true)), tableHeader: true }),
        ...rows.map((row) =>
          new TableRow({ children: getRow(row).map((cell) => makeCell(cell)) })
        ),
      ];

      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({ text: filename, heading: HeadingLevel.HEADING_1 }),
            new Paragraph({ text: `Exported: ${new Date().toLocaleString()}` }),
            new Paragraph({ text: '' }),
            new Table({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE } }),
          ],
        }],
      });

      const buffer = await Packer.toBlob(doc);
      triggerDownload(buffer, `${filename}.docx`);
    } finally {
      setBusy(null);
    }
  };

  /* ── UI ───────────────────────────────────────────────────────────────── */
  const formats = [
    { key: 'csv',  label: 'CSV  (.csv)',  icon: '📊', action: exportCSV },
    { key: 'pdf',  label: 'PDF  (.pdf)',  icon: '📄', action: exportPDF },
    { key: 'docx', label: 'Word (.docx)', icon: '📝', action: exportWord },
    { key: 'txt',  label: 'Text (.txt)',  icon: '🗒️', action: exportTXT },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={disabled || !!busy}
        className={`flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition ${className}`}
      >
        {busy ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-blue-600" />
        ) : (
          <Download className="h-4 w-4 text-green-600" />
        )}
        {label}
        <ChevronDown className={`h-3.5 w-3.5 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1.5 w-44 origin-top-right rounded-xl border border-gray-200 bg-white shadow-lg ring-1 ring-black/5 overflow-hidden">
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Export as</p>
          </div>
          {formats.map(({ key, label: fl, icon, action }) => (
            <button
              key={key}
              onClick={action}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <span className="text-base leading-none">{icon}</span>
              {fl}
              {busy === key && (
                <CheckCircle2 className="ml-auto h-4 w-4 text-blue-500 animate-pulse" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
