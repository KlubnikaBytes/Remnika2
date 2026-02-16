import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Inject Token
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token'); // match strict requirements
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle Errors
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Optional: Auto-logout on 401?
            // For now just pass the error
        }
        // Return a consistent error object or message
        const message = error.response?.data?.error || error.response?.data?.message || 'Something went wrong';
        return Promise.reject(new Error(message));
    }
);
