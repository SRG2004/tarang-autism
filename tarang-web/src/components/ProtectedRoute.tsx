"use client"
import { ReactNode } from 'react'
import { useAuth, UserRole, ROLE_ROUTES, PUBLIC_ROUTES } from '@/context/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { ShieldAlert } from 'lucide-react'

interface ProtectedRouteProps {
    children: ReactNode
    allowedRoles?: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, isLoading, isAuthenticated } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (isLoading) return

        // Check if public route
        if (PUBLIC_ROUTES.includes(pathname)) return

        // Not authenticated
        if (!isAuthenticated || !user) {
            router.push('/login')
            return
        }

        // Check role-based access
        if (allowedRoles && allowedRoles.length > 0) {
            if (!allowedRoles.includes(user.role)) {
                // Redirect to appropriate home
                const roleConfig = ROLE_ROUTES[user.role]
                router.push(roleConfig.home)
            }
        }
    }, [isLoading, isAuthenticated, user, allowedRoles, pathname, router])

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FDFCF8] pt-32 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-6" />
                <p className="text-[#0B3D33]/60 font-medium">Verifying access...</p>
            </div>
        )
    }

    // Not authenticated
    if (!isAuthenticated) {
        return null
    }

    // Check role access
    if (allowedRoles && allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
        return (
            <div className="min-h-screen bg-[#FDFCF8] pt-32 flex flex-col items-center justify-center">
                <ShieldAlert className="w-16 h-16 text-red-500 mb-6" />
                <h2 className="text-2xl font-serif font-black text-[#0B3D33] mb-2">Access Denied</h2>
                <p className="text-[#0B3D33]/60">You don't have permission to view this page.</p>
                <p className="text-sm text-[#0B3D33]/40 mt-4">
                    Required: {allowedRoles.join(' or ')} | Your role: {user?.role}
                </p>
            </div>
        )
    }

    return <>{children}</>
}

// Convenience wrapper components for each role
export function ParentOnly({ children }: { children: ReactNode }) {
    return <ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}>{children}</ProtectedRoute>
}

export function ClinicianOnly({ children }: { children: ReactNode }) {
    return <ProtectedRoute allowedRoles={['CLINICIAN', 'ADMIN']}>{children}</ProtectedRoute>
}

export function AdminOnly({ children }: { children: ReactNode }) {
    return <ProtectedRoute allowedRoles={['ADMIN']}>{children}</ProtectedRoute>
}

// Role badge component
export function RoleBadge({ role }: { role: UserRole }) {
    const colors = {
        PARENT: 'bg-blue-100 text-blue-700 border-blue-200',
        CLINICIAN: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        ADMIN: 'bg-amber-100 text-amber-700 border-amber-200'
    }

    return (
        <span className={`inline-block px-2 py-1 text-[8px] font-black uppercase tracking-widest border ${colors[role]}`}>
            {role}
        </span>
    )
}
