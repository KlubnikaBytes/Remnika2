'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ShieldCheck, Check, Camera, RefreshCw, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { kycService, KYCStatus } from '@/lib/services/kyc-service'
import { toast } from 'sonner' // Assuming sonner is used, or replace with appropriate toast
import { useRouter } from 'next/navigation'

// Helper to convert dataURL to File
const dataURLtoFile = (dataurl: string, filename: string) => {
    let arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)![1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

export default function KYCPage() {
    const router = useRouter()
    const [step, setStep] = useState(1) // 1: Intro, 2: Form, 3: Front Cam, 4: Selfie Cam, 5: Review/Submit, 6: Status
    const [isLoading, setIsLoading] = useState(false)
    const [statusData, setStatusData] = useState<KYCStatus | null>(null)

    // Form Data
    const [kycType, setKycType] = useState<string>('')
    const [docNum, setDocNum] = useState('')
    const [frontImage, setFrontImage] = useState<File | null>(null)
    const [backImage, setBackImage] = useState<File | null>(null)
    const [selfieImage, setSelfieImage] = useState<File | null>(null)

    // Camera Refs
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isStreamActive, setIsStreamActive] = useState(false)
    const streamRef = useRef<MediaStream | null>(null)

    // Check Status on Mount
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const status = await kycService.getKYCStatus()
                setStatusData(status)
                if (status.kycStatus !== 'NOT_SUBMITTED' && status.kycStatus !== 'REJECTED') {
                    // If pending or verified, show status screen immediately (Step 6)
                    setStep(6)
                }
            } catch (error) {
                console.error("Failed to fetch KYC status", error)
            }
        }
        checkStatus()
    }, [])

    const startCamera = async (facingMode: 'user' | 'environment' = 'environment') => {
        try {
            if (streamRef.current) {
                stopCamera()
            }
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facingMode }
            })
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                streamRef.current = stream
                setIsStreamActive(true)
            }
        } catch (err) {
            console.error("Error accessing camera:", err)
            toast.error("Could not access camera. Please allow permissions.")
        }
    }

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
            setIsStreamActive(false)
        }
    }, [])


    // Cleanup camera on unmount
    useEffect(() => {
        return () => stopCamera()
    }, [stopCamera])


    const capturePhoto = (target: 'front' | 'selfie') => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current
            const canvas = canvasRef.current

            // Check if video is ready
            if (video.readyState !== 4 || video.videoWidth === 0) {
                toast.error("Camera not ready yet. Please wait.")
                return
            }

            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            const ctx = canvas.getContext('2d')
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
                const dataUrl = canvas.toDataURL('image/jpeg')
                const file = dataURLtoFile(dataUrl, `${target}-${Date.now()}.jpg`)

                if (target === 'front') {
                    setFrontImage(file)
                    stopCamera()
                } else {
                    setSelfieImage(file)
                    stopCamera()
                }
            }
        }
    }

    const handleSubmit = async () => {
        if (!kycType || !docNum || !frontImage || !selfieImage) {
            toast.error("Please complete all steps.")
            return
        }

        setIsLoading(true)
        try {
            await kycService.submitKYC({
                type: kycType as any,
                docNum,
                front: frontImage,
                back: backImage,
                selfie: selfieImage
            })
            setStep(6) // Success/Status screen
            toast.success("KYC Submitted Successfully")
            // Refresh status to show pending
            const status = await kycService.getKYCStatus()
            setStatusData(status)

        } catch (error: any) {
            console.error("KYC Submission Error:", error)
            toast.error(error.message || "Failed to submit KYC")
        } finally {
            setIsLoading(false)
        }
    }

    const retake = (target: 'front' | 'selfie') => {
        if (target === 'front') {
            setFrontImage(null)
            startCamera('environment')
        } else {
            setSelfieImage(null)
            startCamera('user')
        }
    }

    // Steps Logic
    const nextStep = () => setStep(prev => prev + 1)
    const prevStep = () => setStep(prev => prev - 1)


    // Render Helpers
    const renderCameraView = (target: 'selfie') => (
        <div className="relative overflow-hidden rounded-xl bg-black aspect-[3/4] flex items-center justify-center">
            {(!isStreamActive && !selfieImage) && (
                <Button onClick={() => startCamera('user')} className="z-10 gap-2">
                    <Camera className="h-4 w-4" /> Start Camera
                </Button>
            )}

            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 h-full w-full object-cover ${isStreamActive ? 'opacity-100' : 'opacity-0'}`}
                onLoadedMetadata={() => {
                    if (videoRef.current) videoRef.current.play()
                }}
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Captured Image Preview */}
            {selfieImage && !isStreamActive && (
                <img
                    src={URL.createObjectURL(selfieImage)}
                    alt="Captured"
                    className="absolute inset-0 h-full w-full object-cover"
                />
            )}

            {/* Camera Controls Overlay */}
            {isStreamActive && (
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 z-20">
                    <Button
                        size="icon"
                        variant="destructive"
                        className="h-14 w-14 rounded-full border-4 border-white"
                        onClick={() => capturePhoto(target)}
                    >
                        <div className="h-4 w-4" /> {/* Shutter look */}
                    </Button>
                </div>
            )}
        </div>
    )

    // Status View
    if (step === 6) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 dark:bg-gray-950">
                <Card className="w-full max-w-md text-center p-6 space-y-6">
                    <div className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full ${statusData?.kycStatus === 'VERIFIED' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                        {statusData?.kycStatus === 'VERIFIED' ? <Check className="h-12 w-12" /> : <ShieldCheck className="h-12 w-12" />}
                    </div>

                    <h2 className="text-2xl font-bold">
                        {statusData?.kycStatus === 'VERIFIED' ? 'Verified' : 'Verification Pending'}
                    </h2>

                    <div className="space-y-4 text-sm">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Email</span>
                            <span className="font-medium">{statusData?.email}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Submitted On</span>
                            <span className="font-medium">
                                {statusData?.submittedAt ? new Date(statusData.submittedAt).toLocaleString() : '-'}
                            </span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Status</span>
                            <span className={`font-medium ${statusData?.kycStatus === 'VERIFIED' ? 'text-green-600' : 'text-yellow-600'}`}>
                                {statusData?.kycStatus?.replace('_', ' ')}
                            </span>
                        </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400">
                        {statusData?.kycStatus === 'VERIFIED'
                            ? "Your identity has been verified. You can now access all features."
                            : "We are reviewing your documents. This usually takes a few minutes."
                        }
                    </p>

                    {statusData?.kycStatus === 'REJECTED' && (
                        <div className="rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                            <p className="font-medium">Verification Failed</p>
                            <p className="text-sm mt-1">{statusData.rejectionReason || "Please try again with clearer photos."}</p>
                            <Button onClick={() => setStep(1)} variant="outline" className="mt-4 border-red-200 hover:bg-red-100 text-red-800">
                                Try Again
                            </Button>
                        </div>
                    )}

                    <Link href="/dashboard">
                        <Button className="w-full mt-4">Back to Dashboard</Button>
                    </Link>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-gray-900 sticky top-0 z-50">
                <div className="container mx-auto flex items-center justify-between max-w-md">
                    <Button variant="ghost" size="icon" onClick={step === 1 ? () => router.push('/dashboard') : prevStep}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-lg font-bold">Identity Verification</h1>
                    <div className="w-10" />
                </div>
            </header>

            <main className="container mx-auto max-w-md px-4 py-8 pb-24">
                <AnimatePresence mode="wait">
                    {/* Step 1: Intro */}
                    {step === 1 && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="text-center space-y-4 pt-8">
                                <div className="mx-auto h-20 w-20 rounded-full bg-red-100 flex items-center justify-center text-[#c00101] dark:bg-red-900/30">
                                    <ShieldCheck className="h-10 w-10" />
                                </div>
                                <h2 className="text-2xl font-bold">Verify your identity</h2>
                                <p className="text-gray-500">
                                    Required by law to prevent fraud and ensure the safety of your account.
                                </p>
                            </div>

                            <Card>
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex gap-4">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold shrink-0">1</div>
                                        <div>
                                            <h3 className="font-semibold">Government ID</h3>
                                            <p className="text-sm text-gray-500">Passport, Driver&apos;s License, or National ID</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold shrink-0">2</div>
                                        <div>
                                            <h3 className="font-semibold">Selfie</h3>
                                            <p className="text-sm text-gray-500">A clear photo of your face</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Button onClick={nextStep} className="w-full bg-[#c00101] hover:bg-[#a00101] text-lg py-6">
                                Start Verification
                            </Button>
                        </motion.div>
                    )}

                    {/* Step 2: Document Details Form */}
                    {step === 2 && (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="space-y-2">
                                <h2 className="text-xl font-bold">Document Details</h2>
                                <p className="text-sm text-gray-500">Select the ID type you want to use.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Document Type</Label>
                                    <Select value={kycType} onValueChange={setKycType}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select document type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PASSPORT">Passport</SelectItem>
                                            <SelectItem value="NATIONAL_ID">National ID Card</SelectItem>
                                            <SelectItem value="DRIVERS_LICENSE">Driver&apos;s License</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Document Number</Label>
                                    <Input
                                        placeholder="Enter ID Number"
                                        value={docNum}
                                        onChange={(e) => setDocNum(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={nextStep}
                                disabled={!kycType || !docNum}
                                className="w-full bg-[#c00101] hover:bg-[#a00101]"
                            >
                                Continue
                            </Button>
                        </motion.div>
                    )}

                    {/* Step 3: Document Upload (Front & Back) */}
                    {step === 3 && (
                        <motion.div
                            key="doc-upload"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="space-y-2 text-center">
                                <h2 className="text-xl font-bold">Upload Documents</h2>
                                <p className="text-sm text-gray-500">Upload clear photos of your ID.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Front of ID</Label>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setFrontImage(e.target.files[0])
                                            }
                                        }}
                                    />
                                    {frontImage && <p className="text-xs text-green-600">Selected: {frontImage.name}</p>}
                                </div>

                                {kycType !== 'PASSPORT' && (
                                    <div className="space-y-2">
                                        <Label>Back of ID</Label>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    setBackImage(e.target.files[0])
                                                }
                                            }}
                                        />
                                        {backImage && <p className="text-xs text-green-600">Selected: {backImage.name}</p>}
                                    </div>
                                )}
                            </div>

                            <Button
                                onClick={nextStep}
                                disabled={!frontImage || (kycType !== 'PASSPORT' && !backImage)}
                                className="w-full bg-[#c00101] hover:bg-[#a00101]"
                            >
                                Continue
                            </Button>
                        </motion.div>
                    )}

                    {/* Step 4: Selfie Capture */}
                    {step === 4 && (
                        <motion.div
                            key="selfie-cam"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="space-y-2 text-center">
                                <h2 className="text-xl font-bold">Take a Selfie</h2>
                                <p className="text-sm text-gray-500">Position your face in the center.</p>
                            </div>

                            {renderCameraView('selfie')}

                            {selfieImage && (
                                <div className="flex gap-3">
                                    <Button variant="outline" className="flex-1" onClick={() => retake('selfie')}>
                                        <RefreshCw className="mr-2 h-4 w-4" /> Retake
                                    </Button>
                                    <Button className="flex-1 bg-[#c00101] hover:bg-[#a00101]" onClick={nextStep}>
                                        Use Photo
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Step 5: Review & Submit */}
                    {step === 5 && (
                        <motion.div
                            key="review"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                        >
                            <div className="text-center space-y-2">
                                <h2 className="text-xl font-bold">Review Information</h2>
                                <p className="text-sm text-gray-500">Make sure everything is correct before submitting.</p>
                            </div>

                            <Card>
                                <CardContent className="p-4 space-y-4 text-sm">
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-gray-500">Type</span>
                                        <span className="font-medium">{kycType}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-gray-500">Number</span>
                                        <span className="font-medium">{docNum}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Front ID</p>
                                            {frontImage && <img src={URL.createObjectURL(frontImage)} className="rounded-lg border object-cover aspect-video bg-gray-100" />}
                                        </div>
                                        {backImage && (
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Back ID</p>
                                                <img src={URL.createObjectURL(backImage)} className="rounded-lg border object-cover aspect-video bg-gray-100" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Selfie</p>
                                            {selfieImage && <img src={URL.createObjectURL(selfieImage)} className="rounded-lg border object-cover aspect-square bg-gray-100" />}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="rounded-lg bg-yellow-50 p-4 flex gap-3 items-start text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
                                <AlertCircle className="h-5 w-5 shrink-0" />
                                <p className="text-xs">
                                    By clicking Submit, you agree to the processing of your personal data for identity verification purposes.
                                </p>
                            </div>

                            <Button
                                onClick={handleSubmit}
                                className="w-full bg-[#c00101] hover:bg-[#a00101] py-6 text-lg"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                                    </>
                                ) : (
                                    "Submit Verification"
                                )}
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    )
}
