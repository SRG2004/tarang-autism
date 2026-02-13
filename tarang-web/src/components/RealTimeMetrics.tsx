"use client"
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Activity, Brain, Shield, Scan, AlertTriangle } from 'lucide-react'

export interface DetectedMetrics {
    eye_contact: number       // 0-1
    motor_coordination: number // 0-1
    engagement: number        // 0-1
    face_detected: boolean
    landmarks_count: number
}

interface RealTimeMetricsProps {
    metrics: DetectedMetrics | null
    isModelLoaded: boolean
    variant?: 'overlay' | 'sidebar'
}

function MetricBar({ label, value, icon: Icon, color }: {
    label: string
    value: number
    icon: React.ComponentType<{ className?: string }>
    color: string
}) {
    const percentage = Math.round(value * 100)
    const status = percentage >= 70 ? 'OPTIMAL' : percentage >= 40 ? 'MODERATE' : 'LOW'
    const statusColor = percentage >= 70 ? 'text-emerald-400' : percentage >= 40 ? 'text-[#D4AF37]' : 'text-red-400'

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/70">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-[8px] font-black uppercase tracking-widest ${statusColor}`}>{status}</span>
                    <span className="text-[11px] font-mono font-black text-white">{percentage}%</span>
                </div>
            </div>
            <div className="h-1.5 bg-white/5 overflow-hidden relative">
                <motion.div
                    className="h-full relative"
                    style={{ background: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                />
                {/* Glow effect */}
                <motion.div
                    className="absolute top-0 h-full w-6 blur-sm"
                    style={{ background: color, opacity: 0.6 }}
                    animate={{ left: [`${Math.max(0, percentage - 8)}%`, `${percentage}%`] }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                />
            </div>
        </div>
    )
}

export default function RealTimeMetrics({ metrics, isModelLoaded, variant = 'overlay' }: RealTimeMetricsProps) {
    const isOverlay = variant === 'overlay'

    if (!isModelLoaded) {
        return (
            <div className={`${isOverlay ? 'absolute bottom-6 left-6 right-6' : 'w-full'} p-4 bg-black/70 backdrop-blur-xl border border-white/10`}>
                <div className="flex items-center gap-3">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    >
                        <Brain className="w-4 h-4 text-[#D4AF37]" />
                    </motion.div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                        Initializing_MediaPipe_Vision...
                    </span>
                </div>
            </div>
        )
    }

    if (!metrics) {
        return (
            <div className={`${isOverlay ? 'absolute bottom-6 left-6 right-6' : 'w-full'} p-4 bg-black/70 backdrop-blur-xl border border-white/10`}>
                <div className="flex items-center gap-3">
                    <Scan className="w-4 h-4 text-white/40 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                        Awaiting_Face_Detection...
                    </span>
                </div>
            </div>
        )
    }

    return (
        <div className={`${isOverlay ? 'absolute bottom-6 left-6 right-6' : 'w-full'}`}>
            {/* AI Lock Status */}
            <AnimatePresence>
                {metrics.face_detected && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className={`flex items-center gap-2 mb-2 p-2 ${isOverlay ? 'bg-[#D4AF37]' : 'bg-[#D4AF37]'
                            } text-[#0B3D33] font-black text-[10px] uppercase w-fit`}
                    >
                        <Shield className="w-3.5 h-3.5" />
                        <span>AI_Lock_Active</span>
                        <span className="opacity-60">·</span>
                        <span className="font-mono">{metrics.landmarks_count} landmarks</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* No face warning */}
            <AnimatePresence>
                {!metrics.face_detected && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 mb-2 p-2 bg-red-500/80 text-white font-black text-[10px] uppercase w-fit"
                    >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>No_Face_Detected</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Metrics Panel */}
            <div className="p-4 bg-black/70 backdrop-blur-xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">
                        Real-Time_Behavioral_Metrics
                    </span>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[8px] font-black uppercase text-emerald-400">Live</span>
                    </div>
                </div>

                <MetricBar
                    label="Eye_Contact"
                    value={metrics.eye_contact}
                    icon={Eye}
                    color="linear-gradient(90deg, #D4AF37, #F4D03F)"
                />
                <MetricBar
                    label="Motor_Coordination"
                    value={metrics.motor_coordination}
                    icon={Activity}
                    color="linear-gradient(90deg, #0B3D33, #1A6B5A)"
                />
                <MetricBar
                    label="Engagement_Index"
                    value={metrics.engagement}
                    icon={Brain}
                    color="linear-gradient(90deg, #8B5CF6, #A78BFA)"
                />

                {/* Waveform visualization */}
                <div className="flex items-end gap-[2px] h-4 mt-2 pt-2 border-t border-white/5">
                    {Array.from({ length: 24 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="flex-1 bg-[#D4AF37]/30"
                            animate={{
                                height: [
                                    `${20 + Math.sin(i * 0.8) * 30 + (metrics.engagement * 50)}%`,
                                    `${40 + Math.cos(i * 0.5) * 20 + (metrics.eye_contact * 40)}%`,
                                    `${20 + Math.sin(i * 0.8) * 30 + (metrics.engagement * 50)}%`,
                                ]
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 1.5 + i * 0.05,
                                ease: 'easeInOut'
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
