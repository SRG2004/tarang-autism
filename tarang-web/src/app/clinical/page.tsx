"use client"
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, FileText, Activity, Search, Filter, ArrowRight, UserPlus, Loader2, Calendar, Clock, Check, Plus, X } from 'lucide-react'
import { withRoleProtection, useAuth } from '@/context/AuthContext'
import { cn, API_URL } from '@/lib/utils'
import { useRouter } from 'next/navigation'

const PatientCard = ({ patient, onClick }: any) => (
    <div onClick={onClick} className="p-8 border-2 border-[#0B3D33] bg-white group hover:bg-[#0B3D33] hover:text-[#FDFCF8] transition-all duration-500 cursor-pointer shadow-[10px_10px_0px_#D4AF37]">
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

    // Phase 2 State
    const [isOnboardOpen, setIsOnboardOpen] = useState(false)
    const [onboardTab, setOnboardTab] = useState<'new' | 'existing'>('new')
    const [searchTerm, setSearchTerm] = useState("")
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [searching, setSearching] = useState(false)
    const [linking, setLinking] = useState(false)
    const [selectedLink, setSelectedLink] = useState<{ patientId: number, parentEmail: string } | null>(null)
    const [appointments, setAppointments] = useState<any[]>([])
    // Phase 6 State
    const [centerStats, setCenterStats] = useState<any>(null)
    const [addingChild, setAddingChild] = useState<string | null>(null) // parent email
    const [newChildData, setNewChildData] = useState({ name: '', external_id: '', dob: '', phone: '' })

    const router = useRouter()

    useEffect(() => {
        if (!token) return

        // Parallel fetch
        Promise.all([
            fetch(`${API_URL}/clinical/patients`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.ok ? res.json() : []),
            fetch(`${API_URL}/appointments`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.ok ? res.json() : []),
            fetch(`${API_URL}/analytics/center`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.ok ? res.json() : null)
        ]).then(([patientsData, appsData, statsData]) => {
            setPatients(Array.isArray(patientsData) ? patientsData : [])
            setAppointments(Array.isArray(appsData) ? appsData : [])
            setCenterStats(statsData)
        }).catch(err => console.warn(err))
            .finally(() => setLoading(false))
    }, [token])

    const handleSearch = async () => {
        if (!searchTerm) return
        setSearching(true)
        try {
            const res = await fetch(`${API_URL}/users/search?email=${searchTerm}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            setSearchResults(Array.isArray(data) ? data : [])
        } catch (e) {
            console.error(e)
        } finally {
            setSearching(false)
        }
    }

    const handleLink = async () => {
        if (!selectedLink) return
        setLinking(true)
        try {
            const res = await fetch(`${API_URL}/clinical/patients/link`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ patient_id: selectedLink.patientId, parent_email: selectedLink.parentEmail })
            })
            if (res.ok) {
                alert("Patient linked successfully!")
                setIsOnboardOpen(false)
                window.location.reload() // Refresh
            } else {
                alert("Failed to link patient")
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLinking(false)
        }
    }

    const handleAddChild = async () => {
        if (!addingChild || !newChildData.name || !newChildData.external_id || !newChildData.dob) return;
        setLinking(true) // Reuse loading state
        try {
            const res = await fetch(`${API_URL}/clinical/patients`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: newChildData.name,
                    external_id: newChildData.external_id,
                    date_of_birth: new Date(newChildData.dob).toISOString(),
                    phone: newChildData.phone,
                    parent_email: addingChild
                })
            })

            if (res.ok) {
                const data = await res.json()
                alert(`Patient ${newChildData.name} created! ID: ${data.patient_id}`)
                setIsOnboardOpen(false)
                setAddingChild(null)
                window.location.reload()
            } else {
                const err = await res.json()
                alert(`Error: ${err.detail}`)
            }
        } catch (e) {
            alert("Failed to create patient")
        } finally {
            setLinking(false)
        }
    }

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
                <button
                    onClick={() => setIsOnboardOpen(true)}
                    className="flex items-center gap-3 bg-[#0B3D33] text-[#D4AF37] px-8 py-5 font-black uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#0B3D33] transition-all duration-500"
                >
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
                        <div key={p.id} onClick={() => router.push('/intelligence')} className="cursor-pointer">
                            <PatientCard patient={p} />
                        </div>
                    ))
                )}
            </div>

            <div className="mt-20 p-12 border-2 border-dashed border-[#0B3D33]/20 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 mb-6">Industrial_Analytics_Preview</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                    {[
                        { label: "Total Managed", val: centerStats?.total_patients?.toString() || patients.length.toString() },
                        { label: "Screenings (Total)", val: centerStats?.total_screenings?.toString() || "0" },
                        { label: "High Risk Flags", val: centerStats?.high_risk_count?.toString() || "0" },
                        { label: "Low Risk", val: centerStats?.risk_distribution?.Low?.toString() || "0" },
                    ].map(stat => (
                        <div key={stat.label}>
                            <p className="text-4xl font-serif font-black mb-1">{stat.val}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Schedule / Calendar Section */}
            <div className="mt-20">
                <h3 className="text-2xl font-serif font-black uppercase tracking-tighter mb-10 flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-[#D4AF37]" /> Upcoming Schedule
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {appointments.length > 0 ? (
                        appointments.map((app: any) => (
                            <div key={app.id} className="p-6 bg-white border border-[#0B3D33]/10 flex items-start gap-4">
                                <div className="bg-[#0B3D33] text-[#FDFCF8] px-3 py-2 text-center">
                                    <span className="block text-xl font-black">{new Date(app.start_time).getDate()}</span>
                                    <span className="block text-[10px] uppercase">{new Date(app.start_time).toLocaleString('default', { month: 'short' })}</span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Clock className="w-3 h-3 text-[#D4AF37]" />
                                        <span className="text-xs font-bold opacity-60">
                                            {new Date(app.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-lg leading-tight mb-2">{app.patient_name || "Unknown Patient"}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider",
                                            app.status === 'confirmed' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                        )}>
                                            {app.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm opacity-40 font-bold uppercase tracking-widest">No upcoming appointments</p>
                    )}
                </div>
            </div>

            {/* Onboard Modal */}
            {isOnboardOpen && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#FDFCF8] w-full max-w-2xl border-2 border-[#D4AF37] max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-[#0B3D33]/10">
                            <h3 className="text-2xl font-black uppercase tracking-tight">Onboard Patient</h3>
                            <button onClick={() => setIsOnboardOpen(false)}><X className="w-6 h-6" /></button>
                        </div>

                        <div className="p-6">
                            <div className="flex gap-4 mb-8 border-b border-[#0B3D33]/10">
                                <button
                                    onClick={() => setOnboardTab('new')}
                                    className={cn("pb-4 text-sm font-black uppercase tracking-widest transition-all", onboardTab === 'new' ? "text-[#0B3D33] border-b-2 border-[#D4AF37]" : "opacity-40 hover:opacity-100")}
                                >
                                    Register New
                                </button>
                                <button
                                    onClick={() => setOnboardTab('existing')}
                                    className={cn("pb-4 text-sm font-black uppercase tracking-widest transition-all", onboardTab === 'existing' ? "text-[#0B3D33] border-b-2 border-[#D4AF37]" : "opacity-40 hover:opacity-100")}
                                >
                                    Link Existing
                                </button>
                            </div>

                            {onboardTab === 'new' ? (
                                <div className="text-center py-10 space-y-6">
                                    <UserPlus className="w-16 h-16 text-[#D4AF37] mx-auto opacity-50" />
                                    <h4 className="text-xl font-serif font-black">Create New Patient Profile</h4>
                                    <p className="opacity-60 max-w-md mx-auto">Register a new patient and parent account from scratch. Best for walk-ins or new referrals.</p>
                                    <button
                                        onClick={() => router.push('/register')}
                                        className="bg-[#0B3D33] text-[#D4AF37] px-8 py-4 font-black uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#0B3D33] transition-all"
                                    >
                                        Go to Registration
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <input
                                            type="email"
                                            placeholder="Parent Email Address..."
                                            className="flex-1 border-2 border-[#0B3D33]/20 p-4 font-bold outline-none focus:border-[#0B3D33]"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        <button
                                            onClick={handleSearch}
                                            disabled={searching}
                                            className="bg-[#0B3D33] text-white px-6 font-black uppercase tracking-widest disabled:opacity-50"
                                        >
                                            {searching ? <Loader2 className="animate-spin" /> : "Search"}
                                        </button>
                                    </div>

                                    {searchResults.length > 0 && (
                                        <div className="space-y-4 mt-6">
                                            <p className="text-xs font-black uppercase tracking-widest opacity-40">Found Parents & Children</p>
                                            {searchResults.map(parent => (
                                                <div key={parent.id} className="border border-[#0B3D33]/10 p-4">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="font-bold">{parent.full_name}</span>
                                                        <span className="text-xs opacity-50">{parent.email}</span>
                                                    </div>

                                                    {parent.children && parent.children.length > 0 ? (
                                                        <div className="space-y-2 mt-2 bg-[#F5F5F0] p-3">
                                                            {parent.children.map((child: any) => (
                                                                <div
                                                                    key={child.id}
                                                                    className={cn(
                                                                        "flex justify-between items-center p-2 cursor-pointer transition-all border",
                                                                        selectedLink?.patientId === child.id ? "bg-[#0B3D33] text-[#D4AF37] border-[#0B3D33]" : "bg-white hover:border-[#D4AF37] border-transparent"
                                                                    )}
                                                                    onClick={() => setSelectedLink({ patientId: child.id, parentEmail: parent.email })}
                                                                >
                                                                    <span className="text-sm font-bold uppercase">{child.name}</span>
                                                                    {selectedLink?.patientId === child.id && <Check className="w-4 h-4" />}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="mt-2">
                                                            <p className="text-xs opacity-50 italic mb-2">No registered children profiles found.</p>
                                                            {addingChild !== parent.email ? (
                                                                <button
                                                                    onClick={() => setAddingChild(parent.email)}
                                                                    className="text-xs font-bold uppercase text-[#0B3D33] underline hover:text-[#D4AF37]"
                                                                >
                                                                    + Create Patient Profile for {parent.full_name}
                                                                </button>
                                                            ) : (
                                                                <div className="bg-[#FDFCF8] border border-[#D4AF37] p-4 space-y-3">
                                                                    <p className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">New Patient Details</p>
                                                                    <input
                                                                        className="w-full p-2 border border-[#0B3D33]/20 text-sm"
                                                                        placeholder="Child Name"
                                                                        value={newChildData.name}
                                                                        onChange={e => setNewChildData({ ...newChildData, name: e.target.value })}
                                                                    />
                                                                    <input
                                                                        className="w-full p-2 border border-[#0B3D33]/20 text-sm"
                                                                        placeholder="External ID (e.g. PID-123)"
                                                                        value={newChildData.external_id}
                                                                        onChange={e => setNewChildData({ ...newChildData, external_id: e.target.value })}
                                                                    />
                                                                    <input
                                                                        type="date"
                                                                        className="w-full p-2 border border-[#0B3D33]/20 text-sm"
                                                                        placeholder="Date of Birth"
                                                                        value={newChildData.dob}
                                                                        onChange={e => setNewChildData({ ...newChildData, dob: e.target.value })}
                                                                    />
                                                                    <div className="flex gap-2 justify-end">
                                                                        <button
                                                                            onClick={() => setAddingChild(null)}
                                                                            className="px-3 py-1 text-xs font-bold uppercase opacity-50 hover:opacity-100"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                        <button
                                                                            onClick={handleAddChild}
                                                                            disabled={linking}
                                                                            className="px-3 py-1 bg-[#0B3D33] text-[#D4AF37] text-xs font-bold uppercase hover:opacity-90"
                                                                        >
                                                                            {linking ? "Creating..." : "Create & Link"}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {selectedLink && (
                                        <button
                                            onClick={handleLink}
                                            disabled={linking}
                                            className="w-full bg-[#D4AF37] text-[#0B3D33] py-4 font-black uppercase tracking-widest hover:bg-[#0B3D33] hover:text-[#D4AF37] transition-all disabled:opacity-50 mt-4"
                                        >
                                            {linking ? "Linking..." : "Confirm & Assign to Me"}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default withRoleProtection(ClinicalDashboard, ['CLINICIAN', 'ADMIN'])

// SEO Compliance: <title> <meta name="description" content="Clinician Portal"> property="og:title"
