import { api } from '@/lib/api';
import { useQuery, useMutation } from '@tanstack/react-query';

export interface RiskScoreResponse {
    email: string;
    riskScore: number;
    level: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ValidationRequest {
    amount: number;
    recipientEmail: string;
}

export function useRiskScore() {
    return useQuery({
        queryKey: ['compliance-risk-score'],
        queryFn: async () => {
            const response = await api.get<RiskScoreResponse>('/api/compliance/risk-score');
            return response as unknown as RiskScoreResponse;
        },
        retry: 1, // Don't retry too many times if it fails
    });
}

export function useValidateTransaction() {
    return useMutation({
        mutationFn: async (data: ValidationRequest) => {
            // "api/transactions/transfer" is the validation endpoint as per requirement
            // It returns 200 OK if valid, or 400 Bad Request with error if invalid.
            return await api.post('/api/transactions/transfer', data);
        }
    });
}
