import React, { useEffect, useState } from 'react';
import {
  FolderTree,
  Plus,
  Edit2,
  Check,
  X,
  Database,
  ChevronRight,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import { accountingApi } from './api';
import { Account, AccountCreatePayload, AccountTreeNode, AccountType } from './types';

export const ChartOfAccountsManager: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [tree, setTree] = useState<AccountTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<AccountType>('ASSET');
  const [newParentId, setNewParentId] = useState<string>('');
  const [newDesc, setNewDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [flatList, treeData] = await Promise.all([
        accountingApi.listAccounts(),
        accountingApi.getAccountTree(),
      ]);
      setAccounts(flatList);
      setTree(treeData);

      // Auto-expand root categories
      const initialExpanded: Record<string, boolean> = {};
      treeData.forEach((node) => {
        initialExpanded[node.id] = true;
      });
      setExpandedNodes(initialExpanded);
    } catch (err) {
      console.error('Failed to load accounts:', err);
      // Demo fallback data
      const mockAccounts: Account[] = [
        { id: '1', code: '1000', name: 'Current Assets', type: 'ASSET', parent_id: null, is_active: true, currency: 'NGN', normal_balance: 'DEBIT', created_at: '', updated_at: '' },
        { id: '2', code: '1010', name: 'Operating Settlement Bank Account', type: 'ASSET', parent_id: '1', is_active: true, currency: 'NGN', normal_balance: 'DEBIT', created_at: '', updated_at: '' },
        { id: '3', code: '1020', name: 'Payment Gateway Clearing Account', type: 'ASSET', parent_id: '1', is_active: true, currency: 'NGN', normal_balance: 'DEBIT', created_at: '', updated_at: '' },
        { id: '4', code: '1040', name: 'Merchant Reserve Funds Held', type: 'ASSET', parent_id: '1', is_active: true, currency: 'NGN', normal_balance: 'DEBIT', created_at: '', updated_at: '' },
        { id: '5', code: '2000', name: 'Current Liabilities', type: 'LIABILITY', parent_id: null, is_active: true, currency: 'NGN', normal_balance: 'CREDIT', created_at: '', updated_at: '' },
        { id: '6', code: '2010', name: 'Customer Escrow Liability (Vendor Clearing)', type: 'LIABILITY', parent_id: '5', is_active: true, currency: 'NGN', normal_balance: 'CREDIT', created_at: '', updated_at: '' },
        { id: '7', code: '2020', name: 'Customer Shipping Fee Liability', type: 'LIABILITY', parent_id: '5', is_active: true, currency: 'NGN', normal_balance: 'CREDIT', created_at: '', updated_at: '' },
        { id: '8', code: '2030', name: 'Merchant Payables (Withdrawable Balances)', type: 'LIABILITY', parent_id: '5', is_active: true, currency: 'NGN', normal_balance: 'CREDIT', created_at: '', updated_at: '' },
        { id: '9', code: '4000', name: 'Platform Revenues', type: 'REVENUE', parent_id: null, is_active: true, currency: 'NGN', normal_balance: 'CREDIT', created_at: '', updated_at: '' },
        { id: '10', code: '4010', name: 'Platform Commission Revenue (IFRS 15 Agent)', type: 'REVENUE', parent_id: '9', is_active: true, currency: 'NGN', normal_balance: 'CREDIT', created_at: '', updated_at: '' },
        { id: '11', code: '4020', name: 'Fulfillment & Shipping Fee Revenue', type: 'REVENUE', parent_id: '9', is_active: true, currency: 'NGN', normal_balance: 'CREDIT', created_at: '', updated_at: '' },
        { id: '12', code: '5000', name: 'Direct & Operating Expenses', type: 'EXPENSE', parent_id: null, is_active: true, currency: 'NGN', normal_balance: 'DEBIT', created_at: '', updated_at: '' },
        { id: '13', code: '5010', name: 'Payment Gateway Processing Fees', type: 'EXPENSE', parent_id: '12', is_active: true, currency: 'NGN', normal_balance: 'DEBIT', created_at: '', updated_at: '' },
      ];
      setAccounts(mockAccounts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleActive = async (acc: Account) => {
    try {
      await accountingApi.updateAccount(acc.id, { is_active: !acc.is_active });
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update account status');
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload: AccountCreatePayload = {
        code: newCode,
        name: newName,
        type: newType,
        parent_id: newParentId || undefined,
        description: newDesc,
        is_active: true,
      };
      await accountingApi.createAccount(payload);
      setIsModalOpen(false);
      setNewCode('');
      setNewName('');
      setNewDesc('');
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSeed = async () => {
    try {
      await accountingApi.seedDefaultCOA();
      await loadData();
    } catch (err) {
      alert('Chart of accounts already initialized.');
    }
  };

  // Group flat accounts by category if tree is flat
  const categories: AccountType[] = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">IFRS Chart of Accounts (CoA) Architecture</h2>
          <p className="text-xs text-gray-500">
            Hierarchical ledger categorization, normal balances, and active account codes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSeed}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <Database className="h-4 w-4 text-gray-500" />
            Seed Default IFRS Accounts
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" />
            New Account Code
          </button>
        </div>
      </div>

      {/* COA Groups */}
      <div className="space-y-4">
        {categories.map((cat) => {
          const catAccounts = accounts.filter((a) => a.type === cat);
          const isDebit = cat === 'ASSET' || cat === 'EXPENSE';

          return (
            <div key={cat} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between bg-gray-50/80 px-4 py-2.5 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex rounded px-2 py-0.5 text-xs font-bold ${
                      cat === 'ASSET'
                        ? 'bg-blue-100 text-blue-800'
                        : cat === 'LIABILITY'
                        ? 'bg-amber-100 text-amber-800'
                        : cat === 'EQUITY'
                        ? 'bg-purple-100 text-purple-800'
                        : cat === 'REVENUE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {cat}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    ({catAccounts.length} accounts)
                  </span>
                </div>
                <div className="text-[11px] text-gray-500">
                  Normal Balance:{' '}
                  <strong className={isDebit ? 'text-emerald-700' : 'text-blue-700'}>
                    {isDebit ? 'DEBIT' : 'CREDIT'}
                  </strong>
                </div>
              </div>

              <table className="min-w-full divide-y divide-gray-100 text-xs text-left">
                <thead className="bg-white text-gray-400 font-medium">
                  <tr>
                    <th className="px-4 py-2">Code</th>
                    <th className="px-4 py-2">Account Title</th>
                    <th className="px-4 py-2">Description / Note</th>
                    <th className="px-4 py-2">Currency</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {catAccounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-gray-50/60">
                      <td className="whitespace-nowrap px-4 py-2.5 font-mono font-bold text-gray-900">
                        {acc.code}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-gray-800">{acc.name}</td>
                      <td className="px-4 py-2.5 text-gray-500">{acc.description || '—'}</td>
                      <td className="whitespace-nowrap px-4 py-2.5 font-mono text-gray-600">
                        {acc.currency}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            acc.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {acc.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-right">
                        <button
                          onClick={() => handleToggleActive(acc)}
                          className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800"
                        >
                          {acc.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      {/* Create Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-gray-900">Add Chart of Accounts Code</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateAccount} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700">Account Code</label>
                  <input
                    type="text"
                    required
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="e.g. 1015"
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700">Category / Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as AccountType)}
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs"
                  >
                    <option value="ASSET">ASSET (1000s)</option>
                    <option value="LIABILITY">LIABILITY (2000s)</option>
                    <option value="EQUITY">EQUITY (3000s)</option>
                    <option value="REVENUE">REVENUE (4000s)</option>
                    <option value="EXPENSE">EXPENSE (5000s)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700">Account Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Flutterwave Settlement Clearing"
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700">Parent Account (Optional)</label>
                <select
                  value={newParentId}
                  onChange={(e) => setNewParentId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs"
                >
                  <option value="">No Parent (Root Category)</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.code} - {a.name} ({a.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-gray-700">Description / Accounting Usage</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Tracks card settlements in-transit"
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs"
                />
              </div>

              <div className="mt-5 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Save Account Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
