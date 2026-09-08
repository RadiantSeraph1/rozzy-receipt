import { Currency } from '@/types';

export function getTodayFormatted(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getFutureDateFormatted(daysToAdd = 14): string {
  const d = new Date();
  d.setDate(d.getDate() + daysToAdd);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatCurrencySymbol(currency: Currency): string {
  switch (currency) {
    case 'GHS':
      return '₵';
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    default:
      return '₵';
  }
}

export function formatDocNumber(prefix: string, count: number): string {
  const padded = String(count).padStart(6, '0');
  return prefix ? `${prefix}${padded}` : padded;
}
