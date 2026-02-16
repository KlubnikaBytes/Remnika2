
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface WalletBalance {
    currency: string;
    amount: number;
    symbol: string;
    flag: string;
    accountNumber?: string;
}

// Map currency codes to symbols and flags
const CURRENCY_META: Record<string, { symbol: string; flag: string }> = {
    USD: { symbol: '$', flag: '🇺🇸' },
    EUR: { symbol: '€', flag: '🇪🇺' },
    GBP: { symbol: '£', flag: '🇬🇧' },
    NGN: { symbol: '₦', flag: '🇳🇬' },
    INR: { symbol: '₹', flag: '🇮🇳' },
    PHP: { symbol: '₱', flag: '🇵🇭' },
    CAD: { symbol: 'C$', flag: '🇨🇦' },
    AUD: { symbol: 'A$', flag: '🇦🇺' },
    JPY: { symbol: '¥', flag: '🇯🇵' },
    CNY: { symbol: '¥', flag: '🇨🇳' },
    // Add defaults/fallback
};

const getMeta = (currency: string) => {
    return CURRENCY_META[currency] || { symbol: currency, flag: '🌍' };
}

const fetchBalances = async (): Promise<WalletBalance[]> => {
    try {
        const response: any = await api.get('/api/wallet/balance');
        // Backend returns single object: { currency: "USD", balance: 100.00 }
        // Frontend expects array for multi-currency carousel. 
        // For now, we wrap the single backend wallet in an array.
        // Future: Backend might support multiple wallets per user.

        const meta = getMeta(response.currency);
        return [{
            currency: response.currency,
            amount: response.balance,
            symbol: meta.symbol,
            flag: meta.flag,
            accountNumber: response.accountNumber
        }];
    } catch (error) {
        console.error("Failed to fetch wallet balance", error);
        return [];
    }
};

export function useWalletBalances() {
    return useQuery({
        queryKey: ['wallet-balances'],
        queryFn: fetchBalances,
        // reduce stale time to keep balance fresh
        staleTime: 5000,
        retry: false, // Don't retry if 404/500, we want to know so we can show init button
    });
}

// Deprecate or alias
export function useWalletBalance() {
    return useWalletBalances();
}

export function useCreateWallet() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            return await api.post('/api/wallet/create');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wallet-balances'] });
        }
    });
}
