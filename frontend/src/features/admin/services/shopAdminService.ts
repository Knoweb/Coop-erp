import api from '../../../api/axiosConfig';

export interface Shop {
    id: string;
    code: string;
    name: string;
    address: string;
    contactNumber: string;
    active: boolean;
}

export interface UserResponse {
    id: string;
    name: string;
    username: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    shopId?: string;
    shopName?: string;
}

export const shopAdminService = {
    // --- SHOPS ---
    getAllShops: async (): Promise<Shop[]> => {
        const response = await api.get('/admin/shops');
        return response.data;
    },
    createShop: async (shop: Partial<Shop>): Promise<Shop> => {
        const response = await api.post('/admin/shops', shop);
        return response.data;
    },
    updateShop: async (id: string, shop: Partial<Shop>): Promise<Shop> => {
        const response = await api.put(`/admin/shops/${id}`, shop);
        return response.data;
    },
    toggleShopStatus: async (id: string): Promise<Shop> => {
        const response = await api.patch(`/admin/shops/${id}/status`);
        return response.data;
    },

    // --- USERS ---
    getAllUsers: async (shopId?: string): Promise<UserResponse[]> => {
        const params = shopId ? { shopId } : {};
        const response = await api.get('/admin/users', { params });
        return response.data;
    },
    createUser: async (user: any): Promise<any> => {
        const response = await api.post('/admin/users', user);
        return response.data;
    },
    toggleUserStatus: async (id: string): Promise<any> => {
        const response = await api.patch(`/admin/users/${id}/toggle-status`);
        return response.data;
    }
};
