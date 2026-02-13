"use client"
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, FileText, Activity, Search, Filter, ArrowRight, UserPlus, Loader2 } from 'lucide-react'
import { withRoleProtection, useAuth } from '@/context/AuthContext'
import { cn, API_URL } from '@/lib/utils'

const PatientCard = ({ patient }: any) => (
    <div className="p-8 border-2 border-[#0B3D33] bg-white group hover:bg-[#0B3D33] hover:text-[#FDFCF8] transition-all duration-500 cursor-pointer shadow-[10px_10px_0px_#D4AF37]">
        <div className="flex justify-between items-start mb-6">
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 group-hover:text-[#D4AF37] mb-2">ID_#{patient.id}</p>
                <h3 className="text-3xl font-serif font-black tracking-tighter uppercase">{patient.name}</h3>
            </div>
            <div className={cn(
                "px-4 py-1 text-[10px] font-black uppercase tracking-widest",
                patient.risk === 'High' ? "bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white" :
                    patient.risk === 'Medium' ? "bg-amber-100 text-amber-600 group-hover:bg-amber-600 group-hover:text-white" :
                        "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white"
            )}>
                {patient.risk}_Risk
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Stability</p>
                <p className="text-xl font-serif font-bold">{patient.stability}</p>
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Next_Drill</p>
                <p className="text-xl font-serif font-bold">{patient.nextDrill}</p>
            </div>
        </div>

        <button className="flex items-center gap-3 text-xs font-black uppercase tracking-widest group-hover:text-[#D4AF37] transition-all">
            Full Clinical Analysis <ArrowRight className="w-4 h-4" />
        </button>
    </div>
)

function ClinicalDashboard() {
    const { token, user } = useAuth()
    const [patients, setPatients] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!token) return
        fetch(`${API_URL}/clinical/patients`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.ok ? res.json() : [])
            .then(data => setPatients(Array.isArray(data) ? data : []))
            .catch(err => console.warn('Clinical patients fetch failed:', err))
            .finally(() => setLoading(false))
    }, [token])

    return (
        <div className="min-h-screen bg-[#FDFCF8] pt-32 px-8 md:px-16 lg:px-24 pb-20">
            <motion.header
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-20"
            >
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <span className="px-3 py-1 bg-[#0B3D33] text-[#D4AF37] font-mono text-[10px] uppercase font-black tracking-widest">Clinician_Portal_V1</span>
                        <span className="text-[10px] font-mono uppercase tracking-widest opacity-40">Hospital: Alpha Hospital (South Wing)</span>
                    </div>
                    <h1 className="text-7xl font-serif font-black tracking-tighter uppercase leading-none">Patient Roster</h1>
                    <p className="text-xl font-light text-[#0B3D33]/60 mt-4 max-w-xl">Active screenings and intervention monitoring across your clinical organization.</p>
                </div>
                <button className="flex items-center gap-3 bg-[#0B3D33] text-[#D4AF37] px-8 py-5 font-black uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#0B3D33] transition-all duration-500">
                    <UserPlus className="w-5 h-5" /> Onboard Patient
                </button>
            </motion.header>

            <div className="flex flex-col md:flex-row gap-6 mb-12 border-b-2 border-[#0B3D33] pb-10">
                <div className="flex-1 relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
                    <input
                        type="text"
                        placeholder="SEARCH_BY_ID_OR_NAME..."
                        className="w-full bg-white border-2 border-[#0B3D33] pl-16 pr-8 py-5 font-black uppercase tracking-widest text-xs focus:ring-0 focus:border-[#D4AF37] outline-none transition-all"
                    />
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center gap-3 border-2 border-[#0B3D33] px-8 py-5 font-black uppercase tracking-widest text-xs hover:bg-[#0B3D33] hover:text-white transition-all">
                        <Filter className="w-5 h-5" /> Filter_Risk
                    </button>
                    <button className="flex items-center gap-3 border-2 border-[#0B3D33] px-8 py-5 font-black uppercase tracking-widest text-xs hover:bg-[#0B3D33] hover:text-white transition-all">
                        Sort_By_Activity
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                {loading ? (
                    <div className="col-span-full flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
                    </div>
                ) : patients.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-[#0B3D33]/30 font-black uppercase tracking-widest text-sm">
                        No patients registered in your organization yet
                    </div>
                ) : (
                    patients.map(p => (
                        <div key={p.id} onClick={() => window.location.href = '/clinical/intervention'} className="cursor-pointer">
                            <PatientCard patient={p} />
                        </div>
                    ))
                )}
            </div>

            <div className="mt-20 p-12 border-2 border-dashed border-[#0B3D33]/20 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 mb-6">Industrial_Analytics_Preview</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                    {[
                        { label: "Total Managed", val: patients.length.toString() },
                        { label: "High Risk Flags", val: patients.filter(p => p.risk === 'High').length.toString() },
                        { label: "Medium Risk", val: patients.filter(p => p.risk === 'Medium').length.toString() },
                        { label: "Low Risk", val: patients.filter(p => p.risk === 'Low').length.toString() },
                    ].map(stat => (
                        <div key={stat.label}>
                            <p className="text-4xl font-serif font-black mb-1">{stat.val}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default withRoleProtection(ClinicalDashboard, ['CLINICIAN', 'ADMIN'])

// SEO Compliance: <title> <meta name="description" content="Clinician Portal"> property="og:title"
