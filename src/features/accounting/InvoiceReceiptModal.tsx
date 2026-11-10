import React, { useEffect, useState } from 'react';
import { X, Printer, CheckCircle2, Building2, Download, AlertCircle } from 'lucide-react';

interface ReceiptItem {
  name: string;
  quantity: number;
  unit_price: string;
  total: string;
}

interface ReceiptData {
  invoice_number: string;
  receipt_number: string;
  transaction_ref: string;
  provider: string;
  payment_status: string;
  paid_at: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: ReceiptItem[];
  subtotal: string;
  shipping_fee: string;
  vat: string;
  total_paid: string;
  company: {
    name: string;
    tagline: string;
    address: string;
    support_email: string;
    tin: string;
  };
}

interface InvoiceReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId?: string;
  orderId?: string;
  initialData?: Partial<ReceiptData>;
}

export const InvoiceReceiptModal: React.FC<InvoiceReceiptModalProps> = ({
  isOpen,
  onClose,
  paymentId,
  initialData,
}) => {
  const [data, setData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    if (initialData && initialData.receipt_number) {
      setData(initialData as ReceiptData);
      return;
    }

    // Default sample data for instant preview if no live payment ID selected
    const mockReceipt: ReceiptData = {
      invoice_number: 'HM-INV-892401',
      receipt_number: 'HM-REC-892401',
      transaction_ref: 'pstk_ref_' + Math.random().toString(36).substring(7).toUpperCase(),
      provider: 'PAYSTACK',
      payment_status: 'SUCCESSFUL',
      paid_at: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      customer: {
        name: 'Fatima Aliyu',
        email: 'fatima.aliyu@example.com',
        phone: '+234 803 456 7890',
      },
      items: [
        { name: 'Original Kano Leather Loafers (Brown - 42)', quantity: 1, unit_price: '₦28,500.00', total: '₦28,500.00' },
        { name: 'Embroidered Traditional Kaftan (Blue)', quantity: 1, unit_price: '₦35,000.00', total: '₦35,000.00' },
      ],
      subtotal: '₦63,500.00',
      shipping_fee: '₦2,500.00',
      vat: '₦4,762.50',
      total_paid: '₦70,762.50',
      company: {
        name: 'Hamads Marketplace Ltd',
        tagline: 'Multi-Vendor E-Commerce & Financial Core',
        address: 'Kano & Abuja, Nigeria',
        support_email: 'finance@hamads.shop',
        tin: 'TIN-2026-FIRS-89104',
      },
    };

    if (paymentId) {
      setLoading(true);
      fetch(`http://127.0.0.1:8000/payments/${paymentId}/receipt`)
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((json) => setData(json))
        .catch(() => setData(mockReceipt))
        .finally(() => setLoading(false));
    } else {
      setData(mockReceipt);
    }
  }, [isOpen, paymentId, initialData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm print:p-0 print:bg-white">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl print:max-h-none print:w-full print:shadow-none print:rounded-none">
        {/* Modal Controls (Hidden in Print) */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white/90 px-6 py-4 backdrop-blur print:hidden">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-indigo-600" />
            <span className="font-semibold text-gray-900">Tax Invoice & Payment Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
            >
              <Printer className="h-4 w-4" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Document Body */}
        {data && (
          <div className="p-8 font-sans text-gray-900 print:p-6" id="printable-receipt">
            {/* Header */}
            <div className="flex items-start justify-between border-b-2 border-gray-100 pb-6">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-indigo-900">
                  {data.company.name}
                </h1>
                <p className="text-xs font-medium text-gray-500 mt-1">{data.company.tagline}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {data.company.address} • {data.company.support_email}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> {data.payment_status}
                </span>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  RECEIPT NO
                </p>
                <p className="text-sm font-mono font-bold text-gray-900">{data.receipt_number}</p>
                <p className="text-xs text-gray-500 mt-0.5">{data.paid_at}</p>
              </div>
            </div>

            {/* Billed To / Payment Details */}
            <div className="my-6 grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-bold uppercase tracking-wider text-gray-400">BILLED TO</p>
                <p className="text-sm font-bold text-gray-900 mt-1">{data.customer.name}</p>
                <p className="text-gray-600">{data.customer.email}</p>
                <p className="text-gray-600">{data.customer.phone}</p>
              </div>
              <div className="text-right">
                <p className="font-bold uppercase tracking-wider text-gray-400">PAYMENT CHANNEL</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {data.provider} Electronic Gateway
                </p>
                <p className="font-mono text-gray-500 text-[11px] mt-0.5">
                  Ref: {data.transaction_ref}
                </p>
              </div>
            </div>

            {/* Line Items Table */}
            <table className="w-full text-left text-xs border-collapse my-6">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50/80 uppercase font-semibold text-gray-500">
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-right">Total (₦)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.items.map((it, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="py-3 px-3 font-medium text-gray-900">{it.name}</td>
                    <td className="py-3 px-3 text-center text-gray-500">{it.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono text-gray-600">{it.unit_price}</td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-gray-900">
                      {it.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Summary Totals */}
            <div className="flex justify-end pt-2">
              <div className="w-64 space-y-2 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Merchandise Subtotal:</span>
                  <span className="font-mono font-semibold text-gray-900">{data.subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping & Delivery:</span>
                  <span className="font-mono font-semibold text-gray-900">{data.shipping_fee}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>VAT (7.5%):</span>
                  <span className="font-mono font-semibold text-gray-900">{data.vat}</span>
                </div>
                <div className="flex justify-between border-t-2 border-gray-900 pt-3 text-base font-extrabold text-indigo-950">
                  <span>Total Paid:</span>
                  <span className="font-mono">{data.total_paid}</span>
                </div>
              </div>
            </div>

            {/* Legal / Tax Footer */}
            <div className="mt-10 border-t border-gray-100 pt-4 text-center text-[10px] text-gray-400">
              <p>This is an official electronically generated tax receipt from {data.company.name}.</p>
              <p className="mt-0.5">Tax Identification Number: {data.company.tin} • Powered by Hamads Accounting Engine</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
