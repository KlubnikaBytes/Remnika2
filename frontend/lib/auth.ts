
import { api } from '@/lib/api';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// --- Types ---

export interface User {
    sub?: string; // JWT subject often used as ID
    // Add other fields if JWT decode provides them, or fetch from profile endpoint
    // The strict API response only gives a token, so user details might need to be decoded or fetched.
    // For now we will store the token.
}

interface TempAuthData {
    phoneNumber?: string;
    email?: string;
    otpMethod?: 'EMAIL' | 'PHONE';
    context: 'REGISTER' | 'LOGIN';
}

interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    tempAuthData: TempAuthData | null;
    isLoading: boolean;
    setToken: (token: string) => void;
    setTempAuthData: (data: TempAuthData | null) => void;
    logout: () => void;
}

// --- Store ---

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            isAuthenticated: false,
            tempAuthData: null,
            isLoading: false,
            setToken: (token) => {
                if (typeof window !== 'undefined') {
                    localStorage.setItem('token', token);
                }
                set({ token, isAuthenticated: true });
            },
            setTempAuthData: (data) => set({ tempAuthData: data }),
            logout: () => {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                }
                set({ token: null, isAuthenticated: false, tempAuthData: null });
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                token: state.token,
                isAuthenticated: state.isAuthenticated,
                tempAuthData: state.tempAuthData // Persist temp data for page reloads
            }),
        }
    )
);

// --- Service ---

export const authService = {
    async register(data: { fullName: string; phoneNumber: string; email: string; password: string; country: string; otpMethod: 'EMAIL' | 'PHONE' }) {
        // Device ID - simpler handling for web
        const deviceId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'web-device-id';

        console.log('Sending register request to API:', { ...data, deviceId });

        await api.post('/api/auth/register', {
            ...data,
            deviceId,
        });

        useAuthStore.getState().setTempAuthData({
            phoneNumber: data.phoneNumber,
            email: data.email,
            otpMethod: data.otpMethod,
            context: 'REGISTER'
            // We don't need to persist country in temp auth data as it's not needed for verification
        });
    },

    async login(data: { email?: string; phoneNumber?: string; password: string; otpMethod?: 'EMAIL' | 'PHONE' }) {
        await api.post('/api/auth/login', data);

        useAuthStore.getState().setTempAuthData({
            email: data.email,
            phoneNumber: data.phoneNumber,
            otpMethod: data.otpMethod,
            context: 'LOGIN'
        });
    },

    async verifyOtp(otp: string) {
        const { tempAuthData, setToken } = useAuthStore.getState();
        if (!tempAuthData) throw new Error('Session expired. Please try again.');

        let payload: any = { otp };

        if (tempAuthData.context === 'REGISTER') {
            // Doc says: Even if sent to Phone, must send email
            if (!tempAuthData.email) throw new Error('Email missing for verification');
            payload.email = tempAuthData.email;
        } else {
            // LOGIN
            // If the user chose a specific method, we should probably stick to the identifier associated with it if possible,
            // but the backend verify-otp just wants "email" or "phoneNumber".
            // If we have an email, prefer sending email. If we have phone, prefer phone.
            // BUT, unique constraint check:
            // If I logged in with Phone, I have phoneNumber.
            // If I logged in with Email, I have email. 
            // The verify endpoint checks: if phone provided -> verify by phone. else -> verify by email.

            if (tempAuthData.phoneNumber) {
                payload.phoneNumber = tempAuthData.phoneNumber;
            } else if (tempAuthData.email) {
                payload.email = tempAuthData.email;
            } else {
                throw new Error('No identifier found for verification');
            }
        }

        const response: any = await api.post('/api/auth/verify-otp', payload);

        if (response.token) {
            setToken(response.token);
            // Clear temp data after success
            useAuthStore.getState().setTempAuthData(null);
        }

        return response;
    },

    async forgotPasswordInitiate(data: { identifier: string; method: 'EMAIL' | 'PHONE' }) {
        const response = await api.post('/api/auth/forgot-password/initiate', data);

        // Store temp data for the reset flow
        useAuthStore.getState().setTempAuthData({
            email: data.method === 'EMAIL' ? data.identifier : undefined,
            phoneNumber: data.method === 'PHONE' ? data.identifier : undefined,
            otpMethod: data.method,
            context: 'LOGIN' // Reusing LOGIN context as it fits the flow
        });

        return response;
    },

    async forgotPasswordVerify(data: { identifier: string; otp: string; method: 'EMAIL' | 'PHONE' }) {
        return await api.post('/api/auth/forgot-password/verify', data);
    },

    async forgotPasswordUpdate(data: { identifier: string; newPassword: string; method: 'EMAIL' | 'PHONE' }) {
        const response = await api.post('/api/auth/forgot-password/update', data);

        // Clear temp data after successful password reset
        useAuthStore.getState().setTempAuthData(null);

        return response;
    },

    async logout() {
        try {
            await api.post('/api/auth/logout');
        } catch (error) {
            console.error('Logout failed on server:', error);
        } finally {
            useAuthStore.getState().logout();
        }
    }
};
