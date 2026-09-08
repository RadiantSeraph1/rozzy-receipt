'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, History, Trash2, ArrowUpRight, FileText, Receipt } from 'lucide-react';
import { formatCurrencySymbol } from '@/lib/utils';

export default function HistoryModal({ onClose }: { onClose: () => void }) {
  const { history, loadDocFromHistory, deleteDocFromHistory } = useApp();
  const [filterMode, setFilterMode] = useState<'ALL' | 'INVOICE' | 'RECEIPT'>('ALL');

  const filteredHistory = history.filter((doc) => {
    if (filterMode === 'ALL') return true;
    return doc.mode === filterMode;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex justify-between items-center border-b-4 border-red-600">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-lg">Saved Documents History</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex gap-2">
          {(['ALL', 'INVOICE', 'RECEIPT'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterMode === mode
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* List Content */}
        <div className="p-6 overflow-y-auto flex-grow divide-y divide-slate-100">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No saved documents found in history yet.
            </div>
          ) : (
            filteredHistory.map((doc) => {
              const isInv = doc.mode === 'INVOICE';
              const symbol = formatCurrencySymbol(doc.currency);
              const total = doc.items.reduce((acc, item) => acc + item.qty * item.price, 0);

              return (
                <div
                  key={doc.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 p-2 rounded-lg transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2.5 rounded-lg text-white font-bold text-xs ${
                        isInv ? 'bg-slate-900' : 'bg-red-600'
                      }`}
                    >
                      {isInv ? <FileText className="w-4 h-4" /> : <Receipt className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900">
                          {doc.number}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {doc.mode}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">
                        {doc.clientName}
                      </p>
                      <p className="text-[11px] text-slate-400">Date: {doc.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0">
                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        {symbol}
                        {total.toFixed(2)}
                      </div>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider ${
                          doc.status === 'PAID' ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          loadDocFromHistory(doc.id);
                          onClose();
                        }}
                        className="p-2 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                        title="Reload document"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => deleteDocFromHistory(doc.id)}
                        className="p-2 hover:bg-red-100 text-red-500 rounded-lg transition-all"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
