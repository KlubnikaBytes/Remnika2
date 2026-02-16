'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCreateWallet } from '@/hooks/use-wallet';
import { Wallet } from 'lucide-react';
import { useState } from 'react';

export function InjectWalletInit() {
    const { mutate: createWallet, isPending } = useCreateWallet();
    const [error, setError] = useState('');

    const handleInit = () => {
        createWallet(undefined, {
            onError: () => setError("Failed to initialize. Try again.")
        });
    };

    return (
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[#c00101] to-[#8f0101] shadow-2xl shadow-[#c00101]/20">
            <CardContent className="p-8 flex flex-col items-center justify-center text-center text-white h-full min-h-[300px]">
                <div className="mb-4 bg-white/20 p-4 rounded-full">
                    <Wallet className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Activate Your Wallet</h3>
                <p className="text-white/80 mb-6 max-w-xs">
                    Get started by activating your multi-currency wallet.
                </p>

                {error && <p className="text-sm text-red-200 mb-4 bg-red-900/50 px-3 py-1 rounded">{error}</p>}

                <Button
                    onClick={handleInit}
                    disabled={isPending}
                    className="bg-white text-[#c00101] hover:bg-white/90 font-bold px-8"
                >
                    {isPending ? 'Activating...' : 'Activate Wallet'}
                </Button>
            </CardContent>
        </Card>
    );
}
