import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/apiclient' 

// ── Animated counter ───────────────────────────────────────
function Counter({ to, suffix = '' }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let cur = 0
    const step = Math.max(to / 60, 1)
    const t = setInterval(() => {
      cur = Math.min(cur + step, to)
      setVal(Math.floor(cur))
      if (cur >= to) clearInterval(t)
    }, 16)
    return () => clearInterval(t)
  }, [to])
  return <>{val.toLocaleString()}{suffix}</>
}

function timeAgo(dateStr) {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

const STATUS_COLOR = {
  live:           '#34d399',
  stopped:        '#6b7280',
  building:       '#00e5ff',
  pending:        '#f59e0b',
  'failed-deploy':'#f87171',
}

// Fake 7-day chart — swap with real API later
// Shape: [{day, requests}]
function buildWeekData(totalReq) {
  const days    = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  const weights = [0.10, 0.18, 0.12, 0.22, 0.17, 0.08, 0.13]
  return days.map((day, i) => ({ day, v: Math.round(totalReq * weights[i]) }))
}

export function Home() {
  const { user }  = useAuth()
  const navigate       = useNavigate()
  const [stats, setStats]           = useState(null)
  const [recentProjects, setRecent] = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    api.get('/dashboard')
      .then(res => {
        setStats(res.data?.stats || {})
        setRecent(res.data?.recentProjects || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const firstname    = user?.fullname?.split(' ')[0] || 'there'
  const liveCount    = stats?.liveCount    || 0
  const stoppedCount = stats?.stoppedCount || 0
  const totalReq     = stats?.totalRequests || 0
  const recent       = recentProjects
  const weekData     = buildWeekData(totalReq)
  const maxBar       = Math.max(...weekData.map(d => d.v), 1)

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }} className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 pb-1">
        <div>
          <p className="text-xs font-bold tracking-[0.15em] uppercase mb-1.5" style={{ color: '#00e5ff' }}>Dashboard</p>
          <h1 className="font-syne font-black text-[28px] text-white leading-none">
            Hey, {firstname} 👋
          </h1>
          {!loading && (
            <p className="text-sm mt-1.5" style={{ color: '#4b5563' }}>
              <span className="text-emerald-400 font-medium">{liveCount} live</span>
              {' · '}{stoppedCount} stopped · {stats?.totalProjects || 0} total ·{' '}
              {new Date().toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'short' })}
            </p>
          )}
        </div>
        <button onClick={() => navigate('/static/new')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-black flex-shrink-0 transition-all hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #00e5ff, #00b8cc)', boxShadow: '0 4px 20px rgba(0,229,255,0.25)' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: 'Total Projects',
            value: stats?.totalProjects || 0,
            bottom: loading ? '—' : `${liveCount} live · ${stoppedCount} stopped`,
            accent: true,
          },
          {
            label: 'Live Now',
            value: liveCount,
            valueColor: '#34d399',
            bottom: liveCount === 0 ? 'No active projects' : `${Math.round((liveCount / Math.max(stats?.totalProjects || 1, 1)) * 100)}% of total`,
          },
          {
            label: 'Total Requests',
            value: totalReq,
            bottom: 'Across all projects',
          },
          {
            label: 'Projects (Static)',
            value: stats?.staticCount || 0,
            bottom: `${stats?.nodeCount || 0} Node.js`,
          },
        ].map(card => (
          <div key={card.label} className="relative rounded-2xl p-5 flex flex-col gap-1 overflow-hidden transition-all hover:-translate-y-0.5"
            style={card.accent
              ? { background: 'linear-gradient(135deg,rgba(0,229,255,0.07),rgba(0,229,255,0.02))', border: '1px solid rgba(0,229,255,0.15)' }
              : { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {card.accent && <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl" style={{ background: 'rgba(0,229,255,0.12)' }} />}
            <div className="text-[10px] font-bold tracking-[0.15em] uppercase relative z-10"
              style={{ color: card.accent ? 'rgba(0,229,255,0.7)' : '#4b5563' }}>
              {card.label}
            </div>
            <div className="font-syne font-black text-3xl relative z-10"
              style={{ color: card.valueColor || '#fff' }}>
              {loading ? (
                <div className="h-8 w-12 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.07)' }} />
              ) : (
                <Counter to={card.value} />
              )}
            </div>
            <div className="text-[11px] relative z-10" style={{ color: '#374151' }}>{card.bottom}</div>
          </div>
        ))}
      </div>

      {/* ── Chart + Recent ── */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* Request chart */}
        <div className="lg:col-span-2 rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-1" style={{ color: '#4b5563' }}>
                Requests — Last 7 Days
              </p>
              <div className="font-syne font-black text-2xl text-white">
                {loading ? (
                  <div className="h-7 w-20 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.07)' }} />
                ) : (
                  <Counter to={totalReq} />
                )}
              </div>
            </div>
            <span className="text-[10px] font-bold px-3 py-1 rounded-full"
              style={{ background: 'rgba(255,255,255,0.04)', color: '#4b5563', border: '1px solid rgba(255,255,255,0.06)' }}>
              All projects
            </span>
          </div>
          <div className="flex items-end gap-2" style={{ height: '96px' }}>
            {weekData.map((d, i) => {
              const h = Math.max((d.v / maxBar) * 100, 4)
              const isToday = i === weekData.length - 1
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group/b relative">
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover/b:opacity-100 pointer-events-none transition-opacity z-10 whitespace-nowrap"
                    style={{ background: '#0f1623', border: '1px solid rgba(255,255,255,0.08)', color: '#e5e7eb' }}>
                    {d.v.toLocaleString()}
                  </div>
                  <div className="w-full flex items-end" style={{ height: '80px' }}>
                    <div className="w-full rounded-t-lg transition-all duration-300"
                      style={{
                        height: `${h}%`,
                        minHeight: '4px',
                        background: isToday
                          ? 'linear-gradient(180deg, #00e5ff, #0891b2)'
                          : 'rgba(255,255,255,0.07)',
                        boxShadow: isToday ? '0 -6px 16px rgba(0,229,255,0.2)' : 'none',
                      }} />
                  </div>
                  <span className="text-[10px]" style={{ color: isToday ? '#00e5ff' : '#374151' }}>
                    {d.day.slice(0, 1)}
                  </span>
                </div>
              )
            })}
          </div>
          <p className="text-[10px] mt-3" style={{ color: '#1f2937' }}>
            * Chart is estimated from total requests. Connect analytics API for live data.
          </p>
        </div>

        {/* Quick actions */}
        <div className="rounded-2xl p-5 flex flex-col gap-3"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: '#4b5563' }}>Quick Actions</p>
          {[
            {
              label: 'Deploy Project',
              desc: 'Static site or Node.js app',
              cyan: true,
              action: () => navigate('/static/new'),
              icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12',
            },
            {
              label: 'View Projects',
              desc: 'Manage all deployments',
              to: '/projects',
              icon: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2',
            },
            {
              label: 'Usage & Analytics',
              desc: 'Requests, bandwidth stats',
              to: '/usage',
              icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
            },
            {
              label: 'Billing',
              desc: 'Invoices & payment history',
              to: '/billing',
              icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
            },
          ].map(a => {
            const inner = (
              <div className="flex items-center gap-3 group/a">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={a.cyan
                    ? { background: 'rgba(0,229,255,0.12)', color: '#00e5ff' }
                    : { background: 'rgba(255,255,255,0.04)', color: '#4b5563' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={a.icon} />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold leading-none mb-0.5"
                    style={{ color: a.cyan ? '#00e5ff' : '#e5e7eb' }}>{a.label}</div>
                  <div className="text-[10px]" style={{ color: '#374151' }}>{a.desc}</div>
                </div>
                <svg className="w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover/a:opacity-50 transition-opacity"
                  style={{ color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )
            const cls = "w-full px-3 py-2.5 rounded-xl transition-all text-left"
            const style = a.cyan
              ? { background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.1)' }
              : { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }
            if (a.action) return (
              <button key={a.label} onClick={a.action} className={cls} style={style}
                onMouseEnter={e => e.currentTarget.style.borderColor = a.cyan ? 'rgba(0,229,255,0.25)' : 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = a.cyan ? 'rgba(0,229,255,0.1)' : 'rgba(255,255,255,0.04)'}>
                {inner}
              </button>
            )
            return (
              <Link key={a.label} to={a.to} className={cls} style={style}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'}>
                {inner}
              </Link>
            )
          })}
        </div>
      </div>

      {/* ── Recent projects ── */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <span className="text-sm font-bold text-white">Recent Projects</span>
          <Link to="/projects" className="text-xs font-bold hover:opacity-70 transition-opacity" style={{ color: '#00e5ff' }}>
            View all →
          </Link>
        </div>

        {loading ? (
          [1,2,3].map(i => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5 animate-pulse"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <div className="w-9 h-9 rounded-xl flex-shrink-0" style={{ background: 'rgba(255,255,255,0.05)' }} />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 rounded w-32" style={{ background: 'rgba(255,255,255,0.05)' }} />
                <div className="h-2.5 rounded w-48" style={{ background: 'rgba(255,255,255,0.03)' }} />
              </div>
            </div>
          ))
        ) : recent.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm" style={{ color: '#374151' }}>
            No projects yet.{' '}
            <button onClick={() => navigate('/static/new')} style={{ color: '#00e5ff' }} className="font-bold">
              Deploy one →
            </button>
          </div>
        ) : (
          recent.map((p, i) => (
            <Link to={`/project/${p._id}`} key={p._id}
              className="flex items-center gap-4 px-5 py-3.5 transition-colors group"
              style={{ borderBottom: i < recent.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {/* Avatar */}
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-syne font-black text-sm flex-shrink-0"
                style={{ background: 'rgba(0,229,255,0.07)', border: '1px solid rgba(0,229,255,0.1)', color: '#00e5ff' }}>
                {p.name.charAt(0).toUpperCase()}
              </div>
              {/* Name + domain */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">{p.name}</div>
                <div className="text-xs truncate" style={{ color: '#374151' }}>{p.domain}</div>
              </div>
              {/* Plan badge */}
              <span className="hidden sm:block text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                style={{
                  background: p.plan === 'pro' ? 'rgba(0,229,255,0.08)' : 'rgba(255,255,255,0.04)',
                  color: p.plan === 'pro' ? '#00e5ff' : '#4b5563',
                }}>
                {p.plan?.toUpperCase()}
              </span>
              {/* Status dot */}
              <div className="flex items-center gap-1.5">
                {p.status === 'live' ? (
                  <span className="relative flex w-2 h-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-40" style={{ background: '#34d399' }} />
                    <span className="relative inline-flex w-2 h-2 rounded-full" style={{ background: '#34d399' }} />
                  </span>
                ) : (
                  <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLOR[p.status] || '#6b7280' }} />
                )}
                <span className="text-xs font-medium hidden sm:block capitalize"
                  style={{ color: STATUS_COLOR[p.status] || '#6b7280' }}>
                  {p.status}
                </span>
              </div>
              {/* Requests */}
              <div className="hidden md:block text-right">
                <div className="text-sm font-bold text-white">{(p.totalRequest || 0).toLocaleString()}</div>
                <div className="text-[10px]" style={{ color: '#374151' }}>req</div>
              </div>
              {/* Updated */}
              <span className="hidden lg:block text-xs" style={{ color: '#374151' }}>
                {timeAgo(p.updatedAt)}
              </span>
              {/* Arrow */}
              <svg className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-40 transition-opacity"
                style={{ color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))
        )}
      </div>

    </div>
  )
}

export default Home