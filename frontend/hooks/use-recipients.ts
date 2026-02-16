
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Recipient {
    id: string;
    firstName: string;
    lastName: string;
    accountNumber: string;
    bankName: string;
    country: string; // e.g. "India", "Nigeria"
    currency: string; // "INR", "NGN"
    swiftCode?: string;
    relationship?: string;
    email?: string;
    phoneNumber?: string;
}

// Map country to currency (Frontend Helper)
// In a real app, this might come from a metadata API
export const COUNTRY_CURRENCY: Record<string, string> = {
    'India': 'INR',
    'Nigeria': 'NGN',
    'Philippines': 'PHP',
    'USA': 'USD',
    'Europe': 'EUR',
    'UK': 'GBP',
    // ... add more as needed
};

// --- API Functions ---

const fetchRecipients = async (): Promise<Recipient[]> => {
    // API: GET /api/recipients/my-list
    return await api.get('/api/recipients/my-list');
};

const createRecipient = async (data: Omit<Recipient, 'id'>) => {
    // API: POST /api/recipients/add
    return await api.post('/api/recipients/add', data);
};

// --- Hooks ---

export function useRecipients() {
    return useQuery({
        queryKey: ['recipients'],
        queryFn: fetchRecipients,
    });
}

export function useCreateRecipient() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createRecipient,
        onSuccess: () => {
            // Invalidate cache to refresh list
            queryClient.invalidateQueries({ queryKey: ['recipients'] });
        },
    });
}
