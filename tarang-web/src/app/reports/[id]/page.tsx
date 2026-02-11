"use client"
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Activity, Brain, Shield, Info, Download, ArrowLeft, ChevronRight, BarChart3, AlertTriangle } from 'lucide-react'
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'
import { cn, API_URL } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

export default function ReportDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const { token } = useAuth()
    const [report, setReport] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await fetch(`${API_URL}/reports/${id}/detail`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setReport(data)
                }
            } catch (e) {
                console.error("Failed to fetch report detail", e)
            } finally {
                setIsLoading(false)
            }
        }
        if (id && token) fetchReport()
    }, [id, token])

    if (isLoading) return (
        <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        </div>
    )

    if (!report) return <div>Report not found</div>

    // SHAP/Feature Importance Simulation from breakdown
    const radarData = Object.entries(report.breakdown || {}).map(([key, value]: [string, any]) => ({
        subject: key.split('_').join(' ').toUpperCase(),
        A: value * 100,
        fullMark: 100
    }))

    return (
        <div className="min-h-screen bg-[#FDFCF8] pt-32 px-8 md:px-16 lg:px-24 pb-20">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#0B3D33]/40 hover:text-[#0B3D33] mb-12 transition-all">
                <ArrowLeft className="w-4 h-4" /> Back_to_Archives
            </button>

            <motion.header
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-20"
            >
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <span className="px-3 py-1 bg-[#D4AF37]/20 text-[#D4AF37] font-mono text-[10px] uppercase font-black tracking-widest">XAI_DIAGNOSTIC_ANALYSIS</span>
                        <span className="text-[10px] font-mono uppercase tracking-widest opacity-40">Artifact: #{report.id}</span>
                    </div>
                    <h1 className="text-7xl font-serif font-black tracking-tighter uppercase leading-none">{report.patient_name}</h1>
                    <p className="text-xl font-light text-[#0B3D33]/60 mt-4 max-w-xl">Multimodal AI Behavioral Synthesis | {new Date(report.created_at).toLocaleDateString()}</p>
                </div>
                <button className="flex items-center gap-3 bg-[#0B3D33] text-[#D4AF37] px-8 py-5 font-black uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#0B3D33] transition-all duration-500">
                    <Download className="w-5 h-5" /> Export PDF
                </button>
            </motion.header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Core Metrics */}
                <div className="xl:col-span-4 space-y-10">
                    <div className="p-10 border-2 border-[#0B3D33] bg-[#0B3D33] text-[#FDFCF8] relative shadow-[10px_10px_0px_#D4AF37]">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 opacity-40">AI_CONFIDENCE_SCORING</p>
                        <div className="flex items-baseline gap-4">
                            <span className="text-8xl font-serif font-black tracking-tighter">{(report.risk_score * 100).toFixed(1)}%</span>
                            <span className="text-2xl font-serif font-bold text-[#D4AF37]">Risk</span>
                        </div>
                        <div className="mt-10 h-2 bg-white/10 w-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${report.confidence * 100}%` }}
                                className="h-full bg-[#D4AF37]"
                            />
                        </div>
                        <p className="mt-4 text-[10px] font-black uppercase tracking-widest opacity-40">
                            Agent Consistency: {(report.confidence * 100).toFixed(0)}%
                        </p>
                    </div>

                    <div className="p-10 border-2 border-[#0B3D33] bg-white">
                        <h3 className="text-2xl font-serif font-black uppercase tracking-tighter flex items-center gap-3 mb-8">
                            <Brain className="w-6 h-6 text-[#D4AF37]" /> Interpretative_Logic
                        </h3>
                        <p className="text-sm font-medium leading-relaxed opacity-70 italic mb-8">
                            "{report.interpretation}"
                        </p>
                        <div className="space-y-4">
                            <div className="p-4 bg-amber-50 border border-amber-200">
                                <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 flex items-center gap-2 mb-2">
                                    <AlertTriangle className="w-3 h-3" /> Dissonance_Detection
                                </p>
                                <p className="text-xs font-bold text-amber-900 leading-tight">
                                    {report.dissonance_factor > 0.3
                                        ? "High variance between visual and vocal markers detected. Manual review recommended."
                                        : "Markers show high multimodal alignment. Automated confidence is robust."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feature Importance visualization */}
                <div className="xl:col-span-8 space-y-10">
                    <div className="p-10 border-2 border-[#0B3D33] bg-white h-full">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-2xl font-serif font-black uppercase tracking-tighter flex items-center gap-3">
                                <BarChart3 className="w-6 h-6 text-[#D4AF37]" /> AI Feature Importance (SHAP)
                            </h3>
                            <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest opacity-40">
                                <span className="flex items-center gap-2"><div className="w-2 h-2 bg-[#D4AF37]" /> Weighted Impact</span>
                            </div>
                        </div>

                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                    <PolarGrid stroke="#0B3D33" strokeOpacity={0.1} />
                                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 900, fill: '#0B3D33' }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} hide />
                                    <Radar
                                        name="Variance"
                                        dataKey="A"
                                        stroke="#D4AF37"
                                        strokeWidth={3}
                                        fill="#D4AF37"
                                        fillOpacity={0.4}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="mt-10 border-t-2 border-[#0B3D33]/5 pt-10">
                            <h4 className="text-lg font-black uppercase tracking-tighter mb-6">Clinical Recommendations</h4>
                            <p className="text-sm font-medium leading-loose opacity-70">
                                {report.clinical_recommendation}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
