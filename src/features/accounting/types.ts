// IFRS Multi-Vendor Accounting Domain Types

export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
export type NormalBalance = 'DEBIT' | 'CREDIT';
export type JournalEntryStatus = 'DRAFT' | 'POSTED' | 'VOIDED';
export type TransactionType =
  | 'ORDER_PAYMENT'
  | 'ESCROW_RELEASE'
  | 'VENDOR_PAYOUT'
  | 'REFUND'
  | 'DISPUTE_HOLD'
  | 'GATEWAY_SETTLEMENT'
  | 'ADJUSTMENT';

export type SubLedgerType = 'VENDOR' | 'CUSTOMER' | 'GATEWAY' | 'NONE';
export type VendorPayoutStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  parent_id: string | null;
  is_active: boolean;
  currency: string;
  description?: string | null;
  normal_balance: NormalBalance;
  created_at: string;
  updated_at: string;
}

export interface AccountTreeNode extends Account {
  children: AccountTreeNode[];
  current_balance: string;
}

export interface AccountCreatePayload {
  code: string;
  name: string;
  type: AccountType;
  parent_id?: string | null;
  is_active?: boolean;
  currency?: string;
  description?: string;
}

export interface JournalLine {
  id: string;
  account_id: string;
  account_code?: string;
  account_name?: string;
  sub_ledger_type: SubLedgerType;
  sub_ledger_id?: string | null;
  debit: string;
  credit: string;
  currency: string;
  description?: string | null;
}

export interface JournalEntry {
  id: string;
  entry_number: string;
  transaction_type: TransactionType;
  reference_id: string | null;
  narration: string;
  status: JournalEntryStatus;
  posted_at: string;
  created_by: string | null;
  reverses_entry_id: string | null;
  reversed_by_id: string | null;
  lines: JournalLine[];
  total_debit: string;
  total_credit: string;
}

export interface JournalLineIn {
  account_code: string;
  debit: number;
  credit: number;
  sub_ledger_type: SubLedgerType;
  sub_ledger_id?: string | null;
  currency?: string;
  description?: string;
}

export interface JournalEntryCreatePayload {
  transaction_type: TransactionType;
  reference_id?: string;
  narration: string;
  lines: JournalLineIn[];
}

export interface VendorPayout {
  id: string;
  payout_reference: string;
  vendor_id: string;
  vendor_name?: string;
  amount: string;
  fee_deducted: string;
  net_amount: string;
  currency: string;
  bank_account_details: string;
  status: VendorPayoutStatus;
  gateway_reference: string | null;
  journal_entry_id: string | null;
  failure_reason: string | null;
  processed_at: string | null;
  created_at: string;
}

export interface VendorPayoutCreatePayload {
  vendor_id: string;
  amount: number;
  bank_account_details: {
    bank_name: string;
    account_number: string;
    account_holder: string;
    routing_code?: string;
  };
}

export interface VendorSubLedgerSummary {
  vendor_id: string;
  vendor_name: string;
  gross_sales: string;
  platform_commissions: string;
  shipping_earned: string;
  withholding_tax: string;
  refunds_deducted: string;
  reserves_held: string;
  total_payouts_completed: string;
  pending_payouts: string;
  current_withdrawable_balance: string;
  currency: string;
}

export interface ReportLineItem {
  code: string;
  name: string;
  amount: string;
  percentage_of_total?: string | null;
  sub_lines?: ReportLineItem[];
}

export interface ProfitAndLossReport {
  currency: string;
  period_start: string | null;
  period_end: string | null;
  operating_revenues: ReportLineItem[];
  total_revenue: string;
  cost_of_sales: ReportLineItem[];
  total_cost_of_sales: string;
  gross_profit: string;
  gross_profit_margin_pct: string;
  operating_expenses: ReportLineItem[];
  total_operating_expenses: string;
  net_profit: string;
  net_profit_margin_pct: string;
}

export interface BalanceSheetReport {
  currency: string;
  as_of_date: string;
  current_assets: ReportLineItem[];
  total_assets: string;
  current_liabilities: ReportLineItem[];
  total_liabilities: string;
  equity_items: ReportLineItem[];
  current_period_earnings: string;
  total_equity: string;
  total_liabilities_and_equity: string;
  is_balanced: boolean;
  imbalance: string;
}

export interface CashFlowReport {
  currency: string;
  method: string;
  as_of_date: string;
  period_start: string | null;
  operating_cash_flow: ReportLineItem[];
  net_cash_from_operating: string;
  investing_cash_flow: ReportLineItem[];
  net_cash_from_investing: string;
  financing_cash_flow: ReportLineItem[];
  net_cash_from_financing: string;
  net_change_in_cash: string;
  beginning_cash_balance: string;
  ending_cash_balance: string;
}

export interface TrialBalanceItem {
  account_id: string;
  code: string;
  name: string;
  account_type: AccountType;
  debit_balance: string;
  credit_balance: string;
}

export interface TrialBalanceReport {
  currency: string;
  as_of_date: string;
  items: TrialBalanceItem[];
  total_debits: string;
  total_credits: string;
  is_balanced: boolean;
  imbalance: string;
}

export interface AccountingDashboardKPIs {
  gmv: string;
  net_platform_revenue: string;
  escrow_holding: string;
  pending_vendor_payouts: string;
  settlement_health_ratio: number;
  operating_bank_balance: string;
  gateway_clearing_balance: string;
  total_merchant_payables: string;
  active_reserve_holds: string;
  total_journal_entries_count: number;
  unbalanced_entries_count?: number;
}
