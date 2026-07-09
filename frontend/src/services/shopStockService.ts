import api from '../api/axiosConfig';

export const getShopStock = () => {
    return api.get('/shop/stock');
};
