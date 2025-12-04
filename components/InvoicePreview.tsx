import React, { useState } from 'react';
import { ArrowLeft, Printer, Download, Share2, Mail, Loader2, Trash2, Send } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Invoice, BUSINESS_DETAILS } from '../types';

interface InvoicePreviewProps {
  invoice: Invoice;
  onBack: () => void;
  onDelete: (id: string) => void;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice, onBack, onDelete }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    const element = document.getElementById('invoice-preview-content');
    if (!element) return null;

    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      return pdf;
    } catch (error) {
      console.error("PDF Generation failed", error);
      return null;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    const pdf = await generatePDF();
    if (pdf) {
      pdf.save(`Invoice_${invoice.invoiceNumber}.pdf`);
    } else {
      alert("Failed to generate PDF. Please try using Print -> Save as PDF.");
    }
    setIsGenerating(false);
  };

  const handleSendPDF = async () => {
    setIsGenerating(true);
    try {
      const pdf = await generatePDF();
      if (!pdf) throw new Error("Failed to generate PDF");

      const fileName = `Invoice_${invoice.invoiceNumber}.pdf`;
      const file = new File([pdf.output('blob')], fileName, { type: 'application/pdf' });

      // Try Web Share API first (Mobile/Tablets mostly)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Invoice - ${invoice.customer.name}`,
          text: `Please find attached invoice ${invoice.invoiceNumber} from Aakash Furniture.`
        });
      } else {
        // Fallback for Desktop: Download + Mailto
        pdf.save(fileName);
        
        // Short delay to allow download to register
        setTimeout(() => {
            const subject = `Invoice ${invoice.invoiceNumber} - Aakash Furniture`;
            const body = `Dear ${invoice.customer.name},\n\nPlease find attached invoice ${invoice.invoiceNumber}.\n\nTotal Amount: ₹${invoice.grandTotal}\n\nThank you for your business.\n\nRegards,\nAakash Furniture`;
            
            if(confirm("PDF Downloaded. Would you like to open your email client to send it?")) {
                window.location.href = `mailto:${invoice.customer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            }
        }, 500);
      }
    } catch (error) {
      console.error("Sharing failed", error);
      alert("Could not share automatically. Please download the PDF and share manually.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareWhatsApp = () => {
    const message = `Hello ${invoice.customer.name}, here is your invoice ${invoice.invoiceNumber} from Aakash Furniture for Amount ₹${invoice.grandTotal}.`;
    const url = `https://wa.me/${invoice.customer.phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleEmail = () => {
    const subject = `Invoice ${invoice.invoiceNumber} - Aakash Furniture`;
    const body = `Dear ${invoice.customer.name},\n\nPlease find attached invoice ${invoice.invoiceNumber}.\n\nTotal Amount: ₹${invoice.grandTotal}\n\nThank you for your business.\n\nRegards,\nAakash Furniture`;
    window.location.href = `mailto:${invoice.customer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-5 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 no-print">
        <button
          onClick={onBack}
          className="flex items-center text-slate-600 hover:text-slate-900 font-semibold transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>
        
        <div className="flex flex-wrap gap-3 justify-center">
          <button 
            type="button"
            onClick={() => onDelete(invoice.id)} 
            className="flex items-center px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </button>
          <button 
            type="button"
            onClick={handlePrint} 
            className="flex items-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </button>
          <button 
            type="button"
            onClick={handleDownloadPDF} 
            disabled={isGenerating}
            className="flex items-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            PDF
          </button>
          <button 
            type="button"
            onClick={handleSendPDF} 
            disabled={isGenerating}
            className="flex items-center px-4 py-2.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-medium rounded-xl transition-colors disabled:opacity-50"
            title="Send PDF via Email or Share"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            Send PDF
          </button>
          <button 
            type="button"
            onClick={handleShareWhatsApp} 
            className="flex items-center px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-green-200 hover:-translate-y-0.5"
          >
            <Share2 className="w-4 h-4 mr-2" />
            WhatsApp
          </button>
        </div>
      </div>

      {/* Invoice Paper */}
      <div className="flex justify-center pb-12">
        <div id="invoice-preview-content" className="w-[210mm] min-h-[297mm] bg-white shadow-2xl relative flex flex-col p-12">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-100 pb-8 mb-8">
                <div className="w-2/3">
                    <h1 className="text-4xl font-bold text-indigo-700 tracking-tight mb-2">{BUSINESS_DETAILS.name}</h1>
                    <div className="text-sm text-slate-500 leading-relaxed">
                        <p>{BUSINESS_DETAILS.address}</p>
                        <p className="mt-1">Phone: {BUSINESS_DETAILS.phone1}, {BUSINESS_DETAILS.phone2}</p>
                        <p>Email: {BUSINESS_DETAILS.email}</p>
                        <p className="mt-1 font-semibold text-slate-700">GSTIN: {BUSINESS_DETAILS.gstin}</p>
                    </div>
                </div>
                <div className="w-1/3 text-right">
                    <h2 className="text-5xl font-black text-slate-100 tracking-tighter mb-2">INVOICE</h2>
                    <p className="text-lg font-bold text-slate-700">#{invoice.invoiceNumber}</p>
                    <p className="text-sm text-slate-500">Date: {invoice.date}</p>
                </div>
            </div>

            {/* Client & Details Box */}
            <div className="bg-slate-50 rounded-xl p-8 mb-8 grid grid-cols-2 gap-8">
                <div>
                    <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-4">Billed To</h3>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">{invoice.customer.name}</h4>
                    {invoice.customer.address && (
                        <p className="text-sm text-slate-600 mb-2 leading-relaxed">{invoice.customer.address}</p>
                    )}
                    <div className="text-sm text-slate-600 space-y-1">
                        {invoice.customer.phone && <p>Ph: {invoice.customer.phone}</p>}
                        {invoice.customer.email && <p>Email: {invoice.customer.email}</p>}
                    </div>
                </div>
                <div className="border-l border-slate-200 pl-8">
                    <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-4">Invoice Details</h3>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                        <dt className="text-slate-500">Status</dt>
                        <dd className="font-medium text-slate-900 text-right">
                             <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                invoice.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                             }`}>
                                {invoice.status}
                             </span>
                        </dd>
                        
                        <dt className="text-slate-500">Due Date</dt>
                        <dd className="font-medium text-slate-900 text-right">{invoice.dueDate}</dd>
                        
                        <dt className="text-slate-500">Place of Supply</dt>
                        <dd className="font-medium text-slate-900 text-right">{BUSINESS_DETAILS.jurisdiction}</dd>
                    </dl>
                </div>
            </div>

            {/* Table */}
            <div className="flex-grow">
                <table className="w-full mb-8">
                    <thead>
                        <tr className="bg-indigo-600 text-white">
                            <th className="py-3 px-4 text-left text-xs font-bold uppercase rounded-tl-lg">Item Description</th>
                            <th className="py-3 px-4 text-right text-xs font-bold uppercase">Qty</th>
                            <th className="py-3 px-4 text-right text-xs font-bold uppercase">Rate</th>
                            <th className="py-3 px-4 text-right text-xs font-bold uppercase">GST</th>
                            <th className="py-3 px-4 text-right text-xs font-bold uppercase rounded-tr-lg">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 border-x border-b border-slate-100 rounded-b-lg">
                        {invoice.items.map((item, index) => (
                            <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                <td className="py-4 px-4 text-sm font-medium text-slate-800">{item.description}</td>
                                <td className="py-4 px-4 text-sm text-slate-600 text-right">{item.quantity}</td>
                                <td className="py-4 px-4 text-sm text-slate-600 text-right">₹{item.rate.toLocaleString('en-IN')}</td>
                                <td className="py-4 px-4 text-sm text-slate-500 text-right">{item.gstRate}%</td>
                                <td className="py-4 px-4 text-sm font-bold text-slate-900 text-right">₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-2 gap-12 mb-12">
                {/* Bank Details */}
                <div>
                     <div className="bg-indigo-50 rounded-lg p-5 border border-indigo-100 h-full">
                        <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-3">Bank Details</h4>
                        <div className="space-y-2 text-sm text-slate-700">
                             <div className="flex justify-between">
                                <span className="text-slate-500">Bank Name:</span>
                                <span className="font-medium">INDIAN BANK</span>
                             </div>
                             <div className="flex justify-between">
                                <span className="text-slate-500">Account No:</span>
                                <span className="font-medium">CA 7184276999</span>
                             </div>
                             <div className="flex justify-between">
                                <span className="text-slate-500">IFSC Code:</span>
                                <span className="font-medium">IDIB000K735</span>
                             </div>
                        </div>
                     </div>
                </div>

                {/* Totals */}
                <div className="space-y-3">
                    <div className="flex justify-between text-sm text-slate-600 py-1">
                        <span>Subtotal</span>
                        <span>₹{invoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-600 py-1 border-b border-slate-200">
                        <span>GST Total</span>
                        <span>₹{invoice.taxTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                        <span className="text-base font-bold text-slate-800">Grand Total</span>
                        <span className="text-2xl font-bold text-indigo-600">₹{invoice.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-auto border-t border-slate-100 pt-6">
                 <div className="flex justify-between items-end">
                    <div className="w-1/2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Terms & Conditions</h4>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                            Goods once sold will not be taken back. <br/>
                            Subject to {BUSINESS_DETAILS.jurisdiction} Jurisdiction.
                        </p>
                    </div>
                     <div className="text-center">
                        <div className="h-16 w-40 mb-2 flex items-end justify-center">
                             {/* Signature Placeholder area */}
                        </div>
                        <p className="text-xs font-bold text-slate-900 uppercase tracking-wider border-t border-slate-300 pt-2 px-4">Authorized Signatory</p>
                    </div>
                 </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;