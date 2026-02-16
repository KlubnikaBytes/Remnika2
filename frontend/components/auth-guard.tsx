'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/auth'

const PUBLIC_PATHS = ['/login', '/signup', '/verify-otp', '/']

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const { isAuthenticated, token } = useAuthStore()
    const [authorized, setAuthorized] = useState(false)

    const [hydrated, setHydrated] = useState(false)

    useEffect(() => {
        // Wait for Zustand hydration
        useAuthStore.persist.onFinishHydration(() => setHydrated(true))
        setHydrated(useAuthStore.persist.hasHydrated())
    }, [])

    useEffect(() => {
        if (!hydrated) return; // Don't redirect until hydrated

        // Allow public paths
        // Check if current path starts with any public path to handle sub-routes if needed
        const isPublic = PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(path + '/'));

        if (isPublic) {
            setAuthorized(true)
            return
        }

        // Check auth
        if (!isAuthenticated || !token) {
            router.push('/login')
            setAuthorized(false)
        } else {
            setAuthorized(true)
        }
    }, [isAuthenticated, token, pathname, router, hydrated])

    // If public path, render
    if (PUBLIC_PATHS.includes(pathname)) {
        return <>{children}</>
    }

    // If waiting for auth check
    if (!authorized) {
        return null // or a loading spinner
    }

    return <>{children}</>
}
