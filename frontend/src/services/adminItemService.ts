import api from '../api/axiosConfig';

export const getAdminItems = () => {
    return api.get('/admin/products');
};

export const createAdminItem = (data: any) => {
    return api.post('/admin/products', data);
};

export const updateAdminItem = (id: string, data: any) => {
    return api.put(`/admin/products/${id}`, data);
};

export const toggleAdminItemStatus = (id: string) => {
    return api.patch(`/admin/products/${id}/status`);
};
