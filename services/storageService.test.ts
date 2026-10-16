import { describe, it, expect, beforeEach } from 'vitest';
import { 
  generateInvoiceNumber, 
  createEmptyInvoice, 
  duplicateInvoice, 
  exportInvoicesJSON, 
  importInvoicesJSON,
  getInvoices,
  saveInvoice,
  deleteInvoice
} from './storageService';
import { Invoice, InvoiceStatus } from '../types';

// Mock localStorage for node environment
class LocalStorageMock {
  private store: Record<string, string> = {};

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }

  removeItem(key: string) {
    delete this.store[key];
  }
}

const mockStorage = new LocalStorageMock();
Object.defineProperty(globalThis, 'localStorage', {
  value: mockStorage,
  writable: true,
});

describe('storageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('generates sequential invoice numbers with current year prefix', () => {
    const num1 = generateInvoiceNumber();
    const year = new Date().getFullYear().toString().slice(-2);
    expect(num1).toMatch(new RegExp(`^AF-${year}-\\d{3}$`));

    // Create and save invoice with num1
    const inv1: Invoice = {
      ...createEmptyInvoice(),
      id: 'test-1',
      invoiceNumber: num1,
    };
    saveInvoice(inv1);

    const num2 = generateInvoiceNumber();
    expect(num2).not.toBe(num1);
  });

  it('prevents number collision even if an invoice is deleted', () => {
    const inv1 = { ...createEmptyInvoice(), id: 'id-1', invoiceNumber: 'AF-26-001' };
    const inv2 = { ...createEmptyInvoice(), id: 'id-2', invoiceNumber: 'AF-26-002' };
    const inv3 = { ...createEmptyInvoice(), id: 'id-3', invoiceNumber: 'AF-26-003' };
    saveInvoice(inv1);
    saveInvoice(inv2);
    saveInvoice(inv3);

    // Delete invoice 2
    deleteInvoice('id-2');

    // Generating new invoice number should NOT duplicate AF-26-003
    const nextNum = generateInvoiceNumber();
    expect(nextNum).toBe('AF-26-004');
  });

  it('duplicates invoice with new ID, new invoice number, and draft status', () => {
    const source: Invoice = {
      ...createEmptyInvoice(),
      id: 'source-123',
      invoiceNumber: 'AF-26-001',
      customer: {
        name: 'Test Customer',
        phone: '9876543210',
        email: 'test@example.com',
        address: 'Bhopal',
      },
      status: InvoiceStatus.Paid,
    };

    const cloned = duplicateInvoice(source);
    expect(cloned.id).not.toBe(source.id);
    expect(cloned.invoiceNumber).not.toBe(source.invoiceNumber);
    expect(cloned.status).toBe(InvoiceStatus.Draft);
    expect(cloned.customer.name).toBe('Test Customer');
  });

  it('exports and imports invoices JSON successfully', () => {
    const inv = {
      ...createEmptyInvoice(),
      id: 'exp-1',
      invoiceNumber: 'AF-26-099',
      customer: { name: 'Export Client', phone: '123', email: '', address: '' },
    };
    saveInvoice(inv);

    const json = exportInvoicesJSON();
    expect(json).toContain('AF-26-099');
    expect(json).toContain('Export Client');

    // Clear and re-import
    localStorage.clear();
    expect(getInvoices().length).toBe(0);

    const result = importInvoicesJSON(json);
    expect(result.success).toBe(true);
    expect(result.count).toBe(1);
    expect(getInvoices().length).toBe(1);
    expect(getInvoices()[0].invoiceNumber).toBe('AF-26-099');
  });
});
