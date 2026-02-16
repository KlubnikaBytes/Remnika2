'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SuccessPage() {
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
                            <div className="mb-4 flex justify-center">
                                <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                                    <CheckCircle2 className="h-12 w-12 text-white" />
                                </div>
                            </div>
                            <CardTitle className="text-center text-3xl">Password Reset!</CardTitle>
                            <p className="mt-2 text-center text-white/90">
                                Your password has been successfully updated.
                            </p>
                        </CardHeader>
                        <CardContent className="p-8">
                            <Link href="/login">
                                <Button
                                    className="w-full bg-gradient-to-r from-[#c00101] to-[#8f0101] py-6 text-lg font-semibold shadow-lg shadow-[#c00101]/50 hover:shadow-xl hover:from-[#a00101] hover:to-[#6f0000]"
                                >
                                    <span className="flex items-center gap-2">
                                        Back to Login
                                        <ArrowRight className="h-5 w-5" />
                                    </span>
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}
