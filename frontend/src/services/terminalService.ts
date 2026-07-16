import api from '../api/axiosConfig';

export interface ShopTerminal {
    id: string;
    shopId: string;
    terminalCode: string;
    terminalName: string;
    deviceIdentifier: string;
    isActive: boolean;
}

export const terminalService = {
    // Admin Endpoints
    getShopTerminals: async (shopId: string): Promise<ShopTerminal[]> => {
        const response = await api.get(`/admin/shops/${shopId}/terminals`);
        return response.data;
    },

    createShopTerminal: async (shopId: string, terminalData: Partial<ShopTerminal>): Promise<ShopTerminal> => {
        const response = await api.post(`/admin/shops/${shopId}/terminals`, terminalData);
        return response.data;
    },

    updateShopTerminal: async (shopId: string, terminalId: string, terminalData: Partial<ShopTerminal>): Promise<ShopTerminal> => {
        const response = await api.put(`/admin/shops/${shopId}/terminals/${terminalId}`, terminalData);
        return response.data;
    },

    updateTerminalStatus: async (shopId: string, terminalId: string, isActive: boolean): Promise<void> => {
        await api.patch(`/admin/shops/${shopId}/terminals/${terminalId}/status`, { isActive });
    },

    // Shop Endpoints
    getActiveTerminalsForCurrentShop: async (): Promise<ShopTerminal[]> => {
        const response = await api.get(`/shop/terminals`);
        return response.data;
    }
};
