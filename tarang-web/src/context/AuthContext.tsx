"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
    id: string
    email: string
    name: string
    role: 'PARENT' | 'CLINICIAN' | 'ADMIN'
    initials: string
}

interface AuthContextType {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    register: (email: string, name: string, password: string, role: string) => Promise<void>
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

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
            }
        }
        setIsLoading(false)
    }, [])

    const login = async (email: string, password: string) => {
        // In production, this would call the backend API
        // For now, simulate successful login
        const mockUser: User = {
            id: `usr_${Date.now()}`,
            email,
            name: email.split('@')[0].replace(/[.]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            role: 'PARENT',
            initials: email.substring(0, 2).toUpperCase()
        }

        const mockToken = `jwt_${btoa(email)}_${Date.now()}`

        setUser(mockUser)
        setToken(mockToken)
        localStorage.setItem('tarang_token', mockToken)
        localStorage.setItem('tarang_user', JSON.stringify(mockUser))
    }

    const register = async (email: string, name: string, password: string, role: string) => {
        // In production, this would call the backend API
        const mockUser: User = {
            id: `usr_${Date.now()}`,
            email,
            name,
            role: role as User['role'],
            initials: name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        }

        const mockToken = `jwt_${btoa(email)}_${Date.now()}`

        setUser(mockUser)
        setToken(mockToken)
        localStorage.setItem('tarang_token', mockToken)
        localStorage.setItem('tarang_user', JSON.stringify(mockUser))
    }

    const logout = () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem('tarang_token')
        localStorage.removeItem('tarang_user')
    }

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isAuthenticated: !!user,
            isLoading,
            login,
            register,
            logout
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
