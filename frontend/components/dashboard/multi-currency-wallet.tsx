
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Plus, ArrowUpRight, ArrowDownLeft, RefreshCcw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useWalletBalances } from '@/hooks/use-wallet'
import { cn } from '@/lib/utils'
import { CurrencyConversionModal } from '@/components/wallet/currency-conversion-modal'
import { AddMoneyModal } from '@/components/wallet/add-money-modal'
import { InjectWalletInit } from '@/components/wallet/inject-wallet-init'

export function MultiCurrencyWallet() {
    const { data: balances, isLoading } = useWalletBalances()
    const [currentIndex, setCurrentIndex] = useState(0)
    const [direction, setDirection] = useState(0)
    const [isConversionOpen, setIsConversionOpen] = useState(false)
    const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false)

    const nextCurrency = () => {
        if (!balances) return
        setDirection(1)
        setCurrentIndex((prev) => (prev + 1) % balances.length)
    }

    const prevCurrency = () => {
        if (!balances) return
        setDirection(-1)
        setCurrentIndex((prev) => (prev - 1 + balances.length) % balances.length)
    }

    if (isLoading) {
        return (
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[#c00101] to-[#8f0101] shadow-2xl shadow-[#c00101]/20">
                <CardContent className="p-8">
                    <div className="flex h-48 items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-white" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!balances || balances.length === 0) {
        return <InjectWalletInit />;
    }

    const currentBalance = balances[currentIndex]

    return (
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[#c00101] to-[#8f0101] shadow-2xl shadow-[#c00101]/20">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-red-500/20 blur-3xl" />

            <CardContent className="relative p-8 text-white">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <p className="font-medium text-white/90">Total Balance</p>
                        <div className="mt-1 flex items-center gap-2">
                            <span className="text-2xl">{currentBalance.flag}</span>
                            <span className="text-sm font-semibold opacity-90">{currentBalance.currency} Wallet</span>
                        </div>
                        {currentBalance.accountNumber && (
                            <p className="text-xs text-white/70 mt-1">Acc: {currentBalance.accountNumber}</p>
                        )}
                    </div>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="rounded-full bg-white/10 text-white hover:bg-white/20"
                        onClick={() => setIsAddMoneyOpen(true)}
                    >
                        <Plus className="h-5 w-5" />
                    </Button>
                </div>

                <div className="relative mb-8 h-20">
                    <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                        <motion.div
                            key={currentIndex}
                            custom={direction}
                            initial={{ x: direction > 0 ? 100 : -100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: direction > 0 ? -100 : 100, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="absolute inset-0"
                        >
                            <h3 className="text-5xl font-bold tracking-tight">
                                {currentBalance.symbol}{currentBalance.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h3>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Currency Navigation Dots */}
                <div className="mb-8 flex justify-center gap-2">
                    {balances.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setDirection(idx > currentIndex ? 1 : -1)
                                setCurrentIndex(idx)
                            }}
                            className={cn(
                                "h-2 w-2 rounded-full transition-all",
                                idx === currentIndex ? "w-6 bg-white" : "bg-white/30 hover:bg-white/50"
                            )}
                        />
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-4">
                    <Link href="/send-money" className="w-full">
                        <Button
                            className="flex h-auto w-full flex-col gap-2 border-0 bg-white/10 py-4 text-white hover:bg-white/20"
                            variant="outline"
                        >
                            <div className="rounded-full bg-white/20 p-2">
                                <ArrowUpRight className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-medium">Send</span>
                        </Button>
                    </Link>
                    <Button
                        className="flex h-auto flex-col gap-2 border-0 bg-white/10 py-4 text-white hover:bg-white/20"
                        variant="outline"
                        onClick={() => setIsAddMoneyOpen(true)}
                    >
                        <div className="rounded-full bg-white/20 p-2">
                            <ArrowDownLeft className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-medium">Add Money</span>
                    </Button>
                    <Button
                        className="flex h-auto flex-col gap-2 border-0 bg-white/10 py-4 text-white hover:bg-white/20"
                        variant="outline"
                        onClick={() => setIsConversionOpen(true)}
                    >
                        <div className="rounded-full bg-white/20 p-2">
                            <RefreshCcw className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-medium">Exchange</span>
                    </Button>
                </div>
            </CardContent>

            {/* Navigation Arrows (visible on hover/desktop, or always on mobile) */}
            <div className="absolute inset-y-0 left-0 flex items-center pl-2">
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={prevCurrency}
                    className="h-8 w-8 rounded-full bg-black/10 text-white hover:bg-black/20"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={nextCurrency}
                    className="h-8 w-8 rounded-full bg-black/10 text-white hover:bg-black/20"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Conversion Modal */}
            <CurrencyConversionModal
                isOpen={isConversionOpen}
                onClose={() => setIsConversionOpen(false)}
                sourceBalance={currentBalance}
            />

            {/* Add Money Modal */}
            <AddMoneyModal
                isOpen={isAddMoneyOpen}
                onClose={() => setIsAddMoneyOpen(false)}
                currentBalance={currentBalance}
            />
        </Card>
    )
}
