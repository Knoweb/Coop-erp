import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwt_token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const status = error.response.status;
            const message = error.response.data?.message || '';

            if (status === 401 || message.includes('Tenant context is missing') || message.includes('Please login again')) {
                console.warn('Session expired or tenant context missing. Redirecting to login...');
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(new Error('Session expired. Please login again.'));
            }
        }
        return Promise.reject(error);
    }
);

export default api;
