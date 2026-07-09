import api from '../api/axiosConfig';

export const getAdminStock = () => {
    return api.get('/admin/stock');
};
