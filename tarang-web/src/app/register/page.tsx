"use client"
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, AlertCircle, Shield, Users } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth, UserRole } from '@/context/AuthContext'

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'PARENT' as UserRole,
        agreeToTerms: false
    })
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const router = useRouter()
    const { register } = useAuth()

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!formData.name || !formData.email || !formData.password) {
            setError('Please fill in all required fields')
            return
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters')
            return
        }

        if (!formData.agreeToTerms) {
            setError('You must agree to the terms and privacy policy')
            return
        }

        setIsLoading(true)
        try {
            await register(formData.email, formData.name, formData.password, formData.role)
            router.push('/dashboard')
        } catch (err) {
            setError('Registration failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const roles = [
        { id: 'PARENT', label: 'Parent / Guardian', icon: Users, desc: 'Manage child screening and care' },
        { id: 'CLINICIAN', label: 'Healthcare Professional', icon: Shield, desc: 'Clinical access and reports' }
    ]

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
                        JOIN THE<br />
                        <span className="text-[#D4AF37]">CONTINUUM.</span>
                    </h1>
                    <p className="text-xl font-light opacity-60 max-w-md leading-relaxed">
                        Create your account to access AI-powered screening tools and personalized care pathways.
                    </p>
                </div>

                <div className="relative z-10 text-sm font-mono opacity-40">
                    © 2026 TELIPORT Season 3
                </div>
            </div>

            {/* Right Panel - Register Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md py-8"
                >
                    <div className="mb-10">
                        <h2 className="text-4xl font-serif font-black tracking-tighter text-[#0B3D33] mb-3">
                            Create Account
                        </h2>
                        <p className="text-[#0B3D33]/60 font-medium">
                            Start your journey with Tarang
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
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
                                I am a
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {roles.map(role => (
                                    <button
                                        key={role.id}
                                        type="button"
                                        onClick={() => updateField('role', role.id)}
                                        className={`p-4 border-2 text-left transition-all ${formData.role === role.id
                                            ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                                            : 'border-[#0B3D33]/10 hover:border-[#0B3D33]/30'
                                            }`}
                                    >
                                        <role.icon className={`w-5 h-5 mb-2 ${formData.role === role.id ? 'text-[#D4AF37]' : 'text-[#0B3D33]/40'}`} />
                                        <p className="font-bold text-sm text-[#0B3D33]">{role.label}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Name */}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-[#0B3D33]/60 mb-3">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0B3D33]/30" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => updateField('name', e.target.value)}
                                    className="w-full bg-white border-2 border-[#0B3D33]/10 p-4 pl-12 outline-none focus:border-[#D4AF37] transition-colors font-medium"
                                    placeholder="James Smith"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-[#0B3D33]/60 mb-3">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0B3D33]/30" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => updateField('email', e.target.value)}
                                    className="w-full bg-white border-2 border-[#0B3D33]/10 p-4 pl-12 outline-none focus:border-[#D4AF37] transition-colors font-medium"
                                    placeholder="guardian@example.com"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-[#0B3D33]/60 mb-3">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0B3D33]/30" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => updateField('password', e.target.value)}
                                        className="w-full bg-white border-2 border-[#0B3D33]/10 p-4 pl-12 outline-none focus:border-[#D4AF37] transition-colors font-medium"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-[#0B3D33]/60 mb-3">
                                    Confirm
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.confirmPassword}
                                        onChange={(e) => updateField('confirmPassword', e.target.value)}
                                        className="w-full bg-white border-2 border-[#0B3D33]/10 p-4 outline-none focus:border-[#D4AF37] transition-colors font-medium"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Terms */}
                        <label className="flex items-start gap-3 cursor-pointer py-2">
                            <input
                                type="checkbox"
                                checked={formData.agreeToTerms}
                                onChange={(e) => updateField('agreeToTerms', e.target.checked)}
                                className="w-5 h-5 accent-[#D4AF37] mt-0.5"
                            />
                            <span className="text-sm text-[#0B3D33]/60 leading-relaxed">
                                I agree to the <Link href="/privacy" className="text-[#D4AF37] font-bold hover:underline">Privacy Policy</Link> and consent to pediatric data handling protocols.
                            </span>
                        </label>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#0B3D33] text-[#D4AF37] p-5 font-black uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#0B3D33] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Creating Account...' : (
                                <>Create Account <ArrowRight className="w-5 h-5" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-[#0B3D33]/60 font-medium">
                            Already have an account?{' '}
                            <Link href="/login" className="font-bold text-[#0B3D33] hover:text-[#D4AF37] transition-colors">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
