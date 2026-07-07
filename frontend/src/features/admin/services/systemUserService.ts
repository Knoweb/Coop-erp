import api from '../../../api/axiosConfig';

export interface SystemUser {
    id: string;
    name: string;
    username: string;
    email: string;
    role: string;
    active: boolean;
    createdAt: string;
}

export const systemUserService = {
    getSystemUsers: async (): Promise<SystemUser[]> => {
        const response = await api.get('/admin/system-users');
        return response.data;
    },

    createSystemUser: async (payload: any): Promise<SystemUser> => {
        const response = await api.post('/admin/system-users', payload);
        return response.data;
    },

    updateSystemUser: async (id: string, payload: any): Promise<SystemUser> => {
        const response = await api.put(`/admin/system-users/${id}`, payload);
        return response.data;
    },

    updateSystemUserStatus: async (id: string, active: boolean): Promise<void> => {
        await api.patch(`/admin/system-users/${id}/status`, { active });
    },

    resetSystemUserPassword: async (id: string, payload: any): Promise<void> => {
        await api.patch(`/admin/system-users/${id}/password`, payload);
    }
};
