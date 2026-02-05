"use client"
import Link from 'next/link'
import { cn, API_URL } from '@/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '@/hooks/use-i18n'
import { Play, Globe, CheckCircle, LogIn, LogOut, User, Settings, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'

export function Navbar() {
    const pathname = usePathname()
    const router = useRouter()
    const { t, language, setLanguage } = useI18n()
    const [runningDemo, setRunningDemo] = useState(false)
    const [demoResult, setDemoResult] = useState<any>(null)
    const [showUserMenu, setShowUserMenu] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    const { user, isAuthenticated, logout, isLoading } = useAuth()

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const navItems = [
        { name: t.dashboard, href: '/dashboard' },
        { name: t.clinical, href: '/clinical' },
        { name: t.intelligence, href: '/intelligence' },
        { name: t.community, href: '/community' },
        { name: t.screening, href: '/screening' },
        { name: t.reports, href: '/reports' },
    ]

    const handleRunDemo = async () => {
        setRunningDemo(true)
        try {
            const res = await fetch(`${API_URL}/demo/run`, { method: 'POST' })
            const data = await res.json()
            setDemoResult(data)
            setTimeout(() => setDemoResult(null), 5000)
        } catch (e) {
            console.error("Demo failed", e)
        } finally {
            setRunningDemo(false)
        }
    }

    const handleLogout = () => {
        logout()
        setShowUserMenu(false)
        router.push('/')
    }

    // Hide navbar on login/register pages
    if (pathname === '/login' || pathname === '/register') {
        return null
    }

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 w-full z-50 border-b border-[#0B3D33]/10 bg-white/80 backdrop-blur-md px-8 py-5 flex justify-between items-center"
        >
            <Link href="/" className="text-2xl font-black tracking-tighter flex items-center gap-2 group">
                <div className="w-9 h-9 bg-[#0B3D33] flex items-center justify-center transform group-hover:rotate-45 transition-transform duration-500">
                    <span className="text-[#D4AF37] text-lg font-serif">T</span>
                </div>
                <span className="font-serif tracking-widest text-[#0B3D33]">TARANG</span>
            </Link>

            <div className="hidden md:flex gap-12 font-bold uppercase text-[11px] tracking-[0.2em] items-center">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "relative py-1 group transition-colors",
                            pathname === item.href ? "text-[#D4AF37]" : "text-[#0B3D33] hover:text-[#D4AF37]"
                        )}
                    >
                        {item.name}
                        <span className={cn(
                            "absolute bottom-0 left-0 w-full h-[2px] bg-[#D4AF37] transform origin-left transition-transform duration-300",
                            pathname === item.href ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                        )} />
                    </Link>
                ))}
            </div>

            <div className="flex items-center gap-6">
                <button
                    onClick={handleRunDemo}
                    disabled={runningDemo}
                    className="hidden lg:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-[#D4AF37] text-[#0B3D33] px-4 py-2 hover:bg-[#0B3D33] hover:text-[#D4AF37] transition-all disabled:opacity-50"
                >
                    {runningDemo ? "Orchestrating..." : <><Play className="w-3 h-3" /> Run_Full_Demo</>}
                </button>

                <div className="flex items-center gap-2 border-x border-[#0B3D33]/10 px-6">
                    <button
                        onClick={() => setLanguage('en')}
                        className={cn("text-[10px] font-black uppercase", language === 'en' ? "text-[#D4AF37]" : "opacity-30")}
                    >EN</button>
                    <span className="opacity-10">|</span>
                    <button
                        onClick={() => setLanguage('hi')}
                        className={cn("text-[10px] font-black uppercase", language === 'hi' ? "text-[#D4AF37]" : "opacity-30")}
                    >HI</button>
                </div>

                {/* Auth Section */}
                {isLoading ? (
                    <div className="w-10 h-10 border-2 border-[#0B3D33]/20 animate-pulse" />
                ) : isAuthenticated && user ? (
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-2 group"
                        >
                            <div className="w-10 h-10 border-2 border-[#0B3D33] flex items-center justify-center font-black text-xs bg-[#0B3D33] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0B3D33] transition-all">
                                {user.initials}
                            </div>
                            <ChevronDown className={cn("w-4 h-4 text-[#0B3D33]/60 transition-transform", showUserMenu && "rotate-180")} />
                        </button>

                        <AnimatePresence>
                            {showUserMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute right-0 top-14 bg-white border-2 border-[#0B3D33]/10 shadow-xl min-w-[200px] z-50"
                                >
                                    <div className="p-4 border-b border-[#0B3D33]/10">
                                        <p className="font-bold text-sm text-[#0B3D33]">{user.name}</p>
                                        <p className="text-xs text-[#0B3D33]/50">{user.email}</p>
                                        <span className="inline-block mt-2 text-[8px] font-black uppercase tracking-widest bg-[#D4AF37]/20 text-[#0B3D33] px-2 py-1">
                                            {user.role}
                                        </span>
                                    </div>
                                    <div className="py-2">
                                        <Link
                                            href="/profile"
                                            onClick={() => setShowUserMenu(false)}
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-[#FDFCF8] transition-colors"
                                        >
                                            <User className="w-4 h-4 text-[#0B3D33]/60" />
                                            <span className="text-sm font-medium">Profile</span>
                                        </Link>
                                        <Link
                                            href="/settings"
                                            onClick={() => setShowUserMenu(false)}
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-[#FDFCF8] transition-colors"
                                        >
                                            <Settings className="w-4 h-4 text-[#0B3D33]/60" />
                                            <span className="text-sm font-medium">Settings</span>
                                        </Link>
                                    </div>
                                    <div className="border-t border-[#0B3D33]/10 py-2">
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors w-full text-left"
                                        >
                                            <LogOut className="w-4 h-4 text-red-500" />
                                            <span className="text-sm font-medium text-red-600">Sign Out</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <Link
                        href="/login"
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border-2 border-[#0B3D33] text-[#0B3D33] px-4 py-2 hover:bg-[#0B3D33] hover:text-[#D4AF37] transition-all"
                    >
                        <LogIn className="w-3 h-3" /> Login
                    </Link>
                )}
            </div>

            <AnimatePresence>
                {demoResult && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-10 right-10 bg-[#0B3D33] text-[#FDFCF8] p-8 border-2 border-[#D4AF37] shadow-2xl z-[100] max-w-md"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <CheckCircle className="w-6 h-6 text-[#D4AF37]" />
                            <h4 className="text-xl font-serif font-black uppercase tracking-tighter">Demo Loop Success</h4>
                        </div>
                        <div className="space-y-3 font-mono text-[10px] opacity-80">
                            {demoResult.steps.map((s: any, i: number) => (
                                <div key={i} className="flex justify-between border-b border-white/5 pb-1">
                                    <span>{s.step}</span>
                                    <span className="text-[#D4AF37]">{s.agent}</span>
                                </div>
                            ))}
                        </div>
                        <p className="mt-6 text-[9px] font-black uppercase tracking-widest text-[#D4AF37]">Time: {demoResult.total_time}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    )
}
