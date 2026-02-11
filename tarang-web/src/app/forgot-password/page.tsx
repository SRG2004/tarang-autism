"use client"
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, CheckCircle2, Shield } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        // Simulate API call
        setTimeout(() => {
            setIsSubmitted(true)
            setIsLoading(false)
        }, 1500)
    }

    return (
        <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white border-2 border-[#0B3D33] p-12 relative shadow-[20px_20px_0px_rgba(11,61,51,0.05)]"
            >
                <div className="mb-10 text-center">
                    <div className="w-16 h-16 bg-[#0B3D33]/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-8 h-8 text-[#D4AF37]" />
                    </div>
                    <h1 className="text-4xl font-serif font-black tracking-tighter text-[#0B3D33] mb-4 uppercase">
                        Account <br /> <span className="text-[#D4AF37]">Recovery</span>
                    </h1>
                    <p className="text-[#0B3D33]/60 font-medium text-sm">
                        Enter your credentials to receive a secure recovery link.
                    </p>
                </div>

                {!isSubmitted ? (
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#0B3D33]/60 mb-3">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0B3D33]/30" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#FDFCF8] border-2 border-[#0B3D33]/10 p-5 pl-12 outline-none focus:border-[#D4AF37] transition-colors font-medium border-dashed"
                                    placeholder="guardian@example.com"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#0B3D33] text-[#D4AF37] p-6 font-black uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#0B3D33] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isLoading ? "Validating..." : "Request Recovery Link"}
                        </button>

                        <div className="text-center">
                            <Link href="/login" className="text-xs font-black uppercase tracking-widest text-[#0B3D33]/40 hover:text-[#D4AF37] transition-all flex items-center justify-center gap-2">
                                <ArrowLeft className="w-4 h-4" /> Back to Login
                            </Link>
                        </div>
                    </form>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-8"
                    >
                        <div className="w-20 h-20 bg-[#D4AF37]/20 rounded-full flex items-center justify-center mx-auto mb-8">
                            <CheckCircle2 className="w-10 h-10 text-[#0B3D33]" />
                        </div>
                        <h3 className="text-2xl font-serif font-black text-[#0B3D33] mb-4">Transmission Sent</h3>
                        <p className="text-sm font-light text-[#0B3D33]/60 mb-10 leading-relaxed">
                            A secure link has been dispatched to <br />
                            <span className="font-bold text-[#0B3D33] underline">{email}</span>. <br />
                            Please check your encrypted inbox.
                        </p>
                        <Link
                            href="/login"
                            className="inline-block bg-[#0B3D33] text-[#D4AF37] px-10 py-5 font-black uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#0B3D33] transition-all"
                        >
                            Return to Portal
                        </Link>
                    </motion.div>
                )}
            </motion.div>
        </div>
    )
}
