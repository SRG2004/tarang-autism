"use client"
import { useState } from 'react'

export const useAuth = () => {
    const [user, setUser] = useState<any>(null)
    const [token, setToken] = useState<string | null>(null)

    const login = async (email: string) => {
        // Mocking Industrial JWT Auth flow
        const mockUser = { id: 'usr_99', email, role: 'PARENT', name: 'James Smith' }
        setUser(mockUser)
        setToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
        localStorage.setItem('tarang_token', 'jwt_token_here')
    }

    const logout = () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem('tarang_token')
    }

    return { user, token, login, logout, isAuthenticated: !!user }
}
