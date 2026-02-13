"use client"
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Video, Mic, MicOff, VideoOff, PhoneOff, Users, Activity, Shield, Info, HeartPulse } from 'lucide-react'
import { cn, API_URL } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { useMediaPipe } from '@/hooks/use-mediapipe'
import RealTimeMetrics, { type DetectedMetrics } from '@/components/RealTimeMetrics'

export default function LiveScreeningPage() {
    const { id: roomId } = useParams()
    const { user, token } = useAuth()
    const router = useRouter()

    const [localStream, setLocalStream] = useState<MediaStream | null>(null)
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
    const [isMuted, setIsMuted] = useState(false)
    const [isVideoOff, setIsVideoOff] = useState(false)
    const [status, setStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting')
    const [liveMetrics, setLiveMetrics] = useState<DetectedMetrics | null>(null)

    const localVideoRef = useRef<HTMLVideoElement>(null)
    const remoteVideoRef = useRef<HTMLVideoElement>(null)
    const peerConnection = useRef<RTCPeerConnection | null>(null)
    const socket = useRef<WebSocket | null>(null)
    const detectionIntervalRef = useRef<number | null>(null)
    const { isLoaded, detect } = useMediaPipe()

    const ICE_SERVERS = {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    }

    useEffect(() => {
        if (!roomId || !token) return

        const initWebRTC = async () => {
            try {
                // 1. Get User Media
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                setLocalStream(stream)
                if (localVideoRef.current) localVideoRef.current.srcObject = stream

                // 2. Initialize WebSocket Signaling
                const wsBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
                const wsProtocol = wsBaseUrl.startsWith('https') ? 'wss' : 'ws'
                const wsHost = wsBaseUrl.replace(/^https?:\/\//, '')
                const wsUrl = `${wsProtocol}://${wsHost}/ws/screening/${roomId}?token=${token}`
                socket.current = new WebSocket(wsUrl)

                socket.current.onmessage = async (event) => {
                    const message = JSON.parse(event.data)

                    if (message.offer) {
                        await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(message.offer))
                        const answer = await peerConnection.current?.createAnswer()
                        await peerConnection.current?.setLocalDescription(answer)
                        socket.current?.send(JSON.stringify({ answer }))
                    } else if (message.answer) {
                        await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(message.answer))
                    } else if (message.iceCandidate) {
                        await peerConnection.current?.addIceCandidate(new RTCIceCandidate(message.iceCandidate))
                    }
                }

                // 3. Initialize Peer Connection
                peerConnection.current = new RTCPeerConnection(ICE_SERVERS)

                stream.getTracks().forEach(track => {
                    peerConnection.current?.addTrack(track, stream)
                })

                peerConnection.current.ontrack = (event) => {
                    setRemoteStream(event.streams[0])
                    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0]
                    setStatus('connected')
                }

                peerConnection.current.onicecandidate = (event) => {
                    if (event.candidate) {
                        socket.current?.send(JSON.stringify({ iceCandidate: event.candidate }))
                    }
                }

                // If clinician, create offer
                if (user?.role === 'CLINICIAN' || user?.role === 'ADMIN') {
                    const offer = await peerConnection.current.createOffer()
                    await peerConnection.current.setLocalDescription(offer)
                    socket.current.onopen = () => {
                        socket.current?.send(JSON.stringify({ offer }))
                    }
                }

            } catch (e) {
                console.error("WebRTC Error:", e)
            }
        }

        initWebRTC()

        return () => {
            localStream?.getTracks().forEach(track => track.stop())
            peerConnection.current?.close()
            socket.current?.close()
        }
    }, [roomId, token, user?.role])

    // MediaPipe detection loop on local video
    useEffect(() => {
        if (!isLoaded || !localVideoRef.current) return

        const eyeSamples: number[] = []
        const motorSamples: number[] = []
        const engSamples: number[] = []

        detectionIntervalRef.current = window.setInterval(() => {
            if (localVideoRef.current && localVideoRef.current.readyState >= 2) {
                const result = detect(localVideoRef.current)
                if (result?.faceLandmarks?.length) {
                    const lm = result.faceLandmarks[0]
                    const leftEye = lm[159], rightEye = lm[386], nose = lm[1]
                    let eyeScore = 0, stability = 0.5

                    if (leftEye && rightEye && nose) {
                        const ed = Math.sqrt(Math.pow(rightEye.x - leftEye.x, 2) + Math.pow(rightEye.y - leftEye.y, 2))
                        const nd = Math.sqrt(Math.pow(nose.x - leftEye.x, 2) + Math.pow(nose.y - leftEye.y, 2))
                        eyeScore = Math.min(1, Math.max(0, 1 - Math.abs(0.5 - (nd / ed))))
                        stability = 1 - Math.min(1, Math.abs(nose.z || 0) * 2)
                    }

                    eyeSamples.push(eyeScore)
                    motorSamples.push(stability)
                    engSamples.push(Math.min(1, eyeScore * 0.5 + stability * 0.3 + 0.2))
                    if (eyeSamples.length > 10) eyeSamples.shift()
                    if (motorSamples.length > 10) motorSamples.shift()
                    if (engSamples.length > 10) engSamples.shift()

                    const avg = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length
                    setLiveMetrics({
                        eye_contact: Math.round(avg(eyeSamples) * 100) / 100,
                        motor_coordination: Math.round(avg(motorSamples) * 100) / 100,
                        engagement: Math.round(avg(engSamples) * 100) / 100,
                        face_detected: true,
                        landmarks_count: lm.length
                    })
                } else {
                    setLiveMetrics(prev => prev ? { ...prev, face_detected: false } : null)
                }
            }
        }, 200)

        return () => {
            if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current)
        }
    }, [isLoaded, detect])

    const handleEndSession = () => {
        setStatus('ended')
        setTimeout(() => router.push('/dashboard'), 2000)
    }

    return (
        <div className="min-h-screen bg-[#0B3D33] text-[#FDFCF8] flex flex-col overflow-hidden">
            {/* Minimal Header */}
            <div className="p-8 flex justify-between items-center border-b border-white/5 bg-black/20 backdrop-blur-md">
                <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-[#D4AF37] flex items-center justify-center">
                        <Activity className="w-6 h-6 text-[#0B3D33]" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-serif font-black tracking-tighter uppercase leading-none">Live Screening Session</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mt-1 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Encrypted_Peer_Link
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest">
                        Room: {roomId}
                    </div>
                    <button
                        onClick={handleEndSession}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2"
                    >
                        <PhoneOff className="w-4 h-4" /> End_Session
                    </button>
                </div>
            </div>

            {/* Video Canvas Grid */}
            <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 relative pb-32">
                <div className="relative border-2 border-[#D4AF37]/20 bg-black overflow-hidden group">
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <div className="absolute top-6 left-6 px-3 py-1 bg-black/60 backdrop-blur-md text-[10px] font-black uppercase tracking-widest">
                        Remote_Feed (Peer)
                    </div>
                    <AnimatePresence>
                        {status === 'connecting' && (
                            <motion.div
                                initial={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center"
                            >
                                <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-6" />
                                <p className="text-xs font-black uppercase tracking-widest animate-pulse">Waiting_for_Peer...</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="relative border-2 border-white/10 bg-black overflow-hidden">
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover grayscale brightness-75" />
                    <div className="absolute top-6 left-6 px-3 py-1 bg-black/60 backdrop-blur-md text-[10px] font-black uppercase tracking-widest">
                        Local_Feed (Self)
                    </div>

                    {/* Real-time AI Metrics */}
                    <RealTimeMetrics
                        metrics={liveMetrics}
                        isModelLoaded={isLoaded}
                        variant="overlay"
                    />
                </div>

                {/* Floating Controls */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/80 backdrop-blur-xl p-6 border-2 border-white/10 shadow-2xl">
                    <button onClick={() => setIsMuted(!isMuted)} className={cn("p-4 transition-all rounded-full", isMuted ? "bg-red-500/20 text-red-500" : "bg-white/5 hover:bg-white/10")}>
                        {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </button>
                    <button onClick={() => setIsVideoOff(!isVideoOff)} className={cn("p-4 transition-all rounded-full", isVideoOff ? "bg-red-500/20 text-red-500" : "bg-white/5 hover:bg-white/10")}>
                        {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                    </button>
                    <div className="w-[1px] h-8 bg-white/10 mx-4" />
                    <div className="flex flex-col items-center">
                        <HeartPulse className="w-6 h-6 text-[#D4AF37] animate-pulse" />
                        <span className="text-[8px] font-black uppercase mt-1">Live_Sync</span>
                    </div>
                </div>
            </div>

            {/* Ending Overlay */}
            <AnimatePresence>
                {status === 'ended' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-[#0B3D33] z-[200] flex flex-col items-center justify-center p-20 text-center"
                    >
                        <h2 className="text-8xl font-serif font-black tracking-tighter uppercase mb-6">Session Ended</h2>
                        <p className="text-xl font-light opacity-60 mb-12">Diagnostic metadata has been securely cached for agentic synthesis.</p>
                        <div className="w-20 h-1 bg-[#D4AF37]" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
