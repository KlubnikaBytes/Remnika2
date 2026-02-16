
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export interface Transaction {
    id: string;
    amount: number;
    currency: string;
    type: string; // DEPOSIT, TRANSFER_OUT
    status: string;
    createdAt: string;
    gatewayReference?: string;
    // Helper fields for UI
    recipient?: string;
    date?: string;
}

const fetchTransactions = async (): Promise<Transaction[]> => {
    try {
        const response: any[] = await api.get('/api/wallet/history');

        return response.map((tx: any) => ({
            id: tx.id,
            amount: tx.amount,
            currency: tx.currency,
            type: tx.transactionType,
            status: tx.status,
            createdAt: tx.createdAt,
            gatewayReference: tx.gatewayReference,
            // Format date for UI
            date: new Date(tx.createdAt).toLocaleDateString() + ' ' + new Date(tx.createdAt).toLocaleTimeString(),
            // Recipient logic (if applicable)
            recipient: tx.transactionType === 'DEPOSIT' ? 'Top-up' : 'Transfer'
        }));
    } catch (error) {
        console.error("Failed to fetch transactions", error);
        return [];
    }
};

export function useTransactions() {
    return useQuery({
        queryKey: ['wallet-transactions'],
        queryFn: fetchTransactions,
        staleTime: 10000,
    });
}
