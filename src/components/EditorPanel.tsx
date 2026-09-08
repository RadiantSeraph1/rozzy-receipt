'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Currency, PaymentStatus } from '@/types';
import { Plus, Trash2, Printer, Save, RefreshCw, Layers, CheckCircle2, X } from 'lucide-react';

export default function EditorPanel() {
  const { currentDoc, updateCurrentDoc, saveCurrentDocAndIncrement, resetNewDoc } = useApp();
  const [toast, setToast] = useState<{ title: string; desc: string } | null>(null);

  const isInvoice = currentDoc.mode === 'INVOICE';

  // Keep document.title and <title> tag in sync at all times
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const modeText = currentDoc.mode === 'INVOICE' ? 'INVOICE' : 'RECEIPT';
      const numText = currentDoc.number || '0000';
      const clientText = currentDoc.clientName || 'Customer';
      const titleString = `ROZZY ${modeText} ${numText} ${clientText}`;

      document.title = titleString;
      const titleTag = document.querySelector('title');
      if (titleTag) {
        titleTag.innerText = titleString;
      }
    }
  }, [currentDoc.mode, currentDoc.number, currentDoc.clientName]);

  // Handle afterprint event to restore window focus and unblock click events
  useEffect(() => {
    const handleAfterPrint = () => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      window.focus();
    };

    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...currentDoc.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === 'desc' ? value : parseFloat(value) || 0,
    };
    updateCurrentDoc({ items: updatedItems });
  };

  const addItem = () => {
    const newItem = {
      id: String(Date.now()),
      desc: '',
      qty: 1,
      price: 0,
    };
    updateCurrentDoc({ items: [...currentDoc.items, newItem] });
  };

  const removeItem = (index: number) => {
    const updatedItems = currentDoc.items.filter((_, i) => i !== index);
    updateCurrentDoc({ items: updatedItems });
  };

  const handleBankChange = (field: string, value: string) => {
    updateCurrentDoc({
      bankDetails: {
        ...currentDoc.bankDetails,
        [field]: value,
      },
    });
  };

  const handlePrint = (e?: React.MouseEvent) => {
    if (e && e.currentTarget) {
      (e.currentTarget as HTMLElement).blur();
    }

    const savedNum = currentDoc.number || '000000';
    const savedClient = currentDoc.clientName || 'Customer';
    const modeLabel = currentDoc.mode === 'INVOICE' ? 'Invoice' : 'Receipt';
    const modeText = currentDoc.mode === 'INVOICE' ? 'INVOICE' : 'RECEIPT';

    // 1. Auto-save current document to History & advance sequence counter
    saveCurrentDocAndIncrement();

    // 2. Show green confirmation toast banner
    setToast({
      title: `Auto-Saved & Printed ${modeLabel} #${savedNum}!`,
      desc: `Record for ${savedClient} saved to History • Advanced sequence counter`,
    });

    setTimeout(() => {
      setToast(null);
    }, 4500);

    // 3. Update document title for browser PDF print naming
    const safeNum = savedNum.replace(/[^a-zA-Z0-9\s_-]/g, '');
    const safeClient = savedClient.trim().replace(/[^a-zA-Z0-9\s_-]/g, '');
    const filename = `ROZZY ${modeText} ${safeNum} ${safeClient}`.trim();

    document.title = filename;
    const titleTag = document.querySelector('title');
    if (titleTag) {
      titleTag.innerText = filename;
    }

    // 4. Trigger browser print window
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleSaveWithNotification = () => {
    const savedNum = currentDoc.number;
    const client = currentDoc.clientName || 'Customer';
    const modeLabel = currentDoc.mode === 'INVOICE' ? 'Invoice' : 'Receipt';

    saveCurrentDocAndIncrement();

    setToast({
      title: `Saved ${modeLabel} #${savedNum} to History!`,
      desc: `Client: ${client} • Auto-advanced sequence number`,
    });

    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 space-y-6 no-print">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="bg-emerald-600 text-white p-3.5 rounded-xl shadow-lg flex items-center justify-between gap-3 border border-emerald-500">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
            <div>
              <div className="font-bold text-xs sm:text-sm">{toast.title}</div>
              <div className="text-[11px] text-emerald-100 font-medium">{toast.desc}</div>
            </div>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-emerald-200 hover:text-white p-1 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Title */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-red-600" />
          <h2 className="text-lg font-bold text-slate-900">
            Edit {isInvoice ? 'Invoice' : 'Receipt'} Details
          </h2>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
            isInvoice ? 'bg-slate-900 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {currentDoc.mode} MODE
        </span>
      </div>

      {/* Document Numbers & Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
            {isInvoice ? 'Invoice No.' : 'Receipt No.'}
          </label>
          <input
            type="text"
            value={currentDoc.number}
            onChange={(e) => updateCurrentDoc({ number: e.target.value })}
            className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 font-mono text-sm font-semibold focus:ring-2 focus:ring-red-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
            Date (Auto Today)
          </label>
          <input
            type="date"
            value={currentDoc.date}
            onChange={(e) => updateCurrentDoc({ date: e.target.value })}
            className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
          />
        </div>

        {isInvoice && (
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={currentDoc.dueDate}
              onChange={(e) => updateCurrentDoc({ dueDate: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
            Payment Status
          </label>
          <select
            value={currentDoc.status}
            onChange={(e) => updateCurrentDoc({ status: e.target.value as PaymentStatus })}
            className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-sm font-bold focus:ring-2 focus:ring-red-600 focus:outline-none"
          >
            <option value="UNPAID">UNPAID</option>
            <option value="PAID">PAID</option>
            <option value="PARTIAL">PARTIAL</option>
          </select>
        </div>
      </div>

      {/* Customer Info */}
      <div className="border-t border-slate-100 pt-4 space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Customer Information
        </h3>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
            Customer / Company Name
          </label>
          <input
            type="text"
            value={currentDoc.clientName}
            onChange={(e) => updateCurrentDoc({ clientName: e.target.value })}
            placeholder="e.g. Quest Solutions Africa Ltd"
            className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Phone / Email
            </label>
            <input
              type="text"
              value={currentDoc.clientContact}
              onChange={(e) => updateCurrentDoc({ clientContact: e.target.value })}
              placeholder="Contact details"
              className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Billing Address / City
            </label>
            <input
              type="text"
              value={currentDoc.clientAddress}
              onChange={(e) => updateCurrentDoc({ clientAddress: e.target.value })}
              placeholder="e.g. Accra, Ghana"
              className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="border-t border-slate-100 pt-4 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Service Line Items
          </h3>
          <button
            type="button"
            onClick={addItem}
            className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>

        <div className="space-y-2">
          {currentDoc.items.map((item, index) => (
            <div key={item.id || index} className="flex gap-2 items-center">
              <input
                type="text"
                value={item.desc}
                onChange={(e) => handleItemChange(index, 'desc', e.target.value)}
                placeholder="Description"
                className="flex-grow p-2 border border-slate-200 rounded text-sm bg-slate-50"
              />
              <input
                type="number"
                value={item.qty}
                onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                placeholder="Qty"
                className="w-16 p-2 border border-slate-200 rounded text-sm bg-slate-50 text-center"
                min="1"
              />
              <input
                type="number"
                value={item.price}
                onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                placeholder="Price"
                className="w-24 p-2 border border-slate-200 rounded text-sm bg-slate-50 text-right"
                step="0.01"
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-red-400 hover:text-red-600 p-1.5 rounded"
                title="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Currency & Payment Settings */}
      <div className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
            Currency
          </label>
          <select
            value={currentDoc.currency}
            onChange={(e) => updateCurrentDoc({ currency: e.target.value as Currency })}
            className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
          >
            <option value="GHS">GHS (₵)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
            Exchange Rate (Optional)
          </label>
          <input
            type="text"
            value={currentDoc.exchangeRate}
            onChange={(e) => updateCurrentDoc({ exchangeRate: e.target.value })}
            placeholder="e.g. 1 USD = 11.995 GHS"
            className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
          />
        </div>

        {!isInvoice && (
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Payment Method
            </label>
            <select
              value={currentDoc.method}
              onChange={(e) => updateCurrentDoc({ method: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
            >
              <option value="Cash">Cash</option>
              <option value="Mobile Money">Mobile Money</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Card">Card</option>
            </select>
          </div>
        )}
      </div>

      {/* Bank Details (For Invoices) */}
      {isInvoice && (
        <div className="border-t border-slate-100 pt-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Bank Transfer Payment Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-500 mb-1">Bank Name</label>
              <input
                type="text"
                value={currentDoc.bankDetails.bankName}
                onChange={(e) => handleBankChange('bankName', e.target.value)}
                className="w-full p-2 border border-slate-200 rounded bg-slate-50"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-500 mb-1">Account Name</label>
              <input
                type="text"
                value={currentDoc.bankDetails.accName}
                onChange={(e) => handleBankChange('accName', e.target.value)}
                className="w-full p-2 border border-slate-200 rounded bg-slate-50"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-500 mb-1">Account Number</label>
              <input
                type="text"
                value={currentDoc.bankDetails.accNo}
                onChange={(e) => handleBankChange('accNo', e.target.value)}
                className="w-full p-2 border border-slate-200 rounded bg-slate-50"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-500 mb-1">Branch</label>
              <input
                type="text"
                value={currentDoc.bankDetails.branch}
                onChange={(e) => handleBankChange('branch', e.target.value)}
                className="w-full p-2 border border-slate-200 rounded bg-slate-50"
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="border-t border-slate-100 pt-4 space-y-3">
        <button
          type="button"
          onClick={handlePrint}
          className="w-full bg-red-600 hover:bg-black text-white font-bold py-3.5 rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <Printer className="w-5 h-5" />
          Print / Save as PDF
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleSaveWithNotification}
            className="w-full bg-slate-900 hover:bg-red-600 text-white font-bold py-2.5 rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 shadow-md"
            title="Save record to history and increment counter for next doc"
          >
            <Save className="w-4 h-4" />
            Save & Next #{isInvoice ? 'Invoice' : 'Receipt'}
          </button>

          <button
            type="button"
            onClick={() => resetNewDoc()}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-lg text-xs transition-all flex items-center justify-center gap-1.5"
            title="Reset form for a new clean document"
          >
            <RefreshCw className="w-4 h-4" />
            New Document
          </button>
        </div>
      </div>
    </div>
  );
}
