import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PLAN_LIMITS } from '../constant/planLimits'

const DUMMY_PLAN = 'free'
const limits = PLAN_LIMITS[DUMMY_PLAN]

const WEEK = [
  { day: 'Mon', v: 120 }, { day: 'Tue', v: 340 }, { day: 'Wed', v: 210 },
  { day: 'Thu', v: 480 }, { day: 'Fri', v: 390 }, { day: 'Sat', v: 150 }, { day: 'Sun', v: 157 },
]
const TOTAL_REQ = WEEK.reduce((s, d) => s + d.v, 0)
const MAX_BAR   = Math.max(...WEEK.map(d => d.v))

const PROJECTS = [
  { name: 'my-portfolio', status: 'live',    ram: 128, cpu: 0.02, ramLimit: 512, cpuLimit: 0.1 },
  { name: 'node-backend', status: 'live',    ram: 256, cpu: 0.05, ramLimit: 512, cpuLimit: 0.1 },
  { name: 'test-site',    status: 'stopped', ram: 0,   cpu: 0,    ramLimit: 512, cpuLimit: 0.1 },
]

// Animated counter
function Counter({ to }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let cur = 0; const step = to / 60
    const t = setInterval(() => { cur = Math.min(cur + step, to); setVal(Math.floor(cur)); if (cur >= to) clearInterval(t) }, 16)
    return () => clearInterval(t)
  }, [to])
  return <>{val.toLocaleString()}</>
}

// Circular progress ring
function Ring({ used, total, color = '#00e5ff', size = 88 }) {
  const p = Math.min((used / total) * 100, 100)
  const r = size / 2 - 7
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - p / 100)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
        strokeWidth="7" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1s ease' }} />
    </svg>
  )
}

function StatCard({ label, value, sub, color }) {
  return (
    <div className="rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-3" style={{ color: '#4b5563' }}>{label}</p>
      <div className="font-syne font-black text-2xl text-white mb-0.5" style={{ color: color || '#fff' }}>{value}</div>
      {sub && <div className="text-xs" style={{ color: '#374151' }}>{sub}</div>}
    </div>
  )
}

function UsageBar({ label, used, total, color = '#00e5ff', unit = '', note }) {
  const p = Math.min(Math.round((used / total) * 100), 100)
  const isWarn = p >= 80
  const barColor = isWarn ? '#f59e0b' : color
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{label}</span>
          {note && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.04)', color: '#4b5563' }}>{note}</span>}
        </div>
        <span className="text-xs font-bold" style={{ color: isWarn ? '#f59e0b' : '#9ca3af' }}>
          {used.toLocaleString()}{unit} <span style={{ color: '#374151' }}>/ {total === Infinity ? '∞' : total.toLocaleString()}{unit}</span>
          <span className="ml-1.5" style={{ color: '#4b5563' }}>({p}%)</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div className="h-full rounded-full" style={{ width: `${p}%`, background: barColor, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  )
}

export function Usage() {
  const [period, setPeriod] = useState('7d')
  const reqPct = Math.round((TOTAL_REQ / limits.requests) * 100)
  const isWarn = reqPct >= 80

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }} className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.15em] uppercase mb-1.5" style={{ color: '#00e5ff' }}>Analytics</p>
          <h1 className="font-syne font-black text-[28px] text-white leading-none">Usage</h1>
          <p className="text-sm mt-1.5" style={{ color: '#4b5563' }}>
            Billing cycle · Resets <span className="text-white font-medium">Feb 1</span>
          </p>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {[{ k: '7d', l: '7 Days' }, { k: '30d', l: '30 Days' }].map(t => (
            <button key={t.k} onClick={() => setPeriod(t.k)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={period === t.k
                ? { background: 'rgba(0,229,255,0.1)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.15)' }
                : { color: '#4b5563', border: '1px solid transparent' }}>
              {t.l}
            </button>
          ))}
        </div>
      </div>

      {/* Warning */}
      {isWarn && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.18)' }}>
          <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#f59e0b' }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-sm" style={{ color: '#f59e0b' }}>
            <strong>{TOTAL_REQ.toLocaleString()}</strong> of <strong>{limits.requests.toLocaleString()}</strong> requests used — {(limits.requests - TOTAL_REQ).toLocaleString()} remaining
          </span>
          <Link to="/billing" className="ml-auto text-xs font-black" style={{ color: '#f59e0b' }}>Upgrade →</Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Requests Used"  value={<Counter to={TOTAL_REQ} />} sub={`of ${limits.requests.toLocaleString()} / mo`} color={isWarn ? '#f59e0b' : '#00e5ff'} />
        <StatCard label="RAM per Project" value={`${limits.ram}MB`}          sub="allocated per project" />
        <StatCard label="CPU per Project" value={`${limits.cpu} vCPU`}       sub="allocated per project" />
        <StatCard label="Bandwidth"       value="1.2GB"                      sub="of 10GB total" />
      </div>

      {/* Chart + Ring */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* Bar chart */}
        <div className="lg:col-span-2 rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-1" style={{ color: '#4b5563' }}>Request History</p>
              <div className="font-syne font-black text-2xl text-white"><Counter to={TOTAL_REQ} /></div>
            </div>
            <span className="text-[10px] font-bold px-3 py-1 rounded-full"
              style={{ background: 'rgba(52,211,153,0.08)', color: '#34d399', border: '1px solid rgba(52,211,153,0.15)' }}>
              ↑ 12% this week
            </span>
          </div>
          <div className="flex items-end gap-2" style={{ height: '96px' }}>
            {WEEK.map((d, i) => {
              const h = Math.max((d.v / MAX_BAR) * 100, 4)
              const isToday = i === WEEK.length - 1
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group/b relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] px-1.5 py-0.5 rounded pointer-events-none opacity-0 group-hover/b:opacity-100 transition-opacity whitespace-nowrap z-10"
                    style={{ background: '#0c1118', border: '1px solid rgba(255,255,255,0.08)', color: '#e5e7eb' }}>
                    {d.v}
                  </div>
                  <div className="w-full flex items-end" style={{ height: '80px' }}>
                    <div className="w-full rounded-t-lg transition-all"
                      style={{
                        height: `${h}%`, minHeight: '4px',
                        background: isToday ? 'linear-gradient(180deg, #00e5ff, #0891b2)' : 'rgba(255,255,255,0.07)',
                        boxShadow: isToday ? '0 -4px 14px rgba(0,229,255,0.25)' : 'none',
                      }} />
                  </div>
                  <span className="text-[10px]" style={{ color: isToday ? '#00e5ff' : '#374151' }}>{d.day.slice(0,1)}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Ring + plan info */}
        <div className="rounded-2xl p-5 flex flex-col gap-5"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: '#4b5563' }}>Request Usage</p>

          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <Ring used={TOTAL_REQ} total={limits.requests} color={isWarn ? '#f59e0b' : '#00e5ff'} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-syne font-black text-base text-white">{reqPct}%</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-white">{TOTAL_REQ.toLocaleString()} <span className="text-gray-600 font-normal">/ {limits.requests.toLocaleString()}</span></div>
              <div className="text-xs" style={{ color: '#374151' }}>Monthly Requests</div>
            </div>
          </div>

          {/* Per project limits */}
          <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <p className="text-[9px] font-black tracking-[0.15em] uppercase" style={{ color: '#1f2937' }}>Per Project Allocation</p>
            {[
              { k: 'RAM',  v: `${limits.ram}MB`, color: '#7c3aed' },
              { k: 'CPU',  v: `${limits.cpu} vCPU`, color: '#34d399' },
              { k: 'SSL',  v: 'Included', color: '#00e5ff' },
              { k: 'Domain', v: limits.customDomain ? 'Custom' : 'Subdomain only', color: limits.customDomain ? '#34d399' : '#6b7280' },
            ].map(r => (
              <div key={r.k} className="flex items-center justify-between">
                <span className="text-xs" style={{ color: '#4b5563' }}>{r.k}</span>
                <span className="text-xs font-bold" style={{ color: r.color }}>{r.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Account-level usage bars */}
      <div className="rounded-2xl p-5 space-y-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: '#4b5563' }}>Account Limits</p>
          <span className="text-[10px]" style={{ color: '#1f2937' }}>RAM &amp; CPU are per-project allocations</span>
        </div>
        <UsageBar label="Monthly Requests" used={TOTAL_REQ} total={limits.requests} color="#00e5ff" note="resets Feb 1" />
        <UsageBar label="Projects"          used={3}         total={limits.projects === Infinity ? 999 : limits.projects} color="#7c3aed" />
        <UsageBar label="Bandwidth"         used={1.2}       total={10} color="#34d399" unit="GB" />
      </div>

      {/* Per-project resource table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <span className="text-sm font-bold text-white">Per-Project Resources</span>
          <span className="text-[10px]" style={{ color: '#374151' }}>Each project gets its own RAM &amp; CPU</span>
        </div>
        <div>
          {PROJECTS.map((p, i) => {
            const ramPct = Math.round((p.ram / p.ramLimit) * 100)
            const cpuPct = Math.round((p.cpu / p.cpuLimit) * 100)
            return (
              <div key={p.name} className="px-5 py-4 transition-colors"
                style={{ borderBottom: i < PROJECTS.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center font-syne font-black text-xs"
                      style={{ background: 'rgba(0,229,255,0.07)', border: '1px solid rgba(0,229,255,0.1)', color: '#00e5ff' }}>
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-white">{p.name}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={p.status === 'live'
                      ? { background: 'rgba(52,211,153,0.08)', color: '#34d399', border: '1px solid rgba(52,211,153,0.15)' }
                      : { background: 'rgba(107,114,128,0.08)', color: '#6b7280', border: '1px solid rgba(107,114,128,0.15)' }}>
                    {p.status === 'live' ? '● Live' : '○ Stopped'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {/* RAM */}
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[11px]" style={{ color: '#4b5563' }}>RAM</span>
                      <span className="text-[11px] font-medium" style={{ color: '#9ca3af' }}>{p.ram}MB / {p.ramLimit}MB</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <div className="h-full rounded-full" style={{ width: `${ramPct}%`, background: '#7c3aed', transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                  {/* CPU */}
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[11px]" style={{ color: '#4b5563' }}>CPU</span>
                      <span className="text-[11px] font-medium" style={{ color: '#9ca3af' }}>{p.cpu} / {p.cpuLimit} vCPU</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <div className="h-full rounded-full" style={{ width: `${cpuPct}%`, background: '#34d399', transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Upgrade CTA */}
      {DUMMY_PLAN === 'free' && (
        <div className="flex items-center justify-between gap-4 flex-wrap px-6 py-5 rounded-2xl"
          style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.05), rgba(124,58,237,0.05))', border: '1px solid rgba(0,229,255,0.12)' }}>
          <div>
            <h3 className="font-syne font-black text-white text-base mb-1">Need more resources?</h3>
            <p className="text-sm" style={{ color: '#4b5563' }}>Pro — 100k requests, 2GB RAM/project, unlimited projects.</p>
          </div>
          <Link to="/billing"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-black transition-all hover:scale-105 whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg, #00e5ff, #00b8cc)', boxShadow: '0 4px 20px rgba(0,229,255,0.2)' }}>
            Upgrade to Pro →
          </Link>
        </div>
      )}

    </div>
  )
}

export default Usage