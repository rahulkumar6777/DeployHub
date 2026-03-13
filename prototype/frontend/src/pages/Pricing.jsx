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
      { label: 'Per project pricing',          ok: true  },
      { label: '2,000 Requests / Day',          ok: true  },
      { label: 'Static Website Hosting',       ok: true  },
      { label: 'Node.js Hosting',              ok: true  },
      { label: '512 MB RAM per project',       ok: true  },
      { label: '0.1 vCPU per project',         ok: true  },
      { label: 'Free SSL / HTTPS',             ok: true  },
      { label: 'deployhub.online subdomain',       ok: true  },
      { label: 'Custom Domain',                ok: false },
      { label: 'Priority Support',             ok: false },
    ],
    cta:      'Deploy for Free',
    ctaStyle: 'outline',
  },
  {
    name:      'Pro',
    desc:      'For projects that need more power, traffic and a custom domain.',
    monthly:   799,
    annual:    null,
    highlight: true,
    badge:     'Most Popular',
    features: [
      { label: 'Per project pricing',          ok: true  },
      { label: '1,00,000 Requests / Day',       ok: true  },
      { label: 'Static Website Hosting',       ok: true  },
      { label: 'Node.js Hosting',              ok: true  },
      { label: '2 GB RAM per project',         ok: true  },
      { label: '1 vCPU per project',           ok: true  },
      { label: 'Free SSL / HTTPS',             ok: true  },
      { label: 'Custom Domain',                ok: true  },
      { label: 'Priority Support',             ok: true  },
      { label: 'Multi-month discounts',        ok: true  },
    ],
    cta:      'Upgrade Project',
    ctaStyle: 'solid',
  },
]

const DISCOUNTS = [
  { months: 1,  discount: 0  },
  { months: 3,  discount: 4  },
  { months: 6,  discount: 8  },
  { months: 12, discount: 10 },
  { months: 24, discount: 15 },
]

const FAQS = [
  {
    q: 'How does per-project pricing work?',
    a: 'Each project gets its own plan — Free or Pro. You choose the plan per project when deploying. You can have some projects on Free and others on Pro.',
  },
  {
    q: 'What counts as a request?',
    a: 'Every HTTP request your app receives — page loads, API calls, assets — is counted toward that project\'s monthly limit.',
  },
  {
    q: 'Can I upgrade a project anytime?',
    a: 'Yes. You can upgrade any project from Free to Pro at any time from your project settings or billing page.',
  },
  {
    q: 'What happens if I exceed the request limit?',
    a: 'We notify you at 80% usage. On Free projects, requests above the limit may be throttled. Pro projects are never cut off.',
  },
  {
    q: 'Do multi-month discounts apply?',
    a: 'Yes — Pro plan supports 1, 3, 6, 12 and 24 month billing. Longer commitments get up to 15% off.',
  },
  {
    q: 'Do you support databases?',
    a: 'Not yet — but it is coming. For now you can connect to any external DB (PlanetScale, Supabase, MongoDB Atlas).',
  },
]

export default function Pricing() {
  useReveal()

  return (
    <div className="min-h-screen pt-24">

      {/* ── HEADER ─────────────────────────────────────── */}
      <section className="py-20 px-6 text-center">
        <div className="reveal mb-4 text-[#00e5ff] text-xs font-semibold tracking-[0.2em] uppercase">
          Pricing
        </div>
        <h1 className="reveal font-syne font-black text-5xl md:text-6xl tracking-tight mb-4">
          Pay per project.
        </h1>
        <p className="reveal text-gray-400 text-lg max-w-lg mx-auto mb-4 font-light">
          Each project gets its own plan. Start free, upgrade only the projects that need more power.
        </p>
        <p className="reveal text-sm text-gray-600 mb-14">No account-level plans. No surprises.</p>

        {/* Plans */}
        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6 text-left">
          {PLANS.map((plan, i) => (
            <PlanCard
              key={plan.name}
              plan={plan}
              annual={false}
              delay={i * 100}
            />
          ))}
        </div>
      </section>

      {/* ── DISCOUNT TABLE ──────────────────────────────── */}
      <section className="py-12 px-6 max-w-2xl mx-auto">
        <h2 className="reveal font-syne font-black text-2xl text-center mb-2">Pro — Multi-month discounts</h2>
        <p className="reveal text-sm text-center text-gray-500 mb-8">Commit longer, pay less per month.</p>
        <div className="reveal rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="grid grid-cols-3 px-5 py-3 text-[10px] font-black tracking-[0.15em] uppercase"
            style={{ background: 'rgba(255,255,255,0.03)', color: '#374151', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span>Duration</span>
            <span className="text-center">Discount</span>
            <span className="text-right">Total</span>
          </div>
          {DISCOUNTS.map((d, i) => {
            const perMonth = Math.round(799 * (1 - d.discount / 100))
            const total    = perMonth * d.months
            const saved    = 799 * d.months - total
            const isLast   = i === DISCOUNTS.length - 1
            return (
              <div key={d.months} className="grid grid-cols-3 px-5 py-3.5 items-center"
                style={{
                  borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.04)',
                  background: isLast ? 'rgba(0,229,255,0.03)' : 'transparent',
                }}>
                <span className="text-sm font-medium text-white">
                  {d.months === 1  ? '1 Month'  :
                   d.months === 3  ? '3 Months' :
                   d.months === 6  ? '6 Months' :
                   d.months === 12 ? '1 Year'   : '2 Years'}
                </span>
                <span className="text-center">
                  {d.discount > 0
                    ? <span className="text-xs font-black px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399' }}>
                        {d.discount}% OFF
                      </span>
                    : <span className="text-xs" style={{ color: '#374151' }}>—</span>
                  }
                </span>
                <div className="text-right">
                  <div className="text-sm font-bold" style={{ color: isLast ? '#00e5ff' : '#fff' }}>
                    ₹{total.toLocaleString()}
                  </div>
                  {saved > 0 && (
                    <div className="text-[10px]" style={{ color: '#374151' }}>
                      save ₹{saved.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
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