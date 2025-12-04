import { Invoice, InvoiceStatus } from '../types';

const STORAGE_KEY = 'aakash_furniture_invoices';

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const generateInvoiceNumber = (): string => {
  const invoices = getInvoices();
  const count = invoices.length + 1;
  const year = new Date().getFullYear().toString().slice(-2);
  // Format: AF-24-001
  return `AF-${year}-${String(count).padStart(3, '0')}`;
};

export const getInvoices = (): Invoice[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load invoices", error);
    return [];
  }
};

export const saveInvoice = (invoice: Invoice): void => {
  const invoices = getInvoices();
  const existingIndex = invoices.findIndex((i) => i.id === invoice.id);

  if (existingIndex >= 0) {
    invoices[existingIndex] = invoice;
  } else {
    invoices.unshift(invoice); // Add to top
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
};

export const deleteInvoice = (id: string): void => {
  const invoices = getInvoices().filter((i) => i.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
};

export const createEmptyInvoice = (): Invoice => {
  const today = new Date().toISOString().split('T')[0];
  return {
    id: generateId(),
    invoiceNumber: generateInvoiceNumber(),
    date: today,
    dueDate: today,
    status: InvoiceStatus.Pending,
    customer: {
      name: '',
      phone: '',
      email: '',
      address: '',
    },
    items: [],
    subtotal: 0,
    taxTotal: 0,
    grandTotal: 0,
  };
};