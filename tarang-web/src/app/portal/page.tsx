"use client"
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, User, Activity, Fingerprint } from 'lucide-react'

export default function PatientPortal() {
    return (
        <div className="min-h-screen bg-[#FDFCF8] pt-32 pb-20 px-8 md:px-16 flex justify-center">
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">

                {/* New Patient / Guest Flow */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-12"
                >
                    <div>
                        <span className="text-[#D4AF37] font-mono text-xs font-black uppercase tracking-widest mb-4 block">New_Arrivals</span>
                        <h1 className="text-5xl md:text-7xl font-serif font-black text-[#0B3D33] leading-[0.9] tracking-tighter mb-8">
                            Start <br /> Discovery.
                        </h1>
                        <p className="text-lg md:text-xl text-[#0B3D33]/60 font-light leading-relaxed max-w-md">
                            Begin the collaborative screening process without an account. Our AI agents will guide you through the initial behavioral capture.
                        </p>
                    </div>

                    <Link href="/screening" className="group block">
                        <div className="bg-[#0B3D33] text-[#D4AF37] p-8 md:p-12 pr-10 md:pr-20 relative overflow-hidden transition-all hover:bg-[#1a4f44]">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Activity className="w-32 h-32" />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-widest mb-2">Guest Screening</h3>
                            <p className="font-mono text-xs opacity-60 mb-8">No_Login_Required • Instant_Results</p>

                            <div className="flex items-center gap-4 font-bold uppercase tracking-widest text-sm group-hover:gap-8 transition-all">
                                Initialize_Agent <ArrowRight className="w-5 h-5" />
                            </div>
                        </div>
                    </Link>
                </motion.div>

                {/* Returning Patient / Login */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="space-y-12 lg:border-l lg:border-[#0B3D33]/10 lg:pl-20"
                >
                    <div>
                        <span className="text-[#0B3D33]/40 font-mono text-xs font-black uppercase tracking-widest mb-4 block">Returning_Members</span>
                        <h2 className="text-4xl md:text-5xl font-serif font-black text-[#0B3D33] leading-none tracking-tighter mb-8 opacity-80">
                            Digital <br /> Twin Access.
                        </h2>
                        <p className="text-base md:text-lg text-[#0B3D33]/60 font-light leading-relaxed max-w-md">
                            Access your longitudinal progress dashboard, therapy plans, and specialist messages.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="group relative">
                            <Fingerprint className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37]" />
                            <input
                                type="text"
                                placeholder="Tarang_ID (e.g. TAR-9001)"
                                className="w-full bg-white border-2 border-[#0B3D33]/10 p-6 pl-16 font-mono text-sm outline-none focus:border-[#D4AF37] transition-all"
                            />
                        </div>
                        <div className="group relative">
                            <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37]" />
                            <input
                                type="password"
                                placeholder="Secure_Key"
                                className="w-full bg-white border-2 border-[#0B3D33]/10 p-6 pl-16 font-mono text-sm outline-none focus:border-[#D4AF37] transition-all"
                            />
                        </div>
                        <Link href="/dashboard" className="block w-full text-center bg-[#FDFCF8] border-2 border-[#0B3D33] text-[#0B3D33] p-6 font-black uppercase tracking-widest hover:bg-[#0B3D33] hover:text-[#D4AF37] transition-all">
                            Authenticate
                        </Link>
                    </div>

                    <div className="pt-8 border-t border-[#0B3D33]/10 flex gap-8">
                        <div>
                            <p className="text-3xl font-serif font-black text-[#0B3D33]">24k+</p>
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Activefamilies</p>
                        </div>
                        <div>
                            <p className="text-3xl font-serif font-black text-[#0B3D33]">98%</p>
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Privacy_Score</p>
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    )
}
