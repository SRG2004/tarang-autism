"use client"
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Filter, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn, API_URL } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

export default function ReportsPage() {
    const router = useRouter()
    const { token, user } = useAuth()
    const [downloading, setDownloading] = useState<number | null>(null)
    const [reports, setReports] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!token) return
        fetch(`${API_URL}/reports`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.ok ? res.json() : [])
            .then(data => setReports(Array.isArray(data) ? data : []))
            .catch(err => console.warn('Reports fetch failed:', err))
            .finally(() => setLoading(false))
    }, [token])

    const handleDownload = async (id: number) => {
        setDownloading(id)
        try {
            const response = await fetch(`${API_URL}/reports/${id}/download`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `tarang_report_${id}.pdf`
                document.body.appendChild(a)
                a.click()
                a.remove()
            }
        } catch (e) {
            console.error("PDF Download failed", e)
        } finally {
            setDownloading(null)
        }
    }

    return (
        <div className="min-h-screen bg-[#FDFCF8] pt-32 px-8 md:px-16 lg:px-24 pb-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto"
            >
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-20">
                    <div>
                        <h1 className="text-7xl font-serif font-black tracking-tighter uppercase leading-none mb-4">Archives</h1>
                        <p className="text-xl font-light text-[#0B3D33]/60">Secure repository of clinical behavioral summaries.</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="flex items-center gap-3 px-8 py-4 border-2 border-[#0B3D33] font-black uppercase tracking-widest text-[10px] hover:bg-[#0B3D33] hover:text-white transition-all">
                            <Filter className="w-4 h-4" /> Filter_Results
                        </button>
                    </div>
                </div>

                <div className="border-2 border-[#0B3D33] bg-white overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 p-6 border-b-2 border-[#0B3D33] bg-[#0B3D33] text-[#D4AF37] font-black uppercase text-[10px] tracking-widest">
                        <div className="col-span-2">Report_ID</div>
                        <div className="col-span-2">Timestamp</div>
                        <div className="col-span-3">Modality_Type</div>
                        <div className="col-span-2">Risk_Score</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-1"></div>
                    </div>

                    <div className="divide-y-2 divide-[#0B3D33]/10">
                        {loading ? (
                            <div className="flex justify-center py-16">
                                <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : reports.length === 0 ? (
                            <div className="py-16 text-center text-[#0B3D33]/30 font-black uppercase tracking-widest text-sm">
                                No reports yet — complete a screening to generate your first report
                            </div>
                        ) : (
                            reports.map((report, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ backgroundColor: "#FDFCF8" }}
                                    onClick={() => router.push(`/reports/${report.id}`)}
                                    className="grid grid-cols-12 gap-4 p-8 items-center group cursor-pointer"
                                >
                                    <div className="col-span-2 font-mono text-xs font-bold">{report.sid}</div>
                                    <div className="col-span-2 text-sm font-medium opacity-60">{report.date}</div>
                                    <div className="col-span-3">
                                        <p className="font-bold text-[#0B3D33]">{report.type}</p>
                                        <p className="text-[10px] opacity-40 uppercase font-black">Agentic_Synthesis_V1</p>
                                    </div>
                                    <div className="col-span-2 font-serif text-2xl font-black text-[#D4AF37]">{report.risk}</div>
                                    <div className="col-span-2">
                                        <span className={cn(
                                            "px-3 py-1 text-[9px] font-black uppercase tracking-widest",
                                            report.status === 'Available' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                                        )}>{report.status}</span>
                                    </div>
                                    <div className="col-span-1 flex justify-end gap-4">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDownload(report.id)
                                            }}
                                            className="p-2 hover:bg-[#D4AF37]/10 transition-all rounded-full"
                                        >
                                            {downloading === report.id ? (
                                                <div className="w-5 h-5 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Download className="w-5 h-5 text-[#D4AF37]" />
                                            )}
                                        </button>
                                        <ChevronRight className="w-5 h-5 opacity-20 group-hover:opacity-100 transition-opacity text-[#0B3D33]" />
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                <div className="mt-20 p-12 bg-[#0B3D33] text-[#FDFCF8] flex flex-col lg:flex-row items-center justify-between gap-10">
                    <div className="flex gap-6 items-center">
                        <div className="w-16 h-16 bg-[#D4AF37] flex items-center justify-center">
                            <FileText className="w-8 h-8 text-[#0B3D33]" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-serif font-black tracking-tighter uppercase mb-1">Merge Reports</h3>
                            <p className="opacity-60 font-medium">Create a unified longitudinal view for clinical stakeholders.</p>
                        </div>
                    </div>
                    <button className="bg-[#D4AF37] text-[#0B3D33] px-10 py-5 font-black uppercase tracking-widest hover:bg-[#FDFCF8] transition-all">
                        Initialize Synthesis
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
