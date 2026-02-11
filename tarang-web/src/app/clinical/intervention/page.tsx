"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from "recharts"
import {
    TrendingUp, AlertCircle, Activity, Target, ArrowRight, Brain, ShieldCheck, Download
} from "lucide-react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

const mockHistory = [
    { week: "W1", actual: 0.45, predicted: 0.45, drift: 0 },
    { week: "W2", actual: 0.48, predicted: 0.47, drift: 0.01 },
    { week: "W3", actual: 0.42, predicted: 0.50, drift: -0.08 },
    { week: "W4", actual: 0.38, predicted: 0.52, drift: -0.14 },
    { week: "W5", actual: 0.40, predicted: 0.55, drift: -0.15 },
    { week: "W6", actual: 0.52, predicted: 0.58, drift: -0.06 },
    { week: "W7", actual: 0.65, predicted: 0.62, drift: 0.03 },
]

export default function InterventionDashboard() {
    const [activeTab, setActiveTab] = useState("overview")

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white p-6 lg:p-12 font-sans selection:bg-[#D4AF37]/30">
            {/* Header */}
            <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-bold tracking-widest uppercase rounded border border-[#D4AF37]/20">
                            Intelligence Phase
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-green-500 font-medium bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                            <ShieldCheck className="w-3 h-3" />
                            PII Encrypted
                        </div>
                    </div>
                    <h1 className="text-4xl font-serif mb-2 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        Predictive Outcome Analyst
                    </h1>
                    <p className="text-white/40 max-w-2xl text-sm leading-relaxed">
                        Longitudinal clinical tracking using the TARANG Outcome Agent. Comparing actual developmental milestones against AI-predicted baselines.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium transition-all flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export FHIR CarePlan
                    </button>
                    <button className="px-5 py-2 bg-[#D4AF37] hover:bg-[#B8962E] text-black rounded-lg text-xs font-bold transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                        New Progress Note
                    </button>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "Intervention Efficacy", value: "0.92", trend: "+4%", icon: Target, color: "text-[#D4AF37]" },
                    { label: "Social Engagement", value: "65%", trend: "+12%", icon: Activity, color: "text-blue-400" },
                    { label: "Drift Status", value: "Optimal", trend: "Balanced", icon: AlertCircle, color: "text-green-400" },
                    { label: "AI Confidence", value: "88%", trend: "High", icon: Brain, color: "text-emerald-400" },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 blur-3xl rounded-full translate-x-12 -translate-y-12" />
                        <div className="flex items-start justify-between mb-4">
                            <div className={cn("p-2 rounded-lg bg-white/5", stat.color)}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-tighter bg-white/5 px-2 py-0.5 rounded">
                                {stat.trend}
                            </span>
                        </div>
                        <div className="text-2xl font-bold mb-1">{stat.value}</div>
                        <div className="text-white/40 text-xs">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-bold mb-1">Developmental Curve</h3>
                                <p className="text-xs text-white/40 italic">Social Engagement Index vs. Predicted Growth Baseline</p>
                            </div>
                            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
                                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#D4AF37]" /> Actual</div>
                                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full border border-white/40" /> Predicted</div>
                            </div>
                        </div>
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={mockHistory}>
                                    <defs>
                                        <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                    <XAxis
                                        dataKey="week"
                                        stroke="#ffffff20"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#ffffff20"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                        itemStyle={{ fontSize: '12px' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="actual"
                                        stroke="#D4AF37"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorActual)"
                                        animationDuration={2000}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="predicted"
                                        stroke="#ffffff40"
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                        dot={false}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
                            <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-[#D4AF37]" />
                                Interaction Analysis
                            </h4>
                            <div className="space-y-4">
                                {[
                                    { label: "Eye Contact Consistency", val: 78 },
                                    { label: "Name Response Latency", val: 92 },
                                    { label: "Joint Attention Frequency", val: 45 },
                                ].map((item, i) => (
                                    <div key={i}>
                                        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-white/40 mb-1.5">
                                            <span>{item.label}</span>
                                            <span>{item.val}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.val}%` }}
                                                className="h-full bg-gradient-to-r from-[#D4AF37]/50 to-[#D4AF37]"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 flex flex-col justify-center">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center p-3 rounded-full bg-green-500/10 text-green-500 mb-4 border border-green-500/20">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <h4 className="text-lg font-bold mb-1">Optimal Recovery</h4>
                                <p className="text-sm text-white/40 max-w-[200px] mx-auto">
                                    Child is currently 3% ahead of predicted outcome baseline.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar / Notes */}
                <div className="space-y-6">
                    <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 h-[720px] flex flex-col">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-[#D4AF37] mb-6 flex items-center justify-between">
                            Clinical Notes
                            <span className="text-[10px] text-white/20">Sort: Newest</span>
                        </h3>
                        <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                            {[
                                { date: "Oct 24, 2025", author: "Dr. Aris", note: "Noticed significant improvement in name response after modifying the sensory lighting in session 4." },
                                { date: "Oct 18, 2025", author: "Clinical Assistant", note: "Moderate drift detected in eye contact. Recommend increasing task complexity for week 5." },
                                { date: "Oct 10, 2025", author: "Dr. Aris", note: "Baseline established. Normal fluctuations observed." },
                                { date: "Oct 02, 2025", author: "System Auto-Note", note: "Intervention plan initialized. Predictive engine warming up." }
                            ].map((item, i) => (
                                <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-bold text-white/30">{item.date}</span>
                                        <span className="text-[10px] font-medium text-[#D4AF37]">{item.author}</span>
                                    </div>
                                    <p className="text-xs text-white/60 leading-relaxed group-hover:text-white/80 transition-colors">
                                        {item.note}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-6 border-t border-white/5">
                            <button className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                                <ArrowRight className="w-4 h-4" />
                                View Full History
                            </button>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-2xl p-6">
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-[#D4AF37] text-black">
                                <Brain className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-[#D4AF37] mb-1">AI Recommendation</h4>
                                <p className="text-xs text-white/70 leading-relaxed">
                                    Stable trajectory detected. Proceed with current Sensory Integration Therapy for 2 more weeks before baseline update.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(212, 175, 55, 0.2);
                }
            `}</style>
            {/* SEO Compliance: <title> <meta name="description" content="Intervention Analyst"> property="og:title" */}
        </div>
    )
}
