import { describe, it, expect } from 'vitest';
import { 
  roundCurrency, 
  computeItemAmounts, 
  computeInvoiceTotals, 
  numberToWordsIndian 
} from './calculationService';
import { InvoiceItem } from '../types';

describe('calculationService', () => {
  describe('roundCurrency', () => {
    it('accurately rounds floating point numbers to two decimal places', () => {
      expect(roundCurrency(10.004)).toBe(10);
      expect(roundCurrency(10.005)).toBe(10.01);
      expect(roundCurrency(0.1 + 0.2)).toBe(0.3);
      expect(roundCurrency(1234.567)).toBe(1234.57);
    });
  });

  describe('computeItemAmounts', () => {
    it('calculates intra-state GST (50% CGST + 50% SGST) correctly', () => {
      // 1 Sheesham King Bed @ 34,500 with 18% GST
      const result = computeItemAmounts(1, 34500, 18, false);
      expect(result.taxableAmount).toBe(34500);
      expect(result.cgstAmount).toBe(3105); // 9% of 34500
      expect(result.sgstAmount).toBe(3105); // 9% of 34500
      expect(result.igstAmount).toBe(0);
      expect(result.amount).toBe(40710);
    });

    it('calculates inter-state IGST correctly', () => {
      // 2 Dining Tables @ 42,000 with 18% GST inter-state
      const result = computeItemAmounts(2, 42000, 18, true);
      expect(result.taxableAmount).toBe(84000);
      expect(result.cgstAmount).toBe(0);
      expect(result.sgstAmount).toBe(0);
      expect(result.igstAmount).toBe(15120); // 18% of 84000
      expect(result.amount).toBe(99120);
    });

    it('handles zero quantity or zero rate safely', () => {
      const result = computeItemAmounts(0, 5000, 18, false);
      expect(result.taxableAmount).toBe(0);
      expect(result.amount).toBe(0);
    });
  });

  describe('computeInvoiceTotals', () => {
    it('aggregates multiple items accurately for intra-state sale', () => {
      const items: InvoiceItem[] = [
        {
          id: '1',
          description: 'Solid Wood Bed',
          quantity: 1,
          rate: 30000,
          gstRate: 18,
          taxableAmount: 30000,
          cgstAmount: 2700,
          sgstAmount: 2700,
          igstAmount: 0,
          amount: 35400,
        },
        {
          id: '2',
          description: 'Coffee Table',
          quantity: 2,
          rate: 5000,
          gstRate: 12,
          taxableAmount: 10000,
          cgstAmount: 600,
          sgstAmount: 600,
          igstAmount: 0,
          amount: 11200,
        },
      ];

      const totals = computeInvoiceTotals(items, false);
      expect(totals.subtotal).toBe(40000);
      expect(totals.cgstTotal).toBe(3300);
      expect(totals.sgstTotal).toBe(3300);
      expect(totals.igstTotal).toBe(0);
      expect(totals.taxTotal).toBe(6600);
      expect(totals.grandTotal).toBe(46600);
    });
  });

  describe('numberToWordsIndian', () => {
    it('converts small amounts to words', () => {
      expect(numberToWordsIndian(0)).toBe('Rupees Zero Only');
      expect(numberToWordsIndian(500)).toBe('Rupees Five Hundred Only');
      expect(numberToWordsIndian(1250)).toBe('Rupees One Thousand Two Hundred and Fifty Only');
    });

    it('converts thousands and lakhs correctly', () => {
      expect(numberToWordsIndian(42000)).toBe('Rupees Forty Two Thousand Only');
      expect(numberToWordsIndian(50118)).toBe('Rupees Fifty Thousand One Hundred and Eighteen Only');
      expect(numberToWordsIndian(150000)).toBe('Rupees One Lakh Fifty Thousand Only');
    });

    it('converts multi-lakh amounts correctly', () => {
      expect(numberToWordsIndian(345200)).toBe('Rupees Three Lakh Forty Five Thousand Two Hundred Only');
    });
  });
});
