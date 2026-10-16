import { Invoice, InvoiceItem, InvoiceStatus } from '../types';
import { computeInvoiceTotals, computeItemAmounts } from './calculationService';

const STORAGE_KEY = 'aakash_furniture_invoices';
const SEQUENCE_KEY_PREFIX = 'aakash_furniture_seq_';

export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'inv_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
};

export const generateInvoiceNumber = (): string => {
  const invoices = getInvoices();
  const year = new Date().getFullYear().toString().slice(-2);
  const prefix = `AF-${year}-`;

  // Find the highest sequence number in existing invoices for the current year
  let maxSeq = 0;
  for (const inv of invoices) {
    if (inv.invoiceNumber && inv.invoiceNumber.startsWith(prefix)) {
      const rawNum = inv.invoiceNumber.substring(prefix.length);
      const parsed = parseInt(rawNum, 10);
      if (!isNaN(parsed) && parsed > maxSeq) {
        maxSeq = parsed;
      }
    }
  }

  // Also check stored monotonic counter in localStorage so deletions don't cause collisions
  const seqKey = `${SEQUENCE_KEY_PREFIX}${year}`;
  let storedSeq = 0;
  try {
    const val = localStorage.getItem(seqKey);
    if (val) {
      storedSeq = parseInt(val, 10) || 0;
    }
  } catch (e) {
    // ignore
  }

  const nextSeq = Math.max(maxSeq, storedSeq) + 1;

  try {
    localStorage.setItem(seqKey, nextSeq.toString());
  } catch (e) {
    // ignore
  }

  return `${prefix}${String(nextSeq).padStart(3, '0')}`;
};

export const getInvoices = (): Invoice[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (error) {
    console.error("Failed to load invoices from localStorage", error);
    return [];
  }
};

export const saveInvoice = (invoice: Invoice): void => {
  const invoices = getInvoices();
  const existingIndex = invoices.findIndex((i) => i.id === invoice.id);

  if (existingIndex >= 0) {
    invoices[existingIndex] = invoice;
  } else {
    invoices.unshift(invoice); // Add newest to top
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
};

export const deleteInvoice = (id: string): void => {
  const invoices = getInvoices().filter((i) => i.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
};

export const createEmptyInvoice = (): Invoice => {
  const today = new Date().toISOString().split('T')[0];
  const dueDate = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];

  return {
    id: generateId(),
    invoiceNumber: generateInvoiceNumber(),
    date: today,
    dueDate,
    status: InvoiceStatus.Pending,
    isInterState: false,
    customer: {
      name: '',
      phone: '',
      email: '',
      address: '',
      gstin: '',
      state: 'Madhya Pradesh',
    },
    items: [],
    subtotal: 0,
    cgstTotal: 0,
    sgstTotal: 0,
    igstTotal: 0,
    taxTotal: 0,
    grandTotal: 0,
    paymentMethod: 'UPI',
    notes: 'Thank you for choosing Aakash Furniture. Quality craftsmanship guaranteed.',
  };
};

export const duplicateInvoice = (source: Invoice): Invoice => {
  const today = new Date().toISOString().split('T')[0];
  const dueDate = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];

  // Re-id items
  const clonedItems: InvoiceItem[] = source.items.map(item => ({
    ...item,
    id: generateId(),
  }));

  const totals = computeInvoiceTotals(clonedItems, source.isInterState);

  return {
    ...source,
    id: generateId(),
    invoiceNumber: generateInvoiceNumber(),
    date: today,
    dueDate,
    status: InvoiceStatus.Draft,
    items: clonedItems,
    ...totals,
  };
};

export const exportInvoicesJSON = (): string => {
  const invoices = getInvoices();
  return JSON.stringify(invoices, null, 2);
};

export const importInvoicesJSON = (jsonString: string): { success: boolean; count: number; error?: string } => {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      return { success: false, count: 0, error: 'File must contain an array of invoices' };
    }

    const validInvoices: Invoice[] = [];
    for (const item of parsed) {
      if (item && item.id && item.invoiceNumber && item.customer && Array.isArray(item.items)) {
        validInvoices.push(item);
      }
    }

    if (validInvoices.length === 0) {
      return { success: false, count: 0, error: 'No valid invoice structures found in JSON' };
    }

    // Merge by id (existing are replaced, new are added)
    const current = getInvoices();
    const map = new Map<string, Invoice>();
    current.forEach(inv => map.set(inv.id, inv));
    validInvoices.forEach(inv => map.set(inv.id, inv));

    const merged = Array.from(map.values());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));

    return { success: true, count: validInvoices.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message || 'Invalid JSON syntax' };
  }
};

export const seedSampleInvoices = (): Invoice[] => {
  const today = new Date();
  const formatD = (d: Date) => d.toISOString().split('T')[0];

  const d1 = new Date(today.getTime() - 2 * 86400000);
  const d2 = new Date(today.getTime() - 7 * 86400000);
  const d3 = new Date(today.getTime() - 20 * 86400000);

  const samples: Invoice[] = [
    {
      id: 'sample-inv-1',
      invoiceNumber: 'AF-26-001',
      date: formatD(d1),
      dueDate: formatD(today),
      status: InvoiceStatus.Paid,
      isInterState: false,
      customer: {
        name: 'Rahul Sharma',
        phone: '+91 98260 12345',
        email: 'rahul.sharma@example.com',
        address: 'B-42, Gulmohar Colony, E-8 Arera Colony, Bhopal, M.P. - 462039',
        state: 'Madhya Pradesh',
      },
      items: [
        {
          id: 'item-1-1',
          description: 'Sheesham Wood King Size Bed with Hydraulic Storage (Teak Finish)',
          hsnCode: '9403',
          quantity: 1,
          rate: 34500,
          gstRate: 18,
          taxableAmount: 34500,
          cgstAmount: 3105,
          sgstAmount: 3105,
          igstAmount: 0,
          amount: 40710,
        },
        {
          id: 'item-1-2',
          description: 'Matching Sheesham Bedside Nightstand Tables (Pair)',
          hsnCode: '9403',
          quantity: 2,
          rate: 4200,
          gstRate: 12,
          taxableAmount: 8400,
          cgstAmount: 504,
          sgstAmount: 504,
          igstAmount: 0,
          amount: 9408,
        },
      ],
      subtotal: 42900,
      cgstTotal: 3609,
      sgstTotal: 3609,
      igstTotal: 0,
      taxTotal: 7218,
      grandTotal: 50118,
      paymentMethod: 'UPI',
      notes: 'Delivered and assembled at client residence. Full payment received via UPI.',
    },
    {
      id: 'sample-inv-2',
      invoiceNumber: 'AF-26-002',
      date: formatD(d2),
      dueDate: formatD(new Date(today.getTime() + 8 * 86400000)),
      status: InvoiceStatus.Pending,
      isInterState: false,
      customer: {
        name: 'Pooja Verma',
        phone: '+91 94250 88776',
        email: 'pooja.verma@example.com',
        address: 'Flat 304, Fortune Divine City, Hoshangabad Road, Bhopal, M.P. - 462026',
        state: 'Madhya Pradesh',
      },
      items: [
        {
          id: 'item-2-1',
          description: 'Solid Teak Wood 6-Seater Dining Table with Cushioned Chairs',
          hsnCode: '9403',
          quantity: 1,
          rate: 42000,
          gstRate: 18,
          taxableAmount: 42000,
          cgstAmount: 3780,
          sgstAmount: 3780,
          igstAmount: 0,
          amount: 49560,
        },
      ],
      subtotal: 42000,
      cgstTotal: 3780,
      sgstTotal: 3780,
      igstTotal: 0,
      taxTotal: 7560,
      grandTotal: 49560,
      paymentMethod: 'Bank Transfer',
      notes: '50% advance received. Balance pending on delivery inspection.',
    },
    {
      id: 'sample-inv-3',
      invoiceNumber: 'AF-26-003',
      date: formatD(d3),
      dueDate: formatD(new Date(today.getTime() - 5 * 86400000)),
      status: InvoiceStatus.Overdue,
      isInterState: false,
      customer: {
        name: 'Apex Architects & Interiors',
        phone: '+91 98930 55443',
        email: 'accounts@apexinteriors.com',
        address: 'Plot 18, Commercial Zone, M.P. Nagar Zone-II, Bhopal, M.P. - 462011',
        gstin: '23AAACA1122B1Z4',
        state: 'Madhya Pradesh',
      },
      items: [
        {
          id: 'item-3-1',
          description: 'High-Back Ergonomic Executive Office Chairs (Black Mesh)',
          hsnCode: '9401',
          quantity: 4,
          rate: 8500,
          gstRate: 18,
          taxableAmount: 34000,
          cgstAmount: 3060,
          sgstAmount: 3060,
          igstAmount: 0,
          amount: 40120,
        },
      ],
      subtotal: 34000,
      cgstTotal: 3060,
      sgstTotal: 3060,
      igstTotal: 0,
      taxTotal: 6120,
      grandTotal: 40120,
      paymentMethod: 'Cheque',
      notes: 'Reminder sent on WhatsApp for overdue invoice payment.',
    },
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(samples));
  localStorage.setItem(`${SEQUENCE_KEY_PREFIX}26`, '3');
  return samples;
};