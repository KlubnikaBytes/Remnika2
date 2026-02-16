
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, User, Building, MapPin, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CountrySelector, COUNTRIES } from '@/components/ui/country-selector'
import { useCreateRecipient } from '@/hooks/use-recipients'

export default function AddRecipientPage() {
    const router = useRouter()
    const createRecipientMutation = useCreateRecipient()
    const [country, setCountry] = useState(COUNTRIES[0])

    // Form States
    const [fullName, setFullName] = useState('')
    const [bankName, setBankName] = useState('')
    const [accountNumber, setAccountNumber] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Split name
        const names = fullName.trim().split(' ')
        const firstName = names[0]
        const lastName = names.slice(1).join(' ') || ''

        try {
            await createRecipientMutation.mutateAsync({
                firstName,
                lastName,
                country: country.name, // Ensure this matches backend expectation
                bankName,
                accountNumber,
                currency: 'USD', // Default or derive from country
            } as any) // Type assertion if needed for Omit mismatch

            // Success
            router.push('/recipients')
        } catch (error) {
            console.error("Failed to add recipient", error)
            // Error handling UI
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="container mx-auto flex h-12 items-center justify-between">
                    <Link href="/recipients">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <h1 className="text-lg font-bold">Add New Recipient</h1>
                    <div className="w-16" />
                </div>
            </header>

            <main className="container mx-auto max-w-2xl px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <form onSubmit={handleSubmit}>
                        <Card className="overflow-hidden border-0 shadow-lg">
                            <CardHeader className="border-b border-gray-200 bg-gradient-to-br from-indigo-100 to-purple-100 p-6 dark:border-gray-800 dark:from-indigo-950 dark:to-purple-950">
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Recipient Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 p-6">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input
                                        placeholder="e.g. John Doe"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Country</Label>
                                    <CountrySelector selectedCountry={country} onSelect={setCountry} />
                                </div>

                                <div className="space-y-2">
                                    <Label>Bank Name</Label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                        <Input
                                            className="pl-9"
                                            placeholder="Select Bank"
                                            required
                                            value={bankName}
                                            onChange={(e) => setBankName(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Account Number / IBAN</Label>
                                    <Input
                                        placeholder="Enter account number"
                                        required
                                        value={accountNumber}
                                        onChange={(e) => setAccountNumber(e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {country.name === 'United States' ? 'Format: 7-12 digits' : 'Enter local bank account number'}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Address (Optional)</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                        <Input className="pl-9" placeholder="Recipient's address" />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 py-6 text-lg font-semibold hover:shadow-lg"
                                        disabled={createRecipientMutation.isPending}
                                    >
                                        {createRecipientMutation.isPending ? (
                                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Save className="h-5 w-5" />
                                                Save Recipient
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </motion.div>
            </main>
        </div>
    )
}
