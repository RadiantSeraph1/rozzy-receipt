import { AppCounters, DocumentData } from '@/types';
import { formatDocNumber, getFutureDateFormatted, getTodayFormatted } from './utils';

const STORAGE_KEYS = {
  PIN: 'rozzy_auth_pin',
  SESSION: 'rozzy_session_active',
  COUNTERS: 'rozzy_counters',
  HISTORY: 'rozzy_history',
  CURRENT: 'rozzy_current_draft',
};

export const DEFAULT_COUNTERS: AppCounters = {
  invoicePrefix: 'RTT-INV-',
  invoiceCounter: 1146,
  receiptPrefix: 'RTT-REC-',
  receiptCounter: 1234,
};

export const DEFAULT_BANK_DETAILS = {
  bankName: 'Guaranty Trust Bank (Ghana) Ltd',
  accName: 'Rozzy Travel and Tours Ltd',
  accNo: '201/109482/1/10',
  branch: 'Tarkwa Branch',
};

export function getStoredPin(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.PIN);
}

export function setStoredPin(pin: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PIN, pin);
}

export function clearStoredPin(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.PIN);
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

export function getStoredSession(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEYS.SESSION) === 'true';
}

export function setStoredSession(active: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SESSION, String(active));
}

export function getStoredCounters(): AppCounters {
  if (typeof window === 'undefined') return DEFAULT_COUNTERS;
  const raw = localStorage.getItem(STORAGE_KEYS.COUNTERS);
  if (!raw) return DEFAULT_COUNTERS;
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_COUNTERS;
  }
}

export function setStoredCounters(counters: AppCounters): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.COUNTERS, JSON.stringify(counters));
}

export function getStoredHistory(): DocumentData[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function setStoredHistory(history: DocumentData[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
}

export function createNewDefaultDoc(
  mode: 'INVOICE' | 'RECEIPT',
  counters: AppCounters
): DocumentData {
  const isInvoice = mode === 'INVOICE';
  const number = isInvoice
    ? formatDocNumber(counters.invoicePrefix, counters.invoiceCounter)
    : formatDocNumber(counters.receiptPrefix, counters.receiptCounter);

  return {
    id: `doc_${Date.now()}`,
    mode,
    number,
    date: getTodayFormatted(),
    dueDate: getFutureDateFormatted(14),
    status: isInvoice ? 'UNPAID' : 'PAID',
    currency: 'GHS',
    exchangeRate: '1 USD = 11.995 GHS',
    method: 'Bank Transfer',
    clientName: 'Quest Solutions Africa Ltd',
    clientContact: '020 8134572 / info@quest.com',
    clientAddress: 'Accra, Ghana',
    items: [
      {
        id: '1',
        desc: isInvoice
          ? 'Date change - For Mr. Leon Van Der Berg (Abidjan Accra Reissued Ticket)'
          : 'Air Ticket Reservation - Accra to London Heathrow',
        qty: 1,
        price: isInvoice ? 1060.50 : 1200.00,
      },
    ],
    taxRate: 0,
    discount: 0,
    bankDetails: DEFAULT_BANK_DETAILS,
    notes: 'Thank you for traveling with Rozzy Travel & Tours Ltd!',
    createdAt: new Date().toISOString(),
  };
}
