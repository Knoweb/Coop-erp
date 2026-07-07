import api from '../../../api/axiosConfig';

export interface DashboardSummary {
    totalProducts: number;
    totalStockQuantity: number;
    lowStockItems: number;
    todaySales: number;
    todayRevenue: number;
    pendingPurchases: number;
    totalSuppliers: number;
    totalUsers: number;
    totalShops: number;
    activeShops: number;
    totalCustomers: number;
}

export const adminDashboardService = {
    getSummary: async (): Promise<DashboardSummary> => {
        const response = await api.get('/admin/dashboard/summary');
        return response.data;
    }
};
