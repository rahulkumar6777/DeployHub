import { useState, useEffect } from 'react'
import useReveal from '../components/useReveal'

const TERMINAL_LINES = [
  { prompt: true,  text: 'DeployHub deploy ./my-app',           color: 'text-gray-200' },
  { prompt: false, text: '  Detecting project...',             color: 'text-gray-500' },
  { prompt: false, text: '  ✔ Node.js 20 detected',           color: 'text-emerald-400' },
  { prompt: false, text: '  Uploading 42 files...',            color: 'text-gray-500' },
  { prompt: false, text: '  ✔ Files ready',                   color: 'text-emerald-400' },
  { prompt: false, text: '  Starting container...',            color: 'text-gray-500' },
  { prompt: false, text: '  ✔ App is live! 🚀',              color: 'text-emerald-400' },
  { prompt: false, text: '',                                   color: '' },
  { prompt: true,  text: 'echo $URL',                         color: 'text-gray-200' },
  { prompt: false, text: '  https://my-app.DeployHub.app',     color: 'text-[#00e5ff]' },
]

const HOW_IT_WORKS = [
  { n: '01', title: 'Push Your Code',   desc: 'Use our CLI or drag-and-drop. Static files or Node.js — we detect it automatically.' },
  { n: '02', title: 'We Build It',      desc: 'Dependencies installed, your app containerised with 512 MB RAM and 0.1 CPU.' },
  { n: '03', title: 'It Goes Live',     desc: 'A unique subdomain is assigned. SSL provisioned. Accessible worldwide.' },
  { n: '04', title: 'We Monitor It',    desc: 'Every request is counted. If it crashes, it auto-restarts. You stay focused on building.' },
]

const VALUES = [
  { icon: '🎯', title: 'Simple by Design',    desc: "If you need to read docs to deploy, we've failed. Zero confusion is the goal." },
  { icon: '💡', title: 'Transparent Pricing', desc: 'Every limit documented upfront. No surprise bills, no locked features.' },
  { icon: '🤝', title: 'Developer First',     desc: "Built by developers, for developers. We use DeployHub for our own projects." },
]

export default function About() {
  useReveal()

  // Typewriter effect for terminal
  const [typedLines, setTypedLines] = useState([])

  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      if (i < TERMINAL_LINES.length) {
        const line = TERMINAL_LINES[i]  // capture before increment
        i++
        setTypedLines(prev => [...prev, line])
      } else {
        clearInterval(timer)
      }
    }, 300)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen pt-24">

      {/* ── HERO / INTRO ───────────────────────────────── */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="reveal mb-4">
          <span className="text-[#00e5ff] text-xs font-semibold tracking-[0.2em] uppercase">
            About DeployHub
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Left — text */}
          <div>
            <h1 className="reveal font-syne font-black text-5xl md:text-6xl tracking-tight leading-tight mb-6">
              Hosting that stays<br />
              <span className="grad-text">out of your way.</span>
            </h1>
            <p className="reveal text-gray-400 text-lg leading-relaxed mb-6 font-light">
              DeployHub was born from frustration. Too many hosting platforms have confusing UIs,
              hidden fees, and require you to be a DevOps engineer just to get an app online.
            </p>
            <p className="reveal text-gray-400 leading-relaxed font-light">
              We built DeployHub for makers who want to focus on their product — not infrastructure.
              One command, one dashboard, zero drama.
            </p>
          </div>

          {/* Right — animated terminal */}
          <div className="reveal">
            <div className="bg-[#0a0e1a] rounded-2xl overflow-hidden border border-white/5 shadow-2xl shadow-black/60">
              {/* Terminal title bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#111827]">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-auto text-xs text-gray-600 font-mono">DeployHub-cli v1.0</span>
              </div>
              {/* Terminal body */}
              <div className="p-5 font-mono text-sm leading-loose min-h-[280px]">
                {typedLines.map((line, i) => (
                  <div key={i} className={line.color || 'text-gray-200'}>
                    {line.prompt && <span className="text-[#00e5ff]">$ </span>}
                    {line.text}
                  </div>
                ))}
                {typedLines.length < TERMINAL_LINES.length && (
                  <div>
                    <span className="text-[#00e5ff]">$ </span>
                    <span className="cursor" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────── */}
      <section className="py-20 px-6 bg-[#0d1117] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 reveal">
            <div className="text-[#00e5ff] text-xs font-semibold tracking-[0.2em] uppercase mb-3">
              Process
            </div>
            <h2 className="font-syne font-black text-4xl tracking-tight">How it works</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div
                key={step.n}
                className="reveal relative"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {/* Connector line */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-[#00e5ff]/30 to-transparent z-10" />
                )}
                <div className="font-syne font-black text-5xl text-[#00e5ff]/15 mb-3">{step.n}</div>
                <h3 className="font-syne font-bold text-base mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ─────────────────────────────────────── */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12 reveal">
          <h2 className="font-syne font-black text-4xl tracking-tight">Our principles</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {VALUES.map((v, i) => (
            <div
              key={v.title}
              className="reveal bg-[#111827] border border-white/5 rounded-2xl p-8"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="text-3xl mb-4">{v.icon}</div>
              <h3 className="font-syne font-bold text-lg mb-2">{v.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}