import React, { useState, useEffect } from 'react';
import { Sofa, Plus, LayoutDashboard } from 'lucide-react';
import { Invoice, InvoiceStatus, ViewMode } from './types';
import { getInvoices, saveInvoice, deleteInvoice } from './services/storageService';
import Dashboard from './components/Dashboard';
import InvoiceForm from './components/InvoiceForm';
import InvoicePreview from './components/InvoicePreview';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>('dashboard');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | undefined>(undefined);

  // Load data on mount
  useEffect(() => {
    refreshInvoices();
  }, []);

  const refreshInvoices = () => {
    setInvoices(getInvoices());
  };

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

  const handleDelete = (id: string) => {
    // 1. Confirm deletion
    if (!window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      return;
    }

    // 2. Perform deletion in storage
    deleteInvoice(id);

    // 3. Immediately refresh the list from storage to ensure UI sync
    const updatedInvoices = getInvoices();
    setInvoices(updatedInvoices);
    
    // 4. If the deleted invoice is currently selected/viewed, return to dashboard
    if (selectedInvoice && selectedInvoice.id === id) {
      setSelectedInvoice(undefined);
      setView('dashboard');
    }
  };

  const handleSave = (invoice: Invoice) => {
    saveInvoice(invoice);
    refreshInvoices();
    setView('dashboard');
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
    setSelectedInvoice(undefined);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div 
              className="flex items-center space-x-3 cursor-pointer group" 
              onClick={handleBackToDashboard}
            >
              <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-indigo-200 shadow-lg group-hover:scale-105 transition-transform duration-200">
                <Sofa className="h-6 w-6" />
              </div>
              <div>
                <span className="font-bold text-xl text-slate-800 tracking-tight block">Aakash Furniture</span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              {view !== 'dashboard' && (
                <button
                  onClick={handleBackToDashboard}
                  className="flex items-center px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </button>
              )}
              {view === 'dashboard' && (
                <button
                  onClick={handleCreate}
                  className="flex items-center px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-200 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Invoice
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {view === 'dashboard' && (
            <Dashboard 
              invoices={invoices}
              onCreate={handleCreate}
              onEdit={handleEdit}
              onView={handleView}
              onDelete={handleDelete}
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
              onDelete={handleDelete}
            />
          )}
        </div>
      </main>
      
      <footer className="border-t border-slate-200 bg-white py-8 mt-auto no-print">
        <div className="text-center">
          <p className="text-sm text-slate-500 font-medium">&copy; {new Date().getFullYear()} Aakash Furniture.</p>
          <p className="text-xs text-slate-400 mt-1">Professional Invoicing System</p>
        </div>
      </footer>
    </div>
  );
};

export default App;