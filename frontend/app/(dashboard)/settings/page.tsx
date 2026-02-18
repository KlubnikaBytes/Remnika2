
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, User, Bell, Shield, Globe2, Lock, Sliders } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { useState } from 'react'
import { complianceService, RiskScoreResponse } from '@/lib/services/compliance-service'
import { Modal } from '@/components/ui/modal'
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react'

export default function SettingsPage() {
    const [showRiskModal, setShowRiskModal] = useState(false)
    const [riskData, setRiskData] = useState<RiskScoreResponse | null>(null)
    const [isLoadingRisk, setIsLoadingRisk] = useState(false)

    const handleCheckRisk = async () => {
        setShowRiskModal(true)
        setIsLoadingRisk(true)
        try {
            const data = await complianceService.getRiskScore()
            setRiskData(data)
        } catch (error) {
            console.error("Failed to fetch risk score", error)
        } finally {
            setIsLoadingRisk(false)
        }
    }

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
                            Settings
                        </h1>
                        <div className="w-10 sm:w-24" />
                    </div>
                </div>
            </header>

            <main className="container relative mx-auto px-4 py-12">
                <div className="mx-auto max-w-4xl space-y-6">
                    {/* Menu Items */}
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Compliance Check Card */}
                        <Card
                            className="h-full border-0 shadow-lg transition-transform hover:scale-[1.02] cursor-pointer"
                            onClick={handleCheckRisk}
                        >
                            <CardContent className="flex items-center gap-4 p-6">
                                <div className="rounded-full bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/30">
                                    <Shield className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Compliance Check</h3>
                                    <p className="text-sm text-gray-500">View your risk score</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Link href="/kyc">
                            <Card className="h-full border-0 shadow-lg transition-transform hover:scale-[1.02]">
                                <CardContent className="flex items-center gap-4 p-6">
                                    <div className="rounded-full bg-red-100 p-3 text-[#c00101] dark:bg-red-900/30">
                                        <Shield className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Identity Verification</h3>
                                        <p className="text-sm text-gray-500">Increase your limits</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/referrals">
                            <Card className="h-full border-0 shadow-lg transition-transform hover:scale-[1.02]">
                                <CardContent className="flex items-center gap-4 p-6">
                                    <div className="rounded-full bg-orange-100 p-3 text-orange-600 dark:bg-orange-900/30">
                                        <Globe2 className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Invite Friends</h3>
                                        <p className="text-sm text-gray-500">Earn rewards</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/support" className="md:col-span-2">
                            <Card className="h-full border-0 shadow-lg transition-transform hover:scale-[1.02]">
                                <CardContent className="flex items-center gap-4 p-6">
                                    <div className="rounded-full bg-gray-100 p-3 text-gray-600 dark:bg-gray-900/30">
                                        <Bell className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Help & Support</h3>
                                        <p className="text-sm text-gray-500">Get help with your account</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/settings/security">
                            <Card className="h-full border-0 shadow-lg transition-transform hover:scale-[1.02]">
                                <CardContent className="flex items-center gap-4 p-6">
                                    <div className="rounded-full bg-rose-100 p-3 text-rose-600 dark:bg-rose-900/30">
                                        <Lock className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Security</h3>
                                        <p className="text-sm text-gray-500">Password & 2FA</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/settings/preferences">
                            <Card className="h-full border-0 shadow-lg transition-transform hover:scale-[1.02]">
                                <CardContent className="flex items-center gap-4 p-6">
                                    <div className="rounded-full bg-gray-100 p-3 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                        <Sliders className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Preferences</h3>
                                        <p className="text-sm text-gray-500">Language & Theme</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>

                    {/* Profile Section (simplified) */}
                    <Card className="border-0 shadow-lg">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-full bg-gray-100 p-3 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                <User className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">John Doe</h3>
                                <p className="text-sm text-gray-500">john@example.com • +1 234 567 8900</p>
                            </div>
                            <Link href="/settings/profile" className="ml-auto">
                                <Button variant="outline">Edit</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </main>

            {/* Risk Score Modal */}
            <Modal
                isOpen={showRiskModal}
                onClose={() => setShowRiskModal(false)}
                title="Compliance Risk Assessment"
            >
                {isLoadingRisk ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 className="h-10 w-10 animate-spin text-[#c00101]" />
                        <p className="mt-4 text-sm text-gray-500">Analyzing risk profile...</p>
                    </div>
                ) : riskData ? (
                    <div className="space-y-6 text-center">
                        <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${riskData.level === 'LOW' ? 'bg-green-100 text-green-600' :
                                riskData.level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-600' :
                                    'bg-red-100 text-red-600'
                            }`}>
                            {riskData.level === 'LOW' ? <CheckCircle className="h-10 w-10" /> : <AlertTriangle className="h-10 w-10" />}
                        </div>

                        <div>
                            <div className="text-4xl font-bold">{riskData.riskScore}</div>
                            <div className={`mt-1 text-sm font-semibold tracking-wide ${riskData.level === 'LOW' ? 'text-green-600' :
                                    riskData.level === 'MEDIUM' ? 'text-yellow-600' :
                                        'text-red-600'
                                }`}>
                                {riskData.level} RISK
                            </div>
                        </div>

                        <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                            <p>
                                {riskData.level === 'LOW' ? "Your account is in good standing. No restrictions applied." :
                                    riskData.level === 'MEDIUM' ? "Please complete verification to improve your score." :
                                        "Your account activity has flagged high risk. Please contact support."}
                            </p>
                        </div>

                        <Button className="w-full" onClick={() => setShowRiskModal(false)}>
                            Done
                        </Button>
                    </div>
                ) : (
                    <div className="text-center py-8 text-red-500">
                        Failed to load risk data.
                    </div>
                )}
            </Modal>
        </div>
    )
}
