import { InvoiceItem } from '../types';

/**
 * Rounds a number to exactly two decimal places, avoiding floating point inaccuracies.
 */
export const roundCurrency = (value: number): number => {
  return Math.round((value + Number.EPSILON) * 100) / 100;
};

/**
 * Format a number as Indian Currency string without symbol.
 */
export const formatAmount = (value: number): string => {
  return (value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Format a number with the Indian Rupee symbol.
 */
export const formatINR = (value: number): string => {
  return `₹${formatAmount(value)}`;
};

/**
 * Computes taxable and tax breakdown for an individual line item.
 */
export const computeItemAmounts = (
  quantity: number,
  rate: number,
  gstRate: number,
  isInterState: boolean = false
): {
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  amount: number;
} => {
  const qty = Math.max(0, Number(quantity) || 0);
  const r = Math.max(0, Number(rate) || 0);
  const gst = Math.max(0, Number(gstRate) || 0);

  const taxableAmount = roundCurrency(qty * r);

  if (isInterState) {
    const igstAmount = roundCurrency((taxableAmount * gst) / 100);
    return {
      taxableAmount,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount,
      amount: roundCurrency(taxableAmount + igstAmount),
    };
  } else {
    const halfGst = gst / 2;
    const cgstAmount = roundCurrency((taxableAmount * halfGst) / 100);
    const sgstAmount = roundCurrency((taxableAmount * halfGst) / 100);
    return {
      taxableAmount,
      cgstAmount,
      sgstAmount,
      igstAmount: 0,
      amount: roundCurrency(taxableAmount + cgstAmount + sgstAmount),
    };
  }
};

/**
 * Computes all aggregates for the entire invoice.
 */
export const computeInvoiceTotals = (
  items: InvoiceItem[],
  isInterState: boolean = false
): {
  subtotal: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  taxTotal: number;
  grandTotal: number;
} => {
  let subtotal = 0;
  let cgstTotal = 0;
  let sgstTotal = 0;
  let igstTotal = 0;

  for (const item of items) {
    const computed = computeItemAmounts(
      item.quantity,
      item.rate,
      item.gstRate,
      isInterState
    );
    subtotal += computed.taxableAmount;
    cgstTotal += computed.cgstAmount;
    sgstTotal += computed.sgstAmount;
    igstTotal += computed.igstAmount;
  }

  subtotal = roundCurrency(subtotal);
  cgstTotal = roundCurrency(cgstTotal);
  sgstTotal = roundCurrency(sgstTotal);
  igstTotal = roundCurrency(igstTotal);
  const taxTotal = roundCurrency(cgstTotal + sgstTotal + igstTotal);
  const grandTotal = roundCurrency(subtotal + taxTotal);

  return {
    subtotal,
    cgstTotal,
    sgstTotal,
    igstTotal,
    taxTotal,
    grandTotal,
  };
};

/**
 * Converts a positive number into standard Indian numbering words (Crore, Lakh, Thousand, Hundred).
 */
export const numberToWordsIndian = (num: number): string => {
  if (isNaN(num) || num === null || num === undefined) return '';
  const rounded = Math.round(num);
  if (rounded === 0) return 'Rupees Zero Only';

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  const convertTwoDigits = (n: number): string => {
    if (n < 20) return ones[n];
    const t = Math.floor(n / 10);
    const o = n % 10;
    return `${tens[t]}${o ? ' ' + ones[o] : ''}`;
  };

  const convertThreeDigits = (n: number): string => {
    const h = Math.floor(n / 100);
    const rem = n % 100;
    let res = '';
    if (h > 0) {
      res += `${ones[h]} Hundred`;
    }
    if (rem > 0) {
      if (res) res += ' and ';
      res += convertTwoDigits(rem);
    }
    return res;
  };

  let remaining = Math.abs(rounded);
  let words = '';

  // Crores (1,00,00,000)
  const crores = Math.floor(remaining / 10000000);
  remaining %= 10000000;
  if (crores > 0) {
    words += `${convertTwoDigits(crores)} Crore `;
  }

  // Lakhs (1,00,000)
  const lakhs = Math.floor(remaining / 100000);
  remaining %= 100000;
  if (lakhs > 0) {
    words += `${convertTwoDigits(lakhs)} Lakh `;
  }

  // Thousands (1,000)
  const thousands = Math.floor(remaining / 1000);
  remaining %= 1000;
  if (thousands > 0) {
    words += `${convertTwoDigits(thousands)} Thousand `;
  }

  // Hundreds & Remaining
  if (remaining > 0) {
    words += convertThreeDigits(remaining);
  }

  return `Rupees ${words.trim()} Only`;
};
