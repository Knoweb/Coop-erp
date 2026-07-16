import api from '../api/axiosConfig';

export interface CashSession {
  id: string;
  shop: any;
  terminal: any;
  user: any;
  sessionDate: string;
  openedAt: string;
  closedAt: string | null;
  openingCash: number;
  expectedCash: number;
  actualCash: number | null;
  cashSalesTotal: number;
  cardSalesTotal: number;
  creditSalesTotal: number;
  totalSales: number;
  difference: number;
  status: 'OPEN' | 'CLOSED';
  notes: string | null;
}

export const cashSessionService = {
  getCurrentOpenSession: async (terminalId: string): Promise<CashSession | null> => {
    const response = await api.get<CashSession | ''>('/shop/cash-session/current', {
      params: { terminalId }
    });
    return response.data || null;
  },

  openSession: async (shopId: string, terminalId: string, openingCash: number): Promise<CashSession> => {
    const response = await api.post<CashSession>('/shop/cash-session/open', {
      shopId,
      terminalId,
      openingCash
    });
    return response.data;
  },

  closeSession: async (sessionId: string, actualCash: number, notes?: string): Promise<CashSession> => {
    const response = await api.post<CashSession>('/shop/cash-session/close', {
      sessionId,
      actualCash,
      notes
    });
    return response.data;
  },

  getSessionsReport: async (shopId: string, fromDate?: string, toDate?: string, terminalId?: string): Promise<CashSession[]> => {
    const params: any = { shopId };
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    if (terminalId) params.terminalId = terminalId;

    const response = await api.get<CashSession[]>('/shop/cash-session/report', { params });
    return response.data;
  }
};
