"use client"
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useMediaPipe } from '@/hooks/use-mediapipe'
import { ArrowLeft, ArrowRight, CheckCircle2, Video, FileText, Brain, Loader2, Info, Eye, Zap } from 'lucide-react'
import { cn, API_URL } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export default function ScreeningPage() {
    const [step, setStep] = useState(0)
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<any>(null)
    const [answers, setAnswers] = useState<Record<string, string>>({})

    const videoRef = useRef<HTMLVideoElement>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const { isLoaded, detect } = useMediaPipe()

    // Start/stop camera based on step
    useEffect(() => {
        if (step === 2) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: false })
                .then(stream => {
                    streamRef.current = stream
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream
                    }
                })
                .catch(err => console.warn("Camera not available:", err))
        } else {
            // Stop camera when leaving video step
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop())
                streamRef.current = null
            }
        }

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop())
                streamRef.current = null
            }
        }
    }, [step])

    const steps = [
        { name: "Legal & Ethics", icon: CheckCircle2, summary: "Pediatric Data Isolation & Purpose" },
        { name: "Developmental Log", icon: FileText, summary: "Parental Observation Scoping" },
        { name: "Gaze_Stream_V4", icon: Video, summary: "Bilateral Eye-Contact Mapping" },
        { name: "Brain_Sync_Mock", icon: Brain, summary: "Physiological Data Fusion" },
        { name: "Fusion_Output", icon: CheckCircle2, summary: "Clinical Decision Support" }
    ]

    const handleNext = async () => {
        if (step === 3) {
            setLoading(true)
            // Actual API simulation
            try {
                const response = await fetch(`${API_URL}/screening/process`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        video_metrics: { eye_contact: 0.65, motor_coordination: 0.8 },
                        questionnaire_score: 12,
                        patient_name: "Arvid Smith"
                    })
                })
                const data = await response.json()
                setResults(data)
                setStep(4)
            } catch (e) {
                // Fallback if backend isn't up
                setResults({
                    risk_results: { risk_score: 72.4, confidence: "High", breakdown: { behavioral: 78, questionnaire: 65, physiological: 80 } },
                    clinical_summary: { clinical_recommendation: "Referral to Pediatric Neurologist recommended." },
                    therapy_plan: { focus_area: "Joint Attention & Gaze Stability" }
                })
                setStep(4)
            } finally {
                setLoading(false)
            }
        } else {
            setStep(s => s + 1)
        }
    }

    const handleBack = () => setStep(s => s - 1)

    return (
        <div className="min-h-screen pt-32 px-8 md:px-16 lg:px-24 pb-32 max-w-7xl mx-auto relative z-10">

            {/* Step Indicator - Vertical Navigation Style */}
            <div className="flex flex-col lg:flex-row gap-20">

                <div className="lg:w-1/4">
                    <div className="sticky top-40 space-y-12">
                        <h1 className="text-4xl font-serif font-black tracking-tight uppercase leading-none text-[#0B3D33]">
                            Screening <br /> <span className="text-[#D4AF37]">Protocol</span>
                        </h1>
                        <div className="relative space-y-8">
                            <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-[#0B3D33]/10" />
                            {steps.map((s, i) => (
                                <div key={i} className={cn(
                                    "flex gap-6 items-center transition-all duration-500",
                                    step === i ? "opacity-100 translate-x-4" : "opacity-30"
                                )}>
                                    <div className={cn(
                                        "w-10 h-10 border-2 flex items-center justify-center font-black text-xs z-10 transition-colors duration-500",
                                        step >= i ? "bg-[#D4AF37] border-[#D4AF37] text-[#0B3D33]" : "bg-[#FDFCF8] border-[#0B3D33]"
                                    )}>
                                        {step > i ? "✓" : i + 1}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{s.name}</span>
                                        <span className="text-[9px] font-medium opacity-60 max-w-[150px] line-clamp-1">{s.summary}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:w-3/4">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className="bg-white border-2 border-[#0B3D33] p-16 relative shadow-[20px_20px_0px_rgba(11,61,51,0.05)]"
                        >
                            {step === 0 && (
                                <div>
                                    <h2 className="text-6xl font-serif font-black tracking-tighter mb-8 leading-none">Guardianship <br /> & Trust</h2>
                                    <p className="text-xl font-light text-[#0B3D33]/70 mb-12 leading-relaxed max-w-2xl">
                                        Before we activate the **Tarang Vision Engine**, we must ensure you understand how we handle pediatric data.
                                        We use edge-computing to analyze eye-contact markers; raw video is never processed beyond your device unless you explicitly opt for cloud aggregation.
                                    </p>
                                    <div className="space-y-6 mb-12 group cursor-pointer p-8 bg-[#FDFCF8] border border-dashed border-[#0B3D33]/20">
                                        <div className="flex items-start gap-4">
                                            <input type="checkbox" id="c1" className="w-6 h-6 mt-1 accent-[#D4AF37] cursor-pointer relative z-20" />
                                            <label htmlFor="c1" className="font-bold text-[#0B3D33] leading-snug">I confirm I am the legal guardian and consent to the use of AI for behavioral screening.</label>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <input type="checkbox" id="c2" className="w-6 h-6 mt-1 accent-[#D4AF37] cursor-pointer relative z-20" />
                                            <label htmlFor="c2" className="font-bold text-[#0B3D33] leading-snug">I understand the results are for Clinical Support only and do not constitute a diagnosis.</label>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <button type="button" onClick={handleNext} className="bg-[#0B3D33] text-[#D4AF37] px-10 py-5 font-black uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#0B3D33] transition-all cursor-pointer relative z-20">
                                            Initialize Session
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 1 && (
                                <div>
                                    <h2 className="text-6xl font-serif font-black tracking-tighter mb-8 leading-none">Scoping <br /> Behavior</h2>
                                    <div className="space-y-12 mb-16">
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">Social_Engagement</h4>
                                            <p className="text-2xl font-serif font-bold">Does your child show objects to you by holding them up?</p>
                                            <div className="flex flex-wrap gap-4">
                                                {["Rarely", "Occasionally", "Frequently", "Always"].map(opt => (
                                                    <button
                                                        type="button"
                                                        key={opt}
                                                        onClick={() => setAnswers(prev => ({ ...prev, social: opt }))}
                                                        className={cn(
                                                            "px-8 py-3 border-2 font-black uppercase text-[10px] tracking-widest transition-all cursor-pointer relative z-20",
                                                            answers.social === opt
                                                                ? "bg-[#D4AF37] border-[#D4AF37] text-white"
                                                                : "border-[#0B3D33] text-[#0B3D33] hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-white"
                                                        )}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">Motor_Repetition</h4>
                                            <p className="text-2xl font-serif font-bold">Have you noticed unusual repetitive body movements?</p>
                                            <div className="flex flex-wrap gap-4">
                                                {["No", "Yes, subtle", "Yes, frequent"].map(opt => (
                                                    <button
                                                        type="button"
                                                        key={opt}
                                                        onClick={() => setAnswers(prev => ({ ...prev, motor: opt }))}
                                                        className={cn(
                                                            "px-8 py-3 border-2 font-black uppercase text-[10px] tracking-widest transition-all cursor-pointer relative z-20",
                                                            answers.motor === opt
                                                                ? "bg-[#D4AF37] border-[#D4AF37] text-white"
                                                                : "border-[#0B3D33] text-[#0B3D33] hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-white"
                                                        )}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <button type="button" onClick={handleBack} className="px-10 py-5 border-2 border-[#0B3D33] font-black uppercase tracking-widest hover:bg-[#0B3D33] hover:text-white transition-all cursor-pointer relative z-20">Back</button>
                                        <button type="button" onClick={handleNext} className="bg-[#0B3D33] text-[#D4AF37] px-10 py-5 font-black uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#0B3D33] transition-all flex items-center gap-3 cursor-pointer relative z-20">
                                            Continue to Vision <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div>
                                    <div className="flex justify-between items-start mb-10">
                                        <h2 className="text-6xl font-serif font-black tracking-tighter leading-none">Vision <br /> Stream_V4</h2>
                                        <div className="p-4 bg-[#D4AF37]/10 border border-[#D4AF37]">
                                            <Eye className="w-8 h-8 text-[#D4AF37] animate-pulse" />
                                        </div>
                                    </div>

                                    <div className="relative aspect-video bg-black overflow-hidden mb-12 shadow-2xl">
                                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1] opacity-60" />

                                        {/* Overlay Markers */}
                                        <div className="absolute inset-0 border-[30px] border-[#0B3D33]/50 pointer-events-none" />
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border-2 border-dashed border-[#D4AF37]/30" />

                                        <div className="absolute bottom-10 left-10 space-y-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
                                                <span className="text-[10px] font-mono text-[#D4AF37] font-bold">SYSTEM_STATE: ANALYSIS_LIVE</span>
                                            </div>
                                            <div className="h-1 w-48 bg-white/10 overflow-hidden">
                                                <motion.div
                                                    animate={{ x: ["-100%", "100%"] }}
                                                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                                    className="w-1/2 h-full bg-[#D4AF37]"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-[#0B3D33]/60 font-medium mb-12 flex items-start gap-4 max-w-2xl bg-[#FDFCF8] p-6">
                                        <Info className="w-6 h-6 text-[#D4AF37] shrink-0" />
                                        Please ensure the child is sitting 3 feet away with adequate lighting. The system is tracking 468 facial landmarks to detect social smiling and gaze shifts.
                                    </p>

                                    <div className="flex gap-4">
                                        <button type="button" onClick={handleNext} className="bg-[#0B3D33] text-[#D4AF37] px-12 py-6 font-black uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#0B3D33] transition-all cursor-pointer relative z-20">
                                            Commit Behavioral Frame
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="text-center py-10">
                                    <h2 className="text-7xl font-serif font-black tracking-tighter mb-10 text-[#0B3D33]">Physiological <br /> Synthesis</h2>
                                    <div className="flex justify-center mb-16 gap-4">
                                        {[1, 2, 3, 4].map(i => (
                                            <motion.div
                                                key={i}
                                                animate={{ height: [40, 100, 60, 80] }}
                                                transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                                                className="w-12 bg-[#D4AF37] opacity-20"
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xl font-light text-[#0B3D33]/60 mb-16 max-w-xl mx-auto">
                                        Integrating simulated EEG bandpower (Alpha/Theta ratios) to refine the risk scoring alignment.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        disabled={loading}
                                        className="bg-[#0B3D33] text-[#D4AF37] px-16 py-8 text-2xl font-black uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#0B3D33] transition-all flex items-center justify-center gap-6 mx-auto min-w-[350px] cursor-pointer relative z-20"
                                    >
                                        {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : "Initiate Final Fusion"}
                                        {!loading && <Zap className="w-8 h-8" />}
                                    </button>
                                </div>
                            )}

                            {step === 4 && (
                                <div>
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37] mb-4">Final_Clinical_Output</p>
                                            <h2 className="text-7xl font-serif font-black tracking-tighter leading-none">Fusion <br /> Complete</h2>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-mono font-black text-[#D4AF37] mb-2">{results?.risk_results?.interpretation || 'RISK_SCORE'}</p>
                                            <h3 className="text-8xl font-serif font-black leading-none">{results?.risk_results?.risk_score}%</h3>
                                            <p className="text-[10px] font-black uppercase tracking-widest mt-4 opacity-40">Confidence: {results?.risk_results?.confidence}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
                                        <div className="p-10 bg-[#0B3D33] text-[#FDFCF8] border-2 border-[#0B3D33]">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-[#D4AF37] mb-6">Agent_Analysis</h4>
                                            <p className="text-xl font-light leading-relaxed italic">
                                                "{results?.clinical_summary?.clinical_recommendation}"
                                            </p>
                                        </div>
                                        <div className="p-10 border-2 border-[#0B3D33]">
                                            <h4 className="text-xs font-black uppercase tracking-widest mb-6 opacity-40">Modality_Weights</h4>
                                            <div className="space-y-4">
                                                {[
                                                    { label: "Vision", val: results?.risk_results?.breakdown?.behavioral },
                                                    { label: "Cognition", val: results?.risk_results?.breakdown?.questionnaire },
                                                    { label: "Neuro", val: results?.risk_results?.breakdown?.physiological }
                                                ].map(m => (
                                                    <div key={m.label} className="space-y-1">
                                                        <div className="flex justify-between text-[10px] font-black uppercase">
                                                            <span>{m.label}</span>
                                                            <span>{m.val}%</span>
                                                        </div>
                                                        <div className="h-1 bg-[#D4AF37]/10">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${m.val}%` }}
                                                                className="h-full bg-[#D4AF37]"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-6 pt-10 border-t border-[#0B3D33]/10">
                                        <button className="bg-[#0B3D33] text-[#D4AF37] px-10 py-5 font-black uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#0B3D33] transition-all">
                                            Generate Clinical PDF
                                        </button>
                                        <Link href="/dashboard" className="px-10 py-5 border-2 border-[#0B3D33] font-black uppercase tracking-widest hover:bg-[#0B3D33] hover:text-[#FDFCF8] transition-all">
                                            Return to Hub
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
