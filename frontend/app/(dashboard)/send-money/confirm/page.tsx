
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, User, ChevronRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useSendMoneyStore } from '@/hooks/use-send-money-store'
import { useSendMoney } from '@/hooks/use-transfers'
import { useToast } from '@/components/ui/use-toast'

export default function ConfirmTransferPage() {
    const router = useRouter()
    const { quote, recipient, setRecipient } = useSendMoneyStore()
    const [isLoading, setIsLoading] = useState(false)

    // Redirect if no recipient selected (should have come from recipient page)
    useEffect(() => {
        if (!recipient) {
            router.push('/send-money/recipient')
        } else if (!quote) {
            router.push('/send-money')
        }
    }, [recipient, quote, router])

    const { mutate: sendMoney, isPending } = useSendMoney()
    const { toast } = useToast()

    const handleConfirm = () => {
        if (!recipient || !quote) return

        sendMoney({
            recipientAccountNumber: recipient.accountNumber,
            amount: quote.sourceAmount,
            description: "Transfer to " + recipient.name
        }, {
            onSuccess: () => {
                router.push('/send-money/success')
            },
            onError: (error: any) => {
                toast({
                    title: "Transfer Failed",
                    description: error.response?.data?.message || "Something went wrong",
                    variant: "destructive"
                })
            }
        })
    }

    if (!recipient || !quote) {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="container mx-auto flex h-12 items-center justify-between">
                    <Link href="/send-money">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <h1 className="text-lg font-bold">Confirm Transfer</h1>
                    <div className="w-16" />
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="mx-auto max-w-lg space-y-6">
                    {/* Summary Card */}
                    <Card className="overflow-hidden border-0 shadow-lg">
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 text-white">
                            <p className="text-sm opacity-90">You are sending</p>
                            <h2 className="text-3xl font-bold">
                                {quote.sourceAmount.toFixed(2)} {quote.sourceCurrency}
                            </h2>
                            <div className="mt-4 flex items-center gap-2 text-sm opacity-80">
                                <span>Exchange Rate: 1 {quote.sourceCurrency} = {quote.exchangeRate.toFixed(4)} {quote.targetCurrency}</span>
                            </div>
                        </div>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Recipient will get</span>
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        {quote.targetAmount.toFixed(2)} {quote.targetCurrency}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Total fees</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {(quote.fees.transferFee + quote.fees.serviceFee).toFixed(2)} {quote.sourceCurrency}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Selected Recipient Display */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 dark:text-white">Recipient</h3>
                            <Link href="/send-money/recipient">
                                <Button variant="link" className="h-auto p-0 text-indigo-600">Change</Button>
                            </Link>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                                <User className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">{recipient.name}</p>
                                <p className="text-sm text-gray-500">{recipient.bank} • {recipient.accountNumber}</p>
                                <p className="text-sm text-gray-500">{recipient.country}</p>
                            </div>
                        </div>
                    </div>

                    {/* Confirm Button */}
                    <Button
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 py-6 text-lg font-bold shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40"
                        disabled={!recipient || isPending}
                        onClick={handleConfirm}
                    >
                        {isPending ? (
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                            'Confirm & Send'
                        )}
                    </Button>
                </div>
            </main>
        </div>
    )
}

function Plus({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}
