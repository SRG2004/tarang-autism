"use client"
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Activity, Brain, ShieldCheck, Heart, Zap, Award } from 'lucide-react'
import { useRef } from 'react'

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 200])

  return (
    <main ref={containerRef} className="min-h-screen bg-[#FDFCF8] text-[#0B3D33] overflow-x-hidden pt-24">
      {/* Hero Section - Radical Asymmetry */}
      <section className="relative min-h-[90vh] flex items-center px-8 md:px-16 lg:px-24">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

          <div className="lg:col-span-12 relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-[clamp(4rem,15vw,12rem)] font-serif font-black leading-[0.85] tracking-tighter mb-12">
                EARLY <br />
                <span className="text-[#D4AF37] italic">VISION.</span> <br />
                PRECISION <br />
                <span className="relative">
                  CARE.
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="absolute -bottom-4 left-0 w-full h-4 bg-[#D4AF37]/20 origin-left"
                  />
                </span>
              </h1>
            </motion.div>
          </div>

          <div className="lg:col-span-7">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-2xl md:text-3xl font-light leading-relaxed max-w-2xl mb-12 text-[#0B3D33]/80"
            >
              Bridging the 5-year diagnosis gap with hybrid AI behavioral fusion.
              Because every day of early intervention shifts a lifetime.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="flex flex-wrap gap-6"
            >
              <Link href="/screening" className="group relative bg-[#0B3D33] text-[#D4AF37] px-10 py-6 text-xl font-black uppercase tracking-widest overflow-hidden">
                <span className="relative z-10 flex items-center gap-3">
                  Start Screening <ArrowRight className="group-hover:translate-x-2 transition-transform duration-500" />
                </span>
                <motion.div className="absolute inset-0 bg-[#D4AF37]/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </Link>

              <Link href="/dashboard" className="px-10 py-6 text-xl font-black uppercase tracking-widest border-2 border-[#0B3D33] hover:bg-[#0B3D33] hover:text-[#FDFCF8] transition-all duration-500">
                View Demo
              </Link>
            </motion.div>
          </div>

          <div className="lg:col-span-5 relative">
            <motion.div
              style={{ y: y1 }}
              className="aspect-[3/4] bg-[#0B3D33] relative group shadow-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620145648356-4c320054bc46?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center grayscale mix-blend-overlay opacity-60 group-hover:scale-110 transition-transform duration-[2s]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B3D33] via-transparent to-transparent" />

              <div className="absolute bottom-10 left-10 text-[#FDFCF8]">
                <p className="font-mono text-xs uppercase tracking-[0.3em] mb-2 text-[#D4AF37]">Behavioral_Analysis_V4</p>
                <h3 className="text-4xl font-serif font-bold leading-tight">Gaze Velocity <br /> Tracking</h3>
              </div>
            </motion.div>

            <motion.div
              style={{ y: y2 }}
              className="absolute -top-20 -right-12 w-64 p-8 bg-white border border-[#0B3D33]/10 shadow-2xl z-20 backdrop-blur-xl"
            >
              <Zap className="w-10 h-10 text-[#D4AF37] mb-4" />
              <p className="font-black text-sm uppercase tracking-widest mb-2">Multimodal</p>
              <p className="text-xs text-[#0B3D33]/60 leading-relaxed font-medium">Fusing Eye-Contact, Pose, and Sensory markers into a unified risk factor.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Section - Continuous Stream */}
      <section className="py-32 bg-[#0B3D33] text-[#FDFCF8] relative overflow-hidden">
        {/* Background Text Decor */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-[0.03] pointer-events-none select-none">
          <p className="text-[20rem] font-black tracking-tighter whitespace-nowrap -translate-x-1/4">AUTISM_CARE_CONTINUUM_TARANG</p>
        </div>

        <div className="px-8 md:px-16 lg:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-32">
            <div className="lg:col-span-6">
              <h2 className="text-7xl font-serif font-black tracking-tighter mb-8 leading-[0.9]">
                AGENTIC <br />
                <span className="text-[#D4AF37]">INTELLIGENCE.</span>
              </h2>
            </div>
            <div className="lg:col-span-6 flex items-end">
              <p className="text-2xl font-light text-[#FDFCF8]/60 leading-relaxed max-w-xl">
                Tarang isn't just a dashboard. It's an ecosystem of 4 specialized AI agents working autonomously across the care spectrum.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-24">
            {[
              {
                agent: "Screening Agent",
                title: "Early Risk Detection",
                icon: Activity,
                desc: "Analyzes asynchronous behavior videos and questionnaire data to flag early risk markers with weighted fusion scoring."
              },
              {
                agent: "Clinical Support",
                title: "Evidence Synthesizer",
                icon: ShieldCheck,
                desc: "Aggregates multimodal results into clinically vetted summaries, providing explainable insights for pediatric neurologists."
              },
              {
                agent: "Therapy Planning",
                title: "Personalized Paths",
                icon: Brain,
                desc: "Crafts adaptive intervention plans based on specific social and motor coordination metrics detected during screening."
              },
              {
                agent: "Progress Monitor",
                title: "Outcome Optimization",
                icon: Award,
                desc: "Longitudinally tracks improvement or regression, alerting stakeholders when intervention pivots are necessary."
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -20 }}
                className="group relative"
              >
                <div className="w-16 h-16 bg-[#D4AF37] flex items-center justify-center mb-8 transform group-hover:rotate-12 transition-transform duration-500">
                  <item.icon className="w-8 h-8 text-[#0B3D33]" />
                </div>
                <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#D4AF37] mb-4">{item.agent}</p>
                <h3 className="text-3xl font-serif font-bold mb-6">{item.title}</h3>
                <div className="h-[2px] w-12 bg-[#D4AF37] mb-6 group-hover:w-full transition-all duration-500" />
                <p className="text-[#FDFCF8]/50 font-medium leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Ethics - Massive Typographic Layout */}
      <section className="py-48 px-8 md:px-16 lg:px-24 bg-[#F9F7F2]">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-[clamp(3rem,8vw,6rem)] font-serif font-black leading-none tracking-tighter mb-16">
            ETHICAL BY <br />
            <span className="text-[#D4AF37]">ARCHITECTURE.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-left">
            <div>
              <Heart className="w-8 h-8 text-[#D4AF37] mb-6" />
              <h4 className="text-xl font-bold mb-4 uppercase tracking-widest">Pediatric First</h4>
              <p className="text-[#0B3D33]/60 leading-relaxed font-medium">Consent workflows built exclusively for legal guardians with full data transparency.</p>
            </div>
            <div>
              <ShieldCheck className="w-8 h-8 text-[#D4AF37] mb-6" />
              <h4 className="text-xl font-bold mb-4 uppercase tracking-widest">Data Isolation</h4>
              <p className="text-[#0B3D33]/60 leading-relaxed font-medium">Row-level security ensures that pediatric behavioral markers never leak across profiles.</p>
            </div>
            <div>
              <Activity className="w-8 h-8 text-[#D4AF37] mb-6" />
              <h4 className="text-xl font-bold mb-4 uppercase tracking-widest">Explainable AI</h4>
              <p className="text-[#0B3D33]/60 leading-relaxed font-medium">No black boxes. Every risk score includes source-signal attribution for clinician trust.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#0B3D33] text-[#FDFCF8]/40 py-20 px-8 md:px-16 lg:px-24 border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-12 max-w-7xl mx-auto">
          <div className="font-serif text-2xl font-bold text-[#FDFCF8]">TARANG</div>
          <div className="flex gap-12 font-bold uppercase text-[10px] tracking-widest">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/portal" className="hover:text-white transition-colors">Portal</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
          <p className="text-[10px] font-mono tracking-widest">© 2026 Submission for TELIPORT Season 3</p>
        </div>
      </footer>
    </main>
  )
}
