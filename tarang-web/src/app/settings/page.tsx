"use client"
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Bell, Globe, Shield, Moon, Volume2, Save, CheckCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/hooks/use-i18n'
import { API_URL } from '@/lib/utils'

export default function SettingsPage() {
    const { isAuthenticated, isLoading, token } = useAuth()
    const { language, setLanguage } = useI18n()
    const router = useRouter()
    const [saved, setSaved] = useState(false)

    const [settings, setSettings] = useState({
        notifications: {
            screeningReminders: true,
            appointmentAlerts: true,
            communityUpdates: false,
            emailDigest: true
        },
        privacy: {
            shareProgress: false,
            allowResearch: false,
            publicProfile: false
        },
        accessibility: {
            reducedMotion: false,
            highContrast: false,
            largeText: false
        }
    })

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

    const updateSetting = (category: string, key: string, value: boolean) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category as keyof typeof prev],
                [key]: value
            }
        }))
    }

    const handleSave = async () => {
        try {
            const response = await fetch(`${API_URL}/users/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(settings)
            })
            if (response.ok) {
                setSaved(true)
                setTimeout(() => setSaved(false), 3000)
            }
        } catch (err) {
            console.error('Failed to save settings:', err)
        }
    }

    const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) => (
        <button
            onClick={() => onChange(!enabled)}
            className={`w-12 h-7 rounded-full transition-colors relative ${enabled ? 'bg-[#D4AF37]' : 'bg-[#0B3D33]/20'}`}
        >
            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? 'left-6' : 'left-1'}`} />
        </button>
    )

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
                            App_Settings
                        </span>
                        <h1 className="text-5xl font-serif font-black tracking-tighter text-[#0B3D33]">
                            Settings
                        </h1>
                    </div>
                    <button
                        onClick={handleSave}
                        className={`flex items-center gap-2 px-6 py-3 font-black uppercase tracking-widest text-sm transition-all ${saved
                            ? 'bg-green-500 text-white'
                            : 'bg-[#0B3D33] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0B3D33]'
                            }`}
                    >
                        {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
                    </button>
                </div>

                {/* Language */}
                <div className="bg-white border-2 border-[#0B3D33]/10 p-8 mb-6">
                    <div className="flex items-center gap-4 mb-6">
                        <Globe className="w-6 h-6 text-[#D4AF37]" />
                        <h2 className="text-xl font-black uppercase tracking-widest">Language</h2>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setLanguage('en')}
                            className={`px-6 py-3 font-black uppercase tracking-widest transition-all ${language === 'en'
                                ? 'bg-[#0B3D33] text-[#D4AF37]'
                                : 'border-2 border-[#0B3D33]/20 text-[#0B3D33]/60'
                                }`}
                        >
                            English
                        </button>
                        <button
                            onClick={() => setLanguage('hi')}
                            className={`px-6 py-3 font-black uppercase tracking-widest transition-all ${language === 'hi'
                                ? 'bg-[#0B3D33] text-[#D4AF37]'
                                : 'border-2 border-[#0B3D33]/20 text-[#0B3D33]/60'
                                }`}
                        >
                            हिन्दी
                        </button>
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-white border-2 border-[#0B3D33]/10 p-8 mb-6">
                    <div className="flex items-center gap-4 mb-6">
                        <Bell className="w-6 h-6 text-[#D4AF37]" />
                        <h2 className="text-xl font-black uppercase tracking-widest">Notifications</h2>
                    </div>
                    <div className="space-y-6">
                        {[
                            { key: 'screeningReminders', label: 'Screening Reminders', desc: 'Get notified about upcoming screenings' },
                            { key: 'appointmentAlerts', label: 'Appointment Alerts', desc: 'Reminders for scheduled appointments' },
                            { key: 'communityUpdates', label: 'Community Updates', desc: 'New posts and discussions' },
                            { key: 'emailDigest', label: 'Weekly Email Digest', desc: 'Summary of your care journey' }
                        ].map(item => (
                            <div key={item.key} className="flex justify-between items-center py-4 border-b border-[#0B3D33]/5 last:border-0">
                                <div>
                                    <p className="font-bold text-[#0B3D33]">{item.label}</p>
                                    <p className="text-sm text-[#0B3D33]/50">{item.desc}</p>
                                </div>
                                <Toggle
                                    enabled={settings.notifications[item.key as keyof typeof settings.notifications]}
                                    onChange={(v) => updateSetting('notifications', item.key, v)}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Privacy */}
                <div className="bg-white border-2 border-[#0B3D33]/10 p-8 mb-6">
                    <div className="flex items-center gap-4 mb-6">
                        <Shield className="w-6 h-6 text-[#D4AF37]" />
                        <h2 className="text-xl font-black uppercase tracking-widest">Privacy</h2>
                    </div>
                    <div className="space-y-6">
                        {[
                            { key: 'shareProgress', label: 'Share Progress with Clinicians', desc: 'Allow assigned clinicians to view screening data' },
                            { key: 'allowResearch', label: 'Anonymous Research Contribution', desc: 'Help improve ASD detection algorithms' },
                            { key: 'publicProfile', label: 'Public Community Profile', desc: 'Show your name in community discussions' }
                        ].map(item => (
                            <div key={item.key} className="flex justify-between items-center py-4 border-b border-[#0B3D33]/5 last:border-0">
                                <div>
                                    <p className="font-bold text-[#0B3D33]">{item.label}</p>
                                    <p className="text-sm text-[#0B3D33]/50">{item.desc}</p>
                                </div>
                                <Toggle
                                    enabled={settings.privacy[item.key as keyof typeof settings.privacy]}
                                    onChange={(v) => updateSetting('privacy', item.key, v)}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Accessibility */}
                <div className="bg-white border-2 border-[#0B3D33]/10 p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <Volume2 className="w-6 h-6 text-[#D4AF37]" />
                        <h2 className="text-xl font-black uppercase tracking-widest">Accessibility</h2>
                    </div>
                    <div className="space-y-6">
                        {[
                            { key: 'reducedMotion', label: 'Reduced Motion', desc: 'Minimize animations and transitions' },
                            { key: 'highContrast', label: 'High Contrast', desc: 'Increase visual contrast for better readability' },
                            { key: 'largeText', label: 'Large Text', desc: 'Increase default text size' }
                        ].map(item => (
                            <div key={item.key} className="flex justify-between items-center py-4 border-b border-[#0B3D33]/5 last:border-0">
                                <div>
                                    <p className="font-bold text-[#0B3D33]">{item.label}</p>
                                    <p className="text-sm text-[#0B3D33]/50">{item.desc}</p>
                                </div>
                                <Toggle
                                    enabled={settings.accessibility[item.key as keyof typeof settings.accessibility]}
                                    onChange={(v) => updateSetting('accessibility', item.key, v)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
