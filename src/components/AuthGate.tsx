'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Lock, KeyRound, ShieldCheck, ArrowRight, RotateCcw, AlertTriangle, Unlock, Trash2 } from 'lucide-react';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hasPinSet, login, setupPin, resetSecurityPin, resetAndBypassAuth, factoryResetAll } = useApp();
  const [pinInput, setPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [showResetPrompt, setShowResetPrompt] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4" suppressHydrationWarning>
        <div className="text-white text-xs font-bold uppercase tracking-widest animate-pulse" suppressHydrationWarning>
          Initializing Rozzy System...
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!pinInput.trim()) {
      setError('Please enter your passcode');
      return;
    }

    const success = login(pinInput.trim());
    if (!success) {
      setError('Incorrect security passcode. Please try again.');
    }
  };

  const handleSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!pinInput.trim() || pinInput.length < 4) {
      setError('Passcode must be at least 4 digits/characters');
      return;
    }
    if (pinInput !== confirmPinInput) {
      setError('Passcodes do not match. Please verify.');
      return;
    }

    setupPin(pinInput.trim());
  };

  const handleConfirmResetAndUnlock = () => {
    resetAndBypassAuth();
    setPinInput('');
    setConfirmPinInput('');
    setError('');
    setShowResetPrompt(false);
  };

  const handleConfirmResetPin = () => {
    resetSecurityPin();
    setPinInput('');
    setConfirmPinInput('');
    setError('');
    setShowResetPrompt(false);
  };

  const handleFactoryReset = () => {
    factoryResetAll();
    setPinInput('');
    setConfirmPinInput('');
    setError('');
    setShowResetPrompt(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4" suppressHydrationWarning>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-800" suppressHydrationWarning>
        {/* Top Header Branding */}
        <div className="bg-black p-8 text-center border-b-4 border-red-600 relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-4xl font-black text-white tracking-widest leading-none">
                ROZZY
              </span>
            </div>
            <div className="bg-red-600 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider inline-block">
              Travel and Tours Ltd.
            </div>
            <p className="text-slate-400 text-xs mt-3 uppercase tracking-wider font-semibold">
              Official Document System
            </p>
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
            <span className="text-8xl font-black text-white tracking-widest -rotate-12">
              ROZZY
            </span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-8">
          {showResetPrompt ? (
            /* Reset Options View (Without Login) */
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-1">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Reset System Without Login</h2>
              <p className="text-xs text-slate-500">
                Forgot passcode or locked out? Choose how you would like to reset your security configuration:
              </p>

              <div className="pt-2 space-y-2.5">
                <button
                  type="button"
                  onClick={handleConfirmResetAndUnlock}
                  className="w-full bg-red-600 hover:bg-black text-white font-bold py-3 rounded-lg text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <Unlock className="w-4 h-4" />
                  Reset Passcode & Unlock System Directly
                </button>

                <button
                  type="button"
                  onClick={handleConfirmResetPin}
                  className="w-full bg-slate-800 hover:bg-black text-white font-bold py-2.5 rounded-lg text-xs transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4 text-red-400" />
                  Reset Security Passcode & Create New
                </button>

                <button
                  type="button"
                  onClick={handleFactoryReset}
                  className="w-full bg-slate-100 hover:bg-red-50 text-red-600 hover:text-red-700 font-bold py-2.5 rounded-lg text-xs border border-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Factory Reset (Clear All Data, History & Passcode)
                </button>

                <button
                  type="button"
                  onClick={() => setShowResetPrompt(false)}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold py-2 rounded-lg text-xs transition-all mt-1"
                >
                  Cancel & Back to Login
                </button>
              </div>
            </div>
          ) : !hasPinSet ? (
            /* First Time Setup Form */
            <form onSubmit={handleSetupSubmit} className="space-y-5">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Initial Security Setup</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Create a master security passcode to protect invoice & receipt access.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border-l-4 border-red-600 text-red-700 text-xs font-semibold rounded">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Create Security Passcode
                </label>
                <div className="relative">
                  <KeyRound className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="Enter 4+ digit passcode"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Confirm Security Passcode
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    value={confirmPinInput}
                    onChange={(e) => setConfirmPinInput(e.target.value)}
                    placeholder="Re-enter passcode"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-black text-white font-bold py-3 rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                Set Passcode & Unlock System
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleConfirmResetAndUnlock}
                  className="text-xs text-slate-500 hover:text-slate-900 font-semibold hover:underline transition-all flex items-center justify-center gap-1 mx-auto"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  Skip Passcode & Open System Directly
                </button>
              </div>
            </form>
          ) : (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-slate-100 text-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Protected System Access</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your master passcode to access the generator.
                </p>
                <span className="inline-block bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded text-[11px] font-semibold mt-2">
                  Master Passcode: <strong className="text-red-600 font-mono">0000</strong> (Or your set passcode)
                </span>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border-l-4 border-red-600 text-red-700 text-xs font-semibold rounded">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Security Passcode
                </label>
                <div className="relative">
                  <KeyRound className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="Enter passcode"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-black hover:bg-red-600 text-white font-bold py-3 rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                Authenticate Access
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetPrompt(true)}
                  className="text-xs text-red-600 hover:text-black font-semibold hover:underline transition-all flex items-center justify-center gap-1 mx-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Forgot Passcode? Reset Without Logging In
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            ROZZY Travel and Tours Ltd. &bull; Tarkwa, Ghana
          </p>
        </div>
      </div>
    </div>
  );
}
