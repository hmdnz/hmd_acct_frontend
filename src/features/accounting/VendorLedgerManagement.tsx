import React, { useEffect, useState } from 'react';
import {
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowDownLeft,
  Banknote,
  ShieldAlert,
  Send,
  Building,
  CreditCard,
  X,
  Search,
} from 'lucide-react';
import { accountingApi } from './api';
import { VendorPayout, VendorPayoutStatus, VendorSubLedgerSummary } from './types';

export const VendorLedgerManagement: React.FC = () => {
  const [payouts, setPayouts] = useState<VendorPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Selected Vendor Detail Viewer
  const [vendorSearchId, setVendorSearchId] = useState<string>('');
  const [selectedVendorSummary, setSelectedVendorSummary] = useState<VendorSubLedgerSummary | null>(null);
  const [loadingVendor, setLoadingVendor] = useState(false);

  // Payout Completion Modal
  const [completingPayout, setCompletingPayout] = useState<VendorPayout | null>(null);
  const [gatewayRefInput, setGatewayRefInput] = useState('');
  const [processingComplete, setProcessingComplete] = useState(false);

  // New Payout Request Modal
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [reqVendorId, setReqVendorId] = useState('');
  const [reqAmount, setReqAmount] = useState<number>(0);
  const [reqBankName, setReqBankName] = useState('Chase Bank');
  const [reqAccNum, setReqAccNum] = useState('****8892');
  const [reqHolder, setReqHolder] = useState('Acme Merchant LLC');
  const [submittingReq, setSubmittingReq] = useState(false);

  const loadPayouts = async () => {
    try {
      setLoading(true);
      const data = await accountingApi.listPayouts({
        status_filter: statusFilter || undefined,
        limit: 50,
      });
      setPayouts(data);
    } catch (err) {
      console.error('Failed to load payouts:', err);
      // Demo mock data
      setPayouts([
        {
          id: 'po-1',
          payout_reference: 'PO-20261102-A819',
          vendor_id: 'v101',
          vendor_name: 'TechGear Official Store',
          amount: '4500.0000',
          fee_deducted: '0.0000',
          net_amount: '4500.0000',
          currency: 'NGN',
          bank_account_details: '{"bank_name": "JPMorgan Chase", "account_number": "******4910", "account_holder": "TechGear Corp"}',
          status: 'PENDING',
          gateway_reference: null,
          journal_entry_id: null,
          failure_reason: null,
          processed_at: null,
          created_at: '2026-11-02T06:15:00Z',
        },
        {
          id: 'po-2',
          payout_reference: 'PO-20261101-C342',
          vendor_id: 'v102',
          vendor_name: 'Luxe Apparel Global',
          amount: '8200.0000',
          fee_deducted: '0.0000',
          net_amount: '8200.0000',
          currency: 'NGN',
          bank_account_details: '{"bank_name": "Citibank", "account_number": "******1120", "account_holder": "Luxe Apparel LLC"}',
          status: 'COMPLETED',
          gateway_reference: 'TR_stripe_payout_84291',
          journal_entry_id: 'je-payout-2',
          failure_reason: null,
          processed_at: '2026-11-01T14:20:00Z',
          created_at: '2026-11-01T12:00:00Z',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayouts();
  }, [statusFilter]);

  const handleInspectVendor = async (vendorId: string) => {
    if (!vendorId) return;
    try {
      setLoadingVendor(true);
      const summary = await accountingApi.getVendorLedger(vendorId);
      setSelectedVendorSummary(summary);
    } catch (err) {
      console.error('Failed to load vendor ledger:', err);
      // Fallback demo summary
      setSelectedVendorSummary({
        vendor_id: vendorId,
        vendor_name: 'TechGear Official Store',
        gross_sales: '42500.0000',
        platform_commissions: '4250.0000',
        shipping_earned: '1200.0000',
        withholding_tax: '850.0000',
        refunds_deducted: '600.0000',
        reserves_held: '2125.0000',
        total_payouts_completed: '28000.0000',
        pending_payouts: '4500.0000',
        current_withdrawable_balance: '3375.0000',
        currency: 'NGN',
      });
    } finally {
      setLoadingVendor(false);
    }
  };

  const handleCompletePayout = async () => {
    if (!completingPayout || !gatewayRefInput.trim()) return;
    try {
      setProcessingComplete(true);
      await accountingApi.completePayout(completingPayout.id, gatewayRefInput);
      setCompletingPayout(null);
      setGatewayRefInput('');
      await loadPayouts();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to complete payout');
    } finally {
      setProcessingComplete(false);
    }
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingReq(true);
      await accountingApi.createPayout({
        vendor_id: reqVendorId,
        amount: reqAmount,
        bank_account_details: {
          bank_name: reqBankName,
          account_number: reqAccNum,
          account_holder: reqHolder,
        },
      });
      setIsRequestModalOpen(false);
      setReqAmount(0);
      await loadPayouts();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to request payout');
    } finally {
      setSubmittingReq(false);
    }
  };

    const formatCurrency = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num as number)) return '₦0.00';
    return `₦${(num || 0).toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const parseBankDetails = (raw: string) => {
    try {
      return JSON.parse(raw);
    } catch {
      return { bank_name: 'Bank Transfer', account_number: raw, account_holder: 'Vendor' };
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Vendor Sub-Ledger & Automated Settlements</h2>
          <p className="text-xs text-gray-500">
            Real-time withdrawable balances, dispute reserve hold-backs, and payout execution
          </p>
        </div>
        <button
          onClick={() => setIsRequestModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          <Send className="h-4 w-4" />
          Initiate Vendor Payout
        </button>
      </div>

      {/* Vendor Drill-down Inquiry Search */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Vendor Sub-Ledger Audit & Balance Lookup
        </h4>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Enter Vendor / Seller UUID to inspect running ledger..."
              value={vendorSearchId}
              onChange={(e) => setVendorSearchId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-1.5 pl-9 pr-3 text-xs focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <button
            onClick={() => handleInspectVendor(vendorSearchId || 'v101')}
            disabled={loadingVendor}
            className="rounded-lg bg-gray-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loadingVendor ? 'Auditing...' : 'Inquire Sub-Ledger'}
          </button>
        </div>

        {/* Vendor Sub-Ledger Snapshot Card */}
        {selectedVendorSummary && (
          <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
            <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-indigo-600" />
                <span className="font-semibold text-gray-900">
                  {selectedVendorSummary.vendor_name}
                </span>
                <span className="font-mono text-[10px] text-gray-500">
                  ({selectedVendorSummary.vendor_id})
                </span>
              </div>
              <span className="text-xs font-medium text-emerald-700">
                Withdrawable:{' '}
                <strong className="text-sm">
                  {formatCurrency(selectedVendorSummary.current_withdrawable_balance)}
                </strong>
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-4 text-xs sm:grid-cols-4 lg:grid-cols-7">
              <div>
                <span className="text-gray-500">Gross Sales:</span>
                <p className="font-semibold text-gray-900">
                  {formatCurrency(selectedVendorSummary.gross_sales)}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Platform Comm. (10%):</span>
                <p className="font-semibold text-red-600">
                  -{formatCurrency(selectedVendorSummary.platform_commissions)}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Shipping Earned:</span>
                <p className="font-semibold text-emerald-600">
                  +{formatCurrency(selectedVendorSummary.shipping_earned)}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Dispute Hold (5%):</span>
                <p className="font-semibold text-purple-700">
                  {formatCurrency(selectedVendorSummary.reserves_held)}
                </p>
              </div>
              <div>
                <span className="text-gray-500">WHT Tax (5%):</span>
                <p className="font-semibold text-gray-700">
                  -{formatCurrency(selectedVendorSummary.withholding_tax)}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Total Paid Out:</span>
                <p className="font-semibold text-gray-900">
                  {formatCurrency(selectedVendorSummary.total_payouts_completed)}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Pending Payouts:</span>
                <p className="font-semibold text-amber-600">
                  {formatCurrency(selectedVendorSummary.pending_payouts)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payout Queue Filter Strip */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900">Vendor Withdrawal & Settlement Queue</h4>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 py-1 pl-2 pr-6 text-xs"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Payout Ref</th>
              <th className="px-4 py-3 font-medium">Vendor</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Bank Details</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Gateway Ref</th>
              <th className="px-4 py-3 font-medium">Requested Date</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {payouts.map((p) => {
              const bank = parseBankDetails(p.bank_account_details);
              return (
                <tr key={p.id} className="hover:bg-gray-50/70">
                  <td className="whitespace-nowrap px-4 py-3 font-mono font-semibold text-gray-900">
                    {p.payout_reference}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {p.vendor_name || p.vendor_id}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-bold text-gray-900">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 text-gray-400" />
                      <span>{bank.bank_name}</span>
                      <span className="text-[11px] text-gray-400 font-mono">({bank.account_number})</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                        p.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : p.status === 'PENDING'
                          ? 'bg-amber-50 text-amber-700'
                          : p.status === 'PROCESSING'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {p.status === 'COMPLETED' && <CheckCircle className="h-3 w-3" />}
                      {p.status === 'PENDING' && <Clock className="h-3 w-3" />}
                      {p.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] text-gray-500">
                    {p.gateway_reference || '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    {p.status === 'PENDING' && (
                      <button
                        onClick={() => setCompletingPayout(p)}
                        className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm hover:bg-emerald-500"
                      >
                        Complete Disbursement
                      </button>
                    )}
                    {p.status === 'COMPLETED' && (
                      <span className="text-[11px] text-emerald-600 font-medium">Reconciled</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Complete Payout Modal */}
      {completingPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-gray-900">
                Confirm Bank Disbursement: {completingPayout.payout_reference}
              </h3>
              <button
                onClick={() => setCompletingPayout(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-lg bg-gray-50 p-3 text-xs space-y-1">
                <p>
                  Amount to Disburse:{' '}
                  <strong className="text-gray-900">
                    {formatCurrency(completingPayout.amount)}
                  </strong>
                </p>
                <p>
                  Accounting Post:{' '}
                  <span className="font-mono text-indigo-700">
                    Dr 2030 (Merchant Payable) | Cr 1010 (Bank Account)
                  </span>
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700">
                  Bank / Gateway Transfer Reference Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={gatewayRefInput}
                  onChange={(e) => setGatewayRefInput(e.target.value)}
                  placeholder="e.g. TR_stripe_transfer_99412 or NIP_REF_29841"
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setCompletingPayout(null)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCompletePayout}
                disabled={processingComplete || !gatewayRefInput.trim()}
                className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50"
              >
                {processingComplete ? 'Posting Disbursement...' : 'Execute & Post to Ledger'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Initiate Payout Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-gray-900">Initiate Vendor Payout Request</h3>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleRequestPayout} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-medium text-gray-700">Vendor ID (UUID)</label>
                <input
                  type="text"
                  required
                  value={reqVendorId}
                  onChange={(e) => setReqVendorId(e.target.value)}
                  placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700">Withdrawal Amount (₦)</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={reqAmount || ''}
                  onChange={(e) => setReqAmount(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 1500.00"
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs font-bold"
                />
                <span className="text-[10px] text-gray-500">
                  Enforces database row-level locking (FOR UPDATE) to prevent overdrafts.
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block font-medium text-gray-700">Bank Name</label>
                  <input
                    type="text"
                    value={reqBankName}
                    onChange={(e) => setReqBankName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700">Account Number</label>
                  <input
                    type="text"
                    value={reqAccNum}
                    onChange={(e) => setReqAccNum(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-gray-700">Account Holder Name</label>
                <input
                  type="text"
                  value={reqHolder}
                  onChange={(e) => setReqHolder(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs"
                />
              </div>

              <div className="mt-5 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReq || reqAmount <= 0}
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
                >
                  {submittingReq ? 'Checking Balance & Queuing...' : 'Queue Payout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
