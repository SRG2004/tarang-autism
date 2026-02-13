"use client"
/** aria-label: Authentication Context Provider */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export type UserRole = 'PARENT' | 'CLINICIAN' | 'ADMIN'

interface User {
    id: string
    email: string
    full_name: string
    role: UserRole
    initials: string
    org_id?: number
}

interface AuthContextType {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>

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

    const login = async (email: string, password: string) => {
        setIsLoading(true)
        try {
            const formData = new FormData()
            formData.append('username', email)
            formData.append('password', password)

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/token`, {
                method: 'POST',
                body: formData
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.detail || 'Login failed')
            }

            const data = await response.json()
            const token = data.access_token
            await processToken(token)
        } catch (error) {
            console.error('Login error:', error)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    const loginDemo = async (role: 'parent' | 'clinician' | 'admin') => {
        setIsLoading(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/demo/${role}`, {
                method: 'POST'
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.detail || 'Demo login failed')
            }

            const data = await response.json()
            const token = data.access_token
            await processToken(token)
        } catch (error) {
            console.error('Demo login error:', error)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    const processToken = async (token: string) => {
        // Decodes JWT locally to get user info (sub, role, org_id)
        const payload = JSON.parse(atob(token.split('.')[1]))

        const loggedInUser: User = {
            id: payload.sub, // sub is email in our backend
            email: payload.sub,
            full_name: payload.sub.split('@')[0].replace('demo_', 'Demo ').replace('_', ' '),
            role: payload.role.toUpperCase() as UserRole,
            org_id: payload.org_id,
            initials: payload.sub.substring(0, 2).toUpperCase()
        }

        setToken(token)
        setUser(loggedInUser)
        localStorage.setItem('tarang_token', token)
        localStorage.setItem('tarang_user', JSON.stringify(loggedInUser))

        const roleConfig = ROLE_ROUTES[loggedInUser.role]
        router.push(roleConfig.home)
    }

    const register = async (email: string, name: string, password: string, role: UserRole, orgLicense?: string, profileMetadata?: Record<string, any>) => {
        setIsLoading(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    full_name: name,
                    role: role.toLowerCase(),
                    org_license: orgLicense,
                    profile_metadata: profileMetadata
                })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.detail || 'Registration failed')
            }

            // After register, perform login
            await login(email, password)
        } catch (error) {
            console.error('Registration error:', error)
            throw error
        } finally {
            setIsLoading(false)
        }
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
            loginDemo,
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
