'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, UserPlus, Edit, Trash2, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRecipients } from '@/hooks/use-recipients'

export default function RecipientsPage() {
    const { data: recipients, isLoading } = useRecipients()

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 dark:from-gray-950 dark:via-gray-900 dark:to-red-950">
            {/* Animated Background */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <motion.div
                    className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-red-400/20 to-orange-400/20 blur-3xl"
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 20, repeat: Infinity }}
                />
            </div>

            {/* Header */}
            <header className="relative border-b border-gray-200/50 bg-white/80 shadow-sm backdrop-blur-xl dark:border-gray-800/50 dark:bg-gray-900/80">
                <div className="container mx-auto px-4">
                    <div className="grid h-20 grid-cols-[auto_1fr_auto] items-center gap-4">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="sm" className="pl-2 pr-2 sm:pl-4 sm:pr-4">
                                <ArrowLeft className="h-5 w-5 sm:mr-2" />
                                <span className="hidden sm:inline">Dashboard</span>
                            </Button>
                        </Link>
                        <h1 className="text-center text-xl font-bold bg-gradient-to-r from-[#c00101] to-[#8f0101] bg-clip-text text-transparent sm:text-2xl">
                            Recipients
                        </h1>
                        <Link href="/recipients/add">
                            <Button size="sm" className="bg-gradient-to-r from-[#c00101] to-[#8f0101] hover:from-[#a00101] hover:to-[#6f0000]">
                                <UserPlus className="h-5 w-5 sm:mr-2" />
                                <span className="hidden sm:inline">Add New</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container relative mx-auto px-4 py-12">
                <div className="mx-auto max-w-4xl">
                    <div className="grid gap-6">
                        {isLoading ? (
                            <div className="text-center py-10">Loading recipients...</div>
                        ) : recipients?.length === 0 ? (
                            <div className="text-center py-10 border rounded-lg bg-white/50">
                                <p className="text-gray-500">No recipients found. Add one to get started!</p>
                            </div>
                        ) : (
                            recipients?.map((recipient, index) => (
                                <motion.div
                                    key={recipient.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="overflow-hidden border-0 shadow-lg transition-all hover:shadow-2xl">
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-950 dark:to-rose-950">
                                                        <span className="text-2xl font-bold text-[#c00101] dark:text-red-400">
                                                            {recipient.firstName?.[0]}{recipient.lastName?.[0]}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                                            {recipient.firstName} {recipient.lastName}
                                                        </h3>
                                                        <p className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                                            <MapPin className="h-4 w-4" />
                                                            {recipient.country}
                                                        </p>
                                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                                                            {recipient.bankName} • {recipient.accountNumber}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Link href={`/recipients/${recipient.id}/edit`}>
                                                        <Button variant="outline" size="sm">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )))}
                    </div>
                </div>
            </main>
        </div>
    )
}
