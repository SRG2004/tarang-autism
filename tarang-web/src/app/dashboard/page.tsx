"use client"
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, AlertCircle, Calendar, ChevronRight, Clock, Download, FileText, Globe, Loader2, Play, Plus, TrendingUp, User, ArrowUpRight } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { cn, API_URL } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
    const { token, user, isLoading: authLoading } = useAuth()
    const [dashboardData, setDashboardData] = useState<any>(null)
    const [appointments, setAppointments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState<number | null>(null)
    const [isScheduleOpen, setIsScheduleOpen] = useState(false)
    const [scheduleActivity, setScheduleActivity] = useState("")
    const [scheduleTime, setScheduleTime] = useState("")
    const [scheduling, setScheduling] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (!token) return
        const headers = { 'Authorization': `Bearer ${token}` }
        fetch(`${API_URL}/users/dashboard`, { headers })
            .then(res => res.ok ? res.json() : null)
            .then(data => { if (data) setDashboardData(data) })
            .catch(err => console.warn('Dashboard fetch failed:', err))
            .finally(() => setLoading(false))
    }, [token])

    const chartData = dashboardData?.chart_data || []
    const stabilityIndex = dashboardData?.latest_risk ? `${Number(dashboardData.latest_risk).toFixed(1)}%` : '—'
    const totalScreenings = dashboardData?.total_screenings ?? 0

    const stats = [
        { label: "Stability Index", val: stabilityIndex, trend: totalScreenings > 1 ? "Tracking" : "—", color: "#D4AF37" },
        { label: "Total Screenings", val: totalScreenings.toString(), trend: "Cumulative", color: "#0B3D33" },
        { label: "Status", val: totalScreenings > 0 ? "Active" : "New", trend: totalScreenings > 0 ? "Monitored" : "—", color: "#0B3D33" },
    ]

    const submitSchedule = async () => {
        if (!scheduleTime || !dashboardData?.primary_patient_id) {
            alert("Please select a time (and ensure user profile is complete)")
            return
        }
        setScheduling(true)
        try {
            const start = new Date(scheduleTime)
            const end = new Date(start.getTime() + 60 * 60 * 1000) // 1 hour duration

            const res = await fetch(`${API_URL}/appointments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    patient_id: dashboardData.primary_patient_id,
                    start_time: start.toISOString(),
                    end_time: end.toISOString(),
                    notes: `Requested for: ${scheduleActivity}`
                })
            })

            if (res.ok) {
                alert("Session requested successfully! Your clinician will confirm shortly.")
                setIsScheduleOpen(false)
            } else {
                const err = await res.json()
                alert(`Scheduling failed: ${err.detail || 'Unknown error'}`)
            }
        } catch (e) {
            console.error(e)
            alert("Connection error")
        } finally {
            setScheduling(false)
        }
    }

    if (authLoading || !user) {
        return (
            <div className="min-h-screen bg-[#FDFCF8] pt-32 px-8 md:px-16 lg:px-24 pb-20 flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#0B3D33]" />
            </div>
        )
    }

    const handleDownload = async (reportId: number, filename: string) => {
        if (downloading) return
        setDownloading(reportId)
        try {
            const res = await fetch(`${API_URL}/reports/${reportId}/download`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const blob = await res.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `TARANG_REPORT_${filename}_${reportId}.pdf`
                document.body.appendChild(a)
                a.click()
                a.remove()
            } else {
                alert("Report download failed. Please try again.")
            }
        } catch (e) {
            console.error(e)
            alert("Error downloading report")
        } finally {
            setDownloading(null)
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
                        <span className="px-3 py-1 bg-[#D4AF37]/20 text-[#D4AF37] font-mono text-[10px] uppercase font-black tracking-widest">Active_Care_Continuum</span>
                        <span className="text-[10px] font-mono uppercase tracking-widest opacity-40">Profile_ID: #TAR_9001</span>
                    </div>
                    <h1 className="text-7xl font-serif font-black tracking-tighter uppercase leading-none">{user?.full_name || "Patient"}</h1>
                    <p className="text-xl font-light text-[#0B3D33]/60 mt-4 max-w-xl">Early Behavioral Intervention | Stage 2 Recovery</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => router.push('/screening')}
                        className="group flex items-center gap-3 bg-[#0B3D33] text-[#D4AF37] px-8 py-5 font-black uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#0B3D33] transition-all duration-500"
                    >
                        <Plus className="w-5 h-5" /> New Screening
                    </button>
                </div>
            </motion.header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">

                {/* Progress System - Left Pillar */}
                <div className="xl:col-span-8 space-y-10">

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border-2 border-[#0B3D33]">
                        {stats.map((stat, i) => (
                            <div key={i} className={cn(
                                "p-10 relative overflow-hidden group border-[#0B3D33]",
                                i !== 2 ? "sm:border-r-2" : ""
                            )}>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 opacity-40">{stat.label}</p>
                                <div className="flex items-end justify-between">
                                    <span className="text-5xl font-serif font-black tracking-tighter" style={{ color: i === 0 ? stat.color : 'inherit' }}>{stat.val}</span>
                                    <div className="flex flex-col items-end">
                                        <ArrowUpRight className="w-5 h-5 text-[#D4AF37] mb-1" />
                                        <span className="text-[10px] font-black">{stat.trend}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="p-12 bg-white border-2 border-[#0B3D33] relative"
                    >
                        <div className="flex justify-between items-center mb-16">
                            <h3 className="text-2xl font-serif font-black uppercase tracking-tighter flex items-center gap-3">
                                <Activity className="w-6 h-6 text-[#D4AF37]" /> Interaction Variance Analysis
                            </h3>
                            <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest opacity-40">
                                <span className="flex items-center gap-2"><span className="w-2 h-2 bg-[#D4AF37] inline-block" /> Observation</span>
                                <span className="flex items-center gap-2"><span className="w-2 h-2 border border-[#0B3D33] inline-block" /> Target</span>
                            </div>
                        </div>

                        <div className="h-[350px] w-full">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fontWeight: 900, fill: '#0B3D33', opacity: 0.4 }}
                                            dy={20}
                                        />
                                        <YAxis hide domain={[0, 100]} />
                                        <Tooltip
                                            cursor={{ stroke: '#0B3D33', strokeWidth: 1, strokeDasharray: '4 4' }}
                                            contentStyle={{ borderRadius: 0, border: '2px solid #0B3D33', backgroundColor: '#FDFCF8', fontWeight: 900, fontSize: 12 }}
                                        />
                                        <Area type="monotone" dataKey="score" stroke="#D4AF37" strokeWidth={5} fillOpacity={1} fill="url(#colorScore)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-[#0B3D33]/30 font-black uppercase tracking-widest text-sm">
                                    No screening data yet — complete your first screening to see trends
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Clinical Alerts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div className="p-8 border-2 border-[#D4AF37] bg-white relative">
                            {dashboardData?.latest_recommendation ? (
                                <>
                                    <div className="absolute top-0 right-0 bg-[#D4AF37] px-3 py-1 text-[10px] font-black text-[#0B3D33] uppercase">Clinical_Insight</div>
                                    <h4 className="flex items-center gap-3 text-lg font-black uppercase tracking-tight mb-4">
                                        <AlertCircle className="w-5 h-5 text-[#D4AF37]" /> Agent Feedback
                                    </h4>
                                    <p className="text-sm font-medium leading-relaxed mb-6 opacity-70">
                                        {dashboardData.latest_recommendation}
                                    </p>
                                    <button className="text-[10px] font-black uppercase tracking-[0.2em] border-b-2 border-[#D4AF37] pb-1 hover:opacity-50 transition-all">Review_Clinical_Proof</button>
                                </>
                            ) : (
                                <>
                                    <h4 className="flex items-center gap-3 text-lg font-black uppercase tracking-tight mb-4">
                                        <AlertCircle className="w-5 h-5 text-[#D4AF37]" /> Agent Feedback
                                    </h4>
                                    <p className="text-sm font-medium leading-relaxed opacity-40">
                                        No clinical insights yet — complete a screening to receive AI recommendations.
                                    </p>
                                </>
                            )}
                        </div>

                        <div className="p-8 border-2 border-[#0B3D33] bg-white">
                            <h4 className="flex items-center gap-3 text-lg font-black uppercase tracking-tight mb-4 text-[#0B3D33]">
                                <Download className="w-5 h-5 text-[#D4AF37]" /> Document Hub
                            </h4>
                            <div className="space-y-4">
                                {(dashboardData?.recent_reports || []).length > 0 ? (
                                    dashboardData.recent_reports.map((doc: any) => (
                                        <div
                                            key={doc.id}
                                            onClick={() => handleDownload(doc.id, doc.name)}
                                            className="flex justify-between items-center group cursor-pointer"
                                        >
                                            <span className="text-sm font-bold opacity-60 group-hover:opacity-100 group-hover:text-[#D4AF37] transition-all">{doc.name}</span>
                                            {downloading === doc.id ? (
                                                <Loader2 className="w-4 h-4 text-[#D4AF37] animate-spin" />
                                            ) : (
                                                <Download className="w-4 h-4 opacity-20 group-hover:opacity-100" />
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm opacity-40">No documents generated yet</p>
                                )}
                            </div>
                        </div>

                        {/* Care Team Section */}
                        <div className="p-8 border-2 border-[#0B3D33] bg-white">
                            <h4 className="flex items-center gap-3 text-lg font-black uppercase tracking-tight mb-4 text-[#0B3D33]">
                                <User className="w-5 h-5 text-[#D4AF37]" /> Care Team
                            </h4>
                            {dashboardData?.care_team && dashboardData.care_team.length > 0 ? (
                                dashboardData.care_team.map((doc: any) => (
                                    <div key={doc.id} className="flex items-center gap-4 mb-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                                        <div className="w-10 h-10 bg-[#0B3D33] rounded-full flex items-center justify-center text-[#D4AF37] font-black shrink-0">
                                            {doc.name[0]}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-[#0B3D33]">{doc.name}</div>
                                            <div className="text-[10px] opacity-60 uppercase tracking-wider font-medium">{doc.role}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm opacity-40 italic">No clinicians assigned yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Temporal Pillar - Right Axis */}
                <div className="xl:col-span-4 space-y-10">

                    <div className="p-10 border-2 border-[#0B3D33] bg-[#0B3D33] text-[#FDFCF8] relative shadow-[10px_10px_0px_#D4AF37]">
                        <h3 className="text-2xl font-serif font-black uppercase tracking-tighter mb-10 flex items-center gap-3">
                            <Calendar className="w-6 h-6 text-[#D4AF37]" /> Interaction Timeline
                        </h3>
                        <div className="space-y-10 relative">
                            {/* Visual Timeline Path */}
                            <div className="absolute left-[23px] top-2 bottom-0 w-[1px] bg-[#FDFCF8]/10" />

                            {appointments.length > 0 ? (
                                appointments.slice(0, 5).map((app: any, i: number) => {
                                    const timeStr = new Date(app.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
                                    const title = app.notes?.replace("Requested for: ", "") || "Therapy Session"
                                    const statusMap: any = { requested: "Pending", confirmed: "Upcoming", completed: "Done", cancelled: "Void" }
                                    const statusLabel = statusMap[app.status] || app.status
                                    const isDone = app.status === 'completed'

                                    return (
                                        <div key={i} className="flex gap-8 group cursor-pointer relative z-10" onClick={() => {
                                            setScheduleActivity(title)
                                            setIsScheduleOpen(true)
                                        }}>
                                            <div className={cn(
                                                "w-12 h-12 flex items-center justify-center font-black text-[10px] shrink-0 border transition-all",
                                                isDone ? "bg-[#D4AF37] border-[#D4AF37] text-[#0B3D33]" : "border-white/20 group-hover:border-[#D4AF37] group-hover:text-[#D4AF37]"
                                            )}>
                                                {timeStr}
                                            </div>
                                            <div className="flex-1 py-1">
                                                <p className="text-[9px] font-mono tracking-[0.2em] opacity-40 uppercase mb-1">{statusLabel}</p>
                                                <div className="flex justify-between items-center border-b border-white/10 pb-4 group-hover:border-[#D4AF37] transition-all">
                                                    <h4 className="font-bold text-lg leading-none">{title}</h4>
                                                    <Play className="w-8 h-8 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-[#D4AF37] fill-[#D4AF37]" />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="text-center opacity-40 py-10">
                                    <p className="text-xs font-black uppercase tracking-widest mb-4">No recent activity</p>
                                    <button onClick={() => setIsScheduleOpen(true)} className="border border-[#D4AF37] px-4 py-2 text-[10px] uppercase font-bold text-[#D4AF37]">Schedule First Session</button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-10 border-2 border-[#0B3D33] bg-white">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-2xl font-serif font-black uppercase tracking-tighter flex items-center gap-3">
                                <Clock className="w-6 h-6 text-[#D4AF37]" /> Skill_Labs
                            </h3>
                            <Plus className="w-5 h-5 opacity-40" />
                        </div>
                        <div className="space-y-6">
                            {(dashboardData?.therapy_activities || []).length > 0 ? (
                                dashboardData.therapy_activities.map((act: any) => (
                                    <div key={act.title} className="p-6 border-2 border-[#FDFCF8] hover:border-[#0B3D33] transition-all group cursor-pointer bg-[#FDFCF8]">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-[10px] font-black font-mono uppercase tracking-widest text-[#D4AF37]">{act.diff}_Protocol</span>
                                            <span className="text-[10px] font-black opacity-30">{act.duration}</span>
                                        </div>
                                        <span className="text-xl font-serif font-bold tracking-tight text-[#0B3D33]">{act.title}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm opacity-40 text-center py-6">Complete a screening to unlock personalized skill protocols</p>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
