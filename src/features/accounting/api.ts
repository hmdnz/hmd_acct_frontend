import axios from 'axios';
import {
  Account,
  AccountCreatePayload,
  AccountTreeNode,
  AccountingDashboardKPIs,
  BalanceSheetReport,
  CashFlowReport,
  JournalEntry,
  JournalEntryCreatePayload,
  ProfitAndLossReport,
  TrialBalanceReport,
  VendorPayout,
  VendorPayoutCreatePayload,
  VendorSubLedgerSummary,
} from './types';

// Detect Vite, Create React App, or fallback directly to local FastAPI server
const getBaseUrl = (): string => {
  // Vite (import.meta.env.VITE_API_URL)
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL}/admin/accounting`;
  }
  // Create React App (process.env.REACT_APP_API_URL)
  if (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) {
    return `${process.env.REACT_APP_API_URL}/admin/accounting`;
  }
  // Local FastAPI default
  return 'http://127.0.0.1:8000/admin/accounting';
};

const API_BASE_URL = getBaseUrl();

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject token if present (supports admin_token, token, or access_token)
client.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('admin_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('access_token') ||
    sessionStorage.getItem('admin_token') ||
    sessionStorage.getItem('token') ||
    sessionStorage.getItem('access_token');

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const accountingApi = {
  // Dashboard KPIs
  getDashboardKPIs: async (): Promise<AccountingDashboardKPIs> => {
    const { data } = await client.get<AccountingDashboardKPIs>('/reports/dashboard-kpis');
    return data;
  },

  // Chart of Accounts
  listAccounts: async (type?: string, isActive?: boolean): Promise<Account[]> => {
    const params = new URLSearchParams();
    if (type) params.append('account_type', type);
    if (isActive !== undefined) params.append('is_active', String(isActive));
    const { data } = await client.get<Account[]>(`/accounts?${params.toString()}`);
    return data;
  },

  getAccountTree: async (): Promise<AccountTreeNode[]> => {
    const { data } = await client.get<AccountTreeNode[]>('/accounts/tree');
    return data;
  },

  createAccount: async (payload: AccountCreatePayload): Promise<Account> => {
    const { data } = await client.post<Account>('/accounts', payload);
    return data;
  },

  updateAccount: async (id: string, payload: Partial<AccountCreatePayload>): Promise<Account> => {
    const { data } = await client.patch<Account>(`/accounts/${id}`, payload);
    return data;
  },

  seedDefaultCOA: async (): Promise<{ message: string; accounts_count: number }> => {
    const { data } = await client.post<{ message: string; accounts_count: number }>('/accounts/seed');
    return data;
  },

  // Journal Entries & General Ledger
  listJournalEntries: async (params?: {
    transaction_type?: string;
    status_filter?: string;
    reference_id?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }): Promise<JournalEntry[]> => {
    const { data } = await client.get<JournalEntry[]>('/journal-entries', { params });
    return data;
  },

  getJournalEntry: async (id: string): Promise<JournalEntry> => {
    const { data } = await client.get<JournalEntry>(`/journal-entries/${id}`);
    return data;
  },

  createJournalEntry: async (payload: JournalEntryCreatePayload): Promise<JournalEntry> => {
    const { data } = await client.post<JournalEntry>('/journal-entries', payload);
    return data;
  },

  reverseJournalEntry: async (id: string, reason: string): Promise<JournalEntry> => {
    const { data } = await client.post<JournalEntry>(
      `/journal-entries/${id}/reverse?reason=${encodeURIComponent(reason)}`
    );
    return data;
  },

  // Vendor Ledger & Payouts
  getVendorLedger: async (vendorId: string): Promise<VendorSubLedgerSummary> => {
    const { data } = await client.get<VendorSubLedgerSummary>(`/vendors/${vendorId}/ledger`);
    return data;
  },

  listPayouts: async (params?: {
    status_filter?: string;
    vendor_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<VendorPayout[]> => {
    const { data } = await client.get<VendorPayout[]>('/payouts', { params });
    return data;
  },

  createPayout: async (payload: VendorPayoutCreatePayload): Promise<VendorPayout> => {
    const { data } = await client.post<VendorPayout>('/payouts', payload);
    return data;
  },

  completePayout: async (payoutId: string, gatewayReference: string): Promise<VendorPayout> => {
    const { data } = await client.post<VendorPayout>(`/payouts/${payoutId}/complete`, {
      gateway_reference: gatewayReference,
    });
    return data;
  },

  // Financial Statements (IFRS & IAS)
  getTrialBalance: async (asOfDate?: string): Promise<TrialBalanceReport> => {
    const params = asOfDate ? { as_of_date: asOfDate } : {};
    const { data } = await client.get<TrialBalanceReport>('/reports/trial-balance', { params });
    return data;
  },

  getProfitAndLoss: async (startDate?: string, endDate?: string): Promise<ProfitAndLossReport> => {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const { data } = await client.get<ProfitAndLossReport>('/reports/profit-and-loss', { params });
    return data;
  },

  getBalanceSheet: async (asOfDate?: string): Promise<BalanceSheetReport> => {
    const params = asOfDate ? { as_of_date: asOfDate } : {};
    const { data } = await client.get<BalanceSheetReport>('/reports/balance-sheet', { params });
    return data;
  },

  getCashFlow: async (asOfDate?: string): Promise<CashFlowReport> => {
    const params = asOfDate ? { as_of_date: asOfDate } : {};
    const { data } = await client.get<CashFlowReport>('/reports/cash-flow', { params });
    return data;
  },

  // Auditable CSV General Ledger Export
  exportGeneralLedgerCSV: async (): Promise<Blob> => {
    const response = await client.get('/reports/export/general-ledger-csv', {
      responseType: 'blob',
    });
    return response.data;
  },
};