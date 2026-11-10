import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  PlusCircle,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  ExternalLink,
} from 'lucide-react';
import { accountingApi } from './api';
import { JournalEntry, JournalEntryCreatePayload, JournalLineIn, TransactionType } from './types';

export const GeneralLedgerViewer: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Reversal Modal
  const [reversalTarget, setReversalTarget] = useState<JournalEntry | null>(null);
  const [reversalReason, setReversalReason] = useState<string>('');
  const [reversing, setReversing] = useState(false);

  // New Journal Entry Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newEntryType, setNewEntryType] = useState<TransactionType>('ADJUSTMENT');
  const [newEntryRef, setNewEntryRef] = useState('');
  const [newEntryNarration, setNewEntryNarration] = useState('');
  const [lines, setLines] = useState<JournalLineIn[]>([
    { account_code: '1010', debit: 0, credit: 0, sub_ledger_type: 'NONE' },
    { account_code: '4010', debit: 0, credit: 0, sub_ledger_type: 'NONE' },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const data = await accountingApi.listJournalEntries({
        transaction_type: typeFilter || undefined,
        reference_id: searchQuery || undefined,
        limit: 100,
      });
      setEntries(data);
    } catch (err) {
      console.error('Failed to load journal entries:', err);
      // Demo mock data
      setEntries([
        {
          id: 'je-1',
          entry_number: 'JE-20261102-00001',
          transaction_type: 'ORDER_PAYMENT',
          reference_id: 'ORD-98432',
          narration: 'Customer checkout payment via Stripe Checkout',
          status: 'POSTED',
          posted_at: '2026-11-02T08:14:22Z',
          created_by: null,
          reverses_entry_id: null,
          reversed_by_id: null,
          total_debit: '450.0000',
          total_credit: '450.0000',
          lines: [
            {
              id: 'jl-1',
              account_id: 'a1',
              account_code: '1020',
              account_name: 'Payment Gateway Clearing Account',
              sub_ledger_type: 'GATEWAY',
              sub_ledger_id: 'ch_3N4x9y2eZvKYlo2C',
              debit: '450.0000',
              credit: '0.0000',
              currency: 'NGN',
              description: 'In-transit gateway funds pending settlement',
            },
            {
              id: 'jl-2',
              account_id: 'a2',
              account_code: '2010',
              account_name: 'Customer Escrow Liability (Vendor Clearing)',
              sub_ledger_type: 'CUSTOMER',
              sub_ledger_id: 'cust-1234',
              debit: '0.0000',
              credit: '410.0000',
              currency: 'NGN',
              description: 'Merchandise escrow deposit held for fulfillment',
            },
            {
              id: 'jl-3',
              account_id: 'a3',
              account_code: '2020',
              account_name: 'Customer Shipping Fee Liability',
              sub_ledger_type: 'CUSTOMER',
              sub_ledger_id: 'cust-1234',
              debit: '0.0000',
              credit: '40.0000',
              currency: 'NGN',
              description: 'Customer delivery fee deposit',
            },
          ],
        },
        {
          id: 'je-2',
          entry_number: 'JE-20261102-00002',
          transaction_type: 'ESCROW_RELEASE',
          reference_id: 'SO-58210',
          narration: 'IFRS 15 Revenue recognition upon delivery confirmation',
          status: 'POSTED',
          posted_at: '2026-11-02T08:30:15Z',
          created_by: null,
          reverses_entry_id: null,
          reversed_by_id: null,
          total_debit: '450.0000',
          total_credit: '450.0000',
          lines: [
            {
              id: 'jl-4',
              account_id: 'a2',
              account_code: '2010',
              account_name: 'Customer Escrow Liability (Vendor Clearing)',
              sub_ledger_type: 'VENDOR',
              sub_ledger_id: 'vend-441',
              debit: '410.0000',
              credit: '0.0000',
              currency: 'NGN',
              description: 'Escrow obligation released to vendor payable',
            },
            {
              id: 'jl-5',
              account_id: 'a3',
              account_code: '2020',
              account_name: 'Customer Shipping Fee Liability',
              sub_ledger_type: 'NONE',
              sub_ledger_id: null,
              debit: '40.0000',
              credit: '0.0000',
              currency: 'NGN',
              description: 'Release shipping escrow to recognized fulfillment fee',
            },
            {
              id: 'jl-6',
              account_id: 'a4',
              account_code: '2030',
              account_name: 'Merchant Payables',
              sub_ledger_type: 'VENDOR',
              sub_ledger_id: 'vend-441',
              debit: '0.0000',
              credit: '348.5000',
              currency: 'NGN',
              description: 'Net withdrawable earnings credited to vendor',
            },
            {
              id: 'jl-7',
              account_id: 'a5',
              account_code: '4010',
              account_name: 'Platform Commission Revenue',
              sub_ledger_type: 'VENDOR',
              sub_ledger_id: 'vend-441',
              debit: '0.0000',
              credit: '41.0000',
              currency: 'NGN',
              description: '10.0% marketplace commission earned (IFRS 15 Agent)',
            },
            {
              id: 'jl-8',
              account_id: 'a6',
              account_code: '4020',
              account_name: 'Fulfillment & Shipping Fee Revenue',
              sub_ledger_type: 'NONE',
              sub_ledger_id: null,
              debit: '0.0000',
              credit: '40.0000',
              currency: 'NGN',
              description: 'Fulfillment revenue earned on order delivery',
            },
            {
              id: 'jl-9',
              account_id: 'a7',
              account_code: '1040',
              account_name: 'Merchant Reserve Funds Held',
              sub_ledger_type: 'VENDOR',
              sub_ledger_id: 'vend-441',
              debit: '0.0000',
              credit: '20.5000',
              currency: 'NGN',
              description: '5.0% dispute safety hold for 14 days',
            },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, [typeFilter]);

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const handleReverse = async () => {
    if (!reversalTarget || !reversalReason.trim()) return;
    try {
      setReversing(true);
      await accountingApi.reverseJournalEntry(reversalTarget.id, reversalReason);
      setReversalTarget(null);
      setReversalReason('');
      await loadEntries();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to reverse entry');
    } finally {
      setReversing(false);
    }
  };

  // Balancing calculation for new manual entry modal
  const sumDebits = lines.reduce((acc, curr) => acc + (Number(curr.debit) || 0), 0);
  const sumCredits = lines.reduce((acc, curr) => acc + (Number(curr.credit) || 0), 0);
  const isBalanced = Math.abs(sumDebits - sumCredits) < 0.0001 && sumDebits > 0;

  const handleAddLine = () => {
    setLines([...lines, { account_code: '1010', debit: 0, credit: 0, sub_ledger_type: 'NONE' }]);
  };

  const handleRemoveLine = (idx: number) => {
    if (lines.length <= 2) return;
    setLines(lines.filter((_, i) => i !== idx));
  };

  const handleLineChange = (idx: number, field: keyof JournalLineIn, val: any) => {
    const updated = [...lines];
    updated[idx] = { ...updated[idx], [field]: val };
    setLines(updated);
  };

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) {
      setErrorMessage('Debits and Credits must be equal and greater than 0.');
      return;
    }
    try {
      setSubmitting(true);
      setErrorMessage(null);
      const payload: JournalEntryCreatePayload = {
        transaction_type: newEntryType,
        reference_id: newEntryRef || undefined,
        narration: newEntryNarration,
        lines,
      };
      await accountingApi.createJournalEntry(payload);
      setIsCreateModalOpen(false);
      setNewEntryNarration('');
      setNewEntryRef('');
      await loadEntries();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Failed to post entry.');
    } finally {
      setSubmitting(false);
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

  return (
    <div className="space-y-6 p-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">General Ledger & Double-Entry Postings</h2>
          <p className="text-xs text-gray-500">
            Immutable audit trail of all financial transactions across the platform
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          <PlusCircle className="h-4 w-4" />
          Post Manual Journal Entry
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Reference ID (e.g. Order ID, Payout ID)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadEntries()}
            className="w-full rounded-lg border border-gray-300 py-1.5 pl-9 pr-3 text-xs focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border border-gray-300 py-1.5 pl-2 pr-8 text-xs focus:border-indigo-500 focus:outline-none"
            >
              <option value="">All Transaction Types</option>
              <option value="ORDER_PAYMENT">Order Payment (Escrow)</option>
              <option value="ESCROW_RELEASE">Escrow Release (IFRS 15)</option>
              <option value="VENDOR_PAYOUT">Vendor Payout</option>
              <option value="REFUND">Customer Refund</option>
              <option value="GATEWAY_SETTLEMENT">Gateway Bank Settlement</option>
              <option value="ADJUSTMENT">Manual Adjustment</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="py-3 pl-4 pr-2 font-medium"></th>
              <th className="px-3 py-3 font-medium">Entry #</th>
              <th className="px-3 py-3 font-medium">Type</th>
              <th className="px-3 py-3 font-medium">Reference</th>
              <th className="px-3 py-3 font-medium">Narration</th>
              <th className="px-3 py-3 font-medium">Posted Date</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 text-right font-medium">Total Dr / Cr</th>
              <th className="py-3 pl-3 pr-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {entries.map((entry) => {
              const isExpanded = expandedRow === entry.id;
              return (
                <React.Fragment key={entry.id}>
                  <tr className="hover:bg-gray-50/70">
                    <td className="py-3 pl-4 pr-2">
                      <button
                        onClick={() => toggleRow(entry.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 font-semibold text-gray-900">
                      {entry.entry_number}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                          entry.transaction_type === 'ORDER_PAYMENT'
                            ? 'bg-blue-50 text-blue-700'
                            : entry.transaction_type === 'ESCROW_RELEASE'
                            ? 'bg-emerald-50 text-emerald-700'
                            : entry.transaction_type === 'VENDOR_PAYOUT'
                            ? 'bg-purple-50 text-purple-700'
                            : entry.transaction_type === 'REFUND'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {entry.transaction_type}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 font-mono text-[11px] text-gray-600">
                      {entry.reference_id || '—'}
                    </td>
                    <td className="max-w-xs truncate px-3 py-3 text-gray-600" title={entry.narration}>
                      {entry.narration}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-gray-500">
                      {new Date(entry.posted_at).toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          entry.status === 'POSTED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : entry.status === 'VOIDED'
                            ? 'bg-red-50 text-red-700 line-through'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {entry.status === 'POSTED' && <CheckCircle2 className="h-3 w-3" />}
                        {entry.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right font-medium text-gray-900">
                      {formatCurrency(entry.total_debit)}
                    </td>
                    <td className="whitespace-nowrap py-3 pl-3 pr-4 text-right">
                      {entry.status === 'POSTED' && !entry.reversed_by_id && (
                        <button
                          onClick={() => setReversalTarget(entry)}
                          className="inline-flex items-center gap-1 rounded border border-gray-200 px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-50 hover:text-red-600"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Reverse
                        </button>
                      )}
                      {entry.reversed_by_id && (
                        <span className="text-[10px] text-gray-400">Offset Posted</span>
                      )}
                    </td>
                  </tr>

                  {/* Expanded Lines View */}
                  {isExpanded && (
                    <tr className="bg-gray-50/50">
                      <td colSpan={9} className="p-4">
                        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-inner">
                          <h6 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                            Line Items ({entry.lines.length} balanced postings)
                          </h6>
                          <table className="min-w-full divide-y divide-gray-100 text-[11px]">
                            <thead className="text-gray-400">
                              <tr>
                                <th className="py-1 text-left font-medium">Account</th>
                                <th className="py-1 text-left font-medium">Sub-Ledger</th>
                                <th className="py-1 text-left font-medium">Description</th>
                                <th className="py-1 text-right font-medium">Debit (₦)</th>
                                <th className="py-1 text-right font-medium">Credit (₦)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 font-mono">
                              {entry.lines.map((line) => (
                                <tr key={line.id}>
                                  <td className="py-1.5 font-semibold text-gray-800">
                                    <span className="rounded bg-gray-100 px-1 py-0.5 text-gray-600">
                                      {line.account_code}
                                    </span>{' '}
                                    <span className="font-sans font-normal text-gray-600">
                                      {line.account_name}
                                    </span>
                                  </td>
                                  <td className="py-1.5 text-gray-500 font-sans">
                                    {line.sub_ledger_type !== 'NONE' ? (
                                      <span className="inline-flex items-center gap-1 rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] text-indigo-700">
                                        {line.sub_ledger_type}: {line.sub_ledger_id?.slice(0, 10)}...
                                      </span>
                                    ) : (
                                      '—'
                                    )}
                                  </td>
                                  <td className="py-1.5 text-gray-500 font-sans">{line.description}</td>
                                  <td className="py-1.5 text-right font-semibold text-emerald-700">
                                    {parseFloat(line.debit) > 0 ? formatCurrency(line.debit) : '—'}
                                  </td>
                                  <td className="py-1.5 text-right font-semibold text-blue-700">
                                    {parseFloat(line.credit) > 0 ? formatCurrency(line.credit) : '—'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Reversal Modal (IFRS Immutability) */}
      {reversalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-gray-900">
                Reverse Journal Entry {reversalTarget.entry_number}
              </h3>
              <button
                onClick={() => setReversalTarget(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <p className="text-xs text-gray-600">
                Under IFRS accounting rules, posted journal entries cannot be deleted. An exact
                offsetting reversal entry will be posted to the ledger.
              </p>
              <div>
                <label className="block text-xs font-semibold text-gray-700">
                  Auditable Reason for Reversal <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  placeholder="e.g., Incorrect commission percentage applied to seller order"
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setReversalTarget(null)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReverse}
                disabled={reversing || !reversalReason.trim()}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50"
              >
                {reversing ? 'Posting Reversal...' : 'Confirm Offsetting Reversal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Balanced Journal Entry Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-gray-900">Post Manual Double-Entry Journal</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEntry} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Transaction Type</label>
                  <select
                    value={newEntryType}
                    onChange={(e) => setNewEntryType(e.target.value as TransactionType)}
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs"
                  >
                    <option value="ADJUSTMENT">ADJUSTMENT</option>
                    <option value="ORDER_PAYMENT">ORDER_PAYMENT</option>
                    <option value="ESCROW_RELEASE">ESCROW_RELEASE</option>
                    <option value="VENDOR_PAYOUT">VENDOR_PAYOUT</option>
                    <option value="REFUND">REFUND</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Reference ID</label>
                  <input
                    type="text"
                    value={newEntryRef}
                    onChange={(e) => setNewEntryRef(e.target.value)}
                    placeholder="e.g. ADJ-001 or Order UUID"
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Narration / Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newEntryNarration}
                  onChange={(e) => setNewEntryNarration(e.target.value)}
                  placeholder="e.g. Manual correction of logistics surcharge"
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs"
                />
              </div>

              {/* Lines table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700">Journal Lines</span>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    + Add Line
                  </button>
                </div>
                <div className="max-h-52 overflow-y-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200 text-xs">
                    <thead className="bg-gray-50 text-gray-500">
                      <tr>
                        <th className="px-2 py-1.5 text-left">Account Code</th>
                        <th className="px-2 py-1.5 text-left">Debit (₦)</th>
                        <th className="px-2 py-1.5 text-left">Credit (₦)</th>
                        <th className="px-2 py-1.5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {lines.map((l, idx) => (
                        <tr key={idx}>
                          <td className="p-1.5">
                            <input
                              type="text"
                              value={l.account_code}
                              onChange={(e) => handleLineChange(idx, 'account_code', e.target.value)}
                              placeholder="1010"
                              className="w-24 rounded border border-gray-300 p-1 text-xs font-mono"
                            />
                          </td>
                          <td className="p-1.5">
                            <input
                              type="number"
                              step="0.01"
                              value={l.debit || ''}
                              onChange={(e) =>
                                handleLineChange(idx, 'debit', parseFloat(e.target.value) || 0)
                              }
                              placeholder="0.00"
                              className="w-28 rounded border border-gray-300 p-1 text-xs"
                            />
                          </td>
                          <td className="p-1.5">
                            <input
                              type="number"
                              step="0.01"
                              value={l.credit || ''}
                              onChange={(e) =>
                                handleLineChange(idx, 'credit', parseFloat(e.target.value) || 0)
                              }
                              placeholder="0.00"
                              className="w-28 rounded border border-gray-300 p-1 text-xs"
                            />
                          </td>
                          <td className="p-1.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveLine(idx)}
                              disabled={lines.length <= 2}
                              className="text-xs text-red-500 hover:text-red-700 disabled:opacity-30"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Real-time Double-Entry Balance Validator Strip */}
              <div
                className={`flex items-center justify-between rounded-lg p-3 text-xs font-medium ${
                  isBalanced
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'bg-amber-50 text-amber-800'
                }`}
              >
                <div>
                  <span>Total Debits: <strong>₦{sumDebits.toFixed(2)}</strong></span>
                  <span className="mx-3">|</span>
                  <span>Total Credits: <strong>₦{sumCredits.toFixed(2)}</strong></span>
                </div>
                <div>
                  {isBalanced ? (
                    <span className="flex items-center gap-1 font-semibold text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" /> Balanced ($\sum Dr = \sum Cr$)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 font-semibold text-amber-700">
                      <AlertCircle className="h-4 w-4" /> Imbalance: ₦{Math.abs(sumDebits - sumCredits).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {errorMessage && (
                <p className="text-xs font-semibold text-red-600">{errorMessage}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isBalanced || submitting}
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
                >
                  {submitting ? 'Posting...' : 'Commit Balanced Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
