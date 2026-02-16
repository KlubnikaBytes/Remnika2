'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { authService, useAuthStore } from '@/lib/auth'

export default function VerifyOTPPage() {
    const router = useRouter()
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        inputRefs.current[0]?.focus()
    }, [])

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return

        const newOtp = [...otp]
        newOtp[index] = value.slice(-1)
        setOtp(newOtp)

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text').slice(0, 6)
        const newOtp = pastedData.split('')
        setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')])
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            const otpValue = otp.join('')
            await authService.verifyOtp(otpValue)
            router.push('/dashboard')
        } catch (err: any) {
            setError(err.message || 'Verification failed. Please check the code and try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const { tempAuthData } = useAuthStore()

    // Determine if OTP was sent via Email
    const isEmailOtp = tempAuthData?.otpMethod === 'EMAIL' || (tempAuthData?.context === 'LOGIN' && !!tempAuthData?.email)
    const destination = isEmailOtp ? 'email' : 'phone'

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
                    <Card className="overflow-hidden border-0 shadow-2xl shadow-[#c00101]/20">
                        <CardHeader className="bg-gradient-to-br from-[#c00101] to-[#8f0101] p-8 text-center text-white">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                                <Shield className="h-8 w-8" />
                            </div>
                            <CardTitle className="text-3xl font-bold">Verify Code</CardTitle>
                            <p className="mt-2 text-white/90">
                                Enter the 6-digit code sent to your <span className="font-semibold">{destination}</span>
                            </p>
                        </CardHeader>
                        <CardContent className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="rounded-md bg-red-50 p-3 text-center text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                        {error}
                                    </div>
                                )}
                                <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => { inputRefs.current[index] = el }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl border-2 border-gray-200 text-center text-2xl font-bold transition-all focus:border-[#c00101] focus:outline-none focus:ring-4 focus:ring-red-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                            disabled={isLoading}
                                        />
                                    ))}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={otp.some(d => !d) || isLoading}
                                    className="w-full bg-gradient-to-r from-[#c00101] to-[#8f0101] py-6 text-lg font-semibold shadow-lg shadow-[#c00101]/30 hover:shadow-xl hover:from-[#a00101] hover:to-[#7f0000] disabled:opacity-70"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Verifying...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            Verify & Continue
                                            <ArrowRight className="h-5 w-5" />
                                        </span>
                                    )}
                                </Button>

                                <div className="text-center">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Didn't receive the code?{' '}
                                        <button type="button" className="font-semibold text-[#c00101] hover:text-[#8f0101]">
                                            Resend to {destination}
                                        </button>
                                    </p>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="mt-6 text-center">
                        <Link href="/signup" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                            ← Back to Sign Up
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
