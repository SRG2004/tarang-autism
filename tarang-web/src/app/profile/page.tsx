"use client"
import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
    const { user, isAuthenticated, isLoading } = useAuth()
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        childName: '',
        childAge: ''
    })

    // Redirect if not authenticated
    if (!isLoading && !isAuthenticated) {
        router.push('/login')
        return null
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FDFCF8] pt-32 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#FDFCF8] pt-32 px-8 md:px-16 lg:px-24 pb-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
            >
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mb-2 block">
                            Account_Profile
                        </span>
                        <h1 className="text-5xl font-serif font-black tracking-tighter text-[#0B3D33]">
                            My Profile
                        </h1>
                    </div>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`flex items-center gap-2 px-6 py-3 font-black uppercase tracking-widest text-sm transition-all ${isEditing
                            ? 'bg-red-50 text-red-600 border-2 border-red-200'
                            : 'bg-[#0B3D33] text-[#D4AF37]'
                            }`}
                    >
                        {isEditing ? <><X className="w-4 h-4" /> Cancel</> : <><Edit2 className="w-4 h-4" /> Edit</>}
                    </button>
                </div>

                {/* Profile Card */}
                <div className="bg-white border-2 border-[#0B3D33]/10 p-10 md:p-16 mb-10">
                    <div className="flex items-center gap-8 pb-10 border-b border-[#0B3D33]/10 mb-10">
                        <div className="w-24 h-24 bg-[#0B3D33] flex items-center justify-center text-4xl font-black text-[#D4AF37]">
                            {user?.initials || 'U'}
                        </div>
                        <div>
                            <h2 className="text-3xl font-serif font-black text-[#0B3D33] mb-2">
                                {user?.full_name || 'User'}
                            </h2>
                            <span className="inline-block px-3 py-1 bg-[#D4AF37]/20 text-[#0B3D33] text-xs font-black uppercase tracking-widest">
                                {user?.role || 'PARENT'}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#0B3D33]/40 mb-3">
                                    <Mail className="w-4 h-4" /> Email Address
                                </label>
                                <p className="text-lg font-medium text-[#0B3D33]">{user?.email || 'Not set'}</p>
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#0B3D33]/40 mb-3">
                                    <Phone className="w-4 h-4" /> Phone Number
                                </label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full border-2 border-[#0B3D33]/10 p-3 focus:border-[#D4AF37] outline-none"
                                        placeholder="+91 98765 43210"
                                    />
                                ) : (
                                    <p className="text-lg font-medium text-[#0B3D33]">{formData.phone || 'Not set'}</p>
                                )}
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#0B3D33]/40 mb-3">
                                    <MapPin className="w-4 h-4" /> Location
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full border-2 border-[#0B3D33]/10 p-3 focus:border-[#D4AF37] outline-none"
                                        placeholder="City, Country"
                                    />
                                ) : (
                                    <p className="text-lg font-medium text-[#0B3D33]">{formData.address || 'Not set'}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6 p-8 bg-[#FDFCF8] border-2 border-[#0B3D33]/5">
                            <h3 className="text-lg font-black uppercase tracking-widest text-[#0B3D33]/40 mb-6">
                                Child Information
                            </h3>
                            <div>
                                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#0B3D33]/40 mb-3">
                                    <User className="w-4 h-4" /> Child's Name
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.childName}
                                        onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                                        className="w-full border-2 border-[#0B3D33]/10 p-3 focus:border-[#D4AF37] outline-none bg-white"
                                        placeholder="Enter name"
                                    />
                                ) : (
                                    <p className="text-lg font-medium text-[#0B3D33]">{formData.childName || 'Not set'}</p>
                                )}
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#0B3D33]/40 mb-3">
                                    <Calendar className="w-4 h-4" /> Age (Years)
                                </label>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        value={formData.childAge}
                                        onChange={(e) => setFormData({ ...formData, childAge: e.target.value })}
                                        className="w-full border-2 border-[#0B3D33]/10 p-3 focus:border-[#D4AF37] outline-none bg-white"
                                        placeholder="e.g. 4"
                                        min="1"
                                        max="18"
                                    />
                                ) : (
                                    <p className="text-lg font-medium text-[#0B3D33]">{formData.childAge ? `${formData.childAge} years` : 'Not set'}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {isEditing && (
                        <div className="mt-10 pt-8 border-t border-[#0B3D33]/10">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="flex items-center gap-2 bg-[#D4AF37] text-[#0B3D33] px-8 py-4 font-black uppercase tracking-widest hover:bg-[#0B3D33] hover:text-[#D4AF37] transition-all"
                            >
                                <Save className="w-4 h-4" /> Save Changes
                            </button>
                        </div>
                    )}
                </div>

                {/* Account Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { label: 'Screenings', value: '3' },
                        { label: 'Reports', value: '2' },
                        { label: 'Sessions', value: '5' },
                        { label: 'Member Since', value: '2026' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white border-2 border-[#0B3D33]/10 p-6 text-center">
                            <p className="text-3xl font-serif font-black text-[#D4AF37] mb-2">{stat.value}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#0B3D33]/40">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}
