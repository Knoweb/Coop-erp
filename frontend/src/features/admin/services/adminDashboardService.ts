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

export interface ShopProductCountDto {
    shopId: string;
    shopName: string;
    selectedProductCount: number;
}

export const adminDashboardService = {
    getSummary: async (): Promise<DashboardSummary> => {
        const response = await api.get('/admin/dashboard/summary');
        return response.data;
    },
    getShopProductCounts: async (): Promise<ShopProductCountDto[]> => {
        const response = await api.get('/admin/dashboard/shop-product-counts');
        return response.data;
    },
    getTotalProducts: async (): Promise<number> => {
        const response = await api.get('/admin/dashboard/total-products');
        return response.data.totalProducts;
    }
};
