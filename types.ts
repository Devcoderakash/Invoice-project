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
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  gstRate: number; // 0, 5, 12, 18, 28
  amount: number; // Calculated (qty * rate) + gst
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string; // ISO Date String
  dueDate: string; // ISO Date String
  status: InvoiceStatus;
  customer: Customer;
  items: InvoiceItem[];
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  notes?: string;
}

export const BUSINESS_DETAILS = {
  name: "Aakash Furniture",
  address: "Shop No. 2, Near SBI Bank, Kolar Road, Bhopal (M.P) - 462042",
  phone1: "+91 91110 92001",
  phone2: "+91 99775 18856",
  email: "aakashfurniture@gmail.com",
  gstin: "23ALVPL7961R2ZW",
  jurisdiction: "Bhopal"
};

export const GST_RATES = [0, 5, 12, 18, 28];