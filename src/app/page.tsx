'use client';

import React, { useState } from 'react';
import { AppProvider } from '@/context/AppContext';
import AuthGate from '@/components/AuthGate';
import Navbar from '@/components/Navbar';
import EditorPanel from '@/components/EditorPanel';
import DocumentPreview from '@/components/DocumentPreview';
import SettingsModal from '@/components/SettingsModal';
import HistoryModal from '@/components/HistoryModal';

function MainAppContent() {
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800" suppressHydrationWarning>
      {/* Navigation Bar */}
      <Navbar
        onOpenSettings={() => setShowSettings(true)}
        onOpenHistory={() => setShowHistory(true)}
      />

      {/* Main Workspace */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Editor Controls */}
          <div className="w-full lg:w-5/12">
            <EditorPanel />
          </div>

          {/* Right Live Document Preview */}
          <div className="w-full lg:w-7/12">
            <DocumentPreview />
          </div>
        </div>
      </main>

      {/* Footer (Hidden on Print) */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400 no-print">
        <p>
          ROZZY Travel and Tours Ltd. &bull; Official Document Generator System &bull; Tarkwa, Ghana
        </p>
      </footer>

      {/* Modals */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showHistory && <HistoryModal onClose={() => setShowHistory(false)} />}
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <AuthGate>
        <MainAppContent />
      </AuthGate>
    </AppProvider>
  );
}
