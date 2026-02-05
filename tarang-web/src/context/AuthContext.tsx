"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export type UserRole = 'PARENT' | 'CLINICIAN' | 'ADMIN'

interface User {
    id: string
    email: string
    name: string
    role: UserRole
    initials: string
}

interface AuthContextType {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (email: string, password: string, role: UserRole) => Promise<void>
    register: (email: string, name: string, password: string, role: UserRole) => Promise<void>
    logout: () => void
    hasRole: (roles: UserRole[]) => boolean
    redirectByRole: () => void
}

// Role-based route access configuration
export const ROLE_ROUTES: Record<UserRole, { home: string; allowed: string[] }> = {
    PARENT: {
        home: '/dashboard',
        allowed: ['/dashboard', '/screening', '/reports', '/community', '/profile', '/settings', '/portal', '/privacy', '/contact']
    },
    CLINICIAN: {
        home: '/clinical',
        allowed: ['/dashboard', '/clinical', '/reports', '/intelligence', '/screening', '/community', '/profile', '/settings', '/privacy', '/contact']
    },
    ADMIN: {
        home: '/dashboard',
        allowed: ['*'] // Admin has access to all routes
    }
}

// Public routes (no auth required)
export const PUBLIC_ROUTES = ['/', '/login', '/register', '/portal', '/privacy', '/contact']

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()

    // Load persisted auth on mount
    useEffect(() => {
        const savedToken = localStorage.getItem('tarang_token')
        const savedUser = localStorage.getItem('tarang_user')

        if (savedToken && savedUser) {
            try {
                setToken(savedToken)
                setUser(JSON.parse(savedUser))
            } catch (e) {
                console.error('Failed to parse saved user:', e)
                localStorage.removeItem('tarang_token')
                localStorage.removeItem('tarang_user')
            }
        }
        setIsLoading(false)
    }, [])

    // Route protection effect
    useEffect(() => {
        if (isLoading) return

        // Skip for public routes
        if (PUBLIC_ROUTES.includes(pathname)) return

        // If not authenticated, redirect to login
        if (!user) {
            router.push('/login')
            return
        }

        // Check role-based access
        const roleConfig = ROLE_ROUTES[user.role]
        if (roleConfig.allowed[0] !== '*' && !roleConfig.allowed.includes(pathname)) {
            // Redirect to role's home page if not allowed
            router.push(roleConfig.home)
        }
    }, [pathname, user, isLoading, router])

    const login = async (email: string, password: string, role: UserRole) => {
        // In production, this would call the backend API with credentials
        // Backend would validate and return user with their actual role
        const mockUser: User = {
            id: `usr_${Date.now()}`,
            email,
            name: email.split('@')[0].replace(/[.]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            role: role,
            initials: email.substring(0, 2).toUpperCase()
        }

        const mockToken = `jwt_${btoa(email)}_${role}_${Date.now()}`

        setUser(mockUser)
        setToken(mockToken)
        localStorage.setItem('tarang_token', mockToken)
        localStorage.setItem('tarang_user', JSON.stringify(mockUser))

        // Redirect based on role
        const roleConfig = ROLE_ROUTES[role]
        router.push(roleConfig.home)
    }

    const register = async (email: string, name: string, password: string, role: UserRole) => {
        const mockUser: User = {
            id: `usr_${Date.now()}`,
            email,
            name,
            role: role,
            initials: name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        }

        const mockToken = `jwt_${btoa(email)}_${role}_${Date.now()}`

        setUser(mockUser)
        setToken(mockToken)
        localStorage.setItem('tarang_token', mockToken)
        localStorage.setItem('tarang_user', JSON.stringify(mockUser))

        // Redirect based on role
        const roleConfig = ROLE_ROUTES[role]
        router.push(roleConfig.home)
    }

    const logout = () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem('tarang_token')
        localStorage.removeItem('tarang_user')
        router.push('/')
    }

    const hasRole = (roles: UserRole[]) => {
        if (!user) return false
        return roles.includes(user.role)
    }

    const redirectByRole = () => {
        if (user) {
            const roleConfig = ROLE_ROUTES[user.role]
            router.push(roleConfig.home)
        }
    }

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isAuthenticated: !!user,
            isLoading,
            login,
            register,
            logout,
            hasRole,
            redirectByRole
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

// HOC for protecting routes
export function withRoleProtection<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    allowedRoles: UserRole[]
) {
    return function ProtectedComponent(props: P) {
        const { user, isLoading, hasRole } = useAuth()
        const router = useRouter()

        useEffect(() => {
            if (!isLoading && (!user || !hasRole(allowedRoles))) {
                router.push('/login')
            }
        }, [user, isLoading, router])

        if (isLoading) {
            return (
                <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                </div>
            )
        }

        if (!user || !hasRole(allowedRoles)) {
            return null
        }

        return <WrappedComponent {...props} />
    }
}
