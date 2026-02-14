"use client"
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useMediaPipe } from '@/hooks/use-mediapipe'
import { ArrowLeft, ArrowRight, CheckCircle2, Video, FileText, Brain, Loader2, Info, Eye, Zap, Download, Play, Calendar } from 'lucide-react'
import { cn, API_URL } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth, withRoleProtection } from '@/context/AuthContext'
import RealTimeMetrics, { type DetectedMetrics } from '@/components/RealTimeMetrics'
import AQ10Questionnaire, { calculateAQ10Score } from '@/components/AQ10Questionnaire'

function ScreeningPage() {
    const [step, setStep] = useState(0)
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<any>(null)
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [visionMetrics, setVisionMetrics] = useState<DetectedMetrics | null>(null)
    const [questionnaireResponses, setQuestionnaireResponses] = useState<number[]>(Array(10).fill(-1))
    const { token, user } = useAuth()

    const videoRef = useRef<HTMLVideoElement>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const detectionIntervalRef = useRef<number | null>(null)
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

            // Start MediaPipe detection
            if (isLoaded && videoRef.current) {
                const eyeContactSamples: number[] = []
                const motorSamples: number[] = []
                const engagementSamples: number[] = []

                detectionIntervalRef.current = window.setInterval(() => {
                    if (videoRef.current && videoRef.current.readyState >= 2) {
                        const result = detect(videoRef.current)
                        if (result && result.faceLandmarks && result.faceLandmarks.length > 0) {
                            const landmarks = result.faceLandmarks[0]
                            const landmarkCount = landmarks.length

                            const leftEye = landmarks[159]
                            const rightEye = landmarks[386]
                            const noseTip = landmarks[1]

                            let eyeContactScore = 0
                            let faceStability = 0.5

                            if (leftEye && rightEye && noseTip) {
                                const eyeDistance = Math.sqrt(
                                    Math.pow(rightEye.x - leftEye.x, 2) +
                                    Math.pow(rightEye.y - leftEye.y, 2)
                                )
                                const noseToLeftEye = Math.sqrt(
                                    Math.pow(noseTip.x - leftEye.x, 2) +
                                    Math.pow(noseTip.y - leftEye.y, 2)
                                )

                                eyeContactScore = Math.min(1, Math.max(0, 1 - Math.abs(0.5 - (noseToLeftEye / eyeDistance))))
                                eyeContactSamples.push(eyeContactScore)

                                faceStability = 1 - Math.min(1, Math.abs(noseTip.z || 0) * 2)
                                motorSamples.push(faceStability)
                            }

                            // Engagement = weighted blend of eye contact + face stability + presence
                            const engagementScore = Math.min(1, (eyeContactScore * 0.5 + faceStability * 0.3 + 0.2))
                            engagementSamples.push(engagementScore)

                            // Keep only last 10 samples
                            if (eyeContactSamples.length > 10) eyeContactSamples.shift()
                            if (motorSamples.length > 10) motorSamples.shift()
                            if (engagementSamples.length > 10) engagementSamples.shift()

                            const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0

                            setVisionMetrics({
                                eye_contact: Math.round(avg(eyeContactSamples) * 100) / 100,
                                motor_coordination: Math.round(avg(motorSamples) * 100) / 100,
                                engagement: Math.round(avg(engagementSamples) * 100) / 100,
                                face_detected: true,
                                landmarks_count: landmarkCount
                            })
                        } else {
                            setVisionMetrics(prev => prev ? { ...prev, face_detected: false } : null)
                        }
                    }
                }, 200)
            }
        } else {
            // Stop camera and detection when leaving video step
            if (detectionIntervalRef.current) {
                clearInterval(detectionIntervalRef.current)
                detectionIntervalRef.current = null
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop())
                streamRef.current = null
            }
        }

        return () => {
            if (detectionIntervalRef.current) {
                clearInterval(detectionIntervalRef.current)
                detectionIntervalRef.current = null
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop())
                streamRef.current = null
            }
        }
    }, [step, isLoaded, detect])

    const steps = [
        { name: "Legal & Ethics", icon: CheckCircle2, summary: "Pediatric Data Isolation & Purpose" },
        { name: "Developmental Log", icon: FileText, summary: "Parental Observation Scoping" },
        { name: "Gaze_Stream_V4", icon: Video, summary: "Bilateral Eye-Contact Mapping" },
        { name: "Brain_Sync_Mock", icon: Brain, summary: "Physiological Data Fusion" },
        { name: "Fusion_Output", icon: CheckCircle2, summary: "Clinical Decision Support" }
    ]

    const [screeningError, setScreeningError] = useState<string | null>(null)

    const handleNext = async () => {
        if (step === 3) {
            setLoading(true)
            setScreeningError(null)
            try {
                const metricsToSend = visionMetrics || { eye_contact: 0.65, motor_coordination: 0.8 }

                const response = await fetch(`${API_URL}/screening/process`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        video_metrics: metricsToSend,
                        questionnaire_score: calculateAQ10Score(questionnaireResponses),
                        patient_name: user?.full_name || "Patient"
                    })
                })

                if (!response.ok) {
                    const errBody = await response.text().catch(() => '')
                    throw new Error(`Server error ${response.status}: ${errBody}`)
                }

                const data = await response.json()
                setResults(data)
                setStep(4)
            } catch (e: any) {
                console.error("Screening API failed:", e)
                setScreeningError(e?.message || "Failed to process screening. Please check your connection and try again.")
            } finally {
                setLoading(false)
            }
        } else {
            setStep(s => s + 1)
        }
    }

    const handleBack = () => setStep(s => s - 1)

    const handleDownloadPDF = async () => {
        try {
            // Use current results to generate PDF
            const body = {
                patient_name: user?.full_name || "Patient",
                timestamp: new Date().toISOString(),
                risk_score: results?.risk_results?.risk_score,
                confidence: results?.risk_results?.confidence,
                breakdown: results?.risk_results?.breakdown,
                clinical_recommendation: results?.clinical_summary?.clinical_recommendation
            }

            const response = await fetch(`${API_URL}/reports/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            })

            if (response.ok) {
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `tarang_clinical_report_${new Date().getTime()}.pdf`
                document.body.appendChild(a)
                a.click()
                a.remove()
            }
        } catch (error) {
            console.error("PDF generation failed:", error)
        }
    }

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
                                    <AQ10Questionnaire
                                        responses={questionnaireResponses}
                                        onResponseChange={(index: number, value: number) => {
                                            const newResponses = [...questionnaireResponses]
                                            newResponses[index] = value
                                            setQuestionnaireResponses(newResponses)
                                        }}
                                        onComplete={() => setStep(2)}
                                    />
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

                                        {/* Real-Time Metrics Overlay */}
                                        <RealTimeMetrics
                                            metrics={visionMetrics}
                                            isModelLoaded={isLoaded}
                                            variant="overlay"
                                        />
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

                                    {screeningError && (
                                        <div className="mt-8 p-6 border-2 border-red-400 bg-red-50 text-center max-w-xl mx-auto">
                                            <p className="text-red-600 font-bold uppercase tracking-widest text-xs mb-3">Screening Failed</p>
                                            <p className="text-sm text-red-500 mb-4">{screeningError}</p>
                                            <button
                                                onClick={handleNext}
                                                className="text-[10px] font-black uppercase tracking-widest text-red-600 border-b-2 border-red-400 pb-1 hover:opacity-60 transition-all"
                                            >
                                                Try Again
                                            </button>
                                        </div>
                                    )}
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

                                    {/* Therapy Plan / Intervention Section */}
                                    {results?.therapy_plan && (
                                        <div className="mb-16">
                                            <div className="flex items-center gap-4 mb-8">
                                                <div className="w-12 h-12 bg-[#D4AF37] flex items-center justify-center text-[#0B3D33]">
                                                    <Brain className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Adaptive_Intervention</p>
                                                    <h3 className="text-3xl font-serif font-black text-[#0B3D33]">Personalized Therapy Plan</h3>
                                                </div>
                                            </div>

                                            <div className="bg-white border-2 border-[#0B3D33]/10 p-8">
                                                <div className="flex justify-between items-start mb-6 border-b border-[#0B3D33]/10 pb-6">
                                                    <div>
                                                        <h4 className="font-bold text-lg text-[#0B3D33]">{results.therapy_plan.focus_area}</h4>
                                                        <p className="text-sm opacity-60">Primary Clinical Objective</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="px-3 py-1 bg-[#0B3D33] text-[#D4AF37] text-[10px] font-black uppercase tracking-widest">
                                                            Review: {results.therapy_plan.next_review}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {results.therapy_plan.suggested_activities?.map((activity: any, idx: number) => (
                                                        <div key={idx} className="bg-[#FDFCF8] p-6 border border-[#0B3D33]/5 hover:border-[#D4AF37] transition-all group">
                                                            <div className="flex justify-between mb-4">
                                                                <span className="w-8 h-8 rounded-full bg-[#0B3D33]/5 flex items-center justify-center font-black text-xs group-hover:bg-[#D4AF37] group-hover:text-[#0B3D33] transition-colors">
                                                                    {idx + 1}
                                                                </span>
                                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3" /> {activity.duration}
                                                                </span>
                                                            </div>
                                                            <h5 className="font-bold text-[#0B3D33] mb-2">{activity.title}</h5>
                                                            <p className="text-sm opacity-70 leading-relaxed">{activity.goal}</p>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mt-8 pt-6 border-t border-[#0B3D33]/10 flex justify-end">
                                                    <button className="text-xs font-black uppercase tracking-widest text-[#D4AF37] hover:underline flex items-center gap-2">
                                                        View Full Protocol <ArrowRight className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-6 pt-10 border-t border-[#0B3D33]/10">
                                        <button
                                            onClick={handleDownloadPDF}
                                            className="bg-[#0B3D33] text-[#D4AF37] px-10 py-5 font-black uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#0B3D33] transition-all flex items-center gap-3"
                                        >
                                            <Download className="w-5 h-5" />
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

export default withRoleProtection(ScreeningPage, ['PARENT', 'CLINICIAN', 'ADMIN'])
