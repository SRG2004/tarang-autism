"use client"
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, ArrowRight, ArrowLeft, Shield, Users, Stethoscope, CheckCircle2, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import { useAuth, UserRole } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

export default function RegisterPage() {
    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    // Form State
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [role, setRole] = useState<UserRole>('PARENT')
    const [orgLicense, setOrgLicense] = useState('')

    // Metadata State
    const [childName, setChildName] = useState('')
    const [childAge, setChildAge] = useState('')
    const [medicalId, setMedicalId] = useState('')
    const [specialization, setSpecialization] = useState('')

    const { register } = useAuth()

    const handleNext = () => {
        if (step === 1 && (!email || !password || !name)) {
            setError('Please complete all identification fields.')
            return
        }
        setError('')
        setStep(s => s + 1)
    }

    const handleBack = () => {
        setError('')
        setStep(s => s - 1)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            const profileMetadata = role === 'PARENT'
                ? { child_name: childName, child_age: childAge }
                : { medical_id: medicalId, specialization: specialization }

            await register(email, name, password, role, orgLicense, profileMetadata)
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please verify your details.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#FDFCF8] flex flex-col lg:flex-row">
            {/* Branding Sidebar */}
            <div className="lg:w-1/3 bg-[#0B3D33] text-[#FDFCF8] p-12 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="text-[15rem] font-black tracking-tighter leading-none -rotate-12 -translate-x-10 translate-y-40 select-none">
                        TARANG
                    </div>
                </div>

                <div className="relative z-10">
                    <Link href="/" className="text-2xl font-serif font-black tracking-tighter hover:text-[#D4AF37] transition-colors">
                        TARANG
                    </Link>
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="px-3 py-1 bg-[#D4AF37] text-[#0B3D33] font-mono text-[10px] uppercase font-black tracking-widest">
                            Enterprise_Onboarding
                        </span>
                    </div>
                    <h1 className="text-5xl font-serif font-black tracking-tighter leading-tight mb-8">
                        Join the <br />
                        <span className="text-[#D4AF37]">Care Continuum.</span>
                    </h1>

                    {/* Stepper Visual */}
                    <div className="space-y-6 mt-12">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className={cn(
                                "flex items-center gap-4 transition-all duration-500",
                                step === s ? "opacity-100 translate-x-2" : "opacity-30"
                            )}>
                                <div className={cn(
                                    "w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs",
                                    step >= s ? "bg-[#D4AF37] border-[#D4AF37] text-[#0B3D33]" : "border-white/20 text-white"
                                )}>
                                    {step > s ? "✓" : s}
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest">
                                    {s === 1 ? "Bio-Identity" : s === 2 ? "Role Scoping" : "Verification"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 text-[10px] font-mono opacity-40 uppercase tracking-widest">
                    &copy; 2026 Tarang Industrial Care
                </div>
            </div>

            {/* Form Content */}
            <div className="w-full lg:w-2/3 flex items-center justify-center p-8 lg:p-20">
                <div className="w-full max-w-xl">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        >
                            {error && (
                                <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
                                    <ShieldAlert className="w-5 h-5 shrink-0" />
                                    <p className="text-sm font-bold">{error}</p>
                                </div>
                            )}

                            {step === 1 && (
                                <div className="space-y-10">
                                    <div>
                                        <h2 className="text-4xl font-serif font-black text-[#0B3D33] tracking-tighter mb-2">Identify Yourself</h2>
                                        <p className="text-[#0B3D33]/60 font-medium">Basic credentials for your secure portal access.</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-[#0B3D33]/40">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B3D33]/30" />
                                                <input value={name} onChange={e => setName(e.target.value)} className="w-full p-4 pl-12 bg-white border-2 border-[#0B3D33]/5 focus:border-[#D4AF37] outline-none transition-all font-medium" placeholder="Elias Thorne" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-[#0B3D33]/40">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B3D33]/30" />
                                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 pl-12 bg-white border-2 border-[#0B3D33]/5 focus:border-[#D4AF37] outline-none transition-all font-medium" placeholder="elias@domain.com" />
                                            </div>
                                        </div>
                                        <div className="space-y-2 col-span-full">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-[#0B3D33]/40">Set Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B3D33]/30" />
                                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 pl-12 bg-white border-2 border-[#0B3D33]/5 focus:border-[#D4AF37] outline-none transition-all font-medium" placeholder="••••••••" />
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={handleNext} className="w-full bg-[#0B3D33] text-[#D4AF37] p-5 font-black uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#0B3D33] transition-all flex items-center justify-center gap-4">
                                        Next Context <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-10">
                                    <div>
                                        <h2 className="text-4xl font-serif font-black text-[#0B3D33] tracking-tighter mb-2">Scope Participation</h2>
                                        <p className="text-[#0B3D33]/60 font-medium">Select your role to unlock specialized tools.</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setRole('PARENT')}
                                            className={cn(
                                                "p-8 border-2 flex flex-col items-center gap-4 transition-all relative overflow-hidden",
                                                role === 'PARENT' ? "border-[#D4AF37] bg-[#D4AF37]/5" : "border-[#0B3D33]/5 hover:border-[#0B3D33]/20"
                                            )}
                                        >
                                            <Users className={cn("w-10 h-10", role === 'PARENT' ? "text-[#D4AF37]" : "text-[#0B3D33]/20")} />
                                            <span className="font-black uppercase tracking-widest text-xs">Parent / Guardian</span>
                                        </button>
                                        <button
                                            onClick={() => setRole('CLINICIAN')}
                                            className={cn(
                                                "p-8 border-2 flex flex-col items-center gap-4 transition-all relative overflow-hidden",
                                                role === 'CLINICIAN' ? "border-[#D4AF37] bg-[#D4AF37]/5" : "border-[#0B3D33]/5 hover:border-[#0B3D33]/20"
                                            )}
                                        >
                                            <Stethoscope className={cn("w-10 h-10", role === 'CLINICIAN' ? "text-[#D4AF37]" : "text-[#0B3D33]/20")} />
                                            <span className="font-black uppercase tracking-widest text-xs">Professional</span>
                                        </button>
                                    </div>

                                    <div className="p-10 bg-white border-2 border-dashed border-[#0B3D33]/10">
                                        <AnimatePresence mode="wait">
                                            {role === 'PARENT' ? (
                                                <motion.div key="parent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#0B3D33]/40">Child's Name (Optional)</label>
                                                        <input value={childName} onChange={e => setChildName(e.target.value)} className="w-full p-4 bg-[#FDFCF8] border border-[#0B3D33]/10 outline-none focus:border-[#D4AF37] font-medium" placeholder="e.g. Arvid" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#0B3D33]/40">Child's Age</label>
                                                        <input type="number" value={childAge} onChange={e => setChildAge(e.target.value)} className="w-full p-4 bg-[#FDFCF8] border border-[#0B3D33]/10 outline-none focus:border-[#D4AF37] font-medium" placeholder="Years" />
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <motion.div key="clinician" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#0B3D33]/40">Medical License ID</label>
                                                        <input value={medicalId} onChange={e => setMedicalId(e.target.value)} className="w-full p-4 bg-[#FDFCF8] border border-[#0B3D33]/10 outline-none focus:border-[#D4AF37] font-medium" placeholder="MED-RX-9921" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#0B3D33]/40">Specialization</label>
                                                        <input value={specialization} onChange={e => setSpecialization(e.target.value)} className="w-full p-4 bg-[#FDFCF8] border border-[#0B3D33]/10 outline-none focus:border-[#D4AF37] font-medium" placeholder="e.g. Pediatric Neurology" />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="flex gap-4">
                                        <button onClick={handleBack} className="p-5 border-2 border-[#0B3D33] text-[#0B3D33] font-black uppercase tracking-widest hover:bg-[#0B3D33] hover:text-white transition-all flex-1">
                                            Return
                                        </button>
                                        <button onClick={handleNext} className="p-5 bg-[#0B3D33] text-[#D4AF37] font-black uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#0B3D33] transition-all flex-1 flex items-center justify-center gap-4">
                                            Final Validate <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-10">
                                    <div className="text-center">
                                        <div className="w-20 h-20 bg-[#D4AF37]/20 rounded-full flex items-center justify-center mx-auto mb-8">
                                            <Shield className="w-10 h-10 text-[#0B3D33]" />
                                        </div>
                                        <h2 className="text-4xl font-serif font-black text-[#0B3D33] tracking-tighter mb-2 italic">Confirm Authorization</h2>
                                        <p className="text-[#0B3D33]/60 font-medium">Final security handshake before account creation.</p>
                                    </div>

                                    {role === 'CLINICIAN' && (
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-[#0B3D33]/40">Organization License Key</label>
                                            <div className="relative">
                                                <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]" />
                                                <input value={orgLicense} onChange={e => setOrgLicense(e.target.value)} className="w-full p-5 pl-12 bg-white border-2 border-[#D4AF37] outline-none font-bold tracking-widest uppercase" placeholder="ALPHA-XXXX-XXXX" />
                                            </div>
                                            <p className="text-[9px] font-mono text-[#0B3D33]/40">Contact your clinical administrator for your organization's unique key.</p>
                                        </div>
                                    )}

                                    <div className="p-8 bg-[#0B3D33]/5 space-y-4">
                                        <div className="flex items-start gap-4">
                                            <input type="checkbox" required className="w-5 h-5 mt-1 accent-[#D4AF37]" />
                                            <p className="text-xs font-medium leading-relaxed opacity-60">I acknowledge that Tarang uses AI-assisted screening tools and clinical data handles adhere to PHI isolation protocols.</p>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <input type="checkbox" required className="w-5 h-5 mt-1 accent-[#D4AF37]" />
                                            <p className="text-xs font-medium leading-relaxed opacity-60">I agree to the Terms of Service and Privacy Policy for pediatric diagnostic support.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button onClick={handleBack} className="p-5 border-2 border-[#0B3D33] text-[#0B3D33] font-black uppercase tracking-widest hover:bg-[#0B3D33] hover:text-white transition-all flex-1">
                                            Adjust
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={isLoading}
                                            className="p-5 bg-[#0B3D33] text-[#D4AF37] font-black uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#0B3D33] transition-all flex-1 flex items-center justify-center gap-4 disabled:opacity-50"
                                        >
                                            {isLoading ? "Authenticating..." : "Establish Account"}
                                            {!isLoading && <ArrowRight className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    <div className="mt-16 text-center">
                        <p className="text-[#0B3D33]/40 text-xs font-medium">
                            Already part of the network? {' '}
                            <Link href="/login" className="text-[#0B3D33] font-black uppercase tracking-widest hover:text-[#D4AF37] transition-colors ml-2 border-b-2 border-[#D4AF37]">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
