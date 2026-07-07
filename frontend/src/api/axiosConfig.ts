import axios from 'axios';

const api = axios.create({
    // Bulletproof logic: Use the environment variable if it exists, 
    // otherwise fallback to localhost for local development without Docker.
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;