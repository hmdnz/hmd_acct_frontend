import React, { useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  FileText,
  FolderTree,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import { FinancialDashboard } from './FinancialDashboard';
import { GeneralLedgerViewer } from './GeneralLedgerViewer';
import { VendorLedgerManagement } from './VendorLedgerManagement';
import { FinancialStatementGenerator } from './FinancialStatementGenerator';
import { ChartOfAccountsManager } from './ChartOfAccountsManager';

export const AccountingPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ledger' | 'vendors' | 'reports' | 'coa'>('dashboard');

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans text-gray-900">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-gray-900">Hamads Accounting Software</span>
                <span className="inline-flex items-center gap-1 rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                  <ShieldCheck className="h-3 w-3" /> IFRS Compliant
                </span>
              </div>
              <p className="text-xs text-gray-500">Multi-Vendor Double-Entry Financial Engine</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 rounded-lg bg-gray-100 p-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors ${
                activeTab === 'ledger'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              General Ledger
            </button>
            <button
              onClick={() => setActiveTab('vendors')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors ${
                activeTab === 'vendors'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              Vendor Payouts
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors ${
                activeTab === 'reports'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              Financial Statements
            </button>
            <button
              onClick={() => setActiveTab('coa')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors ${
                activeTab === 'coa'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FolderTree className="h-3.5 w-3.5" />
              Chart of Accounts
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl py-4 sm:px-6">
        {activeTab === 'dashboard' && (
          <FinancialDashboard onNavigateToTab={(tab) => setActiveTab(tab as any)} />
        )}
        {activeTab === 'ledger' && <GeneralLedgerViewer />}
        {activeTab === 'vendors' && <VendorLedgerManagement />}
        {activeTab === 'reports' && <FinancialStatementGenerator />}
        {activeTab === 'coa' && <ChartOfAccountsManager />}
      </main>
    </div>
  );
};
