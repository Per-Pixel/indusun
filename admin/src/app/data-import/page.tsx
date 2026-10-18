'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import CRMLayout from '@/components/CRMLayout';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Database,
  Sparkles,
  RefreshCw,
  FileText,
  Layers,
  Table,
  Check,
  ChevronDown,
  Download,
  Info,
  X,
  Building2,
  Users,
  Briefcase,
  Receipt,
  CreditCard,
  ShieldAlert,
  ExternalLink,
} from 'lucide-react';

// ─── Entity Definitions ───────────────────────────────────────────────────────

interface EntityOption {
  key: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tableName: string;
  targetUrl: string;
  sampleColumns: string[];
  sampleRow: (string | number)[];
  aliases: Record<string, string[]>;
}

const ENTITIES: EntityOption[] = [
  {
    key: 'property',
    title: 'Properties & Plots',
    subtitle: 'Gurukrupa Master Data inventory (Societies, plots, prices)',
    icon: <Building2 className="w-5 h-5 text-blue-600" />,
    tableName: 'Master Data Of Gurukrupa',
    targetUrl: '/properties',
    sampleColumns: ['Society Name', 'Plot No', 'Plot Size', 'Plot Amount', 'Client Name', 'Contact No', 'Paid Amount', 'EMI Amount', 'EMI Time', "Broker's Name", 'Date of Form', 'Remarks'],
    sampleRow: ['Gurukrupa Enclave', 'A-101', '1200 sqft', '1500000', 'Ramesh Sharma', '9876543210', '500000', '25000', '36 Months', 'Deepak Verma', '2024-03-15', 'Corner plot'],
    aliases: {
      society_name: ['society', 'project', 'society name', 'project name', 'scheme', 'colony'],
      plot_no: ['plot', 'plot no', 'plot number', 'unit', 'unit no', 'flat no'],
      plot_size: ['size', 'plot size', 'area', 'sqft', 'square feet', 'dimension'],
      plot_amount: ['amount', 'price', 'plot amount', 'total cost', 'rate', 'cost'],
      client_name: ['client', 'customer', 'client name', 'buyer', 'owner name'],
      contact_no: ['phone', 'contact', 'mobile', 'contact no', 'phone number'],
      paid_amount: ['paid', 'paid amount', 'booking amount', 'advance'],
      emi_amount: ['emi', 'emi amount', 'monthly installment'],
      emi_time: ['emi time', 'term', 'tenure', 'months', 'duration'],
      "broker's_name": ['broker', 'agent', "broker's name", 'channel partner'],
      date_of_form: ['date', 'form date', 'booking date', 'date of form'],
      remarks: ['remarks', 'notes', 'comments', 'amenities'],
    },
  },
  {
    key: 'customer',
    title: 'Customers & Bookings',
    subtitle: 'Client profiles, allotments, contacts & booking ledgers',
    icon: <Users className="w-5 h-5 text-emerald-600" />,
    tableName: 'Master Data Of Gurukrupa',
    targetUrl: '/customers',
    sampleColumns: ['Client Name', 'Contact No', 'Society Name', 'Plot No', 'Plot Size', 'Plot Amount', 'Paid Amount', 'EMI Amount', 'EMI Time', 'EMI No', 'EMI Paid Date', "Broker's Name", 'Date of Form', 'Remarks', 'R. No'],
    sampleRow: ['Priya Patel', '9822012345', 'Gurukrupa Heights', 'B-204', '1500 sqft', '1800000', '600000', '30000', '48 Months', '1', '2024-04-10', 'Sunil Shah', '2024-04-01', 'Approved', 'R-889'],
    aliases: {
      client_name: ['name', 'client', 'customer', 'client name', 'customer name', 'buyer'],
      contact_no: ['phone', 'contact', 'mobile', 'cell', 'phone number', 'contact no'],
      society_name: ['society', 'project', 'society name', 'scheme'],
      plot_no: ['plot', 'plot no', 'unit', 'unit no'],
      plot_size: ['size', 'plot size', 'area'],
      plot_amount: ['plot amount', 'total amount', 'price'],
      paid_amount: ['paid', 'paid amount', 'down payment', 'token'],
      emi_amount: ['emi', 'emi amount', 'installment'],
      emi_time: ['emi time', 'tenure', 'duration'],
      emi_no: ['emi no', 'installment no', 'emi number'],
      emi_paid_date: ['emi date', 'paid date', 'payment date'],
      "broker's_name": ['broker', 'agent', 'broker name'],
      date_of_form: ['date', 'booking date', 'form date'],
      remarks: ['remarks', 'status', 'notes'],
      r_no: ['r no', 'receipt no', 'ref no'],
    },
  },
  {
    key: 'broker',
    title: 'Brokers & Channel Partners',
    subtitle: 'Registered brokers, commission rates & contact details',
    icon: <Briefcase className="w-5 h-5 text-purple-600" />,
    tableName: 'brokers',
    targetUrl: '/brokers',
    sampleColumns: ['Broker Name', 'Phone', 'Email', 'Location', 'Commission %', 'RERA Number'],
    sampleRow: ['Apex Realty', '9890123456', 'info@apexrealty.com', 'Pune West', '2.5', 'MAHARERA12345'],
    aliases: {
      name: ['broker', 'name', 'broker name', 'agency', 'company', 'partner'],
      phone: ['phone', 'mobile', 'contact', 'phone number'],
      email: ['email', 'email address', 'mail'],
      location: ['city', 'location', 'area', 'address', 'region'],
      commission_rate: ['commission', 'commission %', 'rate', 'percentage', 'comm'],
      rera_number: ['rera', 'rera no', 'rera number', 'license'],
    },
  },
  {
    key: 'bill',
    title: 'Bills & Invoices',
    subtitle: 'Sales invoices, maintenance charges & billing records',
    icon: <Receipt className="w-5 h-5 text-amber-600" />,
    tableName: 'bills',
    targetUrl: '/billing',
    sampleColumns: ['Bill Number', 'Client Name', 'Client Phone', 'Client Address', 'Description', 'Amount', 'Date', 'Payment Method', 'Status', 'Notes'],
    sampleRow: ['INV-2024-001', 'Rajesh Kulkarni', '9822334455', 'Plot 12, Baner, Pune', 'Plot booking installment', '50000', '2024-05-01', 'Bank Transfer', 'Paid', 'Cheque cleared'],
    aliases: {
      bill_number: ['bill no', 'invoice no', 'bill number', 'invoice number', 'inv no'],
      client_name: ['client', 'customer', 'client name', 'name', 'billed to'],
      client_phone: ['phone', 'contact', 'client phone', 'mobile'],
      client_address: ['address', 'client address', 'location'],
      description: ['description', 'item', 'particulars', 'details'],
      amount: ['amount', 'total', 'bill amount', 'price', 'inr'],
      date: ['date', 'bill date', 'invoice date'],
      payment_method: ['payment method', 'mode', 'method', 'type'],
      status: ['status', 'payment status'],
      notes: ['notes', 'remarks'],
    },
  },
  {
    key: 'payment',
    title: 'Payments & Installments',
    subtitle: 'Payment records, EMI logs, cheques & receipts',
    icon: <CreditCard className="w-5 h-5 text-rose-600" />,
    tableName: 'Master Data Of Gurukrupa',
    targetUrl: '/billing',
    sampleColumns: ['Client Name', 'Paid Amount', 'EMI Amount', 'EMI Time', 'EMI No', 'EMI Paid Date', 'Cheque/Cash', 'Month & Year'],
    sampleRow: ['Vikas Joshi', '25000', '25000', '24 Months', '3', '2024-05-15', 'Cheque #102948', 'May 2024'],
    aliases: {
      client_name: ['client', 'customer', 'name', 'client name'],
      paid_amount: ['paid amount', 'amount', 'received', 'installment amount'],
      emi_amount: ['emi amount', 'due amount', 'monthly emi'],
      emi_time: ['emi time', 'term', 'tenure'],
      emi_no: ['emi no', 'installment no', 'slip no'],
      emi_paid_date: ['date', 'paid date', 'payment date'],
      cheque_cash: ['cheque/cash', 'mode', 'payment type', 'instrument'],
      month_and_year: ['month', 'period', 'month & year', 'billing month'],
    },
  },
  // Staff/admin accounts are intentionally not importable — admin_users rows
  // must reference auth.users, so they can only be created via /admin-users.
];

// ─── Component ───────────────────────────────────────────────────────────────

function UniversalDataImportContent() {
  const searchParams = useSearchParams();
  const paramEntity = searchParams.get('entity') || 'property';
  const validEntity = ENTITIES.some((e) => e.key === paramEntity) ? paramEntity : 'property';

  // Wizard state: 1 = Entity & Upload, 2 = Sheet & Header, 3 = Column Mapping, 4 = Preview, 5 = Done
  const [step, setStep] = useState<number>(1);
  const [selectedEntityKey, setSelectedEntityKey] = useState<string>(validEntity);
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  // Parse result state
  const [sheets, setSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [headerRow, setHeaderRow] = useState<number>(1);
  const [rawSampleRows, setRawSampleRows] = useState<{ rowNumber: number; cells: string[] }[]>([]);
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<any[][]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);

  // Field definitions fetched from /api/data-import/execute GET
  const [entityFields, setEntityFields] = useState<
    { key: string; label: string; type: 'text' | 'number' | 'date' }[]
  >([]);
  const [requiredFields, setRequiredFields] = useState<string[]>([]);
  const [duplicateCheckField, setDuplicateCheckField] = useState<string>('');

  // Column mapping: fieldKey -> excelHeader
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [skipDuplicates, setSkipDuplicates] = useState<boolean>(true);
  // 1-based data-row indices the user unticked in the preview table
  const [excludedRows, setExcludedRows] = useState<Set<number>>(new Set());

  // Execution result stats
  const [importResult, setImportResult] = useState<{
    success: boolean;
    stats: { total: number; imported: number; skipped: number; errors: number };
    errorRows: { row: number; data: any; error: string }[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeEntity = ENTITIES.find((e) => e.key === selectedEntityKey) || ENTITIES[0];

  // ── Fetch entity fields when entity changes ──
  useEffect(() => {
    async function loadEntityConfigs() {
      try {
        const res = await fetch('/api/data-import/execute');
        if (!res.ok) return;
        const data = await res.json();
        const conf = data.entities?.find((item: any) => item.key === selectedEntityKey);
        if (conf) {
          setEntityFields(conf.fields || []);
          setRequiredFields(conf.requiredFields || []);
          setDuplicateCheckField(conf.duplicateCheck || '');
        }
      } catch (err) {
        console.error('Failed to load entity config', err);
      }
    }
    loadEntityConfigs();
  }, [selectedEntityKey]);

  // ── Auto-match headers whenever excelHeaders or entityFields change ──
  useEffect(() => {
    if (!excelHeaders.length || !entityFields.length) return;

    const newMapping: Record<string, string> = {};
    const entityAliases = activeEntity.aliases || {};

    entityFields.forEach((field) => {
      // 1. Exact match on field label or key
      const exactMatch = excelHeaders.find(
        (h) =>
          h.toLowerCase().trim() === field.label.toLowerCase().trim() ||
          h.toLowerCase().trim() === field.key.toLowerCase().trim()
      );

      if (exactMatch) {
        newMapping[field.key] = exactMatch;
        return;
      }

      // 2. Check aliases list
      const aliases = entityAliases[field.key] || [];
      const aliasMatch = excelHeaders.find((h) => {
        const lowerH = h.toLowerCase().trim();
        return aliases.some(
          (a) => lowerH === a.toLowerCase().trim() || lowerH.includes(a.toLowerCase().trim())
        );
      });

      if (aliasMatch) {
        newMapping[field.key] = aliasMatch;
      }
    });

    setColumnMapping(newMapping);
  }, [excelHeaders, entityFields, activeEntity]);

  // ── File upload / parse handler ──
  const handleParseFile = async (
    targetFile: File,
    sheetName?: string,
    targetHeaderRow: number = 1
  ) => {
    setIsParsing(true);
    try {
      const form = new FormData();
      form.append('file', targetFile);

      const params = new URLSearchParams();
      if (sheetName) params.append('sheet', sheetName);
      params.append('headerRow', String(targetHeaderRow));
      params.append('previewRows', '30');

      const res = await fetch(`/api/data-import/parse?${params.toString()}`, {
        method: 'POST',
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to parse file');
      }

      setSheets(data.sheets || []);
      setSelectedSheet(data.selectedSheet || data.sheets?.[0] || '');
      setHeaderRow(data.headerRow || 1);
      setRawSampleRows(data.rawSampleRows || []);
      setExcelHeaders(data.preview?.headers || []);
      setPreviewRows(data.preview?.rows || []);
      setTotalRows(data.totalRows || 0);

      toast.success(
        `Parsed ${data.totalRows} data rows across ${data.sheets?.length || 1} sheet(s)!`
      );
    } catch (err: any) {
      toast.error(err.message || 'Error parsing file');
    } finally {
      setIsParsing(false);
    }
  };

  const onFileSelect = (selected: File) => {
    setFile(selected);
    handleParseFile(selected, undefined, 1);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const valid = ['.xlsx', '.xls', '.csv'].some((ext) =>
        droppedFile.name.toLowerCase().endsWith(ext)
      );
      if (!valid) {
        toast.error('Please upload an Excel (.xlsx, .xls) or CSV file');
        return;
      }
      onFileSelect(droppedFile);
    }
  };

  // ── Download Sample Template ──
  const downloadSampleTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      activeEntity.sampleColumns,
      activeEntity.sampleRow,
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sample_Data');
    XLSX.writeFile(wb, `${activeEntity.key}_import_template.xlsx`);
    toast.success(`Downloaded template for ${activeEntity.title}!`);
  };

  // ── Execute Import ──
  const handleExecuteImport = async () => {
    if (!file) {
      toast.error('No file selected');
      return;
    }

    // Verify required fields
    const missing = requiredFields.filter((req) => !columnMapping[req]);
    if (missing.length > 0) {
      const labels = missing
        .map((k) => entityFields.find((f) => f.key === k)?.label || k)
        .join(', ');
      toast.error(`Please map required field(s): ${labels}`);
      setStep(3); // jump back to mapping step
      return;
    }

    setIsExecuting(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('entityType', selectedEntityKey);
      form.append('sheetName', selectedSheet);
      form.append('headerRow', String(headerRow));
      form.append('skipDuplicates', String(skipDuplicates));
      form.append('columnMapping', JSON.stringify(columnMapping));
      form.append('excludeRows', JSON.stringify([...excludedRows]));

      const res = await fetch('/api/data-import/execute', {
        method: 'POST',
        body: form,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Import failed');
      }

      setImportResult(data);
      setStep(5); // Jump to finished screen
      toast.success(
        `Import complete! ${data.stats?.imported || 0} rows successfully imported.`
      );
    } catch (err: any) {
      toast.error(err.message || 'Import execution failed');
    } finally {
      setIsExecuting(false);
    }
  };

  // Calculate mapping coverage
  const mappedCount = Object.keys(columnMapping).filter((k) => !!columnMapping[k]).length;
  const missingRequiredCount = requiredFields.filter((k) => !columnMapping[k]).length;

  return (
    <CRMLayout>
      <div className="min-h-screen bg-slate-50/50 p-6 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header Title & Breadcrumb */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                <Link href="/dashboard" className="hover:text-blue-600 transition">
                  Admin
                </Link>
                <span>/</span>
                <span className="text-slate-800 font-medium">Data Import Wizard</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                <UploadCloud className="w-8 h-8 text-blue-600" />
                Universal Excel Import Wizard
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Seamlessly bulk import properties, customers, brokers, bills, and payments from any Excel (.xlsx/.xls) or CSV spreadsheet.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={downloadSampleTemplate}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm transition active:scale-95"
              >
                <Download className="w-4 h-4 text-blue-600" />
                Download {activeEntity.title} Template
              </button>
            </div>
          </div>

          {/* Stepper Wizard Indicator */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { num: 1, label: 'Entity & Upload', icon: <UploadCloud className="w-4 h-4" /> },
                { num: 2, label: 'Sheet & Row Selection', icon: <Table className="w-4 h-4" /> },
                { num: 3, label: 'Column Mapping', icon: <Layers className="w-4 h-4" /> },
                { num: 4, label: 'Preview & Verify', icon: <Sparkles className="w-4 h-4" /> },
                { num: 5, label: 'Results & Summary', icon: <CheckCircle2 className="w-4 h-4" /> },
              ].map((s) => {
                const isActive = step === s.num;
                const isPassed = step > s.num;
                return (
                  <button
                    key={s.num}
                    type="button"
                    disabled={isExecuting || (!file && s.num > 1)}
                    onClick={() => {
                      if (file || s.num === 1) setStep(s.num);
                    }}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg text-left transition ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold ring-1 ring-blue-500/30'
                        : isPassed
                        ? 'text-emerald-700 hover:bg-emerald-50/50'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition shrink-0 ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isPassed ? <Check className="w-4 h-4" /> : s.num}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs truncate">{s.label}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ──────────────────────────────────────────────────────────────────
              STEP 1: Select Entity & Upload File
          ────────────────────────────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Entity Picker Cards */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2.5">
                  1. Select Target Category to Import Into:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {ENTITIES.map((ent) => {
                    const isSelected = selectedEntityKey === ent.key;
                    return (
                      <div
                        key={ent.key}
                        onClick={() => setSelectedEntityKey(ent.key)}
                        className={`cursor-pointer rounded-xl p-4 border transition duration-150 flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-50/60 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 shadow-xs'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2.5 rounded-lg border ${
                              isSelected
                                ? 'bg-white border-blue-200'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            {ent.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-sm font-bold text-slate-900">{ent.title}</h3>
                              {isSelected && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-600 text-white">
                                  Selected
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                              {ent.subtitle}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-mono text-slate-400">table: {ent.tableName}</span>
                          <span className="text-blue-600 font-medium">
                            {ent.sampleColumns.length} fields supported
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Upload Dropzone */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                <label className="block text-sm font-semibold text-slate-800">
                  2. Upload Spreadsheet File (.xlsx, .xls, .csv):
                </label>

                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
                    file
                      ? 'border-emerald-400 bg-emerald-50/30'
                      : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50/20 bg-slate-50/30'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        onFileSelect(e.target.files[0]);
                      }
                    }}
                  />

                  {file ? (
                    <>
                      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
                        <FileSpreadsheet className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{file.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {(file.size / 1024).toFixed(1)} KB • {totalRows} records detected
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                        <Check className="w-3.5 h-3.5" /> File Loaded Ready
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          Click to browse or drag and drop your spreadsheet here
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Supported formats: Microsoft Excel (.xlsx, .xls), CSV (.csv) up to 10 MB
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {isParsing && (
                  <div className="flex items-center justify-center gap-2 py-3 text-sm text-blue-600 font-medium">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Parsing sheets and reading headers...
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={!file || isParsing}
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-blue-600/20 transition active:scale-95"
                >
                  Continue to Sheet & Row Selection
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────────────
              STEP 2: Sheet & Row Selection ("Decide which row & cells they want")
          ────────────────────────────────────────────────────────────────── */}
          {step === 2 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Table className="w-5 h-5 text-blue-600" />
                    Interactive Sheet & Row Selection
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Select which sheet to read, click the row that contains your column titles, and preview the raw data layout.
                  </p>
                </div>

                {/* Sheet Selector */}
                {sheets.length > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">Active Sheet:</span>
                    <select
                      value={selectedSheet}
                      onChange={(e) => {
                        setSelectedSheet(e.target.value);
                        if (file) handleParseFile(file, e.target.value, headerRow);
                      }}
                      className="text-xs font-medium border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
                    >
                      {sheets.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Header Row Selector Controls */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Header Row:
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                      Row {headerRow}
                    </span>
                    <span className="text-xs text-slate-500">
                      (Data rows start on Row {headerRow + 1})
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Click any row in the spreadsheet grid below to designate it as the header title row.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={headerRow <= 1 || isParsing}
                    onClick={() => {
                      const next = Math.max(1, headerRow - 1);
                      setHeaderRow(next);
                      if (file) handleParseFile(file, selectedSheet, next);
                    }}
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 disabled:opacity-40"
                  >
                    ▲ Previous Row
                  </button>
                  <button
                    type="button"
                    disabled={isParsing}
                    onClick={() => {
                      const next = headerRow + 1;
                      setHeaderRow(next);
                      if (file) handleParseFile(file, selectedSheet, next);
                    }}
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 disabled:opacity-40"
                  >
                    ▼ Next Row
                  </button>
                </div>
              </div>

              {/* Interactive Raw Spreadsheet Grid Preview */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>First 12 raw rows of spreadsheet:</span>
                  <span className="text-blue-600 font-medium">
                    Blue row is active header • Green rows will be imported
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-[380px] shadow-2xs">
                  <table className="w-full text-left text-xs text-slate-700 border-collapse">
                    <thead className="bg-slate-100/80 sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3 text-[11px] font-bold text-slate-500 w-16 text-center border-r border-slate-200">
                          Row #
                        </th>
                        <th className="py-2 px-3 text-[11px] font-bold text-slate-500 w-28 text-center border-r border-slate-200">
                          Row Role
                        </th>
                        {excelHeaders.map((_, i) => (
                          <th
                            key={i}
                            className="py-2 px-3 text-[11px] font-semibold text-slate-600 min-w-[120px] border-r border-slate-200 last:border-0"
                          >
                            Col {String.fromCharCode(65 + (i % 26))}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rawSampleRows.map((r) => {
                        const isHeader = r.rowNumber === headerRow;
                        const isData = r.rowNumber > headerRow;
                        const isIgnored = r.rowNumber < headerRow;

                        return (
                          <tr
                            key={r.rowNumber}
                            onClick={() => {
                              setHeaderRow(r.rowNumber);
                              if (file) handleParseFile(file, selectedSheet, r.rowNumber);
                            }}
                            className={`cursor-pointer transition ${
                              isHeader
                                ? 'bg-blue-100/70 font-semibold text-blue-900 ring-2 ring-blue-500 ring-inset'
                                : isData
                                ? 'bg-white hover:bg-slate-50/80'
                                : 'bg-slate-50/60 text-slate-400'
                            }`}
                          >
                            <td className="py-2 px-3 font-mono text-center font-bold border-r border-slate-200">
                              {r.rowNumber}
                            </td>
                            <td className="py-2 px-3 text-center border-r border-slate-200">
                              {isHeader ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                                  ★ Header Row
                                </span>
                              ) : isData ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Data Row
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-200 text-slate-500">
                                  Skipped Title
                                </span>
                              )}
                            </td>
                            {r.cells.map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                className="py-2 px-3 truncate max-w-[200px] border-r border-slate-200 last:border-0"
                              >
                                {cell || <span className="text-slate-300 italic">empty</span>}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Detected Headers Chips */}
              <div className="pt-2">
                <span className="text-xs font-semibold text-slate-700 block mb-2">
                  Detected Column Titles ({excelHeaders.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {excelHeaders.map((hdr, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 border border-slate-200 text-slate-700"
                    >
                      {hdr}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Upload
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition active:scale-95"
                >
                  Confirm & Map Columns
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────────────
              STEP 3: Intelligent Column Mapping
          ────────────────────────────────────────────────────────────────── */}
          {step === 3 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-600" />
                    Intelligent Column Mapping
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Map each database field to the corresponding Excel column. Smart auto-match has already pre-filled standard matches.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`px-3 py-1.5 rounded-lg font-medium border ${
                      missingRequiredCount === 0
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {missingRequiredCount === 0
                      ? '✓ All Required Fields Mapped'
                      : `⚠ ${missingRequiredCount} Required Field(s) Missing`}
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-medium border border-slate-200">
                    {mappedCount} / {entityFields.length} Mapped
                  </span>
                </div>
              </div>

              {/* Mapping Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs text-slate-700 border-collapse">
                  <thead className="bg-slate-100/90 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 font-bold text-slate-700 w-1/3">
                        Database Field
                      </th>
                      <th className="py-3 px-4 font-bold text-slate-700 w-1/3">
                        Excel Spreadsheet Column
                      </th>
                      <th className="py-3 px-4 font-bold text-slate-700 w-1/3">
                        Sample Value Preview (Row 1)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {entityFields.map((field) => {
                      const isRequired = requiredFields.includes(field.key);
                      const currentMappedHeader = columnMapping[field.key] || '';
                      const isMapped = !!currentMappedHeader;

                      // Find sample value from previewRows
                      const colIndex = excelHeaders.findIndex(
                        (h) => h.toLowerCase() === currentMappedHeader.toLowerCase()
                      );
                      const sampleValue =
                        colIndex !== -1 && previewRows.length > 0
                          ? previewRows[0]?.[colIndex]
                          : '';

                      return (
                        <tr
                          key={field.key}
                          className={`hover:bg-slate-50/80 transition ${
                            isRequired && !isMapped ? 'bg-amber-50/40' : ''
                          }`}
                        >
                          {/* Field Label + Badges */}
                          <td className="py-3.5 px-4 align-middle">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900 text-sm">
                                {field.label}
                              </span>
                              {isRequired && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                                  Required *
                                </span>
                              )}
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 font-mono">
                                {field.type}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                              key: {field.key}
                            </span>
                          </td>

                          {/* Excel Column Selector */}
                          <td className="py-3.5 px-4 align-middle">
                            <select
                              value={currentMappedHeader}
                              onChange={(e) => {
                                setColumnMapping({
                                  ...columnMapping,
                                  [field.key]: e.target.value,
                                });
                              }}
                              className={`w-full text-xs font-medium border rounded-lg px-3 py-2 bg-white transition focus:ring-2 focus:ring-blue-500 ${
                                isRequired && !isMapped
                                  ? 'border-amber-400 bg-amber-50/20 text-slate-800'
                                  : isMapped
                                  ? 'border-blue-400 text-slate-900 bg-blue-50/20'
                                  : 'border-slate-300 text-slate-500'
                              }`}
                            >
                              <option value="">— Do Not Import / Skip —</option>
                              {excelHeaders.map((hdr, i) => (
                                <option key={i} value={hdr}>
                                  {hdr}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Sample Value Preview */}
                          <td className="py-3.5 px-4 align-middle">
                            {isMapped ? (
                              sampleValue ? (
                                <span className="inline-block px-2.5 py-1 rounded bg-slate-100 text-slate-800 font-mono text-[11px] max-w-[240px] truncate">
                                  {String(sampleValue)}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic text-[11px]">
                                  (blank in row 1)
                                </span>
                              )
                            ) : (
                              <span className="text-slate-300 italic text-[11px]">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Sheet
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (missingRequiredCount > 0) {
                      toast.error('Please map all required fields before proceeding');
                      return;
                    }
                    setStep(4);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition active:scale-95"
                >
                  Proceed to Final Preview
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────────────
              STEP 4: Preview & Sanity Check
          ────────────────────────────────────────────────────────────────── */}
          {step === 4 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    Preview & Import Settings
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Review how your spreadsheet data translates into {activeEntity.title} records before committing to the database.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-3.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold">
                    Total Rows to Import: {totalRows}
                  </div>
                </div>
              </div>

              {/* Duplicates Options Card */}
              <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-700 shrink-0">
                    <Info className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Duplicate Record Prevention
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {duplicateCheckField
                        ? `Matches against existing records in "${activeEntity.tableName}" via "${duplicateCheckField}" field.`
                        : 'Inserts records directly into the table.'}
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={skipDuplicates}
                    onChange={(e) => setSkipDuplicates(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    Skip Duplicate Records
                  </span>
                </label>
              </div>

              {/* Transformed Data Preview Table — untick a row to exclude it */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-700">
                    Sample Data Rows ({previewRows.length} displayed) — untick any row to exclude it:
                  </span>
                  {excludedRows.size > 0 && (
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
                      {excludedRows.size} row{excludedRows.size === 1 ? '' : 's'} excluded
                    </span>
                  )}
                </div>
                <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-[380px] shadow-2xs">
                  <table className="w-full text-left text-xs text-slate-700 border-collapse">
                    <thead className="bg-slate-100 sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 w-10 text-center border-r border-slate-200">
                          <input
                            type="checkbox"
                            checked={previewRows.every((_, i) => !excludedRows.has(i + 1))}
                            onChange={(e) => {
                              const next = new Set(excludedRows);
                              if (e.target.checked) {
                                previewRows.forEach((_, i) => next.delete(i + 1));
                              } else {
                                previewRows.forEach((_, i) => next.add(i + 1));
                              }
                              setExcludedRows(next);
                            }}
                            className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                            title="Select all"
                          />
                        </th>
                        <th className="py-2.5 px-3 font-bold text-slate-600 w-12 text-center border-r border-slate-200">
                          #
                        </th>
                        {entityFields
                          .filter((f) => !!columnMapping[f.key])
                          .map((f) => (
                            <th
                              key={f.key}
                              className="py-2.5 px-3 font-semibold text-slate-700 min-w-[130px] border-r border-slate-200 last:border-0"
                            >
                              {f.label}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {previewRows.map((row, rIdx) => {
                        const excluded = excludedRows.has(rIdx + 1);
                        return (
                        <tr
                          key={rIdx}
                          className={`transition ${excluded ? 'bg-slate-50 opacity-40' : 'hover:bg-slate-50/80'}`}
                        >
                          <td className="py-2 px-3 text-center border-r border-slate-200">
                            <input
                              type="checkbox"
                              checked={!excluded}
                              onChange={(e) => {
                                const next = new Set(excludedRows);
                                if (e.target.checked) next.delete(rIdx + 1);
                                else next.add(rIdx + 1);
                                setExcludedRows(next);
                              }}
                              className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                              title={excluded ? 'Include this row' : 'Exclude this row'}
                            />
                          </td>
                          <td className="py-2 px-3 font-mono text-center text-slate-400 border-r border-slate-200">
                            {rIdx + 1}
                          </td>
                          {entityFields
                            .filter((f) => !!columnMapping[f.key])
                            .map((f) => {
                              const excelHeader = columnMapping[f.key];
                              const colIdx = excelHeaders.findIndex(
                                (h) => h.toLowerCase() === excelHeader.toLowerCase()
                              );
                              const val = colIdx !== -1 ? row[colIdx] : '';
                              return (
                                <td
                                  key={f.key}
                                  className="py-2 px-3 truncate max-w-[200px] border-r border-slate-200 last:border-0"
                                >
                                  {val != null && String(val).trim() !== '' ? (
                                    String(val)
                                  ) : (
                                    <span className="text-slate-300 italic">—</span>
                                  )}
                                </td>
                              );
                            })}
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isExecuting}
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Mapping
                </button>
                <button
                  type="button"
                  disabled={isExecuting}
                  onClick={handleExecuteImport}
                  className="inline-flex items-center gap-2.5 px-7 py-3 rounded-lg text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition active:scale-95 disabled:opacity-50"
                >
                  {isExecuting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Importing Records...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-5 h-5" />
                      Execute Import Now ({Math.max(0, totalRows - excludedRows.size)} Rows)
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────────────
              STEP 5: Results & Summary
          ────────────────────────────────────────────────────────────────── */}
          {step === 5 && importResult && (
            <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm space-y-8">
              {/* Top Banner */}
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Data Import Completed Successfully!
                </h2>
                <p className="text-sm text-slate-500">
                  Spreadsheet data has been processed and saved into {activeEntity.title}.
                </p>
              </div>

              {/* 4 Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                  <p className="text-xs font-semibold text-slate-500 uppercase">Total Rows</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {importResult.stats?.total || 0}
                  </p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                  <p className="text-xs font-semibold text-emerald-600 uppercase">
                    Imported
                  </p>
                  <p className="text-2xl font-black text-emerald-700 mt-1">
                    {importResult.stats?.imported || 0}
                  </p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                  <p className="text-xs font-semibold text-amber-600 uppercase">
                    Skipped (Duplicates)
                  </p>
                  <p className="text-2xl font-black text-amber-700 mt-1">
                    {importResult.stats?.skipped || 0}
                  </p>
                </div>
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-center">
                  <p className="text-xs font-semibold text-rose-600 uppercase">Errors</p>
                  <p className="text-2xl font-black text-rose-700 mt-1">
                    {importResult.stats?.errors || 0}
                  </p>
                </div>
              </div>

              {/* Error Rows Accordion if any */}
              {importResult.errorRows && importResult.errorRows.length > 0 && (
                <div className="border border-rose-200 rounded-xl p-4 bg-rose-50/30 space-y-3">
                  <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    Row Issues ({importResult.errorRows.length}):
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 text-xs text-rose-700">
                    {importResult.errorRows.map((err, i) => (
                      <div
                        key={i}
                        className="p-2 rounded bg-white border border-rose-200 flex items-center justify-between"
                      >
                        <span className="font-mono font-bold">Row {err.row}:</span>
                        <span className="text-slate-600 truncate max-w-md">{err.error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-100">
                <Link
                  href={activeEntity.targetUrl}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition active:scale-95"
                >
                  View In {activeEntity.title} Page
                  <ExternalLink className="w-4 h-4" />
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setStep(1);
                    setImportResult(null);
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition active:scale-95"
                >
                  <RefreshCw className="w-4 h-4" /> Import Another File
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </CRMLayout>
  );
}

export default function UniversalDataImportPage() {
  return (
    <Suspense
      fallback={
        <CRMLayout>
          <div className="min-h-screen flex items-center justify-center">
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
              Loading Data Import Wizard...
            </div>
          </div>
        </CRMLayout>
      }
    >
      <UniversalDataImportContent />
    </Suspense>
  );
}
