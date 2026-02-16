
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, User, ChevronRight, Check, Plus, Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { useSendMoneyStore } from '@/hooks/use-send-money-store'
import { recipientService, Recipient } from '@/lib/services/recipient'

export default function RecipientPage() {
    const router = useRouter()
    const { quote, setRecipient, targetCountry } = useSendMoneyStore()
    const [searchQuery, setSearchQuery] = useState('')
    const [isAddingRecipient, setIsAddingRecipient] = useState(false)
    const [newRecipientName, setNewRecipientName] = useState('')
    const [newRecipientBank, setNewRecipientBank] = useState('')
    const [newRecipientAccount, setNewRecipientAccount] = useState('')

    // API State
    const [savedRecipients, setSavedRecipients] = useState<Recipient[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Fetch recipients on mount
    useEffect(() => {
        const fetchRecipients = async () => {
            try {
                const data = await recipientService.getRecipients()
                setSavedRecipients(data)
            } catch (error) {
                console.error('Failed to fetch recipients', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchRecipients()
    }, [])

    const filteredRecipients = savedRecipients.filter(r =>
        (r.firstName + ' ' + r.lastName).toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.bankName.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleSelectRecipient = (recipient: Recipient) => {
        // Map backend recipient to store recipient format
        setRecipient({
            // Map backend UUID to store ID (cast to any for now as store expects number)
            id: recipient.id as any,
            name: `${recipient.firstName} ${recipient.lastName}`,
            country: recipient.country,
            accountNumber: recipient.accountNumber,
            bank: recipient.bankName
        })
        router.push('/send-money/confirm')
    }

    const handleAddRecipient = async () => {
        if (!newRecipientName || !newRecipientBank || !newRecipientAccount) return

        setIsSubmitting(true)
        try {
            const nameParts = newRecipientName.trim().split(' ')
            const firstName = nameParts[0]
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''

            const newRecipientData = {
                firstName,
                lastName: lastName || 'Unknown', // Fallback if single name
                country: targetCountry?.name || 'Unknown',
                bankName: newRecipientBank,
                accountNumber: newRecipientAccount
            }

            // Call API
            await recipientService.addRecipient(newRecipientData)

            // Refresh list
            const data = await recipientService.getRecipients()
            setSavedRecipients(data)

            // Find the new one (simplified logic: just pick the last one or match details)
            // For now, just close modal and let user select (or auto select if we can find it)
            setIsAddingRecipient(false)
            setNewRecipientName('')
            setNewRecipientBank('')
            setNewRecipientAccount('')

            // Ideally auto-select, but list refresh might reorder.
        } catch (error) {
            console.error('Failed to add recipient', error)
            // Show error in UI? current UI has no error state in modal.
        } finally {
            setIsSubmitting(false)
        }
    }

    // Redirect if no quote (user jumped here directly)
    useEffect(() => {
        if (!quote) {
            router.push('/send-money')
        }
    }, [quote, router])

    if (!quote) {
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
                    <h1 className="text-lg font-bold">Select Recipient</h1>
                    <div className="w-16" />
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="mx-auto max-w-lg">
                    {/* Steps Indicator */}
                    <div className="mb-8 flex justify-center gap-2">
                        <div className="h-2 w-8 rounded-full bg-[#c00101]"></div>
                        <div className="h-2 w-8 rounded-full bg-[#c00101]"></div>
                        <div className="h-2 w-8 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                    </div>

                    <div className="space-y-6">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Search name, tag, or email"
                                className="pl-10 text-lg py-6 rounded-2xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Recent/Saved Recipients */}
                        <div>
                            <h3 className="mb-4 font-semibold text-gray-500">Recipients</h3>
                            <div className="space-y-3">
                                {isLoading ? (
                                    <div className="flex justify-center p-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                                    </div>
                                ) : (
                                    <motion.div layout className="space-y-3">
                                        {filteredRecipients.map((rec) => (
                                            <motion.div
                                                key={rec.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleSelectRecipient(rec)}
                                                className="cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-indigo-100 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-950 dark:to-rose-950">
                                                        <span className="text-lg font-bold text-[#c00101] dark:text-red-400">
                                                            {rec.firstName.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-gray-900 dark:text-white">{rec.firstName} {rec.lastName}</h4>
                                                        <p className="text-sm text-gray-500">{rec.bankName} •• {rec.accountNumber.slice(-4)}</p>
                                                    </div>
                                                    <ChevronRight className="h-5 w-5 text-gray-400" />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}

                                {!isLoading && filteredRecipients.length === 0 && (
                                    <div className="py-8 text-center text-gray-500">
                                        No recipients found
                                    </div>
                                )}

                                <Button
                                    variant="outline"
                                    className="w-full justify-start gap-4 rounded-2xl border-dashed py-8 text-[#c00101] hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20"
                                    onClick={() => setIsAddingRecipient(true)}
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
                                        <Plus className="h-5 w-5" />
                                    </div>
                                    <span className="text-lg font-semibold">New Recipient</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Add Recipient Modal */}
            <Modal
                isOpen={isAddingRecipient}
                onClose={() => setIsAddingRecipient(false)}
                title="Add New Recipient"
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                        <Input
                            placeholder="e.g. John Doe"
                            value={newRecipientName}
                            onChange={(e) => setNewRecipientName(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bank Name</label>
                        <Input
                            placeholder="e.g. Chase Bank"
                            value={newRecipientBank}
                            onChange={(e) => setNewRecipientBank(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Number</label>
                        <Input
                            placeholder="e.g. 1234567890"
                            value={newRecipientAccount}
                            onChange={(e) => setNewRecipientAccount(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                    <Button
                        className="w-full bg-[#c00101] hover:bg-[#a00101] mt-4"
                        onClick={handleAddRecipient}
                        disabled={!newRecipientName || !newRecipientBank || !newRecipientAccount || isSubmitting}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Adding...
                            </span>
                        ) : 'Add & Select'}
                    </Button>
                </div>
            </Modal>
        </div>
    )
}
