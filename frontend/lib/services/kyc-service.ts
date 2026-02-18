import { api } from '@/lib/api';

export interface KYCStatus {
    email: string;
    kycStatus: 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED' | 'NOT_SUBMITTED';
    isVerified: boolean;
    submittedAt?: string;
    rejectionReason?: string;
}

export interface KYCSubmissionData {
    type: 'PASSPORT' | 'NATIONAL_ID' | 'DRIVERS_LICENSE'; // Matches backend enum or string expectation
    docNum: string;
    front: File;
    back?: File | null;
    selfie: File;
}

export const kycService = {
    async submitKYC(data: KYCSubmissionData) {
        const formData = new FormData();
        formData.append('type', data.type);
        formData.append('docNum', data.docNum);
        formData.append('front', data.front);
        if (data.back) {
            formData.append('back', data.back);
        }
        formData.append('selfie', data.selfie);

        return api.post('/api/kyc/submit', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    async getKYCStatus(): Promise<KYCStatus> {
        return api.get('/api/kyc/status');
    }
};
