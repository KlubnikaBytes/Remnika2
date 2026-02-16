import { api } from '@/lib/api';

export interface Recipient {
    id: string;
    firstName: string;
    lastName: string;
    country: string;
    bankName: string;
    accountNumber: string;
}

export const recipientService = {
    async addRecipient(data: Omit<Recipient, 'id'>) {
        // Backend response is just a string message "Recipient profile stored successfully!"
        // So we don't expect JSON return, or maybe plain text.
        // Axios handles JSON by default, let's see API client.
        // Client returns response.data.
        // If it's plain text, we might need to handle it.
        // Assuming backend returns 200 OK.
        return api.post('/api/recipients/add', data);
    },

    async getRecipients(): Promise<Recipient[]> {
        return api.get('/api/recipients/my-list');
    }
};
