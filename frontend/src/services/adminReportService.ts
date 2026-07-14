import api from '../api/axiosConfig';

export interface ReportLineDto {
  name: string;
  amount: number;
}

export interface IncomeStatementResponse {
  fromDate: string;
  toDate: string;
  revenue: ReportLineDto[];
  costOfGoods: ReportLineDto[];
  expenses: ReportLineDto[];
  totalRevenue: number;
  totalCostOfGoods: number;
  grossProfit: number;
  totalExpenses: number;
  netIncome: number;
}

export interface BalanceSheetResponse {
  asOfDate: string;
  assets: ReportLineDto[];
  liabilities: ReportLineDto[];
  equity: ReportLineDto[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  liabilitiesAndEquity: number;
}

export interface TrialBalanceLineDto {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
}

export interface TrialBalanceResponse {
  fromDate: string;
  toDate: string;
  rows: TrialBalanceLineDto[];
  totalDebit: number;
  totalCredit: number;
  balanced: boolean;
}

export interface CashFlowResponse {
  fromDate: string;
  toDate: string;
  operatingActivities: ReportLineDto[];
  investingActivities: ReportLineDto[];
  financingActivities: ReportLineDto[];
  netOperatingCashFlow: number;
  netInvestingCashFlow: number;
  netFinancingCashFlow: number;
  netCashFlow: number;
}

export interface LedgerLineDto {
  date: string;
  reference: string;
  description: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface GeneralLedgerResponse {
  fromDate: string;
  toDate: string;
  accountCode: string;
  rows: LedgerLineDto[];
}

export const adminReportService = {
  getBalanceSheet: async (asOfDate?: string): Promise<BalanceSheetResponse> => {
    const params = asOfDate ? { asOfDate } : {};
    const response = await api.get('/admin/reports/balance-sheet', { params });
    return response.data;
  },

  getIncomeStatement: async (fromDate?: string, toDate?: string): Promise<IncomeStatementResponse> => {
    const params: any = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    const response = await api.get('/admin/reports/income-statement', { params });
    return response.data;
  },

  getTrialBalance: async (fromDate?: string, toDate?: string): Promise<TrialBalanceResponse> => {
    const params: any = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    const response = await api.get('/admin/reports/trial-balance', { params });
    return response.data;
  },

  getCashFlow: async (fromDate?: string, toDate?: string): Promise<CashFlowResponse> => {
    const params: any = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    const response = await api.get('/admin/reports/cash-flow', { params });
    return response.data;
  },

  getGeneralLedger: async (fromDate?: string, toDate?: string, accountCode?: string): Promise<GeneralLedgerResponse> => {
    const params: any = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    if (accountCode) params.accountCode = accountCode;
    const response = await api.get('/admin/reports/general-ledger', { params });
    return response.data;
  }
};
