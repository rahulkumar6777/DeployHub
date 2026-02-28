import { useState } from 'react'
import useReveal from '../components/useReveal'
import PlanCard from '../components/PlanCard'
import FaqItem from '../components/FaqItem'

const PLANS = [
  {
    name:      'Free',
    desc:      'Perfect for side projects and learning. No card needed.',
    monthly:   0,
    annual:    0,
    highlight: false,
    badge:     null,
    features: [
      { label: '3 Projects',               ok: true  },
      { label: '2,000 Monthly Requests',   ok: true  },
      { label: 'Static Website Hosting',   ok: true  },
      { label: 'Node.js Hosting',          ok: true  },
      { label: '512 MB RAM per app',       ok: true  },
      { label: '0.1 vCPU per app',         ok: true  },
      { label: 'Free SSL / HTTPS',         ok: true  },
      { label: 'Custom Domain',            ok: false },
      { label: 'Priority Support',         ok: false },
      { label: 'Team Members',             ok: false },
    ],
    cta:      'Deploy for Free',
    ctaStyle: 'outline',
  },
  {
    name:      'Pro',
    desc:      'For serious makers who need more projects and traffic.',
    monthly:   9,
    annual:    7,
    highlight: true,
    badge:     'Most Popular',
    features: [
      { label: 'Unlimited Projects',          ok: true  },
      { label: '100,000 Monthly Requests',    ok: true  },
      { label: 'Static Website Hosting',      ok: true  },
      { label: 'Node.js Hosting',             ok: true  },
      { label: '2 GB RAM per app',            ok: true  },
      { label: '1 vCPU per app',              ok: true  },
      { label: 'Free SSL / HTTPS',            ok: true  },
      { label: 'Custom Domain',               ok: true  },
      { label: 'Priority Support',            ok: true  },
      { label: 'Team Members',               ok: false },
    ],
    cta:      'Get Pro',
    ctaStyle: 'solid',
  },
  {
    name:      'Team',
    desc:      'For small teams shipping multiple products together.',
    monthly:   29,
    annual:    23,
    highlight: false,
    badge:     null,
    features: [
      { label: 'Unlimited Projects',          ok: true },
      { label: '500,000 Monthly Requests',    ok: true },
      { label: 'Static Website Hosting',      ok: true },
      { label: 'Node.js Hosting',             ok: true },
      { label: '4 GB RAM per app',            ok: true },
      { label: '2 vCPU per app',              ok: true },
      { label: 'Free SSL / HTTPS',            ok: true },
      { label: 'Custom Domain',              ok: true },
      { label: 'Priority Support',           ok: true },
      { label: '5 Team Members',             ok: true },
    ],
    cta:      'Get Team',
    ctaStyle: 'outline',
  },
]

const FAQS = [
  {
    q: 'What counts as a request?',
    a: 'Every HTTP request your app receives — page loads, API calls, assets — is counted toward your monthly limit.',
  },
  {
    q: 'Can I upgrade or downgrade anytime?',
    a: 'Yes. Upgrades take effect immediately. Downgrades apply at the next billing cycle.',
  },
  {
    q: 'What happens if I exceed my request limit?',
    a: 'We notify you at 80% and 100%. On Free, requests above the limit may be throttled. On paid plans, we never cut you off.',
  },
  {
    q: 'Do you support databases?',
    a: 'Not yet — but it is coming. For now you can connect to any external DB (PlanetScale, Supabase, MongoDB Atlas).',
  },
]

export default function Pricing() {
  useReveal()
  const [annual, setAnnual] = useState(false)

  return (
    <div className="min-h-screen pt-24">

      {/* ── HEADER ─────────────────────────────────────── */}
      <section className="py-20 px-6 text-center">
        <div className="reveal mb-4 text-[#00e5ff] text-xs font-semibold tracking-[0.2em] uppercase">
          Pricing
        </div>
        <h1 className="reveal font-syne font-black text-5xl md:text-6xl tracking-tight mb-4">
          Simple, honest pricing.
        </h1>
        <p className="reveal text-gray-400 text-lg max-w-lg mx-auto mb-10 font-light">
          Start free forever. Upgrade only when you need more. No tricks.
        </p>

        {/* Monthly / Annual toggle */}
        <div className="reveal inline-flex items-center gap-1 bg-[#111827] border border-white/5 p-1 rounded-xl mb-16">
          <button
            onClick={() => setAnnual(false)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              !annual ? 'bg-[#00e5ff] text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              annual ? 'bg-[#00e5ff] text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            Annual
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                annual ? 'bg-black/20 text-black' : 'bg-emerald-400/20 text-emerald-400'
              }`}
            >
              Save 20%
            </span>
          </button>
        </div>

        {/* Plans */}
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 text-left">
          {PLANS.map((plan, i) => (
            <PlanCard
              key={plan.name}
              plan={plan}
              annual={annual}
              delay={i * 100}
            />
          ))}
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────── */}
      <section className="py-20 px-6 max-w-3xl mx-auto">
        <h2 className="reveal font-syne font-black text-3xl text-center mb-12">
          Frequently asked
        </h2>
        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <FaqItem key={i} q={faq.q} a={faq.a} delay={i * 80} />
          ))}
        </div>
      </section>

    </div>
  )
}