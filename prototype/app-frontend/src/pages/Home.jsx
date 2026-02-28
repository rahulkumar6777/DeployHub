import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PLAN_LIMITS } from '../constant/planLimits'

// ── Dummy Data ─────────────────────────────────────────────
const DUMMY_USER = { fullname: 'Rahul Kumar', subscription: 'free', authProvider: 'github' }
const DUMMY_PROJECTS = [
  { id: '1', name: 'my-portfolio',  status: 'live',    url: 'my-portfolio.deployhub.app',  requests: 847,  ram: 128, deployedAt: '2h ago' },
  { id: '2', name: 'node-backend',  status: 'live',    url: 'node-backend.deployhub.app',  requests: 1203, ram: 256, deployedAt: '1d ago' },
  { id: '3', name: 'test-site',     status: 'stopped', url: 'test-site.deployhub.app',     requests: 0,    ram: 0,   deployedAt: '3d ago' },
]
const WEEK = [
  { day: 'Mon', v: 120 }, { day: 'Tue', v: 340 }, { day: 'Wed', v: 210 },
  { day: 'Thu', v: 480 }, { day: 'Fri', v: 390 }, { day: 'Sat', v: 150 }, { day: 'Sun', v: 247 },
]
const TOTAL_REQ  = WEEK.reduce((s, d) => s + d.v, 0)
const MAX_BAR    = Math.max(...WEEK.map(d => d.v))
const LIVE_COUNT = DUMMY_PROJECTS.filter(p => p.status === 'live').length
const limits     = PLAN_LIMITS[DUMMY_USER.subscription]

// ── Animated counter ───────────────────────────────────────
function Counter({ to, suffix = '' }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let cur = 0
    const step = to / 60
    const t = setInterval(() => {
      cur = Math.min(cur + step, to)
      setVal(Math.floor(cur))
      if (cur >= to) clearInterval(t)
    }, 16)
    return () => clearInterval(t)
  }, [to])
  return <>{val.toLocaleString()}{suffix}</>
}

// ── Live dot ───────────────────────────────────────────────
function LiveDot({ status }) {
  if (status === 'live') return (
    <span className="relative flex w-2 h-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40" />
      <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-400" />
    </span>
  )
  return <span className="w-2 h-2 rounded-full bg-gray-600 inline-block" />
}

// ── Stat card ──────────────────────────────────────────────
function StatCard({ label, children, accent, bottom }) {
  return (
    <div className="relative rounded-2xl p-5 flex flex-col gap-1 overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
      style={accent
        ? { background: 'linear-gradient(135deg, rgba(0,229,255,0.07), rgba(0,229,255,0.02))', border: '1px solid rgba(0,229,255,0.15)' }
        : { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }
      }>
      {accent && <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl" style={{ background: 'rgba(0,229,255,0.12)' }} />}
      <div className="text-[10px] font-bold tracking-[0.15em] uppercase relative z-10" style={{ color: accent ? 'rgba(0,229,255,0.7)' : '#4b5563' }}>
        {label}
      </div>
      <div className="relative z-10">{children}</div>
      {bottom && <div className="text-[11px] relative z-10" style={{ color: '#374151' }}>{bottom}</div>}
    </div>
  )
}

export function Home() {
  const reqPct = Math.round((TOTAL_REQ / limits.requests) * 100)
  const isWarn = reqPct >= 80

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }} className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 pb-1">
        <div>
          <p className="text-xs font-bold tracking-[0.15em] uppercase mb-1.5" style={{ color: '#00e5ff' }}>Dashboard</p>
          <h1 className="font-syne font-black text-[28px] text-white leading-none">
            Hey, {DUMMY_USER.fullname.split(' ')[0]} 👋
          </h1>
          <p className="text-sm mt-1.5" style={{ color: '#4b5563' }}>
            <span className="text-emerald-400 font-medium">{LIVE_COUNT} live</span>
            {' '}· {DUMMY_PROJECTS.length} total projects · {new Date().toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'short' })}
          </p>
        </div>
        <Link to="/projects"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-black flex-shrink-0 transition-all hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #00e5ff, #00b8cc)', boxShadow: '0 4px 20px rgba(0,229,255,0.25)' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </Link>
      </div>

      {/* ── Warning banner ── */}
      {isWarn && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
          style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.18)' }}>
          <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#f59e0b' }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span style={{ color: '#f59e0b' }}><strong>{reqPct}%</strong> of monthly requests used — {(limits.requests - TOTAL_REQ).toLocaleString()} remaining</span>
          <Link to="/billing" className="ml-auto text-xs font-black" style={{ color: '#f59e0b' }}>Upgrade →</Link>
        </div>
      )}

      {/* ── 4 stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Projects" accent
          bottom={`${limits.projects === Infinity ? 'Unlimited' : limits.projects} max on free`}>
          <div className="font-syne font-black text-3xl text-white"><Counter to={DUMMY_PROJECTS.length} /></div>
        </StatCard>
        <StatCard label="Live Now"
          bottom={`${DUMMY_PROJECTS.length - LIVE_COUNT} stopped`}>
          <div className="font-syne font-black text-3xl" style={{ color: '#34d399' }}><Counter to={LIVE_COUNT} /></div>
        </StatCard>
        <StatCard label="Today's Requests"
          bottom="↑ 12% vs yesterday">
          <div className="font-syne font-black text-3xl text-white"><Counter to={WEEK[6].v} /></div>
        </StatCard>
        <StatCard label="Monthly Usage"
          bottom={`${TOTAL_REQ.toLocaleString()} / ${limits.requests.toLocaleString()}`}>
          <div className="font-syne font-black text-3xl" style={{ color: isWarn ? '#f59e0b' : '#a78bfa' }}>
            <Counter to={reqPct} suffix="%" />
          </div>
        </StatCard>
      </div>

      {/* ── Chart + Plan side by side ── */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* Request chart */}
        <div className="lg:col-span-2 rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-1" style={{ color: '#4b5563' }}>Requests — Last 7 Days</p>
              <div className="font-syne font-black text-2xl text-white"><Counter to={TOTAL_REQ} /></div>
            </div>
            <span className="text-[10px] font-bold px-3 py-1 rounded-full"
              style={{ background: 'rgba(52,211,153,0.08)', color: '#34d399', border: '1px solid rgba(52,211,153,0.15)' }}>
              ↑ 12% this week
            </span>
          </div>
          {/* Bars */}
          <div className="flex items-end gap-2" style={{ height: '96px' }}>
            {WEEK.map((d, i) => {
              const h = Math.max((d.v / MAX_BAR) * 100, 4)
              const isToday = i === WEEK.length - 1
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group/b relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover/b:opacity-100 pointer-events-none transition-opacity z-10 whitespace-nowrap"
                    style={{ background: '#0f1623', border: '1px solid rgba(255,255,255,0.08)', color: '#e5e7eb' }}>
                    {d.v}
                  </div>
                  <div className="w-full flex items-end" style={{ height: '80px' }}>
                    <div className="w-full rounded-t-lg transition-all duration-300 group-hover/b:opacity-90"
                      style={{
                        height: `${h}%`,
                        minHeight: '4px',
                        background: isToday ? 'linear-gradient(180deg, #00e5ff, #0891b2)' : 'rgba(255,255,255,0.07)',
                        boxShadow: isToday ? '0 -6px 16px rgba(0,229,255,0.25)' : 'none',
                      }} />
                  </div>
                  <span className="text-[10px]" style={{ color: isToday ? '#00e5ff' : '#374151' }}>{d.day.slice(0,1)}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Plan card */}
        <div className="rounded-2xl p-5 flex flex-col gap-4"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: '#4b5563' }}>Plan Usage</p>
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase"
              style={{ background: 'rgba(0,229,255,0.08)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.12)' }}>
              {DUMMY_USER.subscription}
            </span>
          </div>

          {/* Usage bars */}
          {[
            { label: 'Requests', used: TOTAL_REQ, total: limits.requests, color: reqPct >= 80 ? '#f59e0b' : '#00e5ff' },
            { label: 'Projects', used: DUMMY_PROJECTS.length, total: limits.projects === Infinity ? 999 : limits.projects, color: '#7c3aed' },
          ].map(item => {
            const p = Math.min(Math.round((item.used / item.total) * 100), 100)
            return (
              <div key={item.label} className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: '#6b7280' }}>{item.label}</span>
                  <span className="text-xs font-semibold text-white">{p}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="h-full rounded-full" style={{ width: `${p}%`, background: item.color, transition: 'width 0.8s ease' }} />
                </div>
              </div>
            )
          })}

          {/* Per project info */}
          <div className="rounded-xl p-3 space-y-2.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <p className="text-[9px] font-black tracking-[0.15em] uppercase" style={{ color: '#1f2937' }}>Per Project Limit</p>
            {[
              { k: 'RAM', v: `${limits.ram}MB` },
              { k: 'CPU', v: `${limits.cpu} vCPU` },
              { k: 'SSL', v: 'Included' },
            ].map(r => (
              <div key={r.k} className="flex justify-between">
                <span className="text-xs" style={{ color: '#4b5563' }}>{r.k}</span>
                <span className="text-xs font-semibold text-white">{r.v}</span>
              </div>
            ))}
          </div>

          <Link to="/billing"
            className="w-full flex items-center justify-center py-2.5 rounded-xl text-xs font-black transition-all hover:opacity-90"
            style={{ background: 'rgba(0,229,255,0.08)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.15)' }}>
            Upgrade to Pro →
          </Link>
        </div>
      </div>

      {/* ── Recent projects ── */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <span className="text-sm font-bold text-white">Recent Projects</span>
          <Link to="/projects" className="text-xs font-bold transition-opacity hover:opacity-70" style={{ color: '#00e5ff' }}>View all →</Link>
        </div>
        {DUMMY_PROJECTS.map((p, i) => (
          <Link to={`/project/${p.id}`} key={p.id}
            className="flex items-center gap-4 px-5 py-3.5 transition-colors group"
            style={{
              borderBottom: i < DUMMY_PROJECTS.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            {/* Avatar */}
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-syne font-black text-sm flex-shrink-0"
              style={{ background: 'rgba(0,229,255,0.07)', border: '1px solid rgba(0,229,255,0.1)', color: '#00e5ff' }}>
              {p.name.charAt(0).toUpperCase()}
            </div>
            {/* Name + URL */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">{p.name}</div>
              <div className="text-xs truncate" style={{ color: '#374151' }}>{p.url}</div>
            </div>
            {/* Status */}
            <div className="flex items-center gap-2">
              <LiveDot status={p.status} />
              <span className="text-xs font-medium hidden sm:block" style={{ color: p.status === 'live' ? '#34d399' : '#6b7280' }}>
                {p.status}
              </span>
            </div>
            {/* Requests */}
            <div className="hidden md:block text-right">
              <div className="text-sm font-bold text-white">{p.requests.toLocaleString()}</div>
              <div className="text-[10px]" style={{ color: '#374151' }}>req</div>
            </div>
            {/* Time */}
            <span className="hidden lg:block text-xs" style={{ color: '#374151' }}>{p.deployedAt}</span>
            {/* Arrow */}
            <svg className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#374151' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>

      {/* ── Quick actions ── */}
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { to: '/projects', label: 'Deploy Project', desc: 'Upload files or connect repo', cyan: true,  d: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12' },
          { to: '/usage',    label: 'View Usage',     desc: 'RAM, CPU, requests stats',    d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
          { to: '/billing',  label: 'Manage Billing', desc: 'Upgrade plan, view invoices', d: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
        ].map(a => (
          <Link key={a.to} to={a.to}
            className="flex items-center gap-3.5 p-4 rounded-xl transition-all duration-200 group hover:-translate-y-0.5"
            style={a.cyan
              ? { background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.12)' }
              : { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={a.cyan ? { background: 'rgba(0,229,255,0.1)', color: '#00e5ff' } : { background: 'rgba(255,255,255,0.04)', color: '#4b5563' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={a.d} />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: a.cyan ? '#00e5ff' : '#e5e7eb' }}>{a.label}</div>
              <div className="text-xs" style={{ color: '#374151' }}>{a.desc}</div>
            </div>
            <svg className="w-4 h-4 ml-auto flex-shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>

    </div>
  )
}

export default Home