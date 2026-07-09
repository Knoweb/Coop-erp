import api from '../../../api/axiosConfig';

export interface ShopDashboardSummary {
    totalProducts: number;
    totalStockQuantity: number;
    lowStockItems: number;
    todaySales: number;
    todayRevenue: number;
    todaySalesAmount?: number;
    todaySalesCount?: number;
    pendingPurchases: number;
    totalSuppliers: number;
    totalUsers: number;
    shopId: string;
    shopCode: string;
    shopName: string;
}

export const shopDashboardService = {
    getSummary: async (): Promise<ShopDashboardSummary> => {
        const response = await api.get('/shop/dashboard/summary');
        return response.data;
    },
    getSelectedProductCount: async (): Promise<number> => {
        const response = await api.get('/shop/dashboard/selected-product-count');
        return response.data.selectedProductCount;
    }
};
