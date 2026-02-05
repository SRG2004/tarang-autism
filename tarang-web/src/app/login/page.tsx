"use client"
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const router = useRouter()
    const { login } = useAuth()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!email || !password) {
            setError('Please fill in all fields')
            return
        }

        setIsLoading(true)
        try {
            await login(email, password)
            router.push('/dashboard')
        } catch (err) {
            setError('Invalid credentials. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#FDFCF8] flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#0B3D33] text-[#FDFCF8] p-16 flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                    <div className="text-[20rem] font-black tracking-tighter leading-none -rotate-12 -translate-x-20 translate-y-20">
                        TARANG
                    </div>
                </div>

                <div className="relative z-10">
                    <Link href="/" className="text-3xl font-serif font-black tracking-tighter">
                        TARANG
                    </Link>
                </div>

                <div className="relative z-10">
                    <h1 className="text-6xl font-serif font-black tracking-tighter leading-none mb-8">
                        EARLY<br />
                        <span className="text-[#D4AF37]">VISION.</span>
                    </h1>
                    <p className="text-xl font-light opacity-60 max-w-md leading-relaxed">
                        AI-powered early autism screening platform.
                        Bridging the diagnosis gap with precision care.
                    </p>
                </div>

                <div className="relative z-10 text-sm font-mono opacity-40">
                    © 2026 TELIPORT Season 3
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    <div className="mb-12">
                        <h2 className="text-4xl font-serif font-black tracking-tighter text-[#0B3D33] mb-3">
                            Welcome Back
                        </h2>
                        <p className="text-[#0B3D33]/60 font-medium">
                            Sign in to continue to your dashboard
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700"
                            >
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <span className="text-sm font-medium">{error}</span>
                            </motion.div>
                        )}

                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-[#0B3D33]/60 mb-3">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0B3D33]/30" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white border-2 border-[#0B3D33]/10 p-4 pl-12 outline-none focus:border-[#D4AF37] transition-colors font-medium"
                                    placeholder="guardian@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-[#0B3D33]/60 mb-3">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0B3D33]/30" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white border-2 border-[#0B3D33]/10 p-4 pl-12 pr-12 outline-none focus:border-[#D4AF37] transition-colors font-medium"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0B3D33]/30 hover:text-[#0B3D33] transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 accent-[#D4AF37]" />
                                <span className="text-sm font-medium text-[#0B3D33]/60">Remember me</span>
                            </label>
                            <Link href="/forgot-password" className="text-sm font-bold text-[#D4AF37] hover:underline">
                                Forgot Password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#0B3D33] text-[#D4AF37] p-5 font-black uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#0B3D33] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Signing in...' : (
                                <>Sign In <ArrowRight className="w-5 h-5" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-[#0B3D33]/60 font-medium">
                            Don't have an account?{' '}
                            <Link href="/register" className="font-bold text-[#0B3D33] hover:text-[#D4AF37] transition-colors">
                                Create Account
                            </Link>
                        </p>
                    </div>

                    <div className="mt-12 pt-8 border-t border-[#0B3D33]/10">
                        <p className="text-xs font-mono text-[#0B3D33]/40 text-center uppercase tracking-widest">
                            Role-Based Access: Parent • Clinician • Admin
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
