'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, Clock, TrendingDown, Zap, Shield, ArrowDownUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { CountrySelector, COUNTRIES } from '@/components/ui/country-selector'
import { useSendMoneyStore } from '@/hooks/use-send-money-store'
import { useRouter } from 'next/navigation'



interface Quote {
    quoteId: string
    sourceCurrency: string
    targetCurrency: string
    sourceAmount: number
    targetAmount: number
    exchangeRate: number
    fees: {
        transferFee: number
        serviceFee: number
    }
    expiresAt: number
}

import { useExchangeRates } from '@/hooks/use-exchange-rates'
import { useWalletBalances } from '@/hooks/use-wallet';

// ... imports remain the same

export default function SendMoneyPage() {
    const router = useRouter()
    const {
        amount, setAmount,
        sourceCountry, setSourceCountry,
        targetCountry, setTargetCountry,
        quote, setQuote
    } = useSendMoneyStore()

    const { data: balances } = useWalletBalances();

    const [currentStep, setCurrentStep] = useState(1)
    const [isLoadingQuote, setIsLoadingQuote] = useState(false)
    const [secondsRemaining, setSecondsRemaining] = useState(0)

    // Fetch real-time rates
    const { rates, isLoading: isRatesLoading } = useExchangeRates(sourceCountry?.currency || 'USD')

    // Initialize countries if not set in store
    useEffect(() => {
        if (!sourceCountry) setSourceCountry(COUNTRIES[0])
        if (!targetCountry) setTargetCountry(COUNTRIES[4])
    }, [])

    // Generate quote when amount changes
    useEffect(() => {
        if (!amount || parseFloat(amount) <= 0 || !sourceCountry || !targetCountry || !rates) {
            setQuote(null)
            return
        }

        setIsLoadingQuote(true)

        // Check balance
        const sourceWallet = balances?.find(b => b.currency === sourceCountry.currency) || balances?.[0];
        if (sourceWallet) {
            const amountNum = parseFloat(amount);
            if (amountNum > sourceWallet.amount) {
                // Delay slightly to confirm
                setTimeout(() => {
                    setQuote(null);
                    setIsLoadingQuote(false);
                    // Optional: You could set a specific error state here to show "Insufficient Balance" in UI
                    console.warn("Insufficient funds");
                }, 200);
                return;
            }
        }
        // Simulate calculation delay for UX
        const timer = setTimeout(() => {
            const sourceAmt = parseFloat(amount)
            // Use real-time rate
            const rate = rates[targetCountry.currency] || 1
            const transferFee = sourceAmt * 0.01 // 1% transfer fee
            const serviceFee = sourceAmt * 0.01 // 1% service fee (percentage-based)
            const totalFees = transferFee + serviceFee // Total: 2%
            const targetAmt = (sourceAmt - totalFees) * rate

            setQuote({
                quoteId: `Q${Date.now()}`,
                sourceCurrency: sourceCountry.currency,
                targetCurrency: targetCountry.currency,
                sourceAmount: sourceAmt,
                targetAmount: targetAmt,
                exchangeRate: rate,
                fees: {
                    transferFee: transferFee,
                    serviceFee: serviceFee,
                },
                expiresAt: Date.now() + 60000, // 60 seconds
            })
            setSecondsRemaining(60)
            setIsLoadingQuote(false)
        }, 500)

        return () => clearTimeout(timer)
    }, [amount, sourceCountry, targetCountry, rates])

    // Quote expiry countdown
    useEffect(() => {
        if (!quote || secondsRemaining <= 0) return

        const timer = setInterval(() => {
            setSecondsRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [quote, secondsRemaining])

    const handleContinue = () => {
        router.push('/send-money/recipient')
    }


    const swapCountries = () => {
        if (!sourceCountry || !targetCountry) return
        setSourceCountry(targetCountry)
        setTargetCountry(sourceCountry)
    }

    if (!sourceCountry || !targetCountry) return null // Wait for hydration

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 dark:from-gray-950 dark:via-gray-900 dark:to-red-950">
            {/* Animated Background Elements */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <motion.div
                    className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-red-400/20 to-orange-400/20 blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />
                <motion.div
                    className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-br from-rose-400/20 to-red-400/20 blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        rotate: [90, 0, 90],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />
            </div>

            {/* Header */}
            <motion.header
                className="relative border-b border-gray-200/50 bg-white/80 shadow-sm backdrop-blur-xl dark:border-gray-800/50 dark:bg-gray-900/80"
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 100 }}
            >
                <div className="container mx-auto px-4">
                    <div className="flex h-20 items-center justify-between">
                        <Link href="/dashboard">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 rounded-xl px-2 py-2 text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900 sm:px-4 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                <span className="hidden font-medium sm:inline">Dashboard</span>
                            </motion.button>
                        </Link>

                        <div className="absolute left-1/2 -translate-x-1/2">
                            <motion.h1
                                className="text-xl font-bold bg-gradient-to-r from-[#c00101] to-[#8f0101] bg-clip-text text-transparent sm:text-2xl"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                Send Money
                            </motion.h1>
                        </div>

                        <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="hidden gap-1.5 px-3 py-1.5 sm:flex">
                                <Zap className="h-3.5 w-3.5 text-yellow-600" />
                                <span className="text-xs font-semibold">Instant</span>
                            </Badge>
                            <Badge variant="secondary" className="hidden gap-1.5 px-3 py-1.5 sm:flex">
                                <Shield className="h-3.5 w-3.5 text-green-600" />
                                <span className="text-xs font-semibold">Secure</span>
                            </Badge>
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* Main Content */}
            <main className="container relative mx-auto px-4 py-12 pb-24">
                <div className="mx-auto max-w-4xl">
                    {/* Progress Steps */}
                    <motion.div
                        className="mb-8 flex items-center justify-center gap-1 sm:gap-4 sm:mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        {[
                            { num: 1, label: 'Amount' },
                            { num: 2, label: 'Recipient' },
                            { num: 3, label: 'Confirm' },
                        ].map((step, index) => (
                            <div key={step.num} className="flex items-center">
                                {index > 0 && (
                                    <motion.div
                                        className="mx-1 h-0.5 w-8 bg-gradient-to-r from-gray-300 to-gray-300 sm:mx-4 sm:w-20 dark:from-gray-700 dark:to-gray-700"
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: currentStep > index ? 1 : 0.3 }}
                                        transition={{ duration: 0.5 }}
                                        style={{
                                            background: currentStep > index
                                                ? 'linear-gradient(to right, #c00101, #8f0101)'
                                                : undefined,
                                        }}
                                    />
                                )}
                                <div className="flex flex-col items-center">
                                    <motion.div
                                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shadow-lg transition-all sm:h-12 sm:w-12 sm:text-sm ${currentStep >= step.num
                                            ? 'bg-gradient-to-br from-[#c00101] to-[#8f0101] text-white shadow-[#c00101]/50'
                                            : 'bg-white text-gray-400 shadow-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:shadow-gray-900'
                                            }`}
                                        animate={{
                                            scale: currentStep === step.num ? [1, 1.1, 1] : 1,
                                        }}
                                        transition={{
                                            duration: 0.5,
                                            repeat: currentStep === step.num ? Infinity : 0,
                                            repeatDelay: 2,
                                        }}
                                    >
                                        {step.num}
                                    </motion.div>
                                    <span
                                        className={`mt-2 text-[10px] font-medium sm:text-sm ${currentStep >= step.num
                                            ? 'text-gray-900 dark:text-white'
                                            : 'text-gray-500 dark:text-gray-400'
                                            }`}
                                    >
                                        {step.label}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </motion.div>

                    {/* Amount Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="mb-8 border-0 shadow-2xl shadow-[#c00101]/10 rounded-2xl">
                            <div className="bg-gradient-to-br from-[#c00101] to-[#8f0101] p-6 rounded-t-2xl">
                                <CardTitle className="text-2xl text-white">How much do you want to send?</CardTitle>
                                <p className="mt-2 text-white/90">Fast, secure, and transparent transfers</p>
                            </div>

                            <CardContent className="space-y-8 p-8">
                                {/* Source Country - You Send */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#c00101]/10 text-xs text-[#c00101] dark:bg-[#c00101]/20 dark:text-[#c00101]">
                                            1
                                        </span>
                                        You send
                                    </label>

                                    {/* Country Selector */}
                                    <CountrySelector
                                        selectedCountry={sourceCountry}
                                        onSelect={setSourceCountry}
                                    />

                                    {/* Amount Input */}
                                    <div className="relative flex-1">
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl font-bold text-gray-400 dark:text-gray-500">
                                            {sourceCountry.symbol}
                                        </span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="1"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full border-0 bg-transparent pl-12 text-4xl font-bold text-gray-900 placeholder-gray-300 outline-none dark:text-white dark:placeholder-gray-600"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Swap Button */}
                    <div className="flex justify-center">
                        <motion.button
                            type="button"
                            onClick={swapCountries}
                            className="group relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c00101] to-[#8f0101] text-white shadow-lg shadow-[#c00101]/50 transition-all hover:shadow-xl hover:shadow-[#c00101]/60"
                            whileHover={{ scale: 1.1, rotate: 180 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <ArrowDownUp className="h-6 w-6" />
                            <div className="absolute -inset-2 -z-10 rounded-2xl bg-gradient-to-br from-[#c00101] to-[#8f0101] opacity-0 blur-xl transition-opacity group-hover:opacity-70" />
                        </motion.button>
                    </div>

                    {/* Target Country - They Receive */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Card className="mt-8 mb-8 border-0 shadow-2xl shadow-[#8f0101]/10 rounded-2xl">
                            <div className="bg-gradient-to-br from-[#8f0101] to-[#6f0000] p-6 rounded-t-2xl">
                                <CardTitle className="text-2xl text-white">They receive</CardTitle>
                                <p className="mt-2 text-white/90">Directly to their bank or wallet</p>
                            </div>
                            <CardContent className="space-y-4 p-8">
                                <div className="space-y-3">
                                    <div className="relative">
                                        <div className="flex items-center gap-4 rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 transition-all hover:border-red-300 focus-within:border-[#c00101] focus-within:ring-4 focus-within:ring-[#c00101]/10 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900 dark:hover:border-red-600">
                                            {/* Country Selector */}
                                            <CountrySelector
                                                selectedCountry={targetCountry}
                                                onSelect={setTargetCountry}
                                            />

                                            {/* Converted Amount Display */}
                                            <div className="flex-1">
                                                <AnimatePresence mode="wait">
                                                    {isLoadingQuote ? (
                                                        <motion.div
                                                            key="loading"
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                            className="flex items-center gap-3"
                                                        >
                                                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#c00101] border-t-transparent" />
                                                            <span className="text-lg text-gray-500">Calculating...</span>
                                                        </motion.div>
                                                    ) : quote ? (
                                                        <motion.div
                                                            key="quote"
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.8 }}
                                                        >
                                                            <div className="text-4xl font-bold text-[#8f0101]">
                                                                {targetCountry.symbol}
                                                                {quote.targetAmount.toFixed(2)}
                                                            </div>
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div
                                                            key="placeholder"
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                            className="text-4xl font-bold text-gray-300 dark:text-gray-600"
                                                        >
                                                            {targetCountry.symbol}0.00
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Quote Display */}
                    <AnimatePresence>
                        {quote && !isLoadingQuote && secondsRemaining > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            >
                                <Card className="mb-8 overflow-hidden border-0 bg-gradient-to-br from-red-50 via-rose-50 to-orange-50 shadow-2xl shadow-[#c00101]/20 dark:from-red-950/50 dark:via-rose-950/50 dark:to-orange-950/50">
                                    <CardContent className="p-8">
                                        {/* Header with Timer */}
                                        <div className="mb-6 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#c00101] to-[#8f0101] shadow-lg">
                                                    <TrendingDown className="h-6 w-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Live Exchange Rate</h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Best rates guaranteed</p>
                                                </div>
                                            </div>

                                            <motion.div
                                                className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-lg dark:bg-gray-900/80"
                                                animate={{
                                                    scale: secondsRemaining <= 10 ? [1, 1.05, 1] : 1,
                                                }}
                                                transition={{
                                                    duration: 0.5,
                                                    repeat: secondsRemaining <= 10 ? Infinity : 0,
                                                }}
                                            >
                                                <Clock
                                                    className={`h-5 w-5 ${secondsRemaining <= 10 ? 'text-red-600' : 'text-[#c00101]'
                                                        }`}
                                                />
                                                <span
                                                    className={`font-mono text-lg font-bold ${secondsRemaining <= 10 ? 'text-red-600' : 'text-gray-900 dark:text-white'
                                                        }`}
                                                >
                                                    {secondsRemaining}s
                                                </span>
                                            </motion.div>
                                        </div>

                                        {/* Exchange Rate */}
                                        <motion.div
                                            className="mb-6 rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900"
                                            initial={{ scale: 0.9 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.1 }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">Exchange Rate</p>
                                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                        1 {quote.sourceCurrency} = {quote.exchangeRate.toFixed(4)} {quote.targetCurrency}
                                                    </p>
                                                </div>
                                                <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
                                                    <TrendingDown className="mr-1 h-3 w-3" />
                                                    Best Rate
                                                </Badge>
                                            </div>
                                        </motion.div>

                                        {/* Fee Breakdown */}
                                        <div className="space-y-4 rounded-2xl bg-white/60 p-6 backdrop-blur-sm dark:bg-gray-900/60">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">You send</span>
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    {sourceCountry.symbol}
                                                    {quote.sourceAmount.toFixed(2)} {quote.sourceCurrency}
                                                </span>
                                            </div>

                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Transfer fee (1%)</span>
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    - {sourceCountry.symbol}
                                                    {quote.fees.transferFee.toFixed(2)}
                                                </span>
                                            </div>

                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Service fee (1%)</span>
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    - {sourceCountry.symbol}
                                                    {quote.fees.serviceFee.toFixed(2)}
                                                </span>
                                            </div>

                                            <div className="border-t-2 border-gray-200 pt-4 dark:border-gray-700">
                                                <div className="flex items-end justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recipient gets</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-500">
                                                            Delivered in 2-5 minutes
                                                        </p>
                                                    </div>
                                                    <motion.div
                                                        className="text-right"
                                                        initial={{ scale: 0.8 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ type: "spring", stiffness: 200 }}
                                                    >
                                                        <p className="text-3xl font-bold bg-gradient-to-r from-[#c00101] to-[#8f0101] bg-clip-text text-transparent">
                                                            {targetCountry.symbol}
                                                            {quote.targetAmount.toFixed(2)}
                                                        </p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">{quote.targetCurrency}</p>
                                                    </motion.div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {isLoadingQuote && amount && parseFloat(amount) > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <Card className="mb-8 border-0 shadow-2xl">
                                    <CardContent className="flex items-center justify-center gap-4 p-12">
                                        <div className="relative">
                                            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#c00101] border-t-transparent" />
                                            <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full border-4 border-[#c00101] opacity-20" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Finding the best rates...
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Comparing rates across multiple providers
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Continue Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Button
                            size="lg"
                            className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#c00101] to-[#8f0101] py-7 text-lg font-semibold shadow-2xl shadow-[#c00101]/50 transition-all hover:shadow-3xl hover:shadow-[#c00101]/60 disabled:opacity-50 disabled:shadow-none"
                            onClick={handleContinue}
                            disabled={!quote || secondsRemaining <= 0 || isLoadingQuote}
                        >
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-[#a00101] to-[#6f0000] opacity-0 transition-opacity group-hover:opacity-100"
                                initial={false}
                            />
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Continue to Recipient
                                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </span>
                        </Button>

                        {secondsRemaining <= 0 && quote && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-4 text-center text-sm text-red-600 dark:text-red-400"
                            >
                                ⚠️ Exchange rate expired. Please adjust the amount to get a new quote.
                            </motion.p>
                        )}

                        {!amount && (
                            <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                Enter an amount to get started
                            </p>
                        )}
                    </motion.div>

                    {/* Trust Indicators */}
                    <motion.div
                        className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                    >
                        {[
                            { icon: Zap, title: 'Instant Transfer', desc: '2-5 minutes delivery' },
                            { icon: Shield, title: 'Bank-Level Security', desc: '256-bit encryption' },
                            { icon: TrendingDown, title: 'Best Rates', desc: 'No hidden fees' },
                        ].map((item, index) => (
                            <motion.div
                                key={item.title}
                                className="rounded-2xl border border-gray-200 bg-white/50 p-6 text-center backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/50"
                                whileHover={{ y: -4, scale: 1.02 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#c00101] to-[#8f0101] shadow-lg">
                                    <item.icon className="h-6 w-6 text-white" />
                                </div>
                                <h4 className="mb-1 font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </main>
        </div>
    )
}
