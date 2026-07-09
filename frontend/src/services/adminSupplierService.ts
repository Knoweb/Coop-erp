import api from '../api/axiosConfig';

export const getAdminSuppliers = () => {
    return api.get('/admin/suppliers');
};

export const createAdminSupplier = (data: any) => {
    return api.post('/admin/suppliers', data);
};

export const updateAdminSupplier = (id: string, data: any) => {
    return api.put(`/admin/suppliers/${id}`, data);
};

export const toggleAdminSupplierStatus = (id: string) => {
    return api.patch(`/admin/suppliers/${id}/status`);
};
