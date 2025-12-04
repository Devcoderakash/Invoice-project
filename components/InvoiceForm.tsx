import React, { useState, useEffect } from 'react';
import { Plus, Trash, Save, X, Calculator, ArrowRight } from 'lucide-react';
import { Invoice, InvoiceItem, InvoiceStatus, GST_RATES } from '../types';
import { createEmptyInvoice, generateId } from '../services/storageService';

interface InvoiceFormProps {
  initialData?: Invoice;
  onSave: (invoice: Invoice) => void;
  onCancel: () => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ initialData, onSave, onCancel }) => {
  const [invoice, setInvoice] = useState<Invoice>(initialData || createEmptyInvoice());

  // Calculations Effect
  useEffect(() => {
    const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    
    // Calculate total tax based on each item
    const taxTotal = invoice.items.reduce((sum, item) => {
        const itemTotal = item.quantity * item.rate;
        const itemTax = (itemTotal * item.gstRate) / 100;
        return sum + itemTax;
    }, 0);

    const grandTotal = subtotal + taxTotal;

    setInvoice(prev => ({
      ...prev,
      subtotal,
      taxTotal,
      grandTotal
    }));
  }, [invoice.items]);

  const handleCustomerChange = (field: keyof typeof invoice.customer, value: string) => {
    setInvoice(prev => ({
      ...prev,
      customer: { ...prev.customer, [field]: value }
    }));
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: generateId(),
      description: '',
      quantity: 1,
      rate: 0,
      gstRate: 18,
      amount: 0
    };
    setInvoice(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...invoice.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalculate amount for this item
    const qty = field === 'quantity' ? Number(value) : newItems[index].quantity;
    const rate = field === 'rate' ? Number(value) : newItems[index].rate;
    const gst = field === 'gstRate' ? Number(value) : newItems[index].gstRate;
    
    const baseAmount = qty * rate;
    const taxAmount = (baseAmount * gst) / 100;
    newItems[index].amount = baseAmount + taxAmount;

    setInvoice(prev => ({ ...prev, items: newItems }));
  };

  const removeItem = (index: number) => {
    // Correctly remove the item from the array using filter
    const newItems = invoice.items.filter((_, i) => i !== index);
    setInvoice(prev => ({ ...prev, items: newItems }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice.customer.name) {
      alert('Please enter customer name');
      return;
    }
    if (invoice.items.length === 0) {
      alert('Please add at least one item');
      return;
    }
    onSave(invoice);
  };

  const inputClass = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ease-in-out outline-none placeholder:text-slate-400";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5 ml-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {initialData ? 'Edit Invoice' : 'New Invoice'}
          </h1>
          <p className="text-slate-500 mt-1">Fill in the details below</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:-translate-y-0.5 transition-all flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Customer Details - Left Column */}
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                    <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 text-sm">1</span>
                    Customer Information
                </h3>
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className={labelClass}>Customer Name *</label>
                        <input
                            type="text"
                            required
                            value={invoice.customer.name}
                            onChange={e => handleCustomerChange('name', e.target.value)}
                            className={inputClass}
                            placeholder="e.g. Rahul Sharma"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                        <label className={labelClass}>Phone</label>
                        <input
                            type="tel"
                            value={invoice.customer.phone}
                            onChange={e => handleCustomerChange('phone', e.target.value)}
                            className={inputClass}
                            placeholder="+91..."
                        />
                        </div>
                        <div>
                        <label className={labelClass}>Email</label>
                        <input
                            type="email"
                            value={invoice.customer.email}
                            onChange={e => handleCustomerChange('email', e.target.value)}
                            className={inputClass}
                            placeholder="name@example.com"
                        />
                        </div>
                    </div>
                    <div>
                    <label className={labelClass}>Address</label>
                    <textarea
                        value={invoice.customer.address}
                        onChange={e => handleCustomerChange('address', e.target.value)}
                        className={inputClass}
                        rows={3}
                        placeholder="Billing address..."
                    />
                    </div>
                </div>
            </div>

            {/* Items Section */}
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center">
                        <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 text-sm">3</span>
                        Items & Services
                    </h3>
                    <button
                        type="button"
                        onClick={addItem}
                        className="flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Item
                    </button>
                 </div>
                
                <div className="space-y-4">
                    {invoice.items.length === 0 && (
                        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                            <p className="text-slate-400">No items added yet. Click "Add Item" to start.</p>
                        </div>
                    )}
                    
                    {invoice.items.map((item, index) => (
                        <div key={item.id} className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors group relative">
                             <div className="grid grid-cols-12 gap-4 items-start">
                                <div className="col-span-12 md:col-span-5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Description</label>
                                    <input
                                        type="text"
                                        placeholder="Item description"
                                        value={item.description}
                                        onChange={e => updateItem(index, 'description', e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div className="col-span-4 md:col-span-2">
                                     <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Qty</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={e => updateItem(index, 'quantity', Number(e.target.value))}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div className="col-span-4 md:col-span-2">
                                    <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Rate</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={item.rate}
                                        onChange={e => updateItem(index, 'rate', Number(e.target.value))}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div className="col-span-4 md:col-span-2">
                                    <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">GST</label>
                                    <select
                                        value={item.gstRate}
                                        onChange={e => updateItem(index, 'gstRate', Number(e.target.value))}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        {GST_RATES.map(rate => (
                                            <option key={rate} value={rate}>{rate}%</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-12 md:col-span-1 flex justify-end md:block pt-6">
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                                    >
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </div>
                             </div>
                             <div className="mt-2 text-right">
                                <span className="text-xs text-slate-400 font-medium uppercase mr-2">Total:</span>
                                <span className="text-sm font-bold text-slate-700">₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Invoice Metadata - Right Column */}
        <div className="space-y-6">
             <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 sticky top-24">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                    <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 text-sm">2</span>
                    Details
                </h3>
                <div className="space-y-4">
                    <div>
                    <label className={labelClass}>Invoice Number</label>
                    <input
                        type="text"
                        readOnly
                        value={invoice.invoiceNumber}
                        className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-mono text-sm"
                    />
                    </div>
                    <div>
                    <label className={labelClass}>Status</label>
                    <select
                        value={invoice.status}
                        onChange={e => setInvoice(prev => ({ ...prev, status: e.target.value as InvoiceStatus }))}
                        className={inputClass}
                    >
                        {Object.values(InvoiceStatus).map(status => (
                        <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                    </div>
                    <div>
                    <label className={labelClass}>Date</label>
                    <input
                        type="date"
                        value={invoice.date}
                        onChange={e => setInvoice(prev => ({ ...prev, date: e.target.value }))}
                        className={inputClass}
                    />
                    </div>
                    <div>
                    <label className={labelClass}>Due Date</label>
                    <input
                        type="date"
                        value={invoice.dueDate}
                        onChange={e => setInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
                        className={inputClass}
                    />
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
                    <div className="flex justify-between text-slate-600 text-sm">
                    <span>Subtotal</span>
                    <span>₹{invoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 text-sm">
                    <span>GST Total</span>
                    <span>₹{invoice.taxTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-slate-900 pt-2">
                    <span>Total</span>
                    <span className="text-indigo-600">₹{invoice.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </form>
  );
};

export default InvoiceForm;