'use client';

import React, { useState } from 'react';
import { QrCode, X } from 'lucide-react';

export interface BankAccountItem {
  bankName: string;
  accountNo: string;
  ifsc: string;
  vpa?: string;
}

export const DEFAULT_BANK_DETAILS: BankAccountItem[] = [
  {
    bankName: 'CANARA BANK',
    accountNo: '2883201000305',
    ifsc: 'CNRB0002883',
    vpa: '',
  },
  {
    bankName: 'KARNATAKA BANK LTD',
    accountNo: '7262000100356801',
    ifsc: 'KARB0000726',
    vpa: 'gurukrupacorp@kbl',
  },
  {
    bankName: 'KOTAK MAHINDRA BANK LTD.',
    accountNo: '4112893550',
    ifsc: 'KKBK0000823',
    vpa: '',
  },
];

export const DEFAULT_CANCELLATION_NOTE =
  'IF PLOT CANCELLED AMOUNT DEDUCT 30% AND WILL BE RETURN AFTER PLOT SELLING.';

export const DEFAULT_UPI_VPA = 'gurukrupacorp@kbl';

const ONES = [
  '',
  'ONE',
  'TWO',
  'THREE',
  'FOUR',
  'FIVE',
  'SIX',
  'SEVEN',
  'EIGHT',
  'NINE',
  'TEN',
  'ELEVEN',
  'TWELVE',
  'THIRTEEN',
  'FOURTEEN',
  'FIFTEEN',
  'SIXTEEN',
  'SEVENTEEN',
  'EIGHTEEN',
  'NINETEEN',
];

const TENS = [
  '',
  '',
  'TWENTY',
  'THIRTY',
  'FORTY',
  'FIFTY',
  'SIXTY',
  'SEVENTY',
  'EIGHTY',
  'NINETY',
];

function twoDigitWords(n: number): string {
  if (n <= 0) return '';
  if (n < 20) return ONES[n];
  const ten = Math.floor(n / 10);
  const one = n % 10;
  return `${TENS[ten]}${one > 0 ? ' ' + ONES[one] : ''}`;
}

function convertIntegerToIndianWords(num: number): string {
  if (num === 0) return 'ZERO';
  const parts: string[] = [];
  let n = Math.floor(Math.abs(num));

  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  if (crore > 0) {
    parts.push(`${convertIntegerToIndianWords(crore)} CRORE`);
  }

  const lakh = Math.floor(n / 100000);
  n %= 100000;
  if (lakh > 0) {
    parts.push(`${twoDigitWords(lakh)} LAKH`);
  }

  const thousand = Math.floor(n / 1000);
  n %= 1000;
  if (thousand > 0) {
    parts.push(`${twoDigitWords(thousand)} THOUSAND`);
  }

  const hundred = Math.floor(n / 100);
  n %= 100;
  if (hundred > 0) {
    parts.push(`${ONES[hundred]} HUNDRED`);
  }

  if (n > 0) {
    parts.push(twoDigitWords(n));
  }

  return parts.join(' ').trim();
}

export function numberToIndianWords(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) return '';
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  const rupeeWords = convertIntegerToIndianWords(rupees);
  if (paise > 0) {
    const paiseWords = twoDigitWords(paise);
    return `${rupeeWords} RUPEES AND ${paiseWords} PAISE ONLY.`;
  }
  return `${rupeeWords} RUPEES ONLY.`;
}

export function formatIndianCommaAmount(amount: number): string {
  if (!Number.isFinite(amount)) return '0';
  const rounded = Math.round(amount * 100) / 100;
  const hasDecimals = rounded % 1 !== 0;
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(rounded);
}

export function paymentMethodToShortCode(method?: string): string {
  const m = String(method || '').trim().toUpperCase();
  if (!m) return 'CASH';
  if (m === 'CHEQUE' || m === 'CHQ') return 'CHQ';
  if (m === 'BANK TRANSFER') return 'BANK TRF';
  return m;
}

export function formatReceiptLongDate(isoOrDate?: string | null): string {
  if (!isoOrDate) return '—';
  const raw = String(isoOrDate).trim();
  const d = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? new Date(raw + 'T00:00:00') : new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export interface GurukrupaReceiptProps {
  receiptNumber: string;
  date: string | null;
  partyName: string;
  mobileNo?: string | null;
  societyName?: string | null;
  plotNo?: string | null;
  plotSize?: string | null;
  referenceBy?: string | null;
  totalEmiNo?: string | null;
  paymentDescription?: string | null;
  netAmount: number;
  amountInWords?: string | null;
  remarks?: string | null;
  cancellationNote?: string | null;
  bankDetails?: BankAccountItem[];
  upiVpa?: string | null;
  showQr?: boolean;
}

export function GurukrupaReceipt({
  receiptNumber,
  date,
  partyName,
  mobileNo,
  societyName,
  plotNo,
  plotSize,
  referenceBy,
  totalEmiNo,
  paymentDescription,
  netAmount,
  amountInWords,
  remarks,
  cancellationNote,
  bankDetails,
  upiVpa = DEFAULT_UPI_VPA,
  showQr = true,
}: GurukrupaReceiptProps) {
  const [showQrModal, setShowQrModal] = useState(false);

  const banks =
    Array.isArray(bankDetails) && bankDetails.length > 0
      ? bankDetails.slice(0, 3)
      : DEFAULT_BANK_DETAILS;

  const computedWords =
    (amountInWords && amountInWords.trim()) ||
    numberToIndianWords(netAmount) ||
    'ZERO RUPEES ONLY.';

  const finalNote =
    cancellationNote && cancellationNote.trim()
      ? cancellationNote.trim()
      : DEFAULT_CANCELLATION_NOTE;

  const formattedNetAmount = formatIndianCommaAmount(netAmount);
  const bankColSpan = banks.length + (showQr ? 1 : 0);

  return (
    <>
      <div className="bg-white border-2 border-black text-black font-serif select-text overflow-x-auto shadow-sm">
        <div className="min-w-[680px]">
          {/* Row 1: Top RECEIPT strip */}
          <div className="flex border-b border-black bg-[#c0c0c0]">
            <div className="w-[150px] px-3 py-1 border-r border-black shrink-0">
              <span className="text-[#cc0000] font-bold text-sm tracking-wide uppercase">
                RECEIPT
              </span>
            </div>
            <div className="flex-1 px-3 py-1" />
          </div>

          {/* Row 2: Company Name Banner */}
          <div className="border-b border-black bg-[#c0c0c0] py-1.5 px-4 text-center">
            <h1
              className="text-2xl sm:text-[26px] font-extrabold tracking-wider text-black uppercase leading-tight"
              style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
            >
              GURUKRUPA CORPORATION
            </h1>
          </div>

          {/* Row 3: Address, Phone & Emblems */}
          <div className="flex items-center justify-between px-3 py-2 border-b-2 border-black bg-white gap-3">
            <img
              src="/gurukrupa-emblem-left.png"
              alt="Emblem"
              className="h-13 w-auto object-contain shrink-0"
            />
            <div
              className="text-center flex-1 px-2 min-w-0"
              style={{ fontFamily: 'Calibri, Arial, sans-serif' }}
            >
              <p className="text-xs sm:text-[13px] font-bold underline tracking-tight text-black uppercase leading-snug">
                PLOT NO.7, NR. MARUTI COMPLEX, NASIK MARKANTILE BANK, SURAT - 395 002
              </p>
              <p className="text-xs sm:text-[13px] font-bold text-black mt-1">
                PH : (0261) - 4812727
              </p>
            </div>
            <img
              src="/gurukrupa-emblem-right.png"
              alt="Emblem"
              className="h-13 w-auto object-contain shrink-0"
            />
          </div>

          {/* Row 4: Party / Plot Details (left) & Receipt / Date / Total EMI No (right) */}
          <div className="flex border-b border-black">
            {/* Left 64%: Party Details Table */}
            <div className="w-[64%] border-r border-black py-2 px-3">
              <table className="w-full text-[13px] border-collapse">
                <tbody>
                  <tr>
                    <td className="py-0.5 pr-3 w-[120px] text-center font-medium text-black whitespace-nowrap align-top">
                      Party Name
                    </td>
                    <td className="py-0.5 font-semibold text-black uppercase break-words">
                      {partyName || '—'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-0.5 pr-3 w-[120px] text-center italic text-black whitespace-nowrap align-top">
                      Mobile No
                    </td>
                    <td className="py-0.5 text-black break-words">
                      {mobileNo || '—'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-0.5 pr-3 w-[120px] text-center font-medium text-black whitespace-nowrap align-top">
                      Society Name
                    </td>
                    <td className="py-0.5 font-medium text-black uppercase break-words">
                      {societyName || '—'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-0.5 pr-3 w-[120px] text-center italic text-black whitespace-nowrap align-top">
                      Plot No.
                    </td>
                    <td className="py-0.5 text-black break-words">
                      {plotNo || '—'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-0.5 pr-3 w-[120px] text-center font-medium text-black whitespace-nowrap align-top">
                      Plot Size
                    </td>
                    <td className="py-0.5 text-black break-words">
                      {plotSize || '—'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-0.5 pr-3 w-[120px] text-center font-medium text-black whitespace-nowrap align-top">
                      Refrence BY
                    </td>
                    <td className="py-0.5 text-black uppercase break-words">
                      {referenceBy || '—'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Right 36%: Receipt #, Date, Total EMI No */}
            <div className="w-[36%] flex flex-col text-[13px]">
              <div className="flex border-b border-black bg-[#eaefe4] px-2.5 py-1.5 items-center gap-2">
                <span className="w-[80px] font-medium text-black text-center shrink-0">
                  RECIEPT
                </span>
                <span className="font-semibold text-black break-all">
                  {receiptNumber || '—'}
                </span>
              </div>
              <div className="flex border-b border-black bg-[#eaefe4] px-2.5 py-2 items-center gap-2">
                <span className="w-[80px] font-medium text-black text-center shrink-0">
                  DATE :
                </span>
                <span className="font-medium text-black">
                  {formatReceiptLongDate(date)}
                </span>
              </div>
              <div className="px-2.5 py-2.5 text-center flex flex-col justify-center flex-1 bg-white min-h-[64px]">
                <p className="text-xs font-medium text-black uppercase tracking-wide">
                  TOTAL EMI NO.
                </p>
                <p className="text-sm font-bold text-black mt-1">
                  {totalEmiNo || '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Row 5 & 6: BANK DETAILS | Description | Net Amount Table (zero column overlap) */}
          <table className="w-full border-collapse border-b border-black table-fixed text-[11.5px]">
            <colgroup>
              {banks.map((_, idx) => (
                <col key={idx} style={{ width: showQr ? '19%' : '25%' }} />
              ))}
              {showQr && <col style={{ width: '18%' }} />}
              <col style={{ width: '12%' }} />
              <col style={{ width: '13%' }} />
            </colgroup>
            <thead>
              <tr className="border-b border-black text-xs">
                <th
                  colSpan={bankColSpan}
                  className="border-r border-black py-1 px-2 text-center italic font-semibold text-[#1a237e] uppercase"
                >
                  BANK DETAILS
                </th>
                <th className="border-r border-black py-1 px-1.5 text-center italic font-semibold text-[#1a237e] whitespace-nowrap">
                  Description
                </th>
                <th className="py-1 px-1.5 text-center italic font-semibold text-[#1a237e] whitespace-nowrap">
                  Net Amount
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {banks.map((b, idx) => (
                  <td
                    key={idx}
                    rowSpan={2}
                    className="border-r border-black p-2 text-center align-top leading-snug break-words"
                  >
                    <p className="font-semibold text-black uppercase">
                      {b.bankName}
                      {idx === 0 && !b.bankName.includes('DETAILS') ? ' DETAILS -' : ''}
                    </p>
                    {b.accountNo && (
                      <p className="text-black mt-1 break-all">
                        AC/{b.accountNo}
                      </p>
                    )}
                    {b.ifsc && (
                      <p className="text-black mt-1 break-all">
                        IFSC / {b.ifsc}
                      </p>
                    )}
                    {b.vpa && (
                      <p className="text-black mt-1 break-all">
                        VPA : {b.vpa}
                      </p>
                    )}
                  </td>
                ))}

                {showQr && (
                  <td
                    rowSpan={2}
                    className="border-r border-black p-1.5 text-center align-middle bg-white"
                  >
                    <button
                      type="button"
                      onClick={() => setShowQrModal(true)}
                      title="Click to enlarge Karnataka Bank UPI QR Code"
                      className="group inline-flex flex-col items-center focus:outline-none"
                    >
                      <img
                        src="/gurukrupa-qr.png"
                        alt={`Payment QR Code (${upiVpa || DEFAULT_UPI_VPA})`}
                        className="w-24 h-24 object-contain border border-gray-300"
                      />
                      <span className="text-[9px] text-gray-600 mt-0.5 font-sans no-print group-hover:text-blue-600 break-all">
                        {upiVpa || DEFAULT_UPI_VPA}
                      </span>
                    </button>
                  </td>
                )}

                <td
                  rowSpan={2}
                  className="border-r border-black p-2 text-center align-top"
                >
                  <span className="font-bold text-[#5e2b63] uppercase text-xs break-words">
                    {paymentDescription || 'CASH'}
                  </span>
                </td>

                <td className="border-b border-black p-2 text-center align-top font-semibold text-black text-sm h-[68px]">
                  {formattedNetAmount}
                </td>
              </tr>
              <tr>
                <td className="p-2 h-[68px]" />
              </tr>
            </tbody>
          </table>

          {/* Row 7: AMT IN WORD */}
          <div className="flex border-b border-black items-stretch">
            <div
              className="w-[87%] border-r border-black px-3 py-2 flex items-center gap-3"
              style={{ fontFamily: 'Calibri, Arial, sans-serif' }}
            >
              <span className="text-xs font-bold text-black uppercase shrink-0">
                AMT IN WORD
              </span>
              <span className="text-xs sm:text-[13px] font-bold text-black uppercase text-center flex-1 break-words">
                {computedWords}
              </span>
            </div>
            <div className="w-[13%] bg-[#ccf2ff] px-2 py-2 text-center font-bold text-black text-sm flex items-center justify-center">
              {formattedNetAmount}
            </div>
          </div>

          {/* Row 8: REMARKS */}
          <div
            className="flex border-b border-black items-stretch min-h-[38px]"
            style={{ fontFamily: 'Calibri, Arial, sans-serif' }}
          >
            <div className="w-[125px] shrink-0 border-r border-black px-2.5 py-2 flex items-center justify-center text-center text-xs font-bold text-black uppercase">
              REMARKS :
            </div>
            <div className="flex-1 px-3 py-2 flex items-center justify-center text-center text-xs font-bold text-black uppercase break-words">
              {remarks || '—'}
            </div>
          </div>

          {/* Row 9: NOTE & Authorised Signatory */}
          <div className="flex min-h-[95px]">
            <div className="w-[58%] border-r border-black flex flex-col justify-between">
              <div className="p-2.5 text-center flex-1 flex flex-col justify-center">
                <p className="text-xs font-bold italic underline text-black uppercase">
                  NOTE:
                </p>
                <p className="text-xs font-bold italic underline text-black uppercase mt-1 leading-relaxed break-words">
                  {finalNote}
                </p>
              </div>
              <div className="border-t border-black h-5" />
            </div>
            <div className="w-[42%] p-2.5 flex flex-col items-center justify-between text-center">
              <p className="text-xs sm:text-[13px] font-bold text-[#1d398f] uppercase">
                For GURUKRUPA CORPORATION
              </p>
              <img
                src="/gurukrupa-sign.png"
                alt="Authorised Signatory"
                className="h-10 w-auto object-contain my-1"
              />
              <p className="text-[11px] font-bold text-[#1d398f]">
                Authorised Signatory
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enlarged QR Standee Modal */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 no-print"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-purple-900 text-white">
              <div className="flex items-center gap-2">
                <QrCode size={18} />
                <span className="text-sm font-bold">
                  Karnataka Bank – Scan QR Code to Pay
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="p-1 rounded hover:bg-purple-800 text-white"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4 flex flex-col items-center bg-white">
              <img
                src="/gurukrupa-qr-card.png"
                alt="Gurukrupa Corporation Karnataka Bank QR Card"
                className="max-h-[460px] w-auto object-contain rounded border border-gray-200"
              />
              <p className="text-xs font-semibold text-gray-700 mt-3">
                VPA: <span className="font-mono text-purple-800">{upiVpa || DEFAULT_UPI_VPA}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function PaymentQrSection({
  bankDetails = DEFAULT_BANK_DETAILS,
  upiVpa = DEFAULT_UPI_VPA,
  showQr = true,
  amountInWords,
  remarks,
  cancellationNote = DEFAULT_CANCELLATION_NOTE,
}: {
  bankDetails?: BankAccountItem[];
  upiVpa?: string | null;
  showQr?: boolean;
  amountInWords?: string | null;
  remarks?: string | null;
  cancellationNote?: string | null;
}) {
  const [showQrModal, setShowQrModal] = useState(false);
  const banks = bankDetails.length > 0 ? bankDetails : DEFAULT_BANK_DETAILS;

  return (
    <div className="mt-6 pt-5 border-t border-gray-200 space-y-4">
      {amountInWords && (
        <div className="bg-blue-50/70 border border-blue-100 rounded-lg px-3.5 py-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-blue-900 uppercase">Amount in Words:</span>
          <span className="font-semibold text-gray-900 uppercase">{amountInWords}</span>
        </div>
      )}

      {remarks && (
        <div className="bg-amber-50/60 border border-amber-200 rounded-lg px-3.5 py-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-amber-900 uppercase">Remarks:</span>
          <span className="font-medium text-gray-800 uppercase">{remarks}</span>
        </div>
      )}

      {/* Bank Details + QR Code */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
        <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
          <div className="flex-1 space-y-2 w-full min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-900">
              Bank Details (Gurukrupa Corporation)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              {banks.map((b, i) => (
                <div key={i} className="bg-white p-2.5 rounded border border-gray-200 break-words">
                  <p className="font-bold text-gray-900 uppercase">{b.bankName}</p>
                  <p className="text-gray-700 mt-0.5 font-mono text-[11px] break-all">AC: {b.accountNo}</p>
                  <p className="text-gray-600 font-mono text-[11px] break-all">IFSC: {b.ifsc}</p>
                  {b.vpa && (
                    <p className="text-purple-700 font-semibold text-[11px] mt-0.5 break-all">
                      VPA: {b.vpa}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {showQr && (
            <div className="flex flex-col items-center bg-white p-3 rounded-lg border border-purple-200 shadow-xs shrink-0 mx-auto md:mx-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900 mb-1">
                Scan QR to Pay (UPI)
              </span>
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="focus:outline-none group"
                title="Click to view full Karnataka Bank QR Card"
              >
                <img
                  src="/gurukrupa-qr.png"
                  alt="Gurukrupa Corporation Payment QR Code"
                  className="w-28 h-28 object-contain border border-gray-200 rounded"
                />
              </button>
              <span className="text-[11px] font-mono font-semibold text-gray-800 mt-1">
                {upiVpa || DEFAULT_UPI_VPA}
              </span>
              <span className="text-[10px] text-gray-500">GURUKRUPA CORPORATION</span>
            </div>
          )}
        </div>
      </div>

      {cancellationNote && (
        <div className="text-[11px] text-gray-700 font-semibold italic bg-gray-50 border border-gray-200 rounded px-3 py-2">
          NOTE: {cancellationNote}
        </div>
      )}

      {showQrModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 no-print"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-purple-900 text-white">
              <div className="flex items-center gap-2">
                <QrCode size={18} />
                <span className="text-sm font-bold">
                  Karnataka Bank – Scan QR Code to Pay
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="p-1 rounded hover:bg-purple-800 text-white"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4 flex flex-col items-center bg-white">
              <img
                src="/gurukrupa-qr-card.png"
                alt="Gurukrupa Corporation Karnataka Bank QR Card"
                className="max-h-[460px] w-auto object-contain rounded border border-gray-200"
              />
              <p className="text-xs font-semibold text-gray-700 mt-3">
                VPA: <span className="font-mono text-purple-800">{upiVpa || DEFAULT_UPI_VPA}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
