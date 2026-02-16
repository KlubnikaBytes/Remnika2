'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Mail, Phone, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authService } from '@/lib/auth'

export default function ForgotPasswordPage() {
    const router = useRouter()
    const [identifier, setIdentifier] = useState('')
    const [method, setMethod] = useState<'EMAIL' | 'PHONE'>('EMAIL')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            await authService.forgotPasswordInitiate({
                identifier,
                method
            })

            // Navigate to verify page with params
            router.push(`/forgot-password/verify?identifier=${encodeURIComponent(identifier)}&method=${method}`)
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to send OTP. Please check your input.')
        } finally {
            setIsLoading(false)
        }
    }

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
                        <CardHeader className="bg-gradient-to-br from-[#c00101] to-[#8f0101] p-8 text-white">
                            <CardTitle className="text-3xl">Forgot Password</CardTitle>
                            <p className="mt-2 text-white/90">We'll send you a verification code</p>
                        </CardHeader>
                        <CardContent className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <Label htmlFor="identifier" className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        Email or Phone Number
                                    </Label>
                                    <Input
                                        id="identifier"
                                        type="text"
                                        placeholder="Enter email or phone"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        className="mt-2"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                <div>
                                    <Label className="flex items-center gap-2 mb-2">
                                        <Phone className="h-4 w-4" />
                                        Send OTP via
                                    </Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div
                                            onClick={() => setMethod('EMAIL')}
                                            className={`cursor-pointer rounded-lg border p-3 text-center transition-all ${method === 'EMAIL'
                                                    ? 'border-[#c00101] bg-red-50 text-[#c00101] dark:bg-red-900/20'
                                                    : 'border-gray-200 hover:border-[#c00101]'
                                                }`}
                                        >
                                            <div className="font-medium">Email</div>
                                        </div>
                                        <div
                                            onClick={() => setMethod('PHONE')}
                                            className={`cursor-pointer rounded-lg border p-3 text-center transition-all ${method === 'PHONE'
                                                    ? 'border-[#c00101] bg-red-50 text-[#c00101] dark:bg-red-900/20'
                                                    : 'border-gray-200 hover:border-[#c00101]'
                                                }`}
                                        >
                                            <div className="font-medium">SMS</div>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-[#c00101] to-[#8f0101] py-6 text-lg font-semibold shadow-lg shadow-[#c00101]/50 hover:shadow-xl hover:from-[#a00101] hover:to-[#6f0000] disabled:opacity-70"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Sending OTP...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            Send OTP
                                            <ArrowRight className="h-5 w-5" />
                                        </span>
                                    )}
                                </Button>

                                <div className="text-center">
                                    <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                                        ← Back to Login
                                    </Link>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}
