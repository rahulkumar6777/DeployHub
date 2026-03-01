import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

function Counter({ to }) {
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
  return <>{val.toLocaleString()}</>
}

// Build estimated 7-day distribution from totalRequests
function buildWeekData(total) {
  const days    = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  const weights = [0.10, 0.18, 0.12, 0.22, 0.17, 0.08, 0.13]
  return days.map((day, i) => ({ day, v: Math.round(total * weights[i]) }))
}

const STATUS_STYLE = {
  live:           { color: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.15)'  },
  stopped:        { color: '#6b7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.15)' },
  building:       { color: '#00e5ff', bg: 'rgba(0,229,255,0.08)',   border: 'rgba(0,229,255,0.15)'   },
  pending:        { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.15)'  },
  'failed-deploy':{ color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.15)' },
}

export function Usage() {
  const { api }  = useAuth()
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('7d')

  useEffect(() => {
    api.get('/usage')
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalRequests  = data?.totalRequests  || 0
  const projectStats   = data?.projectStats   || []
  const weekData       = buildWeekData(totalRequests)
  const maxBar         = Math.max(...weekData.map(d => d.v), 1)

  // Top project by requests
  const topProject = projectStats[0]

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }} className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.15em] uppercase mb-1.5" style={{ color: '#00e5ff' }}>Analytics</p>
          <h1 className="font-syne font-black text-[28px] text-white leading-none">Usage</h1>
          <p className="text-sm mt-1.5" style={{ color: '#4b5563' }}>
            Request stats across all your projects
          </p>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
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

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          {
            label: 'Total Requests',
            value: loading ? null : totalRequests,
            sub: 'Across all projects',
            color: '#00e5ff',
            accent: true,
          },
          {
            label: 'Active Projects',
            value: loading ? null : projectStats.filter(p => p.status === 'live').length,
            sub: `${projectStats.length} total projects`,
            color: '#34d399',
          },
          {
            label: 'Top Project',
            value: loading ? null : null,
            custom: loading ? null : topProject ? (
              <div>
                <div className="font-syne font-black text-lg text-white truncate">{topProject.name}</div>
                <div className="text-xs mt-0.5" style={{ color: '#374151' }}>
                  {(topProject.totalRequest || 0).toLocaleString()} requests
                </div>
              </div>
            ) : <div className="text-sm" style={{ color: '#374151' }}>No projects yet</div>,
          },
        ].map(card => (
          <div key={card.label}
            className="rounded-2xl p-5 flex flex-col gap-1 transition-all hover:-translate-y-0.5 overflow-hidden relative"
            style={card.accent
              ? { background: 'linear-gradient(135deg,rgba(0,229,255,0.07),rgba(0,229,255,0.02))', border: '1px solid rgba(0,229,255,0.15)' }
              : { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {card.accent && <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl" style={{ background: 'rgba(0,229,255,0.12)' }} />}
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase relative z-10"
              style={{ color: card.accent ? 'rgba(0,229,255,0.7)' : '#4b5563' }}>
              {card.label}
            </p>
            <div className="relative z-10">
              {loading ? (
                <div className="h-7 w-20 rounded-lg mt-1 animate-pulse" style={{ background: 'rgba(255,255,255,0.07)' }} />
              ) : card.custom ? card.custom : (
                <div className="font-syne font-black text-3xl" style={{ color: card.color || '#fff' }}>
                  <Counter to={card.value || 0} />
                </div>
              )}
            </div>
            {card.sub && <div className="text-[11px] relative z-10" style={{ color: '#374151' }}>{card.sub}</div>}
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-2xl p-5"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-1" style={{ color: '#4b5563' }}>
              Request History — Last 7 Days
            </p>
            <div className="font-syne font-black text-2xl text-white">
              {loading
                ? <div className="h-7 w-24 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.07)' }} />
                : <Counter to={totalRequests} />
              }
            </div>
          </div>
          <span className="text-[10px] font-bold px-3 py-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.04)', color: '#4b5563', border: '1px solid rgba(255,255,255,0.06)' }}>
            Estimated distribution
          </span>
        </div>
        <div className="flex items-end gap-2" style={{ height: '120px' }}>
          {weekData.map((d, i) => {
            const h = Math.max((d.v / maxBar) * 100, 4)
            const isToday = i === weekData.length - 1
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group/b relative">
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover/b:opacity-100 pointer-events-none transition-opacity z-10 whitespace-nowrap"
                  style={{ background: '#0c1118', border: '1px solid rgba(255,255,255,0.08)', color: '#e5e7eb' }}>
                  {d.v.toLocaleString()}
                </div>
                <div className="w-full flex items-end" style={{ height: '96px' }}>
                  <div className="w-full rounded-t-lg transition-all duration-300"
                    style={{
                      height: `${h}%`, minHeight: '4px',
                      background: isToday ? 'linear-gradient(180deg, #00e5ff, #0891b2)' : 'rgba(255,255,255,0.07)',
                      boxShadow: isToday ? '0 -4px 14px rgba(0,229,255,0.25)' : 'none',
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
          * Estimated from total requests. Connect analytics API for per-day data.
        </p>
      </div>

      {/* Per-project requests table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <span className="text-sm font-bold text-white">Requests by Project</span>
          <span className="text-[10px]" style={{ color: '#374151' }}>sorted by usage</span>
        </div>

        {loading ? (
          [1,2,3].map(i => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <div className="w-8 h-8 rounded-xl flex-shrink-0" style={{ background: 'rgba(255,255,255,0.05)' }} />
              <div className="flex-1 space-y-2">
                <div className="h-3 rounded w-28" style={{ background: 'rgba(255,255,255,0.05)' }} />
                <div className="h-1.5 rounded-full w-full" style={{ background: 'rgba(255,255,255,0.03)' }} />
              </div>
              <div className="h-3 rounded w-16" style={{ background: 'rgba(255,255,255,0.05)' }} />
            </div>
          ))
        ) : projectStats.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm" style={{ color: '#374151' }}>
            No projects found.
          </div>
        ) : (
          projectStats.map((p, i) => {
            const pct = totalRequests > 0 ? Math.round((p.totalRequest / totalRequests) * 100) : 0
            const ss  = STATUS_STYLE[p.status] || STATUS_STYLE.stopped
            return (
              <div key={p._id} className="px-5 py-4 transition-colors"
                style={{ borderBottom: i < projectStats.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div className="flex items-center gap-3 mb-2.5">
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center font-syne font-black text-xs flex-shrink-0"
                    style={{ background: 'rgba(0,229,255,0.07)', border: '1px solid rgba(0,229,255,0.1)', color: '#00e5ff' }}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  {/* Name + type */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{p.name}</div>
                    <span className="text-[10px]" style={{ color: '#374151' }}>
                      {p.projectType === 'node' ? 'Node.js' : 'Static'}
                    </span>
                  </div>
                  {/* Plan */}
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md hidden sm:block"
                    style={{
                      background: p.plan === 'pro' ? 'rgba(0,229,255,0.08)' : 'rgba(255,255,255,0.04)',
                      color: p.plan === 'pro' ? '#00e5ff' : '#4b5563',
                    }}>
                    {p.plan?.toUpperCase()}
                  </span>
                  {/* Status */}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}>
                    {p.status}
                  </span>
                  {/* Request count */}
                  <div className="text-right flex-shrink-0 w-20">
                    <div className="text-sm font-bold text-white">{(p.totalRequest || 0).toLocaleString()}</div>
                    <div className="text-[10px]" style={{ color: '#374151' }}>{pct}% of total</div>
                  </div>
                </div>
                {/* Bar */}
                <div className="h-1.5 rounded-full overflow-hidden ml-11"
                  style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      background: p.plan === 'pro'
                        ? 'linear-gradient(90deg, #00e5ff, #7c3aed)'
                        : 'rgba(255,255,255,0.15)',
                    }} />
                </div>
              </div>
            )
          })
        )}
      </div>

    </div>
  )
}

export default Usage