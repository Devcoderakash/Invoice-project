import React, { useState, useMemo } from 'react';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Copy, 
  Search, 
  IndianRupee, 
  FileText, 
  Clock, 
  Plus, 
  Download, 
  Upload, 
  Sparkles,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { Invoice, InvoiceStatus } from '../types';
import { STATUS_CONFIG } from '../constants';
import { formatINR } from '../services/calculationService';

interface DashboardProps {
  invoices: Invoice[];
  onCreate: () => void;
  onEdit: (invoice: Invoice) => void;
  onView: (invoice: Invoice) => void;
  onDelete: (id: string, invoiceNumber: string, customerName: string) => void;
  onDuplicate: (invoice: Invoice) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onLoadSamples: () => void;
}

type SortField = 'date' | 'amount' | 'invoiceNumber';
type SortOrder = 'asc' | 'desc';

export const Dashboard: React.FC<DashboardProps> = ({
  invoices,
  onCreate,
  onEdit,
  onView,
  onDelete,
  onDuplicate,
  onExport,
  onImport,
  onLoadSamples,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Calculate metrics
  const { totalRevenue, pendingAmount, overdueAmount, paidCount, aov } = useMemo(() => {
    let rev = 0;
    let pending = 0;
    let overdue = 0;
    let paid = 0;

    for (const inv of invoices) {
      if (inv.status === InvoiceStatus.Paid) {
        rev += inv.grandTotal;
        paid++;
      } else if (inv.status === InvoiceStatus.Overdue) {
        overdue += inv.grandTotal;
      } else if (inv.status === InvoiceStatus.Pending) {
        pending += inv.grandTotal;
      }
    }

    return {
      totalRevenue: rev,
      pendingAmount: pending + overdue,
      overdueAmount: overdue,
      paidCount: paid,
      aov: paid > 0 ? rev / paid : 0,
    };
  }, [invoices]);

  // Filter & Sort
  const filteredInvoices = useMemo(() => {
    return invoices
      .filter((inv) => {
        // Status filter
        if (statusFilter !== 'ALL' && inv.status !== statusFilter) {
          return false;
        }

        // Search term
        if (searchTerm.trim() !== '') {
          const q = searchTerm.toLowerCase();
          const matchNumber = inv.invoiceNumber.toLowerCase().includes(q);
          const matchName = inv.customer.name.toLowerCase().includes(q);
          const matchPhone = inv.customer.phone.toLowerCase().includes(q);
          const matchEmail = (inv.customer.email || '').toLowerCase().includes(q);
          return matchNumber || matchName || matchPhone || matchEmail;
        }

        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortField === 'date') {
          cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
        } else if (sortField === 'amount') {
          cmp = a.grandTotal - b.grandTotal;
        } else if (sortField === 'invoiceNumber') {
          cmp = a.invoiceNumber.localeCompare(b.invoiceNumber);
        }
        return sortOrder === 'desc' ? -cmp : cmp;
      });
  }, [invoices, statusFilter, searchTerm, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Billing Dashboard
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage your furniture sales, track GST invoices, and monitor revenue
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-all hover:border-slate-300">
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Restore</span>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileInputChange}
            />
          </label>

          {invoices.length > 0 && (
            <button
              type="button"
              onClick={onExport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-all hover:border-slate-300"
              title="Export all invoices as JSON backup"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Backup</span>
            </button>
          )}

          <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Collected */}
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white shadow-xl shadow-indigo-200/50">
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1.5">
                Total Revenue (Paid)
              </p>
              <h3 className="text-3xl font-extrabold tracking-tight">
                {formatINR(totalRevenue)}
              </h3>
              <p className="text-xs text-indigo-200 mt-2 font-medium">
                From {paidCount} completed sales
              </p>
            </div>
            <div className="bg-white/15 p-3 rounded-xl backdrop-blur-md">
              <IndianRupee className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        {/* Pending / Overdue */}
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white shadow-xl shadow-amber-200/50">
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-amber-100 text-xs font-bold uppercase tracking-wider mb-1.5">
                Outstanding Balance
              </p>
              <h3 className="text-3xl font-extrabold tracking-tight">
                {formatINR(pendingAmount)}
              </h3>
              <p className="text-xs text-amber-100 mt-2 font-medium">
                {overdueAmount > 0
                  ? `Includes ${formatINR(overdueAmount)} overdue`
                  : 'All currently within due date'}
              </p>
            </div>
            <div className="bg-white/15 p-3 rounded-xl backdrop-blur-md">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        {/* Total Invoices & AOV */}
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-teal-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-200/50">
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-teal-100 text-xs font-bold uppercase tracking-wider mb-1.5">
                Total Invoices
              </p>
              <h3 className="text-3xl font-extrabold tracking-tight">
                {invoices.length}
              </h3>
              <p className="text-xs text-teal-100 mt-2 font-medium">
                {aov > 0 ? `Avg ticket: ${formatINR(aov)}` : 'No completed sales yet'}
              </p>
            </div>
            <div className="bg-white/15 p-3 rounded-xl backdrop-blur-md">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
        {/* Controls: Search, Filter Tabs, Sort */}
        <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
            {['ALL', InvoiceStatus.Paid, InvoiceStatus.Pending, InvoiceStatus.Overdue, InvoiceStatus.Draft].map((status) => {
              const count =
                status === 'ALL'
                  ? invoices.length
                  : invoices.filter((i) => i.status === status).length;
              const isActive = statusFilter === status;

              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{status === 'ALL' ? 'All Invoices' : status}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'bg-slate-200/80 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by customer, invoice #, phone..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Invoices List / Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr className="bg-slate-50/70">
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-800"
                  onClick={() => toggleSort('invoiceNumber')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Invoice #</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-800"
                  onClick={() => toggleSort('date')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Date & Due</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Customer & Items
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-800"
                  onClick={() => toggleSort('amount')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Grand Total</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    {invoices.length === 0 ? (
                      <div className="max-w-md mx-auto flex flex-col items-center">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 shadow-sm">
                          <FileText className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">
                          No Invoices Yet
                        </h3>
                        <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                          Start creating professional GST invoices for Aakash Furniture customers, or load sample records to explore.
                        </p>
                        <div className="flex flex-wrap gap-3 mt-6">
                          <button
                            type="button"
                            onClick={onCreate}
                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-indigo-200 transition-all"
                          >
                            Create First Invoice
                          </button>
                          <button
                            type="button"
                            onClick={onLoadSamples}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-all"
                          >
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                            Load Sample Invoices
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 py-6">
                        <Filter className="w-8 h-8 text-slate-300 mb-2" />
                        <p className="text-base font-semibold text-slate-700">
                          No matching invoices
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          No invoices match "{searchTerm}" with status "{statusFilter}".
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('ALL');
                          }}
                          className="mt-4 text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline"
                        >
                          Reset filters
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => {
                  const statusConf = STATUS_CONFIG[invoice.status] || STATUS_CONFIG[InvoiceStatus.Draft];

                  return (
                    <tr
                      key={invoice.id}
                      onClick={() => onView(invoice)}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    >
                      {/* Invoice Number */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-mono text-sm font-bold text-indigo-600 group-hover:text-indigo-800">
                          {invoice.invoiceNumber}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {invoice.isInterState ? 'Inter-state (IGST)' : 'Intra-state (MP)'}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-700">
                          {invoice.date}
                        </div>
                        <div className="text-xs text-slate-400">
                          Due: {invoice.dueDate}
                        </div>
                      </td>

                      {/* Customer & Item count */}
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-900">
                          {invoice.customer.name}
                        </div>
                        <div className="text-xs text-slate-500 truncate max-w-xs">
                          {invoice.customer.phone || invoice.customer.address || 'Walk-in Customer'}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {invoice.items.length} item{invoice.items.length !== 1 ? 's' : ''}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-base font-extrabold text-slate-900">
                          {formatINR(invoice.grandTotal)}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Tax: {formatINR(invoice.taxTotal)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusConf.badgeClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dotClass}`} />
                          {statusConf.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div
                          className="flex items-center justify-end gap-1 relative z-10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => onView(invoice)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View / Print / Share Invoice"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEdit(invoice)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Invoice"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDuplicate(invoice)}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Clone / Duplicate this invoice"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onDelete(invoice.id, invoice.invoiceNumber, invoice.customer.name)
                            }
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Invoice"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;