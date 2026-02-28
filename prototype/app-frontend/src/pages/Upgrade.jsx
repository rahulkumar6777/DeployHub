import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { PLAN_LIMITS } from '../constant/planLimits'
import SubscriptionPaymentGateway from '../components/SubscriptionPaymentGateway'

const BASE_PRICE = 799

const DISCOUNTS = {
  1:  0,
  3:  4,
  6:  8,
  12: 10,
  24: 15,
}

const DURATION_LABELS = {
  1:  '1 Month',
  3:  '3 Months',
  6:  '6 Months',
  12: '1 Year',
  24: '2 Years',
}

const PLANS = [
  {
    key: 'free',
    name: 'Free',
    priceLabel: '₹0',
    period: 'forever',
    desc: 'Get started with the basics.',
    features: [
      { label: '3 Projects' },
      { label: '2,000 requests / mo' },
      { label: '512MB RAM per project' },
      { label: '0.1 vCPU per project' },
      { label: 'Free SSL' },
      { label: 'nesthost.app subdomain' },
      { label: 'Custom domain', no: true },
    ],
  },
  {
    key: 'pro',
    name: 'Pro',
    period: 'per month',
    desc: 'For serious projects and teams.',
    badge: 'Most Popular',
    features: [
      { label: '10 Projects' },
      { label: '1,00,000 requests / mo' },
      { label: '2GB RAM per project' },
      { label: '1 vCPU per project' },
      { label: 'Free SSL' },
      { label: 'Custom domain included' },
      { label: 'Priority support' },
    ],
  },
]

function Check({ no }) {
  if (no) return (
    <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#374151' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
  return (
    <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#00e5ff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  )
}

// ── Duration selector ─────────────────────────────────────
function DurationSelector({ selected, onChange }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-black tracking-[0.15em] uppercase" style={{ color: '#4b5563' }}>Billing Duration</p>
        {DISCOUNTS[selected] > 0 && (
          <span className="text-[10px] font-black px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>
            {DISCOUNTS[selected]}% OFF
          </span>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2">
        {Object.entries(DISCOUNTS).map(([months, disc]) => {
          const m = parseInt(months)
          const isActive = selected === m
          return (
            <button key={m} onClick={() => onChange(m)}
              className="flex flex-col items-center py-2.5 px-1 rounded-xl transition-all duration-200 relative"
              style={isActive
                ? { background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.25)', color: '#00e5ff' }
                : { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: '#4b5563' }}>
              {disc > 0 && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] font-black px-1.5 py-0.5 rounded-full whitespace-nowrap"
                  style={{ background: isActive ? '#00e5ff' : '#1f2937', color: isActive ? '#000' : '#6b7280' }}>
                  -{disc}%
                </span>
              )}
              <span className="font-syne font-black text-sm">{m}</span>
              <span className="text-[9px] mt-0.5" style={{ color: isActive ? 'rgba(0,229,255,0.6)' : '#374151' }}>
                {m === 1 ? 'mo' : m === 12 ? 'yr' : m === 24 ? '2yr' : 'mo'}
              </span>
            </button>
          )
        })}
      </div>

      {/* Price breakdown */}
      <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <PriceBreakdown months={selected} />
      </div>
    </div>
  )
}

// ── Price breakdown ───────────────────────────────────────
function PriceBreakdown({ months }) {
  const disc      = DISCOUNTS[months]
  const perMonth  = Math.round(BASE_PRICE * (1 - disc / 100))
  const total     = perMonth * months
  const saved     = BASE_PRICE * months - total

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: '#4b5563' }}>
          ₹{BASE_PRICE} × {months} month{months > 1 ? 's' : ''}
        </span>
        <span className="text-xs" style={{ color: '#374151' }}>₹{BASE_PRICE * months}</span>
      </div>

      {disc > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: '#34d399' }}>Discount ({disc}%)</span>
          <span className="text-xs font-semibold" style={{ color: '#34d399' }}>−₹{saved}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <span className="text-sm font-bold text-white">Total</span>
        <div className="text-right">
          <span className="font-syne font-black text-lg" style={{ color: '#00e5ff' }}>₹{total}</span>
          {months > 1 && (
            <div className="text-[10px]" style={{ color: '#374151' }}>₹{perMonth}/mo effective</div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Plan card ─────────────────────────────────────────────
function PlanCard({ plan, isCurrent, months, onUpgrade }) {
  const isPro    = plan.key === 'pro'
  const disc     = DISCOUNTS[months]
  const perMonth = Math.round(BASE_PRICE * (1 - disc / 100))
  const total    = perMonth * months

  return (
    <div className="relative rounded-2xl flex flex-col transition-all duration-300 hover:-translate-y-1"
      style={{
        background: isPro
          ? 'linear-gradient(160deg, rgba(0,229,255,0.06) 0%, rgba(124,58,237,0.06) 100%)'
          : 'rgba(255,255,255,0.02)',
        border: isPro ? '1px solid rgba(0,229,255,0.2)' : '1px solid rgba(255,255,255,0.07)',
        boxShadow: isPro ? '0 0 40px rgba(0,229,255,0.05)' : 'none',
      }}>

      <div className="h-px w-full rounded-t-2xl"
        style={{ background: isPro ? 'linear-gradient(90deg, transparent, #00e5ff, transparent)' : 'transparent' }} />

      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="text-[10px] font-black tracking-[0.12em] uppercase px-3 py-1 rounded-full"
            style={{ background: '#00e5ff', color: '#000' }}>
            {plan.badge}
          </span>
        </div>
      )}

      <div className="p-6 flex flex-col flex-1">
        {/* Name */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-syne font-black text-base text-white">{plan.name}</span>
            {isCurrent && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.08)' }}>
                Current
              </span>
            )}
          </div>
          <p className="text-xs" style={{ color: '#4b5563' }}>{plan.desc}</p>
        </div>

        {/* Price */}
        <div className="mb-6">
          {isPro ? (
            <div>
              <div className="flex items-end gap-1.5">
                <span className="font-syne font-black text-4xl" style={{ color: '#00e5ff' }}>
                  ₹{perMonth}
                </span>
                <span className="text-sm pb-1.5" style={{ color: '#374151' }}>/mo</span>
                {disc > 0 && (
                  <span className="text-xs pb-1.5 line-through" style={{ color: '#374151' }}>₹{BASE_PRICE}</span>
                )}
              </div>
              {months > 1 && (
                <p className="text-xs mt-1" style={{ color: '#374151' }}>
                  Billed ₹{total} for {DURATION_LABELS[months]}
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-end gap-1.5">
              <span className="font-syne font-black text-4xl" style={{ color: '#9ca3af' }}>₹0</span>
              <span className="text-sm pb-1.5" style={{ color: '#374151' }}>/forever</span>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="space-y-3 flex-1 mb-6">
          {plan.features.map(f => (
            <div key={f.label} className="flex items-center gap-3">
              <Check no={f.no} />
              <span className="text-sm" style={{ color: f.no ? '#374151' : '#9ca3af' }}>{f.label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        {isCurrent ? (
          <div className="w-full py-3 rounded-xl text-center text-sm font-bold"
            style={{ background: 'rgba(255,255,255,0.03)', color: '#374151', border: '1px solid rgba(255,255,255,0.06)' }}>
            Active Plan
          </div>
        ) : isPro ? (
          <button onClick={onUpgrade}
            className="w-full py-3 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #00e5ff, #00b8cc)', boxShadow: '0 4px 20px rgba(0,229,255,0.25)' }}>
            Upgrade — ₹{total} {months > 1 ? `for ${DURATION_LABELS[months]}` : '/ mo'} →
          </button>
        ) : (
          <div className="w-full py-3 rounded-xl text-center text-sm font-bold"
            style={{ background: 'rgba(255,255,255,0.03)', color: '#374151', border: '1px solid rgba(255,255,255,0.06)' }}>
            Free Forever
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────
export function Upgrade() {
  const { user } = useAuth()
  const [months, setMonths] = useState(1)
  const [showPayment, setShowPayment] = useState(false)

  const currentPlan = user?.subscriptionid?.plan || 'free'
  const firstName   = user?.fullname?.split(' ')[0] || 'there'
  const limits      = PLAN_LIMITS[currentPlan]

  const disc    = DISCOUNTS[months]
  const total   = Math.round(BASE_PRICE * (1 - disc / 100)) * months

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }} className="space-y-6">

      {/* Header */}
      <div>
        <p className="text-xs font-bold tracking-[0.15em] uppercase mb-1.5" style={{ color: '#00e5ff' }}>Billing</p>
        <h1 className="font-syne font-black text-[28px] text-white leading-none mb-1">
          {currentPlan === 'pro' ? `You're on Pro, ${firstName} 🎉` : `Upgrade your plan, ${firstName}`}
        </h1>
        <p className="text-sm" style={{ color: '#4b5563' }}>
          {currentPlan === 'pro'
            ? 'You have access to all Pro features.'
            : 'Unlock more projects, requests, and resources.'}
        </p>
      </div>

      {/* Current plan summary */}
      <div className="rounded-2xl p-5"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.12)' }}>
              <svg className="w-4 h-4" style={{ color: '#00e5ff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white capitalize">{currentPlan} Plan</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(52,211,153,0.08)', color: '#34d399', border: '1px solid rgba(52,211,153,0.15)' }}>
                  Active
                </span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: '#374151' }}>
                {limits.projects} projects · {limits.requests.toLocaleString()} req/mo · {limits.ram}MB RAM per project
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="font-syne font-black text-lg text-white">
              {currentPlan === 'free' ? '₹0' : '₹799'}
            </div>
            <div className="text-[10px]" style={{ color: '#374151' }}>
              {currentPlan === 'free' ? 'forever' : 'per month'}
            </div>
          </div>
        </div>
      </div>

      {/* Duration selector — only show if not pro */}
      {currentPlan !== 'pro' && (
        <DurationSelector selected={months} onChange={setMonths} />
      )}

      {/* Plan cards */}
      <div className="grid sm:grid-cols-2 gap-5">
        {PLANS.map(plan => (
          <PlanCard
            key={plan.key}
            plan={plan}
            isCurrent={plan.key === currentPlan}
            months={months}
            onUpgrade={() => setShowPayment(true)}
          />
        ))}
      </div>

      {/* Payment modal */}
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(5,8,16,0.85)', backdropFilter: 'blur(12px)' }}>
          <div className="relative w-full max-w-sm rounded-2xl overflow-hidden"
            style={{ background: '#080c12', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, #00e5ff, transparent)' }} />
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-syne font-black text-white text-base">Pro Plan</h3>
                  <p className="text-xs mt-0.5" style={{ color: '#4b5563' }}>
                    {DURATION_LABELS[months]} · {disc > 0 ? `${disc}% off` : 'No discount'}
                  </p>
                </div>
                <button onClick={() => setShowPayment(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                  style={{ color: '#4b5563', background: 'rgba(255,255,255,0.04)' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = '#4b5563'}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <SubscriptionPaymentGateway
                months={months}
                description={`${DURATION_LABELS[months]} Pro Plan`}
                plan="pro"
                amount={total * 100}
              />
            </div>
          </div>
        </div>
      )}

      {/* FAQ */}
      <div className="rounded-2xl p-6 space-y-4"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <p className="text-[10px] font-black tracking-[0.15em] uppercase" style={{ color: '#374151' }}>Common Questions</p>
        {[
          { q: 'When am I charged?',            a: 'Once at purchase. No recurring charges — you choose the duration.' },
          { q: 'Can I downgrade back to Free?',  a: 'Yes — your plan downgrades when the purchased duration ends.' },
          { q: 'What payment methods?',           a: 'UPI, debit/credit cards, net banking via Razorpay.' },
          { q: 'Is the discount applied on renewal?', a: 'Discounts apply per purchase. Longer durations = bigger savings.' },
        ].map(faq => (
          <div key={faq.q} style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '1rem' }}>
            <div className="text-sm font-semibold text-white mb-1">{faq.q}</div>
            <div className="text-sm" style={{ color: '#4b5563' }}>{faq.a}</div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default Upgrade