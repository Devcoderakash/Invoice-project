import React, { useState, useEffect, useCallback } from 'react';
import { Sofa, Plus, LayoutDashboard, Sparkles } from 'lucide-react';
import { Invoice, InvoiceStatus, ViewMode } from './types';
import { 
  getInvoices, 
  saveInvoice, 
  deleteInvoice, 
  duplicateInvoice, 
  exportInvoicesJSON, 
  importInvoicesJSON, 
  seedSampleInvoices 
} from './services/storageService';
import Dashboard from './components/Dashboard';
import InvoiceForm from './components/InvoiceForm';
import InvoicePreview from './components/InvoicePreview';
import { ToastContainer, ToastMessage, ToastType } from './components/Toast';
import ConfirmModal from './components/ConfirmModal';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>('dashboard');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | undefined>(undefined);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    invoiceId: string;
    invoiceNumber: string;
    customerName: string;
  }>({
    isOpen: false,
    invoiceId: '',
    invoiceNumber: '',
    customerName: '',
  });

  // Load data on mount
  useEffect(() => {
    refreshInvoices();
  }, []);

  const refreshInvoices = () => {
    const list = getInvoices();
    setInvoices(list);
  };

  const showToast = useCallback(
    (title: string, message?: string, type: ToastType = 'info') => {
      const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
      setToasts((prev) => [...prev, { id, title, message, type }]);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleCreate = () => {
    setSelectedInvoice(undefined);
    setView('create');
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setView('edit');
  };

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setView('view');
  };

  const handleDuplicate = (invoice: Invoice) => {
    const duplicated = duplicateInvoice(invoice);
    saveInvoice(duplicated);
    refreshInvoices();
    setSelectedInvoice(duplicated);
    setView('edit');
    showToast(
      'Invoice Cloned',
      `Created draft ${duplicated.invoiceNumber} from ${invoice.invoiceNumber}.`,
      'success'
    );
  };

  const handleDeletePrompt = (id: string, invoiceNumber: string, customerName: string) => {
    setDeleteModal({
      isOpen: true,
      invoiceId: id,
      invoiceNumber,
      customerName,
    });
  };

  const handleConfirmDelete = () => {
    const { invoiceId, invoiceNumber } = deleteModal;
    deleteInvoice(invoiceId);
    refreshInvoices();

    if (selectedInvoice && selectedInvoice.id === invoiceId) {
      setSelectedInvoice(undefined);
      setView('dashboard');
    }

    setDeleteModal({
      isOpen: false,
      invoiceId: '',
      invoiceNumber: '',
      customerName: '',
    });

    showToast('Invoice Deleted', `Invoice ${invoiceNumber} was removed.`, 'info');
  };

  const handleCancelDelete = () => {
    setDeleteModal({
      isOpen: false,
      invoiceId: '',
      invoiceNumber: '',
      customerName: '',
    });
  };

  const handleSave = (invoice: Invoice) => {
    saveInvoice(invoice);
    refreshInvoices();
    setSelectedInvoice(invoice);
    setView('view');
    showToast(
      'Invoice Saved',
      `Invoice ${invoice.invoiceNumber} for ${invoice.customer.name} saved successfully.`,
      'success'
    );
  };

  const handleStatusChange = (newStatus: InvoiceStatus) => {
    if (!selectedInvoice) return;
    const updated: Invoice = {
      ...selectedInvoice,
      status: newStatus,
    };
    saveInvoice(updated);
    refreshInvoices();
    setSelectedInvoice(updated);
    showToast(
      'Status Updated',
      `Invoice ${updated.invoiceNumber} marked as ${newStatus}.`,
      'success'
    );
  };

  const handleExport = () => {
    const json = exportInvoicesJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Aakash_Furniture_Invoices_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup Exported', `Downloaded ${invoices.length} invoices as JSON.`, 'success');
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const res = importInvoicesJSON(content);
      if (res.success) {
        refreshInvoices();
        showToast('Restore Complete', `Successfully imported ${res.count} invoices.`, 'success');
      } else {
        showToast('Import Failed', res.error || 'Failed to read file', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSamples = () => {
    const samples = seedSampleInvoices();
    refreshInvoices();
    showToast(
      'Sample Records Loaded',
      `Loaded ${samples.length} realistic furniture invoices for demonstration.`,
      'success'
    );
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
    setSelectedInvoice(undefined);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 no-print transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo & Name */}
            <div
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={handleBackToDashboard}
            >
              <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-200 group-hover:scale-105 group-hover:bg-indigo-700 transition-all duration-200">
                <Sofa className="h-6 w-6" />
              </div>
              <div>
                <span className="font-extrabold text-xl text-slate-900 tracking-tight block">
                  Aakash Furniture
                </span>
                <span className="text-[11px] font-semibold text-slate-400 block tracking-wide">
                  GST Invoicing System • Bhopal
                </span>
              </div>
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center space-x-3">
              {view !== 'dashboard' ? (
                <button
                  type="button"
                  onClick={handleBackToDashboard}
                  className="flex items-center px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4 mr-2 text-slate-500" />
                  Dashboard
                </button>
              ) : (
                <>
                  {invoices.length === 0 && (
                    <button
                      type="button"
                      onClick={handleLoadSamples}
                      className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Load Samples
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCreate}
                    className="flex items-center px-4 sm:px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-200 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95"
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    New Invoice
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Viewport */}
      <main className="flex-grow py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {view === 'dashboard' && (
            <Dashboard
              invoices={invoices}
              onCreate={handleCreate}
              onEdit={handleEdit}
              onView={handleView}
              onDelete={handleDeletePrompt}
              onDuplicate={handleDuplicate}
              onExport={handleExport}
              onImport={handleImport}
              onLoadSamples={handleLoadSamples}
            />
          )}

          {(view === 'create' || view === 'edit') && (
            <InvoiceForm
              initialData={selectedInvoice}
              onSave={handleSave}
              onCancel={handleBackToDashboard}
            />
          )}

          {view === 'view' && selectedInvoice && (
            <InvoicePreview
              invoice={selectedInvoice}
              onBack={handleBackToDashboard}
              onEdit={handleEdit}
              onDelete={handleDeletePrompt}
              onStatusChange={handleStatusChange}
              onShowToast={showToast}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto no-print">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs font-semibold text-slate-500">
            &copy; {new Date().getFullYear()} Aakash Furniture — Kolar Road, Bhopal (M.P.). All rights reserved.
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            GSTIN: 23ALVPL7961R2ZW • Intra-state & Inter-state Commercial Invoicing
          </p>
        </div>
      </footer>

      {/* Toast Feedback Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Custom Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Invoice?"
        message={`Are you sure you want to delete invoice ${deleteModal.invoiceNumber} for "${deleteModal.customerName}"? This record will be permanently removed.`}
        confirmLabel="Delete Invoice"
        cancelLabel="Keep Invoice"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default App;