import api from '../api/axiosConfig';

export const getShopItems = () => {
    return api.get('/shop/items');
};
