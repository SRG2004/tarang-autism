"use client"
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send, CheckCircle, MessageSquare, Clock, Globe } from 'lucide-react'

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    })
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // In production, this would send to backend
        setSubmitted(true)
    }

    return (
        <div className="min-h-screen bg-[#FDFCF8] pt-32 px-8 md:px-16 lg:px-24 pb-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl mx-auto"
            >
                {/* Header */}
                <div className="mb-16 text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mb-2 block">
                        Get_In_Touch
                    </span>
                    <h1 className="text-6xl font-serif font-black tracking-tighter text-[#0B3D33] mb-6">
                        Contact <span className="text-[#D4AF37]">Us</span>
                    </h1>
                    <p className="text-xl text-[#0B3D33]/60 font-light max-w-2xl mx-auto">
                        Have questions about TARANG? Our team is here to help parents, clinicians, and partners.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Contact Form */}
                    <div className="bg-white border-2 border-[#0B3D33]/10 p-10">
                        {submitted ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-16"
                            >
                                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
                                <h3 className="text-2xl font-serif font-black text-[#0B3D33] mb-4">
                                    Message Sent!
                                </h3>
                                <p className="text-[#0B3D33]/60 mb-8">
                                    We'll get back to you within 24-48 hours.
                                </p>
                                <button
                                    onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '' }) }}
                                    className="text-[#D4AF37] font-black uppercase tracking-widest hover:underline"
                                >
                                    Send Another Message
                                </button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-[#0B3D33]/60 mb-3">
                                        Your Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full border-2 border-[#0B3D33]/10 p-4 outline-none focus:border-[#D4AF37] transition-colors"
                                        placeholder="James Smith"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-[#0B3D33]/60 mb-3">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full border-2 border-[#0B3D33]/10 p-4 outline-none focus:border-[#D4AF37] transition-colors"
                                        placeholder="james@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-[#0B3D33]/60 mb-3">
                                        Subject
                                    </label>
                                    <select
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full border-2 border-[#0B3D33]/10 p-4 outline-none focus:border-[#D4AF37] transition-colors bg-white"
                                    >
                                        <option value="">Select a topic...</option>
                                        <option value="screening">Screening Questions</option>
                                        <option value="clinical">Clinical Partnership</option>
                                        <option value="technical">Technical Support</option>
                                        <option value="privacy">Privacy Concerns</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-[#0B3D33]/60 mb-3">
                                        Message
                                    </label>
                                    <textarea
                                        required
                                        rows={5}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full border-2 border-[#0B3D33]/10 p-4 outline-none focus:border-[#D4AF37] transition-colors resize-none"
                                        placeholder="How can we help you?"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-[#0B3D33] text-[#D4AF37] p-5 font-black uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#0B3D33] transition-all flex items-center justify-center gap-3"
                                >
                                    <Send className="w-5 h-5" /> Send Message
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div className="bg-[#0B3D33] text-[#FDFCF8] p-10">
                            <h3 className="text-2xl font-serif font-black mb-8">Quick Contact</h3>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <Mail className="w-6 h-6 text-[#D4AF37] shrink-0 mt-1" />
                                    <div>
                                        <p className="font-bold mb-1">Email</p>
                                        <p className="text-[#FDFCF8]/60">support@tarang.health</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Phone className="w-6 h-6 text-[#D4AF37] shrink-0 mt-1" />
                                    <div>
                                        <p className="font-bold mb-1">Phone</p>
                                        <p className="text-[#FDFCF8]/60">+91 80-4567-8900</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <MapPin className="w-6 h-6 text-[#D4AF37] shrink-0 mt-1" />
                                    <div>
                                        <p className="font-bold mb-1">Address</p>
                                        <p className="text-[#FDFCF8]/60">
                                            TATA Elxsi Innovation Hub<br />
                                            Electronic City, Bangalore 560100
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white border-2 border-[#0B3D33]/10 p-8 text-center">
                                <Clock className="w-8 h-8 text-[#D4AF37] mx-auto mb-4" />
                                <h4 className="font-black uppercase tracking-widest text-sm mb-2">Response Time</h4>
                                <p className="text-[#0B3D33]/60">24-48 hours</p>
                            </div>
                            <div className="bg-white border-2 border-[#0B3D33]/10 p-8 text-center">
                                <Globe className="w-8 h-8 text-[#D4AF37] mx-auto mb-4" />
                                <h4 className="font-black uppercase tracking-widest text-sm mb-2">Support</h4>
                                <p className="text-[#0B3D33]/60">EN / हिन्दी</p>
                            </div>
                        </div>

                        <div className="bg-[#D4AF37]/10 border-2 border-[#D4AF37] p-8">
                            <MessageSquare className="w-8 h-8 text-[#D4AF37] mb-4" />
                            <h4 className="font-black uppercase tracking-widest mb-2">Clinical Partnerships</h4>
                            <p className="text-[#0B3D33]/60 text-sm mb-4">
                                Interested in integrating TARANG into your clinic? Schedule a demo with our partnerships team.
                            </p>
                            <a href="mailto:partners@tarang.health" className="text-[#0B3D33] font-black text-sm hover:text-[#D4AF37] transition-colors">
                                partners@tarang.health →
                            </a>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
