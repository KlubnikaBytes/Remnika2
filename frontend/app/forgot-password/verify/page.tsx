'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Loader2, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authService } from '@/lib/auth'

function VerifyContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // State to store URL params
    const [identifier, setIdentifier] = useState('')
    const [method, setMethod] = useState<'EMAIL' | 'PHONE'>('EMAIL')
    const [otp, setOtp] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        const id = searchParams.get('identifier')
        const m = searchParams.get('method') as 'EMAIL' | 'PHONE'

        if (!id) {
            // Redirect if params are missing
            router.push('/forgot-password')
            return
        }

        setIdentifier(id)
        if (m) setMethod(m)
    }, [searchParams, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            await authService.forgotPasswordVerify({
                identifier,
                otp,
                method
            })

            // Navigate to update page with params
            router.push(`/forgot-password/update?identifier=${encodeURIComponent(identifier)}&method=${method}`)
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Verification failed. Please check your OTP.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="overflow-hidden border-0 shadow-2xl shadow-[#c00101]/20">
            <CardHeader className="bg-gradient-to-br from-[#c00101] to-[#8f0101] p-8 text-white">
                <CardTitle className="text-3xl">Verify OTP</CardTitle>
                <p className="mt-2 text-white/90">
                    Enter the code sent to {method === 'EMAIL' ? 'your email' : 'your phone'}
                </p>
            </CardHeader>
            <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <div>
                        <Label htmlFor="otp" className="flex items-center gap-2">
                            <KeyRound className="h-4 w-4" />
                            Verification Code
                        </Label>
                        <Input
                            id="otp"
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="mt-2 text-center text-2xl tracking-widest"
                            maxLength={6}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading || otp.length < 6}
                        className="w-full bg-gradient-to-r from-[#c00101] to-[#8f0101] py-6 text-lg font-semibold shadow-lg shadow-[#c00101]/50 hover:shadow-xl hover:from-[#a00101] hover:to-[#6f0000] disabled:opacity-70"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Verifying...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                Verify Code
                                <ArrowRight className="h-5 w-5" />
                            </span>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

export default function VerifyPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-white to-rose-50 dark:from-gray-950 dark:via-gray-900 dark:to-red-950">
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

            <div className="relative w-full max-w-md px-4">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Suspense fallback={
                        <Card className="border-0 shadow-2xl">
                            <CardContent className="flex h-[400px] items-center justify-center p-8">
                                <Loader2 className="h-8 w-8 animate-spin text-[#c00101]" />
                            </CardContent>
                        </Card>
                    }>
                        <VerifyContent />
                    </Suspense>
                </motion.div>
            </div>
        </div>
    )
}
