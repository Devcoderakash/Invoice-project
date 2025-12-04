import { InvoiceStatus } from './types';

export const DEFAULT_INVOICE_STATUS = InvoiceStatus.Draft;

export const STATUS_COLORS = {
  [InvoiceStatus.Draft]: 'bg-gray-100 text-gray-800 border-gray-200',
  [InvoiceStatus.Pending]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [InvoiceStatus.Paid]: 'bg-green-100 text-green-800 border-green-200',
  [InvoiceStatus.Overdue]: 'bg-red-100 text-red-800 border-red-200',
};