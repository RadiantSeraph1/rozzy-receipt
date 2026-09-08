'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Settings, History, Download, LogOut, FileText, Receipt } from 'lucide-react';

interface NavbarProps {
  onOpenSettings: () => void;
  onOpenHistory: () => void;
}

export default function Navbar({ onOpenSettings, onOpenHistory }: NavbarProps) {
  const { currentDoc, setMode, logout, history } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 no-print shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap justify-between items-center gap-4">
        {/* Left Branding */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-start">
              <span className="text-2xl font-black text-black tracking-widest leading-none">
                ROZZY
              </span>
              <div className="bg-red-600 text-white px-2 py-0.5 mt-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider block leading-none">
                  Travel and Tours Ltd.
                </span>
              </div>
            </div>

            {/* IATA Logo */}
            <div className="hidden sm:flex flex-col items-center border-l border-slate-200 pl-4">
              <img
                src="https://cdn.worldvectorlogo.com/logos/iata.svg"
                alt="IATA Accredited Agent"
                className="h-6 w-auto opacity-80"
              />
              <span className="text-[8px] font-bold uppercase tracking-wider text-sky-600 mt-0.5">
                Accredited Agent
              </span>
            </div>
          </div>
        </div>

        {/* Center Mode Switcher Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
          <button
            onClick={() => setMode('INVOICE')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
              currentDoc.mode === 'INVOICE'
                ? 'bg-black text-white shadow-md'
                : 'text-slate-600 hover:text-black'
            }`}
          >
            <FileText className="w-4 h-4" />
            Invoice Mode
          </button>
          <button
            onClick={() => setMode('RECEIPT')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
              currentDoc.mode === 'RECEIPT'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-600 hover:text-black'
            }`}
          >
            <Receipt className="w-4 h-4" />
            Receipt Mode
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* PWA Install Button if available */}
          {deferredPrompt && !isInstalled && (
            <button
              onClick={handleInstallClick}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm"
              title="Install desktop app on your computer"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Install Desktop App</span>
            </button>
          )}

          {/* History Log Trigger */}
          <button
            onClick={onOpenHistory}
            className="p-2 text-slate-600 hover:text-black hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all relative"
            title="Saved Documents History"
          >
            <History className="w-4 h-4" />
            <span className="hidden md:inline">History</span>
            {history.length > 0 && (
              <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {history.length}
              </span>
            )}
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-600 hover:text-black hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Sequence Counter & Security Settings"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden md:inline">Settings</span>
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="Lock Session / Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
