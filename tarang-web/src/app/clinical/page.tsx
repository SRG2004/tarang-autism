"use client"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    BarChart3, Video, Users, AlertCircle,
    Activity, Search, ChevronRight, Monitor,
    Wifi, ShieldCheck, FileText, Settings
} from 'lucide-react'
import { cn, API_URL } from '@/lib/utils'

export default function ClinicianDashboard() {
    const [centerHealth, setCenterHealth] = useState<any>(null)
    const [activeSession, setActiveSession] = useState<any>(null)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetch(`${API_URL}/clinical/center/1/health`)
            .then(res => res.json())
            .then(data => setCenterHealth(data))
    }, [])

    const handleStartTele = async () => {
        const res = await fetch(`${API_URL}/clinical/tele-session/TAR_9001`, {
            method: 'POST'
        })
        const data = await res.json()
        setActiveSession(data)
    }

    return (
        <div className="min-h-screen bg-[#0B3D33] text-[#FDFCF8] pt-32 px-8 md:px-16 lg:px-24 pb-32">
            <motion.header
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-20"
            >
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <span className="px-3 py-1 bg-[#D4AF37] text-[#0B3D33] font-mono text-[10px] uppercase font-black tracking-widest">Clinician_Command_V1</span>
                        <span className="text-[10px] font-mono uppercase tracking-widest opacity-40">System_Status: Operational</span>
                    </div>
                    <h1 className="text-8xl font-serif font-black tracking-tighter uppercase leading-none">
                        Command <br /> <span className="text-[#D4AF37]">Center</span>
                    </h1>
                </div>

                <div className="flex gap-6">
                    <div className="relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white/5 border border-white/10 p-5 pl-14 outline-none focus:border-[#D4AF37] font-bold text-sm tracking-wide transition-all w-[300px]"
                            placeholder="Patient_Lookup..."
                        />
                    </div>
                    <button className="p-5 border border-white/10 hover:border-[#D4AF37] transition-all">
                        <Settings className="w-5 h-5 text-[#D4AF37]" />
                    </button>
                </div>
            </motion.header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Center Health Radar */}
                <div className="lg:col-span-8 p-12 border-2 border-white/10 bg-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                        <BarChart3 className="w-32 h-32" />
                    </div>
                    <h3 className="text-3xl font-serif font-black uppercase tracking-tighter mb-12">Center Health: Hub_01</h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { label: "Patient Load", val: centerHealth?.patient_load || '...', color: "#D4AF37" },
                            { label: "Alerts Pending", val: centerHealth?.alerts_pending || '...', color: "#FF4D4D" },
                            { label: "Active Staff", val: centerHealth?.staff_active || '...', color: "#FDFCF8" },
                            { label: "Throughput", val: centerHealth?.screening_throughput || '...', color: "#FDFCF8" },
                        ].map((stat, i) => (
                            <div key={i} className="p-6 border border-white/10 hover:border-[#D4AF37] transition-all group cursor-pointer">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4">{stat.label}</p>
                                <p className="text-4xl font-serif font-black" style={{ color: stat.color }}>{stat.val}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 border-t border-white/10 pt-10">
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] mb-10 opacity-40">High_Priority_Review_Queue</h4>
                        <div className="space-y-4">
                            {[
                                { name: "Arvid Smith", id: "#TR_9001", risk: "72.4%", status: "Needs Review" },
                                { name: "Maya Patel", id: "#TR_8821", risk: "65.0%", status: "Scheduled" },
                                { name: "Leo Chen", id: "#TR_8702", risk: "58.2%", status: "Stable" },
                            ].map((p, i) => (
                                <div key={i} className="group flex justify-between items-center p-6 border border-white/5 hover:bg-white/5 transition-all cursor-pointer">
                                    <div className="flex gap-6 items-center">
                                        <div className="w-12 h-12 border border-[#D4AF37] flex items-center justify-center font-black">
                                            {p.name[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold">{p.name} <span className="opacity-40 ml-2 font-mono text-[10px]">{p.id}</span></p>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">{p.status}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-10">
                                        <div className="text-right">
                                            <p className="text-2xl font-serif font-black text-[#D4AF37]">{p.risk}</p>
                                            <p className="text-[8px] font-black uppercase opacity-40">Risk_Index</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Telepresence Hub */}
                <div className="lg:col-span-4 space-y-10">
                    <div className="p-10 border-2 border-[#D4AF37] bg-white text-[#0B3D33]">
                        <h3 className="text-2xl font-serif font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                            <Monitor className="w-6 h-6" /> Tele-Diagnostic
                        </h3>
                        <p className="font-medium opacity-60 mb-10 leading-relaxed">
                            Initiate high-resolution biometric consultation with real-time gaze overlay capabilities.
                        </p>
                        <button
                            onClick={handleStartTele}
                            className="w-full bg-[#0B3D33] text-[#FDFCF8] p-6 font-black uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#0B3D33] transition-all flex items-center justify-center gap-4"
                        >
                            <Video className="w-5 h-5" /> Start_Telepresence
                        </button>
                    </div>

                    <AnimatePresence>
                        {activeSession && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-10 border-2 border-white/10 bg-white/5 relative"
                            >
                                <div className="flex justify-between items-center mb-8">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">Live_Briefing</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        <span className="text-[8px] font-black uppercase opacity-60">Connected</span>
                                    </div>
                                </div>
                                <p className="text-lg font-serif italic opacity-80 mb-8 leading-relaxed">
                                    "{activeSession.briefing}"
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/5 border border-white/10">
                                        <p className="text-[8px] font-black uppercase opacity-40 mb-2">Session_Token</p>
                                        <p className="font-mono text-[10px] font-bold">{activeSession.session_token}</p>
                                    </div>
                                    <div className="p-4 bg-white/5 border border-white/10">
                                        <p className="text-[8px] font-black uppercase opacity-40 mb-2">Priority</p>
                                        <p className="font-bold text-[10px] text-[#D4AF37]">{activeSession.priority}</p>
                                    </div>
                                </div>
                                <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-center">
                                    <div className="flex gap-4">
                                        <Wifi className="w-4 h-4 opacity-40" />
                                        <ShieldCheck className="w-4 h-4 opacity-40" />
                                        <FileText className="w-4 h-4 opacity-40" />
                                    </div>
                                    <span className="text-[10px] font-black border-b border-[#D4AF37] pb-1 cursor-pointer">Open_Annotations</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="p-10 border-2 border-white/10 bg-[#0B3D33] flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-[#D4AF37] flex items-center justify-center rounded-full mb-6">
                            <Users className="w-8 h-8 text-[#0B3D33]" />
                        </div>
                        <h4 className="text-xl font-serif font-black uppercase mb-2">Staff Directory</h4>
                        <p className="text-[10px] font-medium opacity-40 uppercase tracking-widest px-8">Connect with center administrators and occupational therapists.</p>
                        <button className="mt-8 text-[10px] font-black uppercase tracking-widest border border-white/20 p-4 hover:border-[#D4AF37] transition-all w-full">Access_Directory</button>
                    </div>
                </div>

            </div>
        </div>
    )
}
