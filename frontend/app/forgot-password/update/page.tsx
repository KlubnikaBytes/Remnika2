'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Loader2, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authService } from '@/lib/auth'

function UpdatePasswordContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // State to store URL params
    const [identifier, setIdentifier] = useState('')
    const [method, setMethod] = useState<'EMAIL' | 'PHONE'>('EMAIL')

    // Form state
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        const id = searchParams.get('identifier')
        const m = searchParams.get('method') as 'EMAIL' | 'PHONE'

        if (!id) {
            router.push('/forgot-password')
            return
        }

        setIdentifier(id)
        if (m) setMethod(m)
    }, [searchParams, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters')
            return
        }

        setIsLoading(true)

        try {
            await authService.forgotPasswordUpdate({
                identifier,
                newPassword,
                method
            })

            // Navigate to success page
            router.push('/forgot-password/success')
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to update password.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="overflow-hidden border-0 shadow-2xl shadow-[#c00101]/20">
            <CardHeader className="bg-gradient-to-br from-[#c00101] to-[#8f0101] p-8 text-white">
                <CardTitle className="text-3xl">Reset Password</CardTitle>
                <p className="mt-2 text-white/90">Create a new secure password</p>
            </CardHeader>
            <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <div>
                        <Label htmlFor="newPassword" className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            New Password
                        </Label>
                        <div className="relative mt-2">
                            <Input
                                id="newPassword"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                disabled={isLoading}
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Confirm Password
                        </Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="mt-2"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-[#c00101] to-[#8f0101] py-6 text-lg font-semibold shadow-lg shadow-[#c00101]/50 hover:shadow-xl hover:from-[#a00101] hover:to-[#6f0000] disabled:opacity-70"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Updating...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                Update Password
                                <ArrowRight className="h-5 w-5" />
                            </span>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

export default function UpdatePasswordPage() {
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
                        <UpdatePasswordContent />
                    </Suspense>
                </motion.div>
            </div>
        </div>
    )
}
