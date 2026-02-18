'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Send, Users, History, Settings, TrendingUp, Clock, LogOut, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MultiCurrencyWallet } from '@/components/dashboard/multi-currency-wallet'

import { useTransactions } from '@/hooks/use-transactions'
import { useLanguage } from '@/lib/language-context'
import { useRiskScore } from '@/hooks/use-compliance'

export default function DashboardPage() {
    const { t } = useLanguage()
    const { data: transactions, isLoading: isLoadingTransactions } = useTransactions()
    const { data: riskData } = useRiskScore()
    const riskScore = riskData?.riskScore || 0
    const riskLevel = riskData?.level || 'LOW'


    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 dark:from-gray-950 dark:via-gray-900 dark:to-red-950">
            {/* Animated Background */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <motion.div
                    className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-red-400/20 to-orange-400/20 blur-3xl"
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 20, repeat: Infinity }}
                />
                <motion.div
                    className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-br from-rose-400/20 to-red-400/20 blur-3xl"
                    animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90] }}
                    transition={{ duration: 25, repeat: Infinity }}
                />
            </div>

            {/* Header */}
            <header className="relative border-b border-gray-200/50 bg-white/80 shadow-sm backdrop-blur-xl dark:border-gray-800/50 dark:bg-gray-900/80">
                <div className="container mx-auto px-4">
                    <div className="flex h-20 items-center justify-between">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#c00101] to-[#8f0101] bg-clip-text text-transparent">
                            Home
                        </h1>
                        <div className="flex items-center gap-2 sm:gap-4">
                            <Link href="/settings">
                                <Button variant="ghost" size="sm">
                                    <Settings className="h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="/login">
                                <Button variant="outline" size="sm" className="px-2 sm:px-4">
                                    <LogOut className="h-5 w-5 sm:hidden" />
                                    <span className="hidden sm:inline">Logout</span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container relative mx-auto px-4 py-12">
                <div className="mx-auto max-w-6xl">
                    {/* Welcome Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('dashboard.welcome')}</h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">{t('dashboard.overview')}</p>
                    </motion.div>

                    {/* Balance Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-8"
                    >
                        <MultiCurrencyWallet />
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-12 grid gap-4 md:grid-cols-3"
                    >
                        <Link href="/send-money">
                            <Card className="group cursor-pointer overflow-hidden border-0 bg-white/60 backdrop-blur-sm transition-all hover:-translate-y-2 hover:shadow-2xl dark:bg-gray-900/60">
                                <CardContent className="flex items-center gap-4 p-6">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#c00101] to-[#8f0101] shadow-lg">
                                        <Send className="h-7 w-7 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white">Send Money</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Transfer worldwide</p>
                                    </div>
                                    <ArrowRight className="ml-auto h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1" />
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/recipients">
                            <Card className="group cursor-pointer overflow-hidden border-0 bg-white/60 backdrop-blur-sm transition-all hover:-translate-y-2 hover:shadow-2xl dark:bg-gray-900/60">
                                <CardContent className="flex items-center gap-4 p-6">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-gray-700 to-gray-600 shadow-lg">
                                        <Users className="h-7 w-7 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white">Recipients</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Manage contacts</p>
                                    </div>
                                    <ArrowRight className="ml-auto h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1" />
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/transactions">
                            <Card className="group cursor-pointer overflow-hidden border-0 bg-white/60 backdrop-blur-sm transition-all hover:-translate-y-2 hover:shadow-2xl dark:bg-gray-900/60">
                                <CardContent className="flex items-center gap-4 p-6">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg">
                                        <History className="h-7 w-7 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white">Transactions</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">View history</p>
                                    </div>
                                    <ArrowRight className="ml-auto h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1" />
                                </CardContent>
                            </Card>
                        </Link>
                    </motion.div>

                    {/* Compliance / Risk Score Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="mb-8"
                    >
                        <Card className="border-0 bg-white/60 backdrop-blur-sm dark:bg-gray-900/60">
                            <CardContent className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-4">
                                    <div className={`flex h-14 w-14 items-center justify-center rounded-xl shadow-lg ${riskLevel === 'LOW' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' :
                                            riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30' :
                                                'bg-red-100 text-red-600 dark:bg-red-900/30'
                                        }`}>
                                        <Shield className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white">Account Safety Level</h4>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-lg font-bold ${riskLevel === 'LOW' ? 'text-green-600' :
                                                    riskLevel === 'MEDIUM' ? 'text-yellow-600' :
                                                        'text-red-600'
                                                }`}>
                                                {riskLevel} RISK
                                            </span>
                                            <span className="text-sm text-gray-500">({riskScore}/100)</span>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm">View Details</Button>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Recent Transactions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="overflow-hidden border-0 shadow-xl">
                            <CardHeader className="border-b border-gray-200 bg-white/60 p-6 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/60">
                                <CardTitle className="flex items-center gap-2">
                                    <History className="h-5 w-5" />
                                    Recent Transactions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {isLoadingTransactions ? (
                                    <div className="p-6 text-center text-gray-500">Loading transactions...</div>
                                ) : transactions?.length === 0 ? (
                                    <div className="p-6 text-center text-gray-500">No recent transactions</div>
                                ) : (
                                    transactions?.map((tx, index) => (
                                        <motion.div
                                            key={tx.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 + index * 0.1 }}
                                            className="flex items-center justify-between border-b border-gray-200 p-6 transition-colors last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900/50"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-950 dark:to-rose-950">
                                                    <TrendingUp className="h-6 w-6 text-[#c00101] dark:text-red-400" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-white">
                                                        {tx.type === 'DEPOSIT' ? 'Deposit' : 'Transfer'}
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(tx.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    {tx.amount} {tx.currency}
                                                </p>
                                                <Badge
                                                    variant={tx.status === 'SUCCESS' ? 'default' : 'secondary'}
                                                    className={tx.status === 'SUCCESS' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400'}
                                                >
                                                    {tx.status}
                                                </Badge>
                                            </div>
                                        </motion.div>
                                    )))}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </main>
        </div>
    )
}
