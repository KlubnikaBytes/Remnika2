'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { complianceService, RiskScoreResponse } from '@/lib/services/compliance-service'
import { ShieldAlert, ShieldCheck, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function CompliancePage() {
    const [data, setData] = useState<RiskScoreResponse | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await complianceService.getRiskScore()
                setData(response)
            } catch (error) {
                console.error("Failed to fetch risk score", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading risk assessment...</div>
    }

    if (!data) {
        return <div className="p-8 text-center text-red-500">Failed to load compliance data.</div>
    }

    const getIcon = () => {
        switch (data.level) {
            case 'LOW': return <ShieldCheck className="h-12 w-12 text-green-500" />
            case 'MEDIUM': return <Shield className="h-12 w-12 text-yellow-500" /> // Changed ShieldExclamation to Shield as ShieldExclamation might not exist in all sets, Shield is safer or ShieldAlert
            case 'HIGH': return <ShieldAlert className="h-12 w-12 text-red-500" />
            default: return <Shield className="h-12 w-12 text-gray-500" />
        }
    }

    const getColor = () => {
        switch (data.level) {
            case 'LOW': return 'bg-green-50 border-green-200 text-green-700'
            case 'MEDIUM': return 'bg-yellow-50 border-yellow-200 text-yellow-700'
            case 'HIGH': return 'bg-red-50 border-red-200 text-red-700'
            default: return 'bg-gray-50 border-gray-200 text-gray-700'
        }
    }

    return (
        <div className="container mx-auto p-6 max-w-2xl space-y-6">
            <h1 className="text-2xl font-bold">Account Compliance</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Risk Assessment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className={`flex items-center gap-4 p-4 rounded-lg border ${getColor()}`}>
                        {getIcon()}
                        <div>
                            <p className="text-sm font-medium opacity-80">Risk Level</p>
                            <h3 className="text-2xl font-bold">{data.level}</h3>
                        </div>
                        <div className="ml-auto text-right">
                            <p className="text-sm font-medium opacity-80">Score</p>
                            <h3 className="text-2xl font-bold">{data.riskScore}/100</h3>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Email Verified</span>
                            <span className="font-medium">Yes</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Registered Email</span>
                            <span className="font-medium">{data.email}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Transaction Limit</span>
                            <span className="font-medium">$1,000.00 / day</span>
                        </div>
                    </div>

                    {data.level === 'HIGH' && (
                        <div className="p-4 bg-red-100 text-red-800 rounded-md text-sm">
                            Your account is flagged as High Risk. Some features may be limited.
                            Please complete KYC to improve your score.
                        </div>
                    )}

                    <div className="flex gap-4">
                        <Link href="/dashboard/kyc" className="flex-1">
                            <Button variant="outline" className="w-full">Update KYC</Button>
                        </Link>
                        <Link href="/dashboard" className="flex-1">
                            <Button className="w-full">Back to Dashboard</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
