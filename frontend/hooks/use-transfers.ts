import { api } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface TransferRequest {
    recipientAccountNumber: string;
    amount: number;
    description: string;
}

export function useSendMoney() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: TransferRequest) => {
            return await api.post('/api/transfers/send', data);
        },
        onSuccess: () => {
            // Invalidate wallet balance so it updates immediately
            queryClient.invalidateQueries({ queryKey: ['wallet-balances'] });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
        },
    });
}
