import { Link } from 'react-router-dom'

/**
 * PlanCard — a single pricing tier card.
 *
 * Props:
 *   plan    {object}  Plan data (see shape below)
 *   annual  {boolean} Show annual price instead of monthly
 *   delay   {number}  CSS transition-delay in ms
 *
 * Plan shape:
 * {
 *   name:      string
 *   desc:      string
 *   monthly:   number
 *   annual:    number
 *   highlight: boolean   — featured border + glow
 *   badge:     string | null
 *   features:  { label: string, ok: boolean }[]
 *   cta:       string
 *   ctaStyle:  'solid' | 'outline'
 * }
 */
export default function PlanCard({ plan, annual, delay = 0 }) {
  return (
    <div
      className={`reveal plan-hover rounded-2xl p-7 relative transition-all duration-300 ${
        plan.highlight
          ? 'bg-[#111827] border-2 border-[#00e5ff]/50 shadow-2xl shadow-cyan-500/10'
          : 'bg-[#111827] border border-white/5'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Featured badge */}
      {plan.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-to-r from-[#00e5ff] to-[#7c3aed] text-black text-xs font-black px-4 py-1 rounded-full tracking-wide uppercase">
            {plan.badge}
          </span>
        </div>
      )}

      {/* Name & description */}
      <div className="font-syne font-black text-xl mb-1">{plan.name}</div>
      <p className="text-gray-500 text-sm mb-5 leading-relaxed">{plan.desc}</p>

      {/* Price */}
      <div className="flex items-end gap-1 mb-6">
        <span className="text-gray-400 text-lg mb-1">$</span>
        <span className="font-syne font-black text-5xl leading-none">
          {annual ? plan.annual : plan.monthly}
        </span>
        <span className="text-gray-500 text-sm mb-1">/mo</span>
      </div>

      {/* Feature list */}
      <ul className="space-y-3 mb-7">
        {plan.features.map(feature => (
          <li
            key={feature.label}
            className={`flex items-center gap-3 text-sm ${
              feature.ok ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 ${
                feature.ok
                  ? 'bg-emerald-400/20 text-emerald-400'
                  : 'bg-white/5 text-gray-600'
              }`}
            >
              {feature.ok ? '✓' : '–'}
            </span>
            {feature.label}
          </li>
        ))}
      </ul>

      {/* CTA button */}
      <Link
        to="#"
        className={`block text-center py-3 rounded-xl text-sm font-bold transition-all ${
          plan.ctaStyle === 'solid'
            ? 'bg-[#00e5ff] text-black hover:bg-cyan-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-500/30'
            : 'border border-white/10 text-white hover:border-[#00e5ff]/50 hover:text-[#00e5ff]'
        }`}
      >
        {plan.cta}
      </Link>
    </div>
  )
}