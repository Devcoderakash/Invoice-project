import React from 'react';
import { Eye, Edit, Trash2, IndianRupee, FileText, Clock, TrendingUp } from 'lucide-react';
import { Invoice, InvoiceStatus } from '../types';
import { STATUS_COLORS } from '../constants';

interface DashboardProps {
  invoices: Invoice[];
  onCreate: () => void;
  onEdit: (invoice: Invoice) => void;
  onView: (invoice: Invoice) => void;
  onDelete: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ invoices, onCreate, onEdit, onView, onDelete }) => {
  
  // Calculate stats
  const totalRevenue = invoices
    .filter(i => i.status === InvoiceStatus.Paid)
    .reduce((acc, curr) => acc + curr.grandTotal, 0);

  const pendingAmount = invoices
    .filter(i => i.status === InvoiceStatus.Pending || i.status === InvoiceStatus.Overdue)
    .reduce((acc, curr) => acc + curr.grandTotal, 0);
    
  const totalInvoices = invoices.length;

  const StatCard = ({ title, value, icon: Icon, gradient }: any) => (
    <div className={`relative overflow-hidden rounded-2xl p-6 shadow-xl text-white ${gradient} transform hover:-translate-y-1 transition-transform duration-300`}>
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-white/80 text-sm font-medium mb-2 tracking-wide uppercase">{title}</p>
          <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
        </div>
        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md">
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      {/* Decorative circle */}
      <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of your business performance</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`₹${totalRevenue.toLocaleString('en-IN')}`} 
          icon={IndianRupee} 
          gradient="bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-200"
        />
        <StatCard 
          title="Pending Amount" 
          value={`₹${pendingAmount.toLocaleString('en-IN')}`} 
          icon={Clock} 
          gradient="bg-gradient-to-br from-amber-400 to-orange-500 shadow-orange-200"
        />
        <StatCard 
          title="Total Invoices" 
          value={totalInvoices} 
          icon={FileText} 
          gradient="bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-200"
        />
      </div>

      {/* Invoice List */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            Recent Invoices
          </h2>
          <button 
            type="button"
            onClick={onCreate}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
          >
            Create New +
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th scope="col" className="px-8 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice #</th>
                <th scope="col" className="px-8 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-8 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                <th scope="col" className="px-8 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-8 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-8 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <FileText className="h-12 w-12 mb-3 text-slate-200" />
                      <p className="text-lg font-medium text-slate-500">No invoices yet</p>
                      <p className="text-sm">Create your first invoice to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer relative" onClick={() => onView(invoice)}>
                    <td className="px-8 py-5 whitespace-nowrap text-sm font-semibold text-indigo-600">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-500">
                      {invoice.date}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-slate-900">
                      {invoice.customer.name}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-900 font-bold">
                      ₹{invoice.grandTotal.toLocaleString('en-IN')}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${STATUS_COLORS[invoice.status] || 'bg-gray-100 text-gray-800'}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                      {/* Added relative and z-index to ensure buttons are above the row click area */}
                      <div className="flex justify-end space-x-2 relative z-20">
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onView(invoice); }}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onEdit(invoice); }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onDelete(invoice.id); }}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;