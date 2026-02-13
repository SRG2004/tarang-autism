"use client"
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, Globe, Users, TrendingUp, AlertTriangle, Building2, MapPin } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { cn, API_URL } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

export default function IntelligenceDashboard() {
    const [prediction, setPrediction] = useState<any>(null)
    const [centers, setCenters] = useState<any[]>([])
    const { token, user } = useAuth()

    useEffect(() => {
        if (!token) return
        const headers = { 'Authorization': `Bearer ${token}` }

        fetch(`${API_URL}/analytics/prediction/${encodeURIComponent(user?.email || 'Patient')}`, { headers })
            .then(res => res.ok ? res.json() : null)
            .then(data => { if (data) setPrediction(data) })
            .catch(err => console.warn('Prediction fetch failed:', err))

        fetch(`${API_URL}/centers`, { headers })
            .then(res => res.ok ? res.json() : [])
            .then(data => setCenters(Array.isArray(data) ? data : []))
            .catch(err => console.warn('Centers fetch failed:', err))
    }, [token])

    const [chartData, setChartData] = useState<any[]>([])

    useEffect(() => {
        if (!prediction) return

        // Transform history and prediction into chart format
        const history = prediction.history || []
        const future = prediction.prediction?.predicted_scores || []

        const data = history.map((score: number, i: number) => ({
            name: `W${i + 1}`,
            actual: score
        }))

        future.forEach((score: number, i: number) => {
            data.push({
                name: `W${history.length + i + 1}`,
                pred: score
            })
        })

        setChartData(data)
    }, [prediction])

    return (
        <div className="min-h-screen bg-[#FDFCF8] pt-32 px-8 md:px-16 lg:px-24 pb-20">
            <motion.header
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-20"
            >
                <div className="flex items-center gap-4 mb-4">
                    <span className="px-3 py-1 bg-[#D4AF37] text-[#0B3D33] font-mono text-[10px] uppercase font-black tracking-widest">Global_Intelligence_V1</span>
                    <span className="text-[10px] font-mono uppercase tracking-widest opacity-40">Predictive_Modeling_Active</span>
                </div>
                <h1 className="text-8xl font-serif font-black tracking-tighter uppercase leading-none text-[#0B3D33]">
                    Inference <br /> <span className="text-[#D4AF37]">Engine</span>
                </h1>
            </motion.header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">

                {/* Predictive Analytics Pillar */}
                <div className="xl:col-span-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-2 p-12 bg-white border-2 border-[#0B3D33] relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8">
                                <TrendingUp className="w-12 h-12 text-[#D4AF37] opacity-20" />
                            </div>
                            <h3 className="text-3xl font-serif font-black uppercase tracking-tighter mb-10 flex items-center gap-4">
                                Predictive Outcome Modeling
                            </h3>

                            <div className="h-[400px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900 }} />
                                        <YAxis hide domain={[0, 100]} />
                                        <Tooltip contentStyle={{ borderRadius: 0, border: '2px solid #0B3D33' }} />
                                        <Line type="monotone" dataKey="actual" stroke="#0B3D33" strokeWidth={4} dot={{ r: 6, fill: "#0B3D33" }} />
                                        <Line type="monotone" dataKey="pred" stroke="#D4AF37" strokeWidth={4} strokeDasharray="10 10" dot={{ r: 6, fill: "#D4AF37" }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="space-y-10">
                            <div className="p-10 border-2 border-[#D4AF37] bg-white text-[#0B3D33]">
                                <h4 className="text-xs font-black uppercase tracking-widest mb-6 opacity-40">Outcome_Agent_Insight</h4>
                                <p className="text-2xl font-serif font-bold leading-tight mb-8">
                                    {prediction?.clinical_insight || "Analyzing longitudinal drift..."}
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-[2px] bg-[#D4AF37]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Confidence: {prediction?.prediction?.confidence_interval * 100}%</span>
                                </div>
                            </div>

                            <div className="p-10 border-2 border-[#0B3D33] bg-[#0B3D33] text-[#FDFCF8]">
                                <h4 className="text-xs font-black uppercase tracking-widest text-[#D4AF37] mb-6">Velocity_Matrix</h4>
                                <div className="flex items-end justify-between">
                                    <span className="text-4xl font-serif font-black">{prediction?.prediction?.trend || "..."}</span>
                                    <Activity className="w-10 h-10 text-[#D4AF37]" />
                                </div>
                                <p className="mt-6 text-[10px] font-mono opacity-40">Velocity: {prediction?.prediction?.velocity} | Inference_Delay: 142ms</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Global Multitenancy - Center Overview */}
                <div className="xl:col-span-12 mt-10">
                    <h2 className="text-5xl font-serif font-black tracking-tighter uppercase mb-12 flex items-center gap-6">
                        <Building2 className="w-10 h-10 text-[#D4AF37]" /> Center <span className="text-[#D4AF37]">Orchestrator</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                        {centers.map((c: any) => (
                            <motion.div
                                key={c.id}
                                whileHover={{ y: -10 }}
                                className="p-10 border-2 border-[#0B3D33] bg-white group cursor-pointer hover:bg-[#0B3D33] hover:text-[#FDFCF8] transition-all duration-500"
                            >
                                <MapPin className="w-8 h-8 text-[#D4AF37] mb-8" />
                                <h4 className="text-2xl font-serif font-bold mb-2">{c.name}</h4>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 group-hover:text-[#D4AF37] mb-8">{c.location}</p>
                                <div className="flex justify-between items-center border-t border-[#0B3D33]/10 pt-8 group-hover:border-white/10">
                                    <span className="text-sm font-bold">Active Patients</span>
                                    <span className="text-3xl font-serif font-black text-[#D4AF37]">{c.patients || "0"}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    )
}
