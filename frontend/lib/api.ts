import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 60000, // 60 seconds timeout for large uploads
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
        console.error("API Error Interceptor:", error); // Log full error object

        if (error.code === 'ERR_NETWORK') {
            return Promise.reject(new Error("Cannot connect to server. Please ensure the backend is running."));
        }

        if (error.response && error.response.status === 401) {
            // Optional: Auto-logout on 401?
            // For now just pass the error
        }
        // Return a consistent error object or message
        const message =
            error.response?.data?.error ||
            error.response?.data?.message ||
            (typeof error.response?.data === 'string' ? error.response.data : 'Something went wrong');
        return Promise.reject(new Error(message));
    }
);
