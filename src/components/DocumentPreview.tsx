'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { formatCurrencySymbol } from '@/lib/utils';

export default function DocumentPreview() {
  const { currentDoc } = useApp();
  const isInvoice = currentDoc.mode === 'INVOICE';
  const symbol = formatCurrencySymbol(currentDoc.currency);

  const subtotal = currentDoc.items.reduce(
    (acc, item) => acc + (item.qty || 0) * (item.price || 0),
    0
  );

  const taxAmount = (subtotal * (currentDoc.taxRate || 0)) / 100;
  const discountAmount = currentDoc.discount || 0;
  const grandTotal = subtotal + taxAmount - discountAmount;

  return (
    <div
      id="document-preview-sheet"
      className="bg-white w-full max-w-2xl mx-auto min-h-[700px] shadow-2xl p-6 sm:p-10 relative flex flex-col border border-slate-200 text-slate-800 font-sans"
    >
      {/* Top Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5 mb-5">
        {/* Rozzy Branding */}
        <div className="flex flex-col items-start">
          <h1 className="text-3xl sm:text-4xl font-black text-black tracking-widest leading-none mb-1.5">
            ROZZY
          </h1>
          <div className="bg-red-600 text-white px-2.5 py-0.5 inline-block">
            <span className="text-[11px] font-bold uppercase tracking-wider block leading-none">
              Travel and Tours Ltd.
            </span>
          </div>

          <div className="mt-3 text-xs text-slate-600 space-y-0.5 font-medium leading-tight">
            <p className="font-semibold text-slate-800">Ground Floor, S.I.C. Building</p>
            <p>P.O. Box 774, Tarkwa, Western Region</p>
            <p>Tel: 020 8134572 / 026 8030149</p>
            <p>Email: reservations@rozzytravel.com</p>
          </div>
        </div>

        {/* Metadata & Title */}
        <div className="text-right flex flex-col items-end">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-300 uppercase tracking-widest mb-2">
            {currentDoc.mode}
          </h2>

          <div className="text-xs space-y-1">
            <p>
              <span className="font-bold text-slate-800">Date:</span>{' '}
              <span className="font-medium text-slate-700">{currentDoc.date || '---'}</span>
            </p>

            {isInvoice && (
              <p>
                <span className="font-bold text-slate-800">Due Date:</span>{' '}
                <span className="font-medium text-slate-700">{currentDoc.dueDate || '---'}</span>
              </p>
            )}

            <p>
              <span className="font-bold text-slate-800">
                {isInvoice ? 'Invoice #' : 'Receipt #'}:
              </span>{' '}
              <span className="font-mono font-bold text-red-600">
                {currentDoc.number || '---'}
              </span>
            </p>

            {/* Status Stamp */}
            <div className="mt-1.5">
              <span
                className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                  currentDoc.status === 'PAID'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : currentDoc.status === 'PARTIAL'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-red-100 text-red-800 border border-red-300'
                }`}
              >
                {currentDoc.status}
              </span>
            </div>

            {/* IATA Logo */}
            <div className="flex flex-col items-end mt-3 pt-1">
              <img
                src="https://cdn.worldvectorlogo.com/logos/iata.svg"
                alt="IATA Accredited Agent"
                className="h-7 w-auto opacity-70 grayscale"
              />
              <span className="text-[9px] uppercase font-bold text-slate-400 mt-0.5">
                Accredited Agent
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Info ("Bill To") */}
      <div className="mb-5 bg-slate-50 p-4 rounded-lg border border-slate-100">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 border-b border-slate-200 pb-0.5">
          {isInvoice ? 'Invoice To' : 'Bill To'}
        </h3>
        <div className="text-sm font-bold text-slate-900">
          {currentDoc.clientName || 'Customer Name'}
        </div>
        {currentDoc.clientContact && (
          <div className="text-xs text-slate-600 mt-0.5">{currentDoc.clientContact}</div>
        )}
        {currentDoc.clientAddress && (
          <div className="text-xs text-slate-600 mt-0.5">{currentDoc.clientAddress}</div>
        )}
      </div>

      {/* Exchange Rate Notice */}
      {currentDoc.exchangeRate && (
        <div className="mb-4 text-xs font-semibold text-sky-800 bg-sky-50 border-l-4 border-sky-600 p-2 rounded">
          <span className="font-bold">EXCHANGE RATE:</span> {currentDoc.exchangeRate}
        </div>
      )}

      {/* Items Table */}
      <div className="mb-6">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-sky-50 text-slate-900 font-bold border-b border-slate-200">
              <th className="py-2.5 px-3 text-left uppercase tracking-wider">Description</th>
              <th className="py-2.5 px-3 text-right uppercase tracking-wider w-16">Qty</th>
              <th className="py-2.5 px-3 text-right uppercase tracking-wider w-24">Price</th>
              <th className="py-2.5 px-3 text-right uppercase tracking-wider w-28">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentDoc.items.map((item, idx) => {
              const lineTotal = (item.qty || 0) * (item.price || 0);
              return (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 text-slate-800 font-medium">
                    {item.desc || 'Service Item'}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-600 font-mono">
                    {item.qty || 1}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-600 font-mono">
                    {symbol}
                    {(item.price || 0).toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">
                    {symbol}
                    {lineTotal.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="flex justify-end mb-6">
        <div className="w-full sm:w-1/2 space-y-1.5 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
            <span className="font-medium">Subtotal</span>
            <span className="font-mono font-bold text-slate-800">
              {symbol}
              {subtotal.toFixed(2)}
            </span>
          </div>

          {currentDoc.taxRate > 0 && (
            <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
              <span className="font-medium">Tax / VAT ({currentDoc.taxRate}%)</span>
              <span className="font-mono font-bold text-slate-800">
                {symbol}
                {taxAmount.toFixed(2)}
              </span>
            </div>
          )}

          {currentDoc.discount > 0 && (
            <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
              <span className="font-medium">Discount</span>
              <span className="font-mono font-bold text-red-600">
                -{symbol}
                {discountAmount.toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex justify-between py-2 border-t-2 border-slate-900 text-sm font-bold">
            <span className="font-black text-slate-900">
              {isInvoice ? 'Total Amount Due' : 'Total Amount Paid'}
            </span>
            <span className="font-mono font-black text-red-600">
              {symbol}
              {grandTotal.toFixed(2)}
            </span>
          </div>

          {!isInvoice && (
            <div className="text-right text-[11px] text-slate-500">
              Paid via: <span className="font-bold text-slate-800">{currentDoc.method}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bank Transfer Details (For Invoices) */}
      {isInvoice && currentDoc.bankDetails && (
        <div className="mb-6 bg-slate-50 p-3.5 rounded border border-slate-200 text-xs">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-1 text-[10px] text-slate-500">
            Payment Details (Bank Wire / Transfer)
          </h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-700 text-[11px]">
            <p>
              <span className="font-semibold text-slate-900">Bank:</span>{' '}
              {currentDoc.bankDetails.bankName}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Account Name:</span>{' '}
              {currentDoc.bankDetails.accName}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Account No:</span>{' '}
              <span className="font-mono font-bold">{currentDoc.bankDetails.accNo}</span>
            </p>
            <p>
              <span className="font-semibold text-slate-900">Branch:</span>{' '}
              {currentDoc.bankDetails.branch}
            </p>
          </div>
        </div>
      )}

      {/* Signature & Footer */}
      <div className="mt-4 pt-3 mb-2 border-t border-slate-200">
        <div className="grid grid-cols-2 gap-8 items-end">
          <div>
            <p className="text-xs text-slate-500 italic mb-0.5">
              Thank you for traveling with us!
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              ROZZY Travel and Tours Ltd.
            </p>
          </div>

          <div className="text-center">
            <div className="border-b border-slate-400 mb-1.5 h-7"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Authorized Signature
            </span>
          </div>
        </div>
      </div>

      {/* Rozzy Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
        <span className="text-8xl sm:text-9xl font-black text-slate-100 opacity-25 -rotate-45 select-none tracking-widest">
          ROZZY
        </span>
      </div>
    </div>
  );
}
