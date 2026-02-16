
'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, MessageCircle, Mail, Phone, ChevronDown, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function SupportPage() {
    const faqs = [
        { q: "How long do transfers take?", a: "Most transfers are instant! Bank transfers can take 1-2 business days depending on the destination country." },
        { q: "What are the fees?", a: "We charge a 2% total fee (1% transfer fee + 1% service fee). There are no hidden fees, and we always show you the total cost upfront." },
        { q: "Is my money safe?", a: "Yes, we use bank-level 256-bit encryption and are fully regulated. Your funds are kept in safeguarded accounts." },
        { q: "How can I verify my identity?", a: "Go to your Settings > Profile to upload your ID document. Verification usually takes less than 5 minutes." },
    ]

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#c00101] to-[#8f0101] pb-24 pt-8 text-white">
                <div className="container mx-auto px-4">
                    <div className="mb-8 flex items-center">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="sm" className="gap-2 text-white hover:bg-white/20 hover:text-white">
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </Button>
                        </Link>
                    </div>
                    <div className="mx-auto max-w-2xl text-center">
                        <h1 className="mb-4 text-3xl font-bold">How can we help you?</h1>
                        <div className="relative">
                            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                            <Input
                                placeholder="Search for answers..."
                                className="h-12 w-full rounded-2xl border-0 bg-white pl-12 text-gray-900 placeholder-gray-500 shadow-xl"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <main className="container relative mx-auto -mt-16 px-4 pb-12">
                <div className="mx-auto max-w-2xl space-y-8">
                    {/* Contact Options */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-3 gap-4"
                    >
                        <Card className="border-0 shadow-lg transition-transform hover:scale-105">
                            <CardContent className="flex flex-col items-center p-6 text-center">
                                <div className="mb-3 rounded-full bg-blue-100 p-3 text-blue-600">
                                    <MessageCircle className="h-6 w-6" />
                                </div>
                                <h3 className="font-semibold text-gray-900">Live Chat</h3>
                                <p className="text-xs text-gray-500">Wait time: ~2m</p>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-lg transition-transform hover:scale-105">
                            <CardContent className="flex flex-col items-center p-6 text-center">
                                <div className="mb-3 rounded-full bg-green-100 p-3 text-green-600">
                                    <Phone className="h-6 w-6" />
                                </div>
                                <h3 className="font-semibold text-gray-900">Call Us</h3>
                                <p className="text-xs text-gray-500">Support 24/7</p>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-lg transition-transform hover:scale-105">
                            <CardContent className="flex flex-col items-center p-6 text-center">
                                <div className="mb-3 rounded-full bg-rose-100 p-3 text-rose-600">
                                    <Mail className="h-6 w-6" />
                                </div>
                                <h3 className="font-semibold text-gray-900">Email</h3>
                                <p className="text-xs text-gray-500">Response &lt; 24h</p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* FAQ */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle>Frequently Asked Questions</CardTitle>
                        </CardHeader>
                        <CardContent className="divide-y divide-gray-100 dark:divide-gray-800">
                            {faqs.map((faq, index) => (
                                <details key={index} className="group py-4">
                                    <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-gray-900 dark:text-white">
                                        {faq.q}
                                        <span className="transition group-open:rotate-180">
                                            <ChevronDown className="h-5 w-5 text-gray-500" />
                                        </span>
                                    </summary>
                                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                                        {faq.a}
                                    </p>
                                </details>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
