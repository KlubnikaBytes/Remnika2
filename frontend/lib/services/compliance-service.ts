import { api } from '@/lib/api';

export interface RiskScoreResponse {
    email: string;
    riskScore: number;
    level: 'LOW' | 'MEDIUM' | 'HIGH';
}

export const complianceService = {
    async getRiskScore(): Promise<RiskScoreResponse> {
        return api.get('/api/compliance/risk-score');
    }
};
