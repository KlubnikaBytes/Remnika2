
import { api } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';

interface InitiatePaymentResponse {
    gatewayOrderId: string;
    status: string;
}

interface VerifyPaymentRequest {
    paymentId: string;
    amount: string; // Backend expects BigDecimal compatible string or number
}

// --- API Functions ---

const initiatePayment = async (amount: number): Promise<InitiatePaymentResponse> => {
    return await api.post('/api/payments/initiate', { amount });
};

const verifyPayment = async (data: VerifyPaymentRequest) => {
    return await api.post('/api/payments/verify', data);
};

// --- Hooks ---

export function useInitiatePayment() {
    return useMutation({
        mutationFn: initiatePayment,
    });
}

export function useVerifyPayment() {
    return useMutation({
        mutationFn: verifyPayment,
    });
}
