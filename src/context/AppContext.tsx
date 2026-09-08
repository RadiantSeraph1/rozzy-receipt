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
    setIsInitialized(true);
  }, []);

  const login = (pin: string): boolean => {
    const storedPin = getStoredPin();
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
  };

  const resetNewDoc = (mode?: DocumentMode): void => {
    const targetMode = mode || currentDoc.mode;
    setCurrentDoc(createNewDefaultDoc(targetMode, counters));
  };

  const resetSecurityPin = (): void => {
    clearStoredPin();
    setHasPinSet(false);
    setIsAuthenticated(false);
  };

  const resetAndBypassAuth = (): void => {
    clearStoredPin();
    setHasPinSet(false);
    setIsAuthenticated(true);
    setStoredSession(true);
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
