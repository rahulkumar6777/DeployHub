import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import useReveal from '../components/useReveal'

const FEATURES = [
  { icon: '⚡', label: 'Instant Deploys',    desc: 'Push your code and go live in under 60 seconds.' },
  { icon: '🔒', label: 'Free SSL / HTTPS',  desc: "Automatic Let's Encrypt certificates for every project." },
  { icon: '📊', label: 'Request Tracking',  desc: 'Every HTTP request is counted so you always know your usage.' },
  { icon: '🌐', label: 'Static + Node.js',  desc: 'Host static sites and Node.js backends under one dashboard.' },
  { icon: '💾', label: 'Managed Runtime',   desc: '512 MB RAM and 0.1 CPU per app on free — zero config.' },
  { icon: '🔄', label: 'Auto Restart',      desc: "App crashed? DeployHub restarts it silently in seconds." },
]

export default function Home() {
  useReveal()

  const [count, setCount] = useState(0)
  useEffect(() => {
    const target = 2847
    let current = 0
    const step = Math.ceil(target / 60)
    const timer = setInterval(() => {
      current += step
      if (current >= target) { setCount(target); clearInterval(timer) }
      else setCount(current)
    }, 30)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen">

      {/* ── HERO ───────────────────────────────────────── */}
      <section className="relative min-h-screen grid-bg flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 overflow-hidden">
        {/* Background orbs */}
        <div className="orb w-[600px] h-[600px] bg-cyan-500/10 top-10 left-1/2 -translate-x-1/2" />
        <div className="orb w-[400px] h-[400px] bg-violet-600/10 bottom-0 right-0" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 border border-[#00e5ff]/25 bg-[#00e5ff]/5 text-[#00e5ff] px-4 py-1.5 rounded-full text-xs font-semibold mb-8 tracking-wider uppercase animate-fadeup">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-pulse-slow inline-block" />
          Early Access — Join Free
        </div>

        {/* Heading */}
        <h1
          className="font-syne font-black text-5xl md:text-7xl lg:text-8xl tracking-tighter leading-[0.95] mb-6"
          style={{ animation: 'fadeUp 0.6s 0.1s ease both' }}
        >
          Host Your Projects.<br />
          <span className="grad-text">No BS. Just Works.</span>
        </h1>

        {/* Sub */}
        <p
          className="text-gray-400 text-lg md:text-xl max-w-xl leading-relaxed mb-10 font-light"
          style={{ animation: 'fadeUp 0.6s 0.2s ease both' }}
        >
          Deploy static websites &amp; Node.js apps in seconds. Free tier forever.
          No credit card, no complicated dashboards.
        </p>

        {/* Buttons */}
        <div
          className="flex flex-wrap gap-4 justify-center"
          style={{ animation: 'fadeUp 0.6s 0.3s ease both' }}
        >
          <Link
            to="/pricing"
            className="bg-[#00e5ff] text-black font-bold px-8 py-3.5 rounded-xl text-sm
                       hover:bg-cyan-300 transition-all hover:-translate-y-1
                       hover:shadow-2xl hover:shadow-cyan-500/30"
          >
            Deploy for Free →
          </Link>
          <Link
            to="/about"
            className="border border-white/10 text-white font-medium px-8 py-3.5 rounded-xl text-sm
                       hover:border-white/30 hover:bg-white/5 transition-all"
          >
            How It Works
          </Link>
        </div>

        {/* Stats */}
        <div
          className="mt-16 flex gap-12 flex-wrap justify-center"
          style={{ animation: 'fadeUp 0.6s 0.4s ease both' }}
        >
          {[
            { num: `${count.toLocaleString()}+`, label: 'Projects Deployed' },
            { num: '99.9%',                      label: 'Uptime SLA' },
            { num: '<1s',                         label: 'Deploy Time' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="font-syne font-black text-3xl text-[#00e5ff]">{stat.num}</div>
              <div className="text-xs text-gray-500 mt-1 tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      
      <section className="py-28 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16 reveal">
          <div className="text-[#00e5ff] text-xs font-semibold tracking-[0.2em] uppercase mb-3">
            Everything You Need
          </div>
          <h2 className="font-syne font-black text-4xl md:text-5xl tracking-tight">
            Built for real projects.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div
              key={f.label}
              className="reveal feature-hover bg-[#111827] border border-white/5 rounded-2xl p-6 cursor-default"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="w-10 h-10 rounded-xl bg-[#00e5ff]/10 flex items-center justify-center text-lg mb-4">
                {f.icon}
              </div>
              <h3 className="font-syne font-bold text-base mb-2">{f.label}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto reveal">
          <div className="bg-gradient-to-r from-[#00e5ff]/10 via-[#7c3aed]/10 to-[#00e5ff]/10 border border-[#00e5ff]/20 rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="orb w-64 h-64 bg-[#00e5ff]/10 -top-10 -left-10" />
            <h2 className="font-syne font-black text-4xl tracking-tight mb-4 relative z-10">
              Ready to ship?
            </h2>
            <p className="text-gray-400 mb-8 relative z-10">
              Start for free. No card needed. 3 projects waiting for you.
            </p>
            <Link
              to="/pricing"
              className="inline-block bg-[#00e5ff] text-black font-bold px-10 py-3.5 rounded-xl
                         hover:bg-cyan-300 transition-all hover:-translate-y-1
                         hover:shadow-2xl hover:shadow-cyan-500/30 relative z-10"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}