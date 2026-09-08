export type DocumentMode = 'INVOICE' | 'RECEIPT';

export type PaymentStatus = 'UNPAID' | 'PAID' | 'PARTIAL';

export type Currency = 'GHS' | 'USD' | 'EUR' | 'GBP';

export interface LineItem {
  id: string;
  desc: string;
  qty: number;
  price: number;
}

export interface BankDetails {
  bankName: string;
  accName: string;
  accNo: string;
  branch: string;
  swift?: string;
}

export interface DocumentData {
  id: string;
  mode: DocumentMode;
  number: string;
  date: string;
  dueDate: string;
  status: PaymentStatus;
  currency: Currency;
  exchangeRate: string;
  method: string;
  clientName: string;
  clientContact: string;
  clientAddress: string;
  items: LineItem[];
  taxRate: number;
  discount: number;
  bankDetails: BankDetails;
  notes: string;
  createdAt: string;
}

export interface AppCounters {
  invoicePrefix: string;
  invoiceCounter: number;
  receiptPrefix: string;
  receiptCounter: number;
}
