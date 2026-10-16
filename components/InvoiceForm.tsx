import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft, 
  PackagePlus, 
  HelpCircle,
  IndianRupee,
  ShieldCheck
} from 'lucide-react';
import { 
  Invoice, 
  InvoiceItem, 
  InvoiceStatus, 
  GST_RATES, 
  FurniturePreset 
} from '../types';
import { 
  createEmptyInvoice, 
  generateId 
} from '../services/storageService';
import { 
  computeItemAmounts, 
  computeInvoiceTotals, 
  formatINR, 
  numberToWordsIndian 
} from '../services/calculationService';
import { 
  FURNITURE_CATALOG, 
  PAYMENT_METHODS 
} from '../constants';

interface InvoiceFormProps {
  initialData?: Invoice;
  onSave: (invoice: Invoice) => void;
  onCancel: () => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ 
  initialData, 
  onSave, 
  onCancel 
}) => {
  const [invoice, setInvoice] = useState<Invoice>(() => {
    if (initialData) return initialData;
    return createEmptyInvoice();
  });

  const [validationErrors, setValidationErrors] = useState<{
    customerName?: string;
    items?: string;
  }>({});

  const [selectedPresetId, setSelectedPresetId] = useState<string>('');

  // Handle intra-state / inter-state toggle
  const handleInterStateToggle = (isInterState: boolean) => {
    const updatedItems = invoice.items.map((item) => {
      const computed = computeItemAmounts(item.quantity, item.rate, item.gstRate, isInterState);
      return {
        ...item,
        ...computed,
      };
    });

    const totals = computeInvoiceTotals(updatedItems, isInterState);

    setInvoice((prev) => ({
      ...prev,
      isInterState,
      items: updatedItems,
      ...totals,
    }));
  };

  const handleCustomerChange = (field: keyof typeof invoice.customer, value: string) => {
    if (field === 'name' && value.trim()) {
      setValidationErrors((prev) => ({ ...prev, customerName: undefined }));
    }
    setInvoice((prev) => ({
      ...prev,
      customer: { ...prev.customer, [field]: value },
    }));
  };

  const handleMetadataChange = <K extends keyof Invoice>(field: K, value: Invoice[K]) => {
    setInvoice((prev) => ({ ...prev, [field]: value }));
  };

  const addItem = (preset?: FurniturePreset) => {
    const isInterState = invoice.isInterState;
    const rate = preset ? preset.defaultRate : 0;
    const gstRate = preset ? preset.defaultGstRate : 18;
    const qty = 1;

    const computed = computeItemAmounts(qty, rate, gstRate, isInterState);

    const newItem: InvoiceItem = {
      id: generateId(),
      description: preset ? preset.name : '',
      hsnCode: preset ? preset.hsnCode : '9403',
      quantity: qty,
      rate,
      gstRate,
      ...computed,
    };

    const newItems = [...invoice.items, newItem];
    const totals = computeInvoiceTotals(newItems, isInterState);

    setInvoice((prev) => ({
      ...prev,
      items: newItems,
      ...totals,
    }));

    if (validationErrors.items) {
      setValidationErrors((prev) => ({ ...prev, items: undefined }));
    }
  };

  const handlePresetSelect = (presetId: string) => {
    setSelectedPresetId(presetId);
    if (!presetId) return;
    const found = FURNITURE_CATALOG.find((p) => p.id === presetId);
    if (found) {
      addItem(found);
      setSelectedPresetId(''); // Reset selector
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...invoice.items];
    const current = { ...newItems[index] };

    if (field === 'quantity') {
      current.quantity = Math.max(1, Number(value) || 1);
    } else if (field === 'rate') {
      current.rate = Math.max(0, Number(value) || 0);
    } else if (field === 'gstRate') {
      current.gstRate = Number(value) || 0;
    } else if (field === 'description') {
      current.description = String(value);
    } else if (field === 'hsnCode') {
      current.hsnCode = String(value);
    }

    const computed = computeItemAmounts(
      current.quantity,
      current.rate,
      current.gstRate,
      invoice.isInterState
    );

    newItems[index] = {
      ...current,
      ...computed,
    };

    const totals = computeInvoiceTotals(newItems, invoice.isInterState);

    setInvoice((prev) => ({
      ...prev,
      items: newItems,
      ...totals,
    }));
  };

  const removeItem = (index: number) => {
    const newItems = invoice.items.filter((_, i) => i !== index);
    const totals = computeInvoiceTotals(newItems, invoice.isInterState);
    setInvoice((prev) => ({
      ...prev,
      items: newItems,
      ...totals,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errors: { customerName?: string; items?: string } = {};

    if (!invoice.customer.name.trim()) {
      errors.customerName = 'Customer name is required';
    }

    if (invoice.items.length === 0) {
      errors.items = 'Please add at least one line item before saving the invoice';
    } else {
      const hasEmptyDesc = invoice.items.some((i) => !i.description.trim());
      if (hasEmptyDesc) {
        errors.items = 'Every line item must have a description';
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    onSave(invoice);
  };

  const inputClass =
    "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm text-slate-800 placeholder:text-slate-400 outline-none";
  const labelClass = "block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-12">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
        <div>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {initialData ? `Edit Invoice #${invoice.invoiceNumber}` : 'Create New Invoice'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            GST-compliant commercial furniture billing for Aakash Furniture
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 border border-slate-300 rounded-xl text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-200 hover:-translate-y-0.5 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Invoice</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Customer & Line Items */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Customer Details */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                  1
                </span>
                Customer Information
              </h3>
              <span className="text-xs font-medium text-slate-400">
                * Indicates required
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelClass}>Customer / Business Name *</label>
                <input
                  type="text"
                  value={invoice.customer.name}
                  onChange={(e) => handleCustomerChange('name', e.target.value)}
                  className={`${inputClass} ${
                    validationErrors.customerName ? 'border-rose-300 ring-2 ring-rose-100' : ''
                  }`}
                  placeholder="e.g. Rahul Sharma or Modern Decorators"
                />
                {validationErrors.customerName && (
                  <p className="text-xs text-rose-500 font-medium mt-1">
                    {validationErrors.customerName}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Phone Number</label>
                  <input
                    type="tel"
                    value={invoice.customer.phone}
                    onChange={(e) => handleCustomerChange('phone', e.target.value)}
                    className={inputClass}
                    placeholder="+91 98260 00000"
                  />
                </div>
                <div>
                  <label className={labelClass}>Email Address</label>
                  <input
                    type="email"
                    value={invoice.customer.email}
                    onChange={(e) => handleCustomerChange('email', e.target.value)}
                    className={inputClass}
                    placeholder="client@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Customer GSTIN (Optional B2B)</label>
                  <input
                    type="text"
                    value={invoice.customer.gstin || ''}
                    onChange={(e) => handleCustomerChange('gstin', e.target.value.toUpperCase())}
                    className={inputClass}
                    placeholder="e.g. 23AAACA1122B1Z4"
                  />
                </div>
                <div>
                  <label className={labelClass}>State / Jurisdiction</label>
                  <input
                    type="text"
                    value={invoice.customer.state || 'Madhya Pradesh'}
                    onChange={(e) => handleCustomerChange('state', e.target.value)}
                    className={inputClass}
                    placeholder="Madhya Pradesh"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Billing / Delivery Address</label>
                <textarea
                  value={invoice.customer.address}
                  onChange={(e) => handleCustomerChange('address', e.target.value)}
                  className={inputClass}
                  rows={2}
                  placeholder="Apartment/Shop, Landmark, Area, City, Pin Code"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Items & Services */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                  2
                </span>
                Furniture Items & GST Details
              </h3>

              {/* Quick Preset Selector */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedPresetId}
                  onChange={(e) => handlePresetSelect(e.target.value)}
                  className="text-xs bg-indigo-50/80 border border-indigo-200 text-indigo-800 font-semibold rounded-lg px-3 py-2 outline-none hover:bg-indigo-100 transition-colors"
                >
                  <option value="">⚡ Quick Add Furniture...</option>
                  {FURNITURE_CATALOG.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({formatINR(cat.defaultRate)})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => addItem()}
                  className="inline-flex items-center gap-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-lg transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Custom Item
                </button>
              </div>
            </div>

            {/* Validation alert */}
            {validationErrors.items && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {validationErrors.items}
              </div>
            )}

            {/* Line items list */}
            <div className="space-y-4">
              {invoice.items.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                  <PackagePlus className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-600">No furniture items added yet</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Choose an item from the "Quick Add Furniture" dropdown or click "Custom Item".
                  </p>
                </div>
              ) : (
                invoice.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 hover:border-indigo-200 transition-all space-y-4"
                  >
                    <div className="grid grid-cols-12 gap-3 items-start">
                      {/* Description */}
                      <div className="col-span-12 sm:col-span-6">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                          Item Description
                        </label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="e.g. Sheesham Wood King Bed"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>

                      {/* HSN Code */}
                      <div className="col-span-6 sm:col-span-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                          HSN
                        </label>
                        <input
                          type="text"
                          value={item.hsnCode || '9403'}
                          onChange={(e) => updateItem(index, 'hsnCode', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                        />
                      </div>

                      {/* Quantity */}
                      <div className="col-span-6 sm:col-span-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                          Qty
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>

                      {/* Delete item */}
                      <div className="col-span-12 sm:col-span-2 flex justify-end sm:pt-6">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="inline-flex items-center text-xs font-semibold text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-2 rounded-lg transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-3 items-center pt-2 border-t border-slate-200/60">
                      {/* Rate */}
                      <div className="col-span-6 sm:col-span-4">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                          Unit Rate (₹)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                            ₹
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={item.rate}
                            onChange={(e) => updateItem(index, 'rate', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg pl-7 pr-3 py-2 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                        </div>
                      </div>

                      {/* GST Bracket */}
                      <div className="col-span-6 sm:col-span-4">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                          GST Rate
                        </label>
                        <select
                          value={item.gstRate}
                          onChange={(e) => updateItem(index, 'gstRate', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                          {GST_RATES.map((rate) => (
                            <option key={rate} value={rate}>
                              {rate}% {rate === 18 ? '(Standard Furniture)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Item Total Breakdown */}
                      <div className="col-span-12 sm:col-span-4 text-right">
                        <div className="text-[11px] text-slate-400">
                          Taxable: {formatINR(item.taxableAmount)} + Tax: {formatINR(item.amount - item.taxableAmount)}
                        </div>
                        <div className="text-base font-extrabold text-indigo-700 mt-0.5">
                          {formatINR(item.amount)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Metadata & Financial Totals */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 sticky top-24 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                  3
                </span>
                Invoice Settings
              </h3>
            </div>

            {/* GST Tax Type Switch */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                GST Jurisdiction Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleInterStateToggle(false)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    !invoice.isInterState
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Intra-State (MP)
                  <span className="block text-[10px] font-normal opacity-90">CGST + SGST</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleInterStateToggle(true)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    invoice.isInterState
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Inter-State
                  <span className="block text-[10px] font-normal opacity-90">IGST Only</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelClass}>Invoice Number</label>
                <input
                  type="text"
                  readOnly
                  value={invoice.invoiceNumber}
                  className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono text-sm font-bold text-indigo-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className={labelClass}>Payment Status</label>
                <select
                  value={invoice.status}
                  onChange={(e) => handleMetadataChange('status', e.target.value as InvoiceStatus)}
                  className={inputClass}
                >
                  {Object.values(InvoiceStatus).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Issue Date</label>
                  <input
                    type="date"
                    value={invoice.date}
                    onChange={(e) => handleMetadataChange('date', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Due Date</label>
                  <input
                    type="date"
                    value={invoice.dueDate}
                    onChange={(e) => handleMetadataChange('dueDate', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Preferred Payment Mode</label>
                <select
                  value={invoice.paymentMethod || 'UPI'}
                  onChange={(e) =>
                    handleMetadataChange(
                      'paymentMethod',
                      e.target.value as Invoice['paymentMethod']
                    )
                  }
                  className={inputClass}
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Notes & Customer Instructions</label>
                <textarea
                  value={invoice.notes || ''}
                  onChange={(e) => handleMetadataChange('notes', e.target.value)}
                  className={inputClass}
                  rows={2}
                  placeholder="Terms, delivery instructions, guarantee notes..."
                />
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-4 border-t border-slate-100 space-y-2.5">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Taxable Subtotal:</span>
                <span className="font-semibold text-slate-800">{formatINR(invoice.subtotal)}</span>
              </div>

              {!invoice.isInterState ? (
                <>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>CGST (Central Tax):</span>
                    <span className="font-semibold text-slate-800">{formatINR(invoice.cgstTotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>SGST (State Tax MP):</span>
                    <span className="font-semibold text-slate-800">{formatINR(invoice.sgstTotal)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-xs text-slate-600">
                  <span>IGST (Integrated Tax):</span>
                  <span className="font-semibold text-slate-800">{formatINR(invoice.igstTotal)}</span>
                </div>
              )}

              <div className="flex justify-between text-xs text-slate-600 font-medium">
                <span>Total Tax Amount:</span>
                <span className="font-bold text-slate-800">{formatINR(invoice.taxTotal)}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Grand Total:</span>
                <span className="text-2xl font-black text-indigo-600">
                  {formatINR(invoice.grandTotal)}
                </span>
              </div>

              {invoice.grandTotal > 0 && (
                <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 text-[11px] text-indigo-900 font-medium leading-relaxed italic">
                  {numberToWordsIndian(invoice.grandTotal)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default InvoiceForm;