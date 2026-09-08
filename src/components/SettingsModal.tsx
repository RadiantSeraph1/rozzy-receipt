'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Hash, KeyRound, Check } from 'lucide-react';

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const { counters, updateCounters, setupPin } = useApp();

  const [invPrefix, setInvPrefix] = useState(counters.invoicePrefix);
  const [invCount, setInvCount] = useState(counters.invoiceCounter);
  const [recPrefix, setRecPrefix] = useState(counters.receiptPrefix);
  const [recCount, setRecCount] = useState(counters.receiptCounter);

  const [newPin, setNewPin] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);
  const [counterSuccess, setCounterSuccess] = useState(false);

  const handleSaveCounters = (e: React.FormEvent) => {
    e.preventDefault();
    updateCounters({
      invoicePrefix: invPrefix,
      invoiceCounter: Number(invCount) || 1,
      receiptPrefix: recPrefix,
      receiptCounter: Number(recCount) || 1,
    });
    setCounterSuccess(true);
    setTimeout(() => setCounterSuccess(false), 2500);
  };

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin.trim() || newPin.length < 4) return;
    setupPin(newPin.trim());
    setNewPin('');
    setPinSuccess(true);
    setTimeout(() => setPinSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex justify-between items-center border-b-4 border-red-600">
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-lg">System & Sequence Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Sequence Counter Form */}
          <form onSubmit={handleSaveCounters} className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Document Sequence Counters
              </h4>
              {counterSuccess && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Counters Saved!
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Invoice Prefix
                </label>
                <input
                  type="text"
                  value={invPrefix}
                  onChange={(e) => setInvPrefix(e.target.value)}
                  placeholder="e.g. RTT-INV-"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Next Invoice Number
                </label>
                <input
                  type="number"
                  value={invCount}
                  onChange={(e) => setInvCount(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Receipt Prefix
                </label>
                <input
                  type="text"
                  value={recPrefix}
                  onChange={(e) => setRecPrefix(e.target.value)}
                  placeholder="e.g. RTT-REC-"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Next Receipt Number
                </label>
                <input
                  type="number"
                  value={recCount}
                  onChange={(e) => setRecCount(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 font-mono font-bold text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-black hover:bg-red-600 text-white font-bold py-2.5 rounded-lg text-xs transition-all shadow-md"
            >
              Update Starting Sequence Numbers
            </button>
          </form>

          {/* Passcode Reset Form */}
          <form onSubmit={handleUpdatePin} className="border-t border-slate-100 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Change Security Passcode
              </h4>
              {pinSuccess && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Passcode Updated!
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                New Security Passcode
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="Enter new 4+ digit passcode"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-black text-white font-bold py-2.5 rounded-lg text-xs transition-all shadow-md"
            >
              Save New Passcode
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
