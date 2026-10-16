import { InvoiceStatus, FurniturePreset } from './types';

export const DEFAULT_INVOICE_STATUS = InvoiceStatus.Pending;

export const STATUS_CONFIG = {
  [InvoiceStatus.Draft]: {
    label: 'Draft',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
    dotClass: 'bg-slate-400',
  },
  [InvoiceStatus.Pending]: {
    label: 'Pending',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
    dotClass: 'bg-amber-500',
  },
  [InvoiceStatus.Paid]: {
    label: 'Paid',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    dotClass: 'bg-emerald-500',
  },
  [InvoiceStatus.Overdue]: {
    label: 'Overdue',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-300',
    dotClass: 'bg-rose-500',
  },
};

// Legacy support
export const STATUS_COLORS = {
  [InvoiceStatus.Draft]: 'bg-slate-100 text-slate-700 border-slate-200',
  [InvoiceStatus.Pending]: 'bg-amber-100 text-amber-800 border-amber-200',
  [InvoiceStatus.Paid]: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  [InvoiceStatus.Overdue]: 'bg-rose-100 text-rose-800 border-rose-200',
};

export const PAYMENT_METHODS = [
  'UPI',
  'Cash',
  'Bank Transfer',
  'Cheque',
  'Credit Card',
] as const;

export const FURNITURE_CATALOG: FurniturePreset[] = [
  {
    id: 'bed-sheesham-king',
    name: 'Sheesham Wood King Size Bed with Storage',
    category: 'Beds',
    hsnCode: '9403',
    defaultRate: 34500,
    defaultGstRate: 18,
  },
  {
    id: 'dining-teak-6s',
    name: 'Solid Teak Wood 6-Seater Dining Table Set',
    category: 'Dining',
    hsnCode: '9403',
    defaultRate: 42000,
    defaultGstRate: 18,
  },
  {
    id: 'sofa-lshape-velvet',
    name: 'Premium L-Shape 6-Seater Fabric Sofa Set',
    category: 'Seating',
    hsnCode: '9401',
    defaultRate: 38000,
    defaultGstRate: 18,
  },
  {
    id: 'wardrobe-4door-modular',
    name: 'Modular 4-Door Wardrobe with Dressing Mirror',
    category: 'Storage',
    hsnCode: '9403',
    defaultRate: 26500,
    defaultGstRate: 18,
  },
  {
    id: 'chair-office-ergonomic',
    name: 'High-Back Ergonomic Executive Office Chair',
    category: 'Office',
    hsnCode: '9401',
    defaultRate: 8500,
    defaultGstRate: 18,
  },
  {
    id: 'table-coffee-sheesham',
    name: 'Solid Sheesham Wood Coffee Center Table',
    category: 'Living',
    hsnCode: '9403',
    defaultRate: 7200,
    defaultGstRate: 12,
  },
  {
    id: 'mattress-ortho-queen',
    name: 'Queen Size 6-Inch Orthopedic Pocket Spring Mattress',
    category: 'Beds',
    hsnCode: '9404',
    defaultRate: 14500,
    defaultGstRate: 18,
  },
  {
    id: 'tv-console-unit',
    name: 'Contemporary TV Entertainment Console (Walnut Finish)',
    category: 'Living',
    hsnCode: '9403',
    defaultRate: 12800,
    defaultGstRate: 18,
  },
  {
    id: 'bookshelf-wooden',
    name: 'Open 5-Tier Sheesham Wood Bookshelf & Display Rack',
    category: 'Storage',
    hsnCode: '9403',
    defaultRate: 9500,
    defaultGstRate: 12,
  },
  {
    id: 'table-bedside-pair',
    name: 'Bedside Nightstand Table with 2 Drawers',
    category: 'Beds',
    hsnCode: '9403',
    defaultRate: 4200,
    defaultGstRate: 12,
  },
];