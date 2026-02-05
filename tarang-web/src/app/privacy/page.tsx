"use client"
import { motion } from 'framer-motion'
import { Shield, Lock, Eye, Database, UserCheck, FileText } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#FDFCF8] pt-32 px-8 md:px-16 lg:px-24 pb-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
            >
                {/* Header */}
                <div className="mb-16">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mb-2 block">
                        Legal_Documentation
                    </span>
                    <h1 className="text-6xl font-serif font-black tracking-tighter text-[#0B3D33] mb-6">
                        Privacy <span className="text-[#D4AF37]">Policy</span>
                    </h1>
                    <p className="text-lg text-[#0B3D33]/60 font-light">
                        Last updated: February 2026 • Effective: Immediately
                    </p>
                </div>

                {/* Key Principles */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {[
                        { icon: Lock, title: 'Encrypted', desc: 'End-to-end encryption for all pediatric data' },
                        { icon: Eye, title: 'Transparent', desc: 'You control what data is shared and when' },
                        { icon: Shield, title: 'Compliant', desc: 'HIPAA, GDPR, and DISHA compliant' }
                    ].map((item, i) => (
                        <div key={i} className="bg-white border-2 border-[#0B3D33]/10 p-8">
                            <item.icon className="w-8 h-8 text-[#D4AF37] mb-4" />
                            <h3 className="font-black uppercase tracking-widest mb-2">{item.title}</h3>
                            <p className="text-sm text-[#0B3D33]/60">{item.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Policy Sections */}
                <div className="space-y-12">
                    <section className="bg-white border-2 border-[#0B3D33]/10 p-10">
                        <div className="flex items-center gap-4 mb-6">
                            <Database className="w-6 h-6 text-[#D4AF37]" />
                            <h2 className="text-2xl font-serif font-black">Data We Collect</h2>
                        </div>
                        <div className="space-y-4 text-[#0B3D33]/80 leading-relaxed">
                            <p>TARANG collects the following categories of information to provide our autism screening and care management services:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>Account Information:</strong> Name, email, phone number, role (Parent/Clinician)</li>
                                <li><strong>Child Information:</strong> Name, age, developmental history (with guardian consent)</li>
                                <li><strong>Screening Data:</strong> Video recordings, questionnaire responses, behavioral metrics</li>
                                <li><strong>Clinical Data:</strong> Risk assessments, therapy plans, progress reports</li>
                                <li><strong>Usage Data:</strong> App interactions, session logs (anonymized)</li>
                            </ul>
                        </div>
                    </section>

                    <section className="bg-white border-2 border-[#0B3D33]/10 p-10">
                        <div className="flex items-center gap-4 mb-6">
                            <UserCheck className="w-6 h-6 text-[#D4AF37]" />
                            <h2 className="text-2xl font-serif font-black">Pediatric Data Protection</h2>
                        </div>
                        <div className="space-y-4 text-[#0B3D33]/80 leading-relaxed">
                            <p>We implement enhanced protections for pediatric data:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>All video data is processed locally when possible and encrypted in transit</li>
                                <li>Guardian consent is required before any data collection begins</li>
                                <li>Row-level security ensures data isolation between patients</li>
                                <li>Behavioral markers are never used for advertising or sold to third parties</li>
                                <li>Parents can request complete data deletion at any time</li>
                            </ul>
                        </div>
                    </section>

                    <section className="bg-white border-2 border-[#0B3D33]/10 p-10">
                        <div className="flex items-center gap-4 mb-6">
                            <FileText className="w-6 h-6 text-[#D4AF37]" />
                            <h2 className="text-2xl font-serif font-black">Your Rights</h2>
                        </div>
                        <div className="space-y-4 text-[#0B3D33]/80 leading-relaxed">
                            <p>As a user of TARANG, you have the right to:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>Access:</strong> Request a copy of all data we hold about you</li>
                                <li><strong>Rectify:</strong> Correct inaccurate or incomplete information</li>
                                <li><strong>Delete:</strong> Request permanent deletion of your account and data</li>
                                <li><strong>Restrict:</strong> Limit how we process your data</li>
                                <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                                <li><strong>Withdraw Consent:</strong> Revoke permissions at any time</li>
                            </ul>
                        </div>
                    </section>
                </div>

                {/* Contact */}
                <div className="mt-16 p-10 bg-[#0B3D33] text-[#FDFCF8]">
                    <h3 className="text-2xl font-serif font-black mb-4">Questions?</h3>
                    <p className="text-[#FDFCF8]/60 mb-6">
                        Contact our Data Protection Officer for any privacy-related inquiries.
                    </p>
                    <Link
                        href="/contact"
                        className="inline-block bg-[#D4AF37] text-[#0B3D33] px-8 py-4 font-black uppercase tracking-widest hover:bg-white transition-colors"
                    >
                        Contact Us
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}
