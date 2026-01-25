"use client"
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, Calendar, Clock, User, ArrowUpRight, Plus, Download, ChevronRight, AlertCircle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { cn } from '@/lib/utils'

const data = [
    { name: 'W1', score: 38 },
    { name: 'W2', score: 42 },
    { name: 'W3', score: 35 },
    { name: 'W4', score: 55 },
    { name: 'W5', score: 62 },
    { name: 'W6', score: 71 },
]

export default function Dashboard() {
    const [scheduling, setScheduling] = useState<string | null>(null)

    const handleSchedule = async (title: string) => {
        setScheduling(title)
        try {
            const response = await fetch('http://localhost:8000/appointments/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patient_id: "TAR_9001",
                    specialist_id: "SPEC_01",
                    timeslot: "Monday 10:00 AM"
                })
            })
            if (response.ok) {
                alert(`Successfully scheduled session for: ${title}`)
            }
        } catch (e) {
            console.error("Scheduling failed", e)
        } finally {
            setScheduling(null)
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
                    <h1 className="text-7xl font-serif font-black tracking-tighter uppercase leading-none">Arvid Smith</h1>
                    <p className="text-xl font-light text-[#0B3D33]/60 mt-4 max-w-xl">Early Behavioral Intervention | Stage 2 Recovery</p>
                </div>
                <div className="flex gap-4">
                    <button className="group flex items-center gap-3 bg-[#0B3D33] text-[#D4AF37] px-8 py-5 font-black uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#0B3D33] transition-all duration-500">
                        <Plus className="w-5 h-5" /> New Screening
                    </button>
                </div>
            </motion.header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">

                {/* Progress System - Left Pillar */}
                <div className="xl:col-span-8 space-y-10">

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border-2 border-[#0B3D33]">
                        {[
                            { label: "Stability Index", val: "72.4%", trend: "+2.1%", color: "#D4AF37" },
                            { label: "Gaze Velocity", val: "Lo-Fi", trend: "Steady", color: "#0B3D33" },
                            { label: "Engagement", val: "Strong", trend: "Rising", color: "#0B3D33" },
                        ].map((stat, i) => (
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
                                <span className="flex items-center gap-2"><div className="w-2 h-2 bg-[#D4AF37]" /> Observation</span>
                                <span className="flex items-center gap-2"><div className="w-2 h-2 border border-[#0B3D33]" /> Target</span>
                            </div>
                        </div>

                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
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
                        </div>
                    </motion.div>

                    {/* Clinical Alerts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div className="p-8 border-2 border-[#D4AF37] bg-white relative">
                            <div className="absolute top-0 right-0 bg-[#D4AF37] px-3 py-1 text-[10px] font-black text-[#0B3D33] uppercase">Urgent_Notice</div>
                            <h4 className="flex items-center gap-3 text-lg font-black uppercase tracking-tight mb-4">
                                <AlertCircle className="w-5 h-5 text-[#D4AF37]" /> Agent Feedback
                            </h4>
                            <p className="text-sm font-medium leading-relaxed mb-6 opacity-70">
                                The **Clinical Support Agent** has detected a 12% improvement in joint-attention cues over the last 48 hours. Recommend escalating stage-2 social drills.
                            </p>
                            <button className="text-[10px] font-black uppercase tracking-[0.2em] border-b-2 border-[#D4AF37] pb-1 hover:opacity-50 transition-all">Review_Clinical_Proof</button>
                        </div>

                        <div className="p-8 border-2 border-[#0B3D33] bg-white">
                            <h4 className="flex items-center gap-3 text-lg font-black uppercase tracking-tight mb-4 text-[#0B3D33]">
                                <Download className="w-5 h-5 text-[#D4AF37]" /> Document Hub
                            </h4>
                            <div className="space-y-4">
                                {["Jan_Scoring_Report.pdf", "Therapy_Plan_V2.pdf"].map(doc => (
                                    <div key={doc} className="flex justify-between items-center group cursor-pointer">
                                        <span className="text-sm font-bold opacity-60 group-hover:opacity-100 group-hover:text-[#D4AF37] transition-all">{doc}</span>
                                        <Download className="w-4 h-4 opacity-20 group-hover:opacity-100" />
                                    </div>
                                ))}
                            </div>
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

                            {[
                                { time: "09:00", title: "Speech Enhancement", status: "Done", color: "#D4AF37" },
                                { time: "11:30", title: "Occupational Drill", status: "Upcoming", color: "#FDFCF8" },
                                { time: "15:00", title: "AI Gaze Review", status: "Wait", color: "#FDFCF8" },
                                { time: "18:00", title: "Parent Consultation", status: "Wait", color: "#FDFCF8" },
                            ].map((ev, i) => (
                                <div key={i} className="flex gap-8 group cursor-pointer relative z-10" onClick={() => handleSchedule(ev.title)}>
                                    <div className={cn(
                                        "w-12 h-12 flex items-center justify-center font-black text-[10px] shrink-0 border transition-all",
                                        ev.status === "Done" ? "bg-[#D4AF37] border-[#D4AF37] text-[#0B3D33]" : "border-white/20 group-hover:border-[#D4AF37] group-hover:text-[#D4AF37]"
                                    )}>
                                        {scheduling === ev.title ? "..." : ev.time.split(':')[0]}
                                    </div>
                                    <div className="flex-1 py-1">
                                        <p className="text-[9px] font-mono tracking-[0.2em] opacity-40 uppercase mb-1">{ev.status}</p>
                                        <p className="text-lg font-serif font-bold group-hover:text-[#D4AF37] transition-colors">{ev.title}</p>
                                        <ChevronRight className="w-4 h-4 mt-2 opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all text-[#D4AF37]" />
                                    </div>
                                </div>
                            ))}
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
                            {[
                                { title: "Joint Attention Drift", duration: "15m", diff: "L2" },
                                { title: "Sensory Processing", duration: "40m", diff: "L3" },
                                { title: "Visual Narrative", duration: "25m", diff: "L1" },
                            ].map(act => (
                                <div key={act.title} className="p-6 border-2 border-[#FDFCF8] hover:border-[#0B3D33] transition-all group group cursor-pointer bg-[#FDFCF8]">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-[10px] font-black font-mono uppercase tracking-widest text-[#D4AF37]">{act.diff}_Protocol</span>
                                        <span className="text-[10px] font-black opacity-30">{act.duration}</span>
                                    </div>
                                    <span className="text-xl font-serif font-bold tracking-tight text-[#0B3D33]">{act.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
