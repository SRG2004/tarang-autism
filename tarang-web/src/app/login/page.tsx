"use client"
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle, Users, Stethoscope, Shield } from 'lucide-react'
import Link from 'next/link'
import { useAuth, UserRole } from '@/context/AuthContext'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [selectedRole, setSelectedRole] = useState<UserRole>('PARENT')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isRegister, setIsRegister] = useState(false)
    const [name, setName] = useState('')
    const [orgLicense, setOrgLicense] = useState('')

    const { login, loginDemo, register, isAuthenticated, redirectByRole } = useAuth()

    // If already authenticated, redirect
    if (isAuthenticated) {
        redirectByRole()
        return null
    }

    const roles = [
        { id: 'PARENT' as UserRole, label: 'Parent', icon: Users, color: 'bg-blue-500' },
        { id: 'CLINICIAN' as UserRole, label: 'Clinician', icon: Stethoscope, color: 'bg-emerald-500' },
        { id: 'ADMIN' as UserRole, label: 'Admin', icon: Shield, color: 'bg-amber-500' }
    ]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!email || !password) {
            setError('Please fill in all fields')
            return
        }

        setIsLoading(true)
        try {
            if (isRegister) {
                await register(email, name, password, selectedRole, orgLicense)
            } else {
                await login(email, password)
            }
        } catch (err: any) {
            setError(err.message || 'Invalid credentials. Please try again.')
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
                        ROLE-BASED<br />
                        <span className="text-[#D4AF37]">ACCESS.</span>
                    </h1>
                    <p className="text-xl font-light opacity-60 max-w-md leading-relaxed">
                        Parents, Clinicians, and Administrators each have tailored dashboards and permissions.
                    </p>
                </div>

                <div className="relative z-10 space-y-4 text-sm">
                    <div className="flex items-center gap-3 opacity-60">
                        <Users className="w-5 h-5 text-blue-400" />
                        <span>Parents → Screening & Reports</span>
                    </div>
                    <div className="flex items-center gap-3 opacity-60">
                        <Stethoscope className="w-5 h-5 text-emerald-400" />
                        <span>Clinicians → Clinical Dashboard & Intelligence</span>
                    </div>
                    <div className="flex items-center gap-3 opacity-60">
                        <Shield className="w-5 h-5 text-amber-400" />
                        <span>Admins → Full System Access</span>
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    <div className="mb-8">
                        <h2 className="text-4xl font-serif font-black tracking-tighter text-[#0B3D33] mb-3">
                            Welcome Back
                        </h2>
                        <p className="text-[#0B3D33]/60 font-medium mb-6">
                            Select a demo account or sign in below
                        </p>

                        {/* PROTOTYPE DEMO BUTTONS */}
                        <div className="grid grid-cols-3 gap-3 mb-8">
                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        await loginDemo('parent')
                                    } catch (err: any) {
                                        setError(err.message || 'Demo login failed')
                                    }
                                }}
                                disabled={isLoading}
                                className="p-3 bg-[#0B3D33] text-[#D4AF37] font-bold uppercase tracking-widest hover:bg-[#0B3D33]/90 transition-all flex flex-col items-center justify-center gap-1 rounded-lg shadow-lg shadow-[#0B3D33]/20"
                            >
                                <span className="text-[10px] opacity-60">Prototype</span>
                                <span className="text-xs">Parent</span>
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        await loginDemo('clinician')
                                    } catch (err: any) {
                                        setError(err.message || 'Demo login failed')
                                    }
                                }}
                                disabled={isLoading}
                                className="p-3 bg-[#D4AF37] text-[#0B3D33] font-bold uppercase tracking-widest hover:bg-[#D4AF37]/90 transition-all flex flex-col items-center justify-center gap-1 rounded-lg shadow-lg shadow-[#D4AF37]/20"
                            >
                                <span className="text-[10px] opacity-60">Prototype</span>
                                <span className="text-xs">Clinician</span>
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        await loginDemo('admin')
                                    } catch (err: any) {
                                        setError(err.message || 'Demo login failed')
                                    }
                                }}
                                disabled={isLoading}
                                className="p-3 bg-red-800 text-white font-bold uppercase tracking-widest hover:bg-red-900 transition-all flex flex-col items-center justify-center gap-1 rounded-lg shadow-lg shadow-red-900/20"
                            >
                                <span className="text-[10px] opacity-60">Prototype</span>
                                <span className="text-xs">Admin</span>
                            </button>
                        </div>

                        <div className="relative mb-8 text-center">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[#0B3D33]/10"></div>
                            </div>
                            <span className="relative bg-[#FDFCF8] px-4 text-xs font-black uppercase tracking-widest text-[#0B3D33]/40">
                                OR LOGIN MANUALLY
                            </span>
                        </div>
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

                        {/* Role Selection */}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-[#0B3D33]/60 mb-3">
                                Select Role
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {roles.map(role => (
                                    <button
                                        key={role.id}
                                        type="button"
                                        onClick={() => setSelectedRole(role.id)}
                                        className={`p-4 border-2 text-center transition-all ${selectedRole === role.id
                                            ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                                            : 'border-[#0B3D33]/10 hover:border-[#0B3D33]/30'
                                            }`}
                                    >
                                        <role.icon className={`w-6 h-6 mx-auto mb-2 ${selectedRole === role.id ? 'text-[#D4AF37]' : 'text-[#0B3D33]/40'}`} />
                                        <p className={`font-bold text-xs uppercase tracking-wider ${selectedRole === role.id ? 'text-[#0B3D33]' : 'text-[#0B3D33]/60'}`}>
                                            {role.label}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>

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
                                    placeholder={selectedRole === 'PARENT' ? 'guardian@example.com' : selectedRole === 'CLINICIAN' ? 'doctor@clinic.com' : 'admin@tarang.health'}
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
                                </button>
                            </div>
                        </div>

                        {isRegister && selectedRole !== 'PARENT' && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                <label className="block text-xs font-black uppercase tracking-widest text-[#0B3D33]/60 mb-3">
                                    Organization License Key
                                </label>
                                <div className="relative">
                                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0B3D33]/30" />
                                    <input
                                        type="text"
                                        value={orgLicense}
                                        onChange={(e) => setOrgLicense(e.target.value)}
                                        className="w-full bg-white border-2 border-[#0B3D33]/10 p-4 pl-12 outline-none focus:border-[#D4AF37] transition-colors font-medium"
                                        placeholder="ALPHA-XXXX-XXXX"
                                    />
                                </div>
                            </motion.div>
                        )}

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
                            {isLoading ? (isRegister ? 'Joining...' : 'Signing in...') : (
                                <>{isRegister ? 'Create Account' : 'Sign In'} as {selectedRole} <ArrowRight className="w-5 h-5" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-[#0B3D33]/60 font-medium">
                            Don't have an account?{' '}
                            <Link
                                href="/register"
                                className="font-bold text-[#0B3D33] hover:text-[#D4AF37] transition-colors underline underline-offset-4"
                            >
                                Create Account
                            </Link>
                        </p>
                    </div>


                </motion.div>
            </div>
        </div>
    )
}
