export type ViewMode = 'dashboard' | 'create' | 'edit' | 'view';

export enum InvoiceStatus {
  Draft = 'Draft',
  Pending = 'Pending',
  Paid = 'Paid',
  Overdue = 'Overdue'
}

export interface Customer {
  name: string;
  phone: string;
  email: string;
  address: string;
  gstin?: string;
  state?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  hsnCode?: string;
  quantity: number;
  rate: number;
  gstRate: number; // 0, 5, 12, 18, 28
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  amount: number; // Grand total for this line item
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string; // ISO Date String (YYYY-MM-DD)
  dueDate: string; // ISO Date String (YYYY-MM-DD)
  status: InvoiceStatus;
  isInterState: boolean; // false = Intra-state MP (CGST+SGST), true = Inter-state (IGST)
  customer: Customer;
  items: InvoiceItem[];
  subtotal: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  taxTotal: number;
  grandTotal: number;
  notes?: string;
  paymentMethod?: 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque' | 'Credit Card';
}

export const BUSINESS_DETAILS = {
  name: "Aakash Furniture",
  tagline: "Quality Wooden & Modular Furniture",
  address: "Shop No. 2, Near SBI Bank, Kolar Road, Bhopal (M.P) - 462042",
  phone1: "+91 91110 92001",
  phone2: "+91 99775 18856",
  email: "aakashfurniture@gmail.com",
  gstin: "23ALVPL7961R2ZW",
  state: "Madhya Pradesh",
  stateCode: "23",
  jurisdiction: "Bhopal (M.P.)",
  bankDetails: {
    bankName: "INDIAN BANK",
    accountName: "AAKASH FURNITURE",
    accountNumber: "CA 7184276999",
    ifscCode: "IDIB000K735",
    branch: "Kolar Road Branch, Bhopal"
  }
};

export const GST_RATES = [0, 5, 12, 18, 28] as const;

export interface FurniturePreset {
  id: string;
  name: string;
  category: 'Beds' | 'Seating' | 'Dining' | 'Storage' | 'Office' | 'Living';
  hsnCode: string;
  defaultRate: number;
  defaultGstRate: number;
}