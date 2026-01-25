"use client"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Send, MessageCircle, Heart, ShieldCheck, Sparkles, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function CommunityHub() {
    const [posts, setPosts] = useState<any[]>([])
    const [newPost, setNewPost] = useState('')
    const [chatQuery, setChatQuery] = useState('')
    const [aiSuggestions, setAiSuggestions] = useState<any[]>([])

    useEffect(() => {
        fetch('http://localhost:8000/community')
            .then(res => res.json())
            .then(data => setPosts(data))
    }, [])

    const handlePost = async () => {
        if (!newPost.trim()) return
        const res = await fetch('http://localhost:8000/community/post', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ author: 'James S.', content: newPost })
        })
        const data = await res.json()
        if (data.moderation.safe) {
            setPosts([{ author: 'James S.', content: newPost, created_at: new Date().toISOString() }, ...posts])
            setNewPost('')
        } else {
            alert("Action Restricted: Your post contains terms that violate our pediatric safety policy.")
        }
    }

    const handleAiHelp = async () => {
        if (!chatQuery.trim()) return
        const res = await fetch('http://localhost:8000/community/help', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: chatQuery })
        })
        const data = await res.json()
        setAiSuggestions(data.suggested_resources)
    }

    return (
        <div className="min-h-screen bg-[#FDFCF8] pt-32 px-8 md:px-16 lg:px-24 pb-32 max-w-7xl mx-auto">
            <motion.header
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-20"
            >
                <div className="flex items-center gap-4 mb-4">
                    <span className="px-3 py-1 bg-[#D4AF37] text-[#0B3D33] font-mono text-[10px] uppercase font-black tracking-widest">Secure_Social_Hub</span>
                    <span className="text-[10px] font-mono uppercase tracking-widest opacity-40">Parent_Support_Loop</span>
                </div>
                <h1 className="text-8xl font-serif font-black tracking-tighter uppercase leading-none text-[#0B3D33]">
                    Community <br /> <span className="text-[#D4AF37]">Circle</span>
                </h1>
            </motion.header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-16">

                {/* P2P Feed Pillar */}
                <div className="xl:col-span-7 space-y-12">

                    <div className="p-10 border-2 border-[#0B3D33] bg-white relative shadow-[10px_10px_0px_rgba(11,61,51,0.05)]">
                        <h3 className="text-2xl font-serif font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                            <MessageCircle className="w-6 h-6 text-[#D4AF37]" /> Share an Insight
                        </h3>
                        <textarea
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                            className="w-full h-32 p-6 bg-[#FDFCF8] border-2 border-[#0B3D33]/10 focus:border-[#D4AF37] outline-none font-medium text-lg transition-all"
                            placeholder="How has your care journey been today?"
                        />
                        <div className="flex justify-between items-center mt-6">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase opacity-40">
                                <ShieldCheck className="w-4 h-4" /> AI_MODERATION_ACTIVE
                            </div>
                            <button
                                onClick={handlePost}
                                className="bg-[#0B3D33] text-[#D4AF37] px-8 py-4 font-black uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#0B3D33] transition-all"
                            >
                                Publish
                            </button>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {posts.map((post, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-10 border-2 border-[#0B3D33]/10 bg-white hover:border-[#0B3D33] transition-all group"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 border-2 border-[#0B3D33] flex items-center justify-center font-black">
                                            {post.author[0]}
                                        </div>
                                        <div>
                                            <p className="font-black text-sm">{post.author}</p>
                                            <p className="text-[10px] font-mono opacity-40 uppercase tracking-widest">Validated_Guardian</p>
                                        </div>
                                    </div>
                                    <Heart className="w-5 h-5 opacity-20 hover:opacity-100 hover:text-[#D4AF37] cursor-pointer" />
                                </div>
                                <p className="text-xl font-light leading-relaxed text-[#0B3D33]/80 italic">"{post.content}"</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* AI Social Concierge Pillar */}
                <div className="xl:col-span-5">
                    <div className="sticky top-40 space-y-10">
                        <div className="p-10 bg-[#0B3D33] text-[#FDFCF8] border-2 border-[#0B3D33] shadow-[10px_10px_0px_#D4AF37]">
                            <h3 className="text-2xl font-serif font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                                <Sparkles className="w-6 h-6 text-[#D4AF37]" /> AI Concierge
                            </h3>
                            <p className="font-light opacity-60 mb-8 leading-relaxed">
                                Ask our Social Support Agent for clinical resources, sibling support, or local caregiver meetups.
                            </p>
                            <div className="relative">
                                <input
                                    value={chatQuery}
                                    onChange={(e) => setChatQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAiHelp()}
                                    className="w-full p-5 bg-white/10 border border-white/20 outline-none focus:border-[#D4AF37] font-bold text-sm tracking-wide transition-all pr-16"
                                    placeholder="e.g. Tips for sleep hygiene..."
                                />
                                <button
                                    onClick={handleAiHelp}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D4AF37] hover:scale-110 transition-transform"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>

                            <AnimatePresence>
                                {aiSuggestions.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-8 pt-8 border-t border-white/10 space-y-4"
                                    >
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Matched_Resources</p>
                                        {aiSuggestions.map((res, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 cursor-pointer group transition-all">
                                                <div className="flex items-center gap-3">
                                                    <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                                                    <span className="font-bold text-sm">{res.topic}</span>
                                                </div>
                                                <span className="text-[10px] font-black text-[#D4AF37] group-hover:underline">View</span>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="p-10 border-2 border-[#0B3D33] bg-white">
                            <h3 className="text-2xl font-serif font-black uppercase tracking-tighter mb-8">Hub Safety</h3>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
                                    <p className="text-sm font-medium opacity-60">Every author is a validated guardian or clinician.</p>
                                </div>
                                <div className="flex gap-4">
                                    <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
                                    <p className="text-sm font-medium opacity-60">Real-time moderation prevents misinformation about ASD cures.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

function CheckCircle(props: any) {
    return <ShieldCheck {...props} />
}
