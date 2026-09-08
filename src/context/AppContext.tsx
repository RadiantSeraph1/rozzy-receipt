'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppCounters, DocumentData, DocumentMode } from '@/types';
import {
  createNewDefaultDoc,
  DEFAULT_COUNTERS,
  getStoredCounters,
  getStoredHistory,
  getStoredPin,
  getStoredSession,
  setStoredCounters,
  setStoredHistory,
  setStoredPin,
  clearStoredPin,
  setStoredSession,
} from '@/lib/storage';
import { formatDocNumber } from '@/lib/utils';

interface AppContextType {
  isAuthenticated: boolean;
  hasPinSet: boolean;
  currentDoc: DocumentData;
  counters: AppCounters;
  history: DocumentData[];
  login: (pin: string) => boolean;
  setupPin: (pin: string) => void;
  resetSecurityPin: () => void;
  resetAndBypassAuth: () => void;
  factoryResetAll: () => void;
  logout: () => void;
  updateCurrentDoc: (updates: Partial<DocumentData>) => void;
  setMode: (mode: DocumentMode) => void;
  saveCurrentDocAndIncrement: () => void;
  loadDocFromHistory: (id: string) => void;
  deleteDocFromHistory: (id: string) => void;
  updateCounters: (newCounters: AppCounters) => void;
  resetNewDoc: (mode?: DocumentMode) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [hasPinSet, setHasPinSet] = useState<boolean>(false);
  const [counters, setCounters] = useState<AppCounters>(DEFAULT_COUNTERS);
  const [history, setHistory] = useState<DocumentData[]>([]);
  const [currentDoc, setCurrentDoc] = useState<DocumentData>(() =>
    createNewDefaultDoc('INVOICE', DEFAULT_COUNTERS)
  );
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    const pin = getStoredPin();
    const session = getStoredSession();
    const loadedCounters = getStoredCounters();
    const loadedHistory = getStoredHistory();

    setHasPinSet(Boolean(pin));
    setIsAuthenticated(session && Boolean(pin));
    setCounters(loadedCounters);
    setHistory(loadedHistory);
    setCurrentDoc(createNewDefaultDoc('INVOICE', loadedCounters));

    // Synchronize global server state for multi-user shared setup
    fetch('/api/system')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.hasPinSet) {
            setHasPinSet(true);
            // If server has pin set and local user has matching session or stored pin
            if (session || pin) {
              setIsAuthenticated(true);
            } else {
              setIsAuthenticated(false);
            }
          }
          if (data.counters) {
            setCounters(data.counters);
            setStoredCounters(data.counters);
            setCurrentDoc(createNewDefaultDoc('INVOICE', data.counters));
          }
          if (data.history && data.history.length > 0) {
            setHistory(data.history);
            setStoredHistory(data.history);
          }
        }
        setIsInitialized(true);
      })
      .catch((err) => {
        console.error('Failed to sync server state:', err);
        setIsInitialized(true);
      });
  }, []);

  const login = (pin: string): boolean => {
    const storedPin = getStoredPin();
    if (storedPin === pin) {
      setIsAuthenticated(true);
      setStoredSession(true);
      return true;
    }

    // Try server API login check
    fetch('/api/system', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', pin }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.valid) {
          setStoredPin(pin);
          setIsAuthenticated(true);
          setStoredSession(true);
        }
      })
      .catch(() => {});

    // Sync validation check
    if (storedPin === pin) {
      setIsAuthenticated(true);
      setStoredSession(true);
      return true;
    }
    return false;
  };

  const setupPin = (pin: string): void => {
    setStoredPin(pin);
    setHasPinSet(true);
    setIsAuthenticated(true);
    setStoredSession(true);

    fetch('/api/system', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'setup', pin }),
    }).catch((err) => console.error('Error saving PIN to server:', err));
  };

  const logout = (): void => {
    setIsAuthenticated(false);
    setStoredSession(false);
  };

  const updateCurrentDoc = (updates: Partial<DocumentData>): void => {
    setCurrentDoc((prev) => ({ ...prev, ...updates }));
  };

  const setMode = (mode: DocumentMode): void => {
    if (currentDoc.mode === mode) return;
    const isInvoice = mode === 'INVOICE';
    const number = isInvoice
      ? formatDocNumber(counters.invoicePrefix, counters.invoiceCounter)
      : formatDocNumber(counters.receiptPrefix, counters.receiptCounter);

    setCurrentDoc((prev) => ({
      ...prev,
      mode,
      number,
      status: isInvoice ? 'UNPAID' : 'PAID',
    }));
  };

  const saveCurrentDocAndIncrement = (): void => {
    // Save document to history
    const updatedHistory = [currentDoc, ...history.filter((d) => d.id !== currentDoc.id)];
    setHistory(updatedHistory);
    setStoredHistory(updatedHistory);

    // Increment counter
    const isInvoice = currentDoc.mode === 'INVOICE';
    const newCounters: AppCounters = {
      ...counters,
      invoiceCounter: isInvoice ? counters.invoiceCounter + 1 : counters.invoiceCounter,
      receiptCounter: !isInvoice ? counters.receiptCounter + 1 : counters.receiptCounter,
    };

    setCounters(newCounters);
    setStoredCounters(newCounters);

    // Create next document automatically
    const nextDoc = createNewDefaultDoc(currentDoc.mode, newCounters);
    nextDoc.clientName = currentDoc.clientName;
    nextDoc.clientContact = currentDoc.clientContact;
    nextDoc.clientAddress = currentDoc.clientAddress;
    nextDoc.currency = currentDoc.currency;
    nextDoc.exchangeRate = currentDoc.exchangeRate;

    setCurrentDoc(nextDoc);

    // Sync with server API
    fetch('/api/system', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'save_doc',
        doc: currentDoc,
        counters: newCounters,
      }),
    }).catch((err) => console.error('Error saving doc to server:', err));
  };

  const loadDocFromHistory = (id: string): void => {
    const found = history.find((d) => d.id === id);
    if (found) {
      setCurrentDoc(found);
    }
  };

  const deleteDocFromHistory = (id: string): void => {
    const updated = history.filter((d) => d.id !== id);
    setHistory(updated);
    setStoredHistory(updated);

    fetch('/api/system', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_history', history: updated }),
    }).catch((err) => console.error('Error deleting doc from server:', err));
  };

  const updateCounters = (newCounters: AppCounters): void => {
    setCounters(newCounters);
    setStoredCounters(newCounters);

    // Update current doc number if appropriate
    const isInvoice = currentDoc.mode === 'INVOICE';
    const newNum = isInvoice
      ? formatDocNumber(newCounters.invoicePrefix, newCounters.invoiceCounter)
      : formatDocNumber(newCounters.receiptPrefix, newCounters.receiptCounter);

    setCurrentDoc((prev) => ({ ...prev, number: newNum }));

    fetch('/api/system', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_counters', counters: newCounters }),
    }).catch((err) => console.error('Error updating counters on server:', err));
  };

  const resetNewDoc = (mode?: DocumentMode): void => {
    const targetMode = mode || currentDoc.mode;
    setCurrentDoc(createNewDefaultDoc(targetMode, counters));
  };

  const resetSecurityPin = (): void => {
    clearStoredPin();
    setHasPinSet(false);
    setIsAuthenticated(false);

    fetch('/api/system', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset_pin' }),
    }).catch((err) => console.error('Error resetting PIN on server:', err));
  };

  const resetAndBypassAuth = (): void => {
    clearStoredPin();
    setHasPinSet(false);
    setIsAuthenticated(true);
    setStoredSession(true);

    fetch('/api/system', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset_pin' }),
    }).catch((err) => console.error('Error resetting PIN on server:', err));
  };

  const factoryResetAll = (): void => {
    clearStoredPin();
    setStoredHistory([]);
    setStoredCounters(DEFAULT_COUNTERS);
    setHasPinSet(false);
    setHistory([]);
    setCounters(DEFAULT_COUNTERS);
    setCurrentDoc(createNewDefaultDoc('INVOICE', DEFAULT_COUNTERS));
    setIsAuthenticated(true);
    setStoredSession(true);

    fetch('/api/system', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'factory_reset' }),
    }).catch((err) => console.error('Error factory resetting on server:', err));
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        hasPinSet,
        currentDoc,
        counters,
        history,
        login,
        setupPin,
        resetSecurityPin,
        resetAndBypassAuth,
        factoryResetAll,
        logout,
        updateCurrentDoc,
        setMode,
        saveCurrentDocAndIncrement,
        loadDocFromHistory,
        deleteDocFromHistory,
        updateCounters,
        resetNewDoc,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
