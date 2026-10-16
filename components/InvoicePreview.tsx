import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  Share2, 
  Mail, 
  Loader2, 
  Trash2, 
  Send, 
  Edit, 
  Copy, 
  Check, 
  IndianRupee,
  Building2,
  Calendar,
  FileCheck
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Invoice, InvoiceStatus, BUSINESS_DETAILS } from '../types';
import { STATUS_CONFIG } from '../constants';
import { formatINR, formatAmount, numberToWordsIndian } from '../services/calculationService';

interface InvoicePreviewProps {
  invoice: Invoice;
  onBack: () => void;
  onEdit: (invoice: Invoice) => void;
  onDelete: (id: string, invoiceNumber: string, customerName: string) => void;
  onStatusChange: (newStatus: InvoiceStatus) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  invoice,
  onBack,
  onEdit,
  onDelete,
  onStatusChange,
  onShowToast,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generatePDF = async () => {
    const element = document.getElementById('invoice-preview-content');
    if (!element) return null;

    try {
      // High resolution capture
      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      return pdf;
    } catch (error) {
      console.error('PDF Generation failed', error);
      return null;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const pdf = await generatePDF();
      if (pdf) {
        pdf.save(`Invoice_${invoice.invoiceNumber}.pdf`);
        onShowToast('PDF Downloaded', `Invoice ${invoice.invoiceNumber} saved successfully.`, 'success');
      } else {
        onShowToast('PDF Generation Failed', 'Please try using Print -> Save as PDF.', 'error');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendPDF = async () => {
    setIsGenerating(true);
    try {
      const pdf = await generatePDF();
      if (!pdf) throw new Error('Failed to generate PDF');

      const fileName = `Invoice_${invoice.invoiceNumber}.pdf`;
      const file = new File([pdf.output('blob')], fileName, { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Invoice #${invoice.invoiceNumber} — Aakash Furniture`,
          text: `Please find attached GST invoice ${invoice.invoiceNumber} for ${formatINR(invoice.grandTotal)} from Aakash Furniture, Bhopal.`,
        });
        onShowToast('Shared Successfully', 'Invoice shared via system dialog.', 'success');
      } else {
        // Fallback: download and offer mailto
        pdf.save(fileName);
        const subject = `Invoice ${invoice.invoiceNumber} - Aakash Furniture`;
        const body = `Dear ${invoice.customer.name},\n\nPlease find attached invoice ${invoice.invoiceNumber} from Aakash Furniture.\n\nTotal Amount: ${formatINR(invoice.grandTotal)}\nStatus: ${invoice.status}\n\nThank you for choosing Aakash Furniture.\n\nBest Regards,\nAakash Furniture\nKolar Road, Bhopal (M.P.)\nPhone: ${BUSINESS_DETAILS.phone1}`;
        window.location.href = `mailto:${invoice.customer.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        onShowToast('PDF Downloaded', 'Opening email draft with invoice details.', 'info');
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Sharing failed', error);
        onShowToast('Sharing Cancelled', 'You can download the PDF and share manually.', 'info');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareWhatsApp = () => {
    const message = `*AAKASH FURNITURE — TAX INVOICE*\n\n` +
      `Dear *${invoice.customer.name}*,\n` +
      `Thank you for your order! Here are the details of your invoice:\n\n` +
      `📄 *Invoice No:* ${invoice.invoiceNumber}\n` +
      `📅 *Date:* ${invoice.date}\n` +
      `💰 *Total Amount:* ${formatINR(invoice.grandTotal)}\n` +
      `🏷️ *Status:* ${invoice.status}\n` +
      `🏦 *Bank Account:* ${BUSINESS_DETAILS.bankDetails.accountNumber} (${BUSINESS_DETAILS.bankDetails.bankName})\n` +
      `⚡ *IFSC:* ${BUSINESS_DETAILS.bankDetails.ifscCode}\n\n` +
      `For any questions, feel free to contact us at ${BUSINESS_DETAILS.phone1}.\n\n` +
      `_Aakash Furniture, Kolar Road, Bhopal (M.P.)_`;

    let cleanPhone = (invoice.customer.phone || '').replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone;
    }

    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');
    onShowToast('WhatsApp Opened', 'Redirecting to WhatsApp with invoice summary.', 'success');
  };

  const handleCopySummary = () => {
    const summary = `Invoice #${invoice.invoiceNumber} | Customer: ${invoice.customer.name} | Total: ${formatINR(invoice.grandTotal)} | Status: ${invoice.status}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    onShowToast('Copied to Clipboard', 'Invoice summary copied.', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const statusConfig = STATUS_CONFIG[invoice.status] || STATUS_CONFIG[InvoiceStatus.Draft];

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Top Action Bar */}
      <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4 bg-white p-5 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 no-print">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Dashboard
          </button>

          {/* Quick status selector */}
          <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <select
              value={invoice.status}
              onChange={(e) => onStatusChange(e.target.value as InvoiceStatus)}
              className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {Object.values(InvoiceStatus).map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            title="Copy summary text"
          >
            {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
            {copied ? 'Copied' : 'Copy'}
          </button>

          <button
            type="button"
            onClick={() => onEdit(invoice)}
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all"
          >
            <Edit className="w-3.5 h-3.5 mr-1" />
            Edit
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            <Printer className="w-3.5 h-3.5 mr-1" />
            Print
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5 mr-1.5" />
            )}
            Download PDF
          </button>

          <button
            type="button"
            onClick={handleSendPDF}
            disabled={isGenerating}
            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-xl transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            Share PDF
          </button>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-200 hover:-translate-y-0.5"
          >
            <Share2 className="w-3.5 h-3.5 mr-1.5" />
            WhatsApp
          </button>

          <button
            type="button"
            onClick={() => onDelete(invoice.id, invoice.invoiceNumber, invoice.customer.name)}
            className="inline-flex items-center px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
            title="Delete this invoice"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Invoice Paper Document (A4 Proportion) */}
      <div className="flex justify-center">
        <div
          id="invoice-preview-content"
          className="w-full max-w-[210mm] min-h-[297mm] bg-white shadow-2xl rounded-sm p-10 sm:p-14 text-slate-800 flex flex-col justify-between border border-slate-200"
        >
          {/* Top Header */}
          <div>
            <div className="flex justify-between items-start border-b-2 border-indigo-600 pb-6 mb-6">
              <div className="w-3/5">
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest block mb-1">
                  Tax Invoice
                </span>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  {BUSINESS_DETAILS.name}
                </h1>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  {BUSINESS_DETAILS.tagline}
                </p>
                <div className="text-xs text-slate-600 mt-2 leading-relaxed space-y-0.5">
                  <p>{BUSINESS_DETAILS.address}</p>
                  <p>
                    <span className="font-semibold text-slate-700">Phone:</span>{' '}
                    {BUSINESS_DETAILS.phone1}, {BUSINESS_DETAILS.phone2}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Email:</span>{' '}
                    {BUSINESS_DETAILS.email}
                  </p>
                  <p className="font-bold text-slate-800">
                    GSTIN: {BUSINESS_DETAILS.gstin} | State Code: {BUSINESS_DETAILS.stateCode} ({BUSINESS_DETAILS.state})
                  </p>
                </div>
              </div>

              <div className="w-2/5 text-right">
                <div className="inline-block bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-right mb-2">
                  <span className="text-xs font-bold text-slate-500 block uppercase">
                    Invoice No.
                  </span>
                  <span className="text-xl font-black text-indigo-700 font-mono block">
                    {invoice.invoiceNumber}
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <p>
                    <span className="text-slate-500">Invoice Date:</span>{' '}
                    <span className="font-bold text-slate-800">{invoice.date}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Due Date:</span>{' '}
                    <span className="font-bold text-slate-800">{invoice.dueDate}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Place of Supply:</span>{' '}
                    <span className="font-bold text-slate-800">{BUSINESS_DETAILS.jurisdiction}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Billed To / Buyer Details & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/80 rounded-xl p-5 border border-slate-200/70 mb-6">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block mb-1.5">
                  Billed To / Buyer:
                </span>
                <h4 className="text-lg font-extrabold text-slate-900 mb-1">
                  {invoice.customer.name}
                </h4>
                {invoice.customer.address && (
                  <p className="text-xs text-slate-600 leading-relaxed mb-1.5">
                    {invoice.customer.address}
                  </p>
                )}
                <div className="text-xs text-slate-600 space-y-0.5">
                  {invoice.customer.phone && (
                    <p>
                      <span className="font-medium text-slate-500">Ph:</span> {invoice.customer.phone}
                    </p>
                  )}
                  {invoice.customer.email && (
                    <p>
                      <span className="font-medium text-slate-500">Email:</span> {invoice.customer.email}
                    </p>
                  )}
                  {invoice.customer.gstin && (
                    <p className="font-bold text-slate-800">
                      <span>GSTIN:</span> {invoice.customer.gstin}
                    </p>
                  )}
                </div>
              </div>

              <div className="sm:border-l sm:border-slate-200 sm:pl-6 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                    Invoice Metadata:
                  </span>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Payment Status:</span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[11px] border ${statusConfig.badgeClass}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tax Type:</span>
                      <span className="font-semibold text-slate-800">
                        {invoice.isInterState ? 'Inter-State (IGST)' : 'Intra-State (CGST + SGST)'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Payment Mode:</span>
                      <span className="font-semibold text-slate-800">
                        {invoice.paymentMethod || 'UPI / Cash'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="mb-6 overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-indigo-600 text-white text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3 text-center w-10 font-bold">#</th>
                    <th className="py-2.5 px-4 font-bold">Item Description</th>
                    <th className="py-2.5 px-3 text-center w-16 font-bold">HSN</th>
                    <th className="py-2.5 px-3 text-right w-12 font-bold">Qty</th>
                    <th className="py-2.5 px-3 text-right w-24 font-bold">Rate</th>
                    <th className="py-2.5 px-3 text-right w-24 font-bold">Taxable</th>
                    <th className="py-2.5 px-3 text-center w-14 font-bold">GST</th>
                    <th className="py-2.5 px-4 text-right w-28 font-bold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {invoice.items.map((item, idx) => (
                    <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                      <td className="py-3 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{item.description}</td>
                      <td className="py-3 px-3 text-center font-mono text-slate-500">
                        {item.hsnCode || '9403'}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-700">{item.quantity}</td>
                      <td className="py-3 px-3 text-right text-slate-700">₹{formatAmount(item.rate)}</td>
                      <td className="py-3 px-3 text-right font-medium text-slate-800">
                        ₹{formatAmount(item.taxableAmount)}
                      </td>
                      <td className="py-3 px-3 text-center font-medium text-slate-600">{item.gstRate}%</td>
                      <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                        ₹{formatAmount(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary & Bank Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              {/* Bank Details */}
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <h5 className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                    Bank Details for NEFT / RTGS / UPI
                  </h5>
                  <div className="text-xs text-slate-700 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Bank Name:</span>
                      <span className="font-bold text-slate-900">{BUSINESS_DETAILS.bankDetails.bankName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Account Name:</span>
                      <span className="font-semibold text-slate-800">{BUSINESS_DETAILS.bankDetails.accountName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Account No:</span>
                      <span className="font-mono font-bold text-indigo-700">{BUSINESS_DETAILS.bankDetails.accountNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">IFSC Code:</span>
                      <span className="font-mono font-bold text-slate-900">{BUSINESS_DETAILS.bankDetails.ifscCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Branch:</span>
                      <span className="text-slate-800">{BUSINESS_DETAILS.bankDetails.branch}</span>
                    </div>
                  </div>
                </div>

                {invoice.notes && (
                  <div className="mt-3 pt-3 border-t border-indigo-100/80 text-[11px] text-slate-600 italic">
                    <span className="font-semibold text-slate-700 not-italic">Notes: </span>
                    {invoice.notes}
                  </div>
                )}
              </div>

              {/* Totals Calculation Box */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Subtotal (Taxable Value):</span>
                  <span className="font-semibold text-slate-900">₹{formatAmount(invoice.subtotal)}</span>
                </div>

                {!invoice.isInterState ? (
                  <>
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>CGST (Central Tax):</span>
                      <span className="font-semibold text-slate-800">₹{formatAmount(invoice.cgstTotal)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>SGST (State Tax MP):</span>
                      <span className="font-semibold text-slate-800">₹{formatAmount(invoice.sgstTotal)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>IGST (Integrated Tax):</span>
                    <span className="font-semibold text-slate-800">₹{formatAmount(invoice.igstTotal)}</span>
                  </div>
                )}

                <div className="flex justify-between text-xs text-slate-600 border-t border-slate-200/70 pt-1.5 font-medium">
                  <span>Total Tax (GST):</span>
                  <span className="font-bold text-slate-900">₹{formatAmount(invoice.taxTotal)}</span>
                </div>

                <div className="flex justify-between items-baseline pt-2 border-t-2 border-slate-900">
                  <span className="text-sm font-black text-slate-900 uppercase">Grand Total:</span>
                  <span className="text-2xl font-black text-indigo-700">
                    ₹{formatAmount(invoice.grandTotal)}
                  </span>
                </div>

                <div className="pt-2 text-[11px] text-slate-600 font-medium leading-relaxed italic border-t border-slate-100">
                  <span className="font-bold text-slate-700 not-italic">Amount in Words: </span>
                  {numberToWordsIndian(invoice.grandTotal)}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer & Signatory */}
          <div className="pt-6 border-t-2 border-slate-200 mt-auto">
            <div className="flex justify-between items-end">
              <div className="w-3/5">
                <h6 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Terms & Conditions
                </h6>
                <ol className="text-[10px] text-slate-500 leading-relaxed list-decimal pl-3 space-y-0.5">
                  <li>Goods once sold will not be returned or exchanged.</li>
                  <li>1-Year Craftsmanship Guarantee on Solid Wood and Modular Furniture.</li>
                  <li>Subject to {BUSINESS_DETAILS.jurisdiction} Jurisdiction only.</li>
                </ol>
              </div>

              <div className="text-center w-2/5 flex flex-col items-end">
                <div className="text-right mb-10">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    For {BUSINESS_DETAILS.name}
                  </span>
                </div>
                <div className="border-t border-slate-400 pt-1.5 px-6 text-center">
                  <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider block">
                    Authorized Signatory
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;