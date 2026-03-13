import { useState, useEffect, useRef } from 'react'
import useReveal from '../components/useReveal'

const TERMINAL_LINES = [
  { prompt: true,  text: 'deployhub connect github Rahulkumar6777/my-app', color: 'text-gray-200' },
  { prompt: false, text: '  ✔ GitHub repo linked',                          color: 'text-emerald-400' },
  { prompt: false, text: '  Cloning repository...',                         color: 'text-gray-500' },
  { prompt: false, text: '  ✔ Node.js 20 detected',                        color: 'text-emerald-400' },
  { prompt: false, text: '  Building Docker image...',                      color: 'text-gray-500' },
  { prompt: false, text: '  ✔ Image pushed to registry',                   color: 'text-emerald-400' },
  { prompt: false, text: '  Starting container...',                         color: 'text-gray-500' },
  { prompt: false, text: '  ✔ SSL provisioned automatically',              color: 'text-emerald-400' },
  { prompt: false, text: '  ✔ App is live! 🚀',                           color: 'text-emerald-400' },
  { prompt: false, text: '',                                                color: '' },
  { prompt: true,  text: 'echo $LIVE_URL',                                 color: 'text-gray-200' },
  { prompt: false, text: '  https://my-app.deployhub.online',              color: 'text-[#00e5ff]' },
]

const HOW_IT_WORKS = [
  {
    n: '01',
    title: 'Connect GitHub',
    desc: 'Link your GitHub repo. We clone it on every deploy — no manual uploads, no CLI needed.',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
      </svg>
    )
  },
  {
    n: '02',
    title: 'We Build It',
    desc: 'Your app is containerised with Docker. Dependencies installed, image pushed to registry automatically.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"/>
      </svg>
    )
  },
  {
    n: '03',
    title: 'Goes Live Instantly',
    desc: 'Unique subdomain assigned. SSL auto-provisioned via Let\'s Encrypt. Custom domains supported.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253"/>
      </svg>
    )
  },
  {
    n: '04',
    title: 'We Monitor It',
    desc: 'Real-time logs streamed via Redis. Every request counted. Crash? Auto-restart. You just build.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/>
      </svg>
    )
  },
]

const STACK = [
  { label: 'Runtime',   value: 'Node.js / Static' },
  { label: 'Container', value: 'Docker' },
  { label: 'Proxy',     value: 'Custom Router + Nginx' },
  { label: 'SSL',       value: "Let's Encrypt (auto)" },
  { label: 'Logs',      value: 'Redis Pub/Sub + Socket.IO' },
  { label: 'Storage',   value: 'MinIO (S3-compatible)' },
  { label: 'Queue',     value: 'BullMQ' },
  { label: 'Database',  value: 'MongoDB' },
]

const VALUES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/>
      </svg>
    ),
    title: 'Simple by Design',
    desc: "If you need to read docs to deploy, we've failed. GitHub connect → live. That's the entire flow."
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75"/>
      </svg>
    ),
    title: 'Transparent Pricing',
    desc: 'Every limit shown upfront. No surprise bills, no locked features. Free tier is actually free.'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"/>
      </svg>
    ),
    title: 'Built by Developers',
    desc: "We run DeployHub on DeployHub. Every pain point you feel, we feel too. That's why we fix them."
  },
]

export default function About() {
  useReveal()
  const [typedLines, setTypedLines] = useState([])
  const [cursorVisible, setCursorVisible] = useState(true)

  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      if (i < TERMINAL_LINES.length) {
        const line = TERMINAL_LINES[i]
        i++
        setTypedLines(prev => [...prev, line])
      } else {
        clearInterval(timer)
      }
    }, 280)
    return () => clearInterval(timer)
  }, [])

  // Blinking cursor
  useEffect(() => {
    const blink = setInterval(() => setCursorVisible(v => !v), 500)
    return () => clearInterval(blink)
  }, [])

  return (
    <div className="min-h-screen pt-24 overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="reveal mb-4">
          <span className="inline-flex items-center gap-2 text-[#00e5ff] text-xs font-semibold tracking-[0.2em] uppercase">
            <span className="w-4 h-px bg-[#00e5ff]" />
            About DeployHub
          </span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left */}
          <div>
            <h1 className="reveal font-syne font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05] mb-6">
              Deploy from GitHub.<br />
              <span className="grad-text">Live in seconds.</span>
            </h1>
            <p className="reveal text-gray-400 text-base sm:text-lg leading-relaxed mb-5 font-light">
              DeployHub is a self-hosted cloud deployment platform. Connect your GitHub repo,
              we clone it, containerise it with Docker, provision SSL automatically, and
              assign a live subdomain — all without you touching a server.
            </p>
            <p className="reveal text-gray-500 text-sm sm:text-base leading-relaxed font-light mb-8">
              Real-time build logs stream as your app builds. Custom domains with auto SSL.
              Request tracking, rate limiting, per-project metrics — all built in.
            </p>

            {/* Stack badges */}
            <div className="reveal grid grid-cols-2 gap-2">
              {STACK.map(s => (
                <div key={s.label} className="flex items-center gap-2 bg-[#111827] border border-white/5 rounded-lg px-3 py-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shrink-0" />
                  <span className="text-gray-500 text-xs">{s.label}:</span>
                  <span className="text-gray-300 text-xs font-medium truncate">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — terminal */}
          <div className="reveal">
            <div className="bg-[#070b14] rounded-2xl overflow-hidden border border-white/[0.07] shadow-2xl shadow-black/70">
              {/* Title bar */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5 bg-[#0d1117]">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                <span className="ml-auto text-[10px] text-gray-600 font-mono tracking-wider">
                  deployhub • build pipeline
                </span>
              </div>
              {/* Body */}
              <div className="p-5 font-mono text-xs sm:text-sm leading-[1.9] min-h-[300px]">
                {typedLines.map((line, i) => (
                  <div key={i} className={line.color || 'text-gray-300'}>
                    {line.prompt && (
                      <span className="text-[#00e5ff] select-none">❯ </span>
                    )}
                    {line.text}
                  </div>
                ))}
                {typedLines.length < TERMINAL_LINES.length && (
                  <div className="text-gray-300">
                    <span className="text-[#00e5ff] select-none">❯ </span>
                    <span
                      className="inline-block w-2 h-4 bg-[#00e5ff] align-middle"
                      style={{ opacity: cursorVisible ? 1 : 0, transition: 'opacity 0.1s' }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-[#0d1117] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 reveal">
            <div className="inline-flex items-center gap-2 text-[#00e5ff] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
              <span className="w-4 h-px bg-[#00e5ff]" />
              Process
              <span className="w-4 h-px bg-[#00e5ff]" />
            </div>
            <h2 className="font-syne font-black text-3xl sm:text-4xl tracking-tight">How it works</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div
                key={step.n}
                className="reveal relative bg-[#111827] border border-white/5 rounded-2xl p-6 hover:border-[#00e5ff]/20 transition-colors duration-300 group"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                {/* Connector */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-gradient-to-r from-[#00e5ff]/40 to-transparent z-10" />
                )}

                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded-xl bg-[#00e5ff]/10 border border-[#00e5ff]/20 flex items-center justify-center text-[#00e5ff] group-hover:bg-[#00e5ff]/15 transition-colors">
                    {step.icon}
                  </div>
                  <span className="font-syne font-black text-3xl text-[#00e5ff]/10 group-hover:text-[#00e5ff]/20 transition-colors">
                    {step.n}
                  </span>
                </div>

                <h3 className="font-syne font-bold text-sm sm:text-base mb-2">{step.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ───────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-10 sm:mb-14 reveal">
          <div className="inline-flex items-center gap-2 text-[#00e5ff] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            <span className="w-4 h-px bg-[#00e5ff]" />
            Principles
            <span className="w-4 h-px bg-[#00e5ff]" />
          </div>
          <h2 className="font-syne font-black text-3xl sm:text-4xl tracking-tight">What we stand for</h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
          {VALUES.map((v, i) => (
            <div
              key={v.title}
              className="reveal group relative bg-[#111827] border border-white/5 rounded-2xl p-6 sm:p-8 overflow-hidden hover:border-[#00e5ff]/20 transition-all duration-300"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {/* Glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#00e5ff]/0 to-[#00e5ff]/0 group-hover:from-[#00e5ff]/5 group-hover:to-transparent transition-all duration-500 rounded-2xl pointer-events-none" />

              <div className="w-10 h-10 rounded-xl bg-[#00e5ff]/10 border border-[#00e5ff]/20 flex items-center justify-center text-[#00e5ff] mb-5 group-hover:bg-[#00e5ff]/15 transition-colors">
                {v.icon}
              </div>
              <h3 className="font-syne font-bold text-base sm:text-lg mb-2">{v.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BUILT ON ─────────────────────────────── */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto text-center reveal">
          <p className="text-gray-600 text-xs tracking-[0.2em] uppercase mb-6 font-semibold">
            Infrastructure stack
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {['Node.js', 'Docker', 'Redis', 'MongoDB', 'BullMQ', 'Socket.IO', 'Nginx', 'MinIO', "Let's Encrypt"].map(tech => (
              <span
                key={tech}
                className="text-gray-500 text-xs sm:text-sm font-mono border border-white/5 rounded-lg px-3 py-1.5 bg-[#111827] hover:text-gray-300 hover:border-white/10 transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}