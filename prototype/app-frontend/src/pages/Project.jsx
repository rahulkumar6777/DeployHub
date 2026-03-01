import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const STATUS = {
  live:           { text: 'Live',       dot: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.18)',  color: '#34d399' },
  stopped:        { text: 'Stopped',    dot: '#6b7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.18)', color: '#6b7280' },
  building:       { text: 'Building',   dot: '#00e5ff', bg: 'rgba(0,229,255,0.08)',   border: 'rgba(0,229,255,0.18)',   color: '#00e5ff' },
  pending:        { text: 'Pending',    dot: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.18)',  color: '#f59e0b' },
  'failed-deploy':{ text: 'Failed',     dot: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.18)', color: '#f87171' },
}

function StatusPill({ status }) {
  const s = STATUS[status] || STATUS.stopped
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status === 'live' ? 'animate-pulse' : ''}`}
        style={{ background: s.dot }} />
      {s.text}
    </span>
  )
}

function PlanBadge({ plan }) {
  const isPro = plan === 'pro'
  return (
    <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md"
      style={{
        background: isPro ? 'rgba(0,229,255,0.08)' : 'rgba(255,255,255,0.04)',
        color: isPro ? '#00e5ff' : '#4b5563',
        border: isPro ? '1px solid rgba(0,229,255,0.15)' : '1px solid transparent',
      }}>
      {isPro ? 'Pro' : 'Free'}
    </span>
  )
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function ProjectCard({ project, onMenuAction }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const isLive = project.status === 'live'

  return (
    <div className="relative rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
      onMouseEnter={e => e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'}
      onMouseLeave={e => e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'}>

      {/* Top accent */}
      <div className="h-px w-full" style={{
        background: isLive
          ? 'linear-gradient(90deg, #34d399, transparent)'
          : project.status === 'failed-deploy'
          ? 'linear-gradient(90deg, #f87171, transparent)'
          : 'linear-gradient(90deg, rgba(107,114,128,0.5), transparent)'
      }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-syne font-black text-sm"
              style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.12), rgba(124,58,237,0.08))', border: '1px solid rgba(0,229,255,0.12)', color: '#00e5ff' }}>
              {project.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="font-syne font-bold text-white text-[15px] truncate">{project.name}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-bold tracking-[0.1em] uppercase px-1.5 py-0.5 rounded-md"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#4b5563' }}>
                  {project.projectType === 'node' ? 'Node.js' : 'Static'}
                </span>
                <PlanBadge plan={project.plan} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <StatusPill status={project.status} />
            <div className="relative">
              <button onClick={() => setMenuOpen(p => !p)}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={{ color: '#4b5563' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#e5e7eb' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4b5563' }}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
                </svg>
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-8 w-44 rounded-xl py-1.5 z-30 shadow-2xl"
                    style={{ background: '#0c1118', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {[
                      { label: isLive ? '⏹ Stop Project' : '▶ Start Project', action: 'toggle' },
                      { label: '🔄 Redeploy', action: 'redeploy' },
                      { label: '🗑 Delete', action: 'delete', danger: true },
                    ].map(item => (
                      <button key={item.label}
                        onClick={() => { setMenuOpen(false); onMenuAction?.(item.action, project._id) }}
                        className="w-full text-left px-4 py-2 text-sm transition-colors"
                        style={{ color: item.danger ? '#f87171' : '#9ca3af' }}
                        onMouseEnter={e => e.currentTarget.style.background = item.danger ? 'rgba(248,113,113,0.08)' : 'rgba(255,255,255,0.04)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        {item.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Domain */}
        <a href={`https://${project.domain}`} target="_blank" rel="noreferrer"
          className="flex items-center gap-1.5 text-xs mb-4 transition-colors"
          style={{ color: '#374151' }}
          onMouseEnter={e => e.currentTarget.style.color = '#00e5ff'}
          onMouseLeave={e => e.currentTarget.style.color = '#374151'}>
          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <span className="truncate">{project.domain}</span>
        </a>

        {/* Stats — no RAM, no uptime */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { label: 'Requests', value: project.totalRequest ? project.totalRequest.toLocaleString() : '0' },
            { label: 'Builds',   value: project.totalBuilds ?? '0' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-2.5 text-center"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="font-syne font-bold text-sm text-white">{s.value}</div>
              <div className="text-[10px] mt-0.5" style={{ color: '#374151' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <span className="text-[11px]" style={{ color: '#374151' }}>Updated {timeAgo(project.updatedAt)}</span>
          <div className="flex gap-1">
            {[
              { label: 'Files',     to: `/project/${project._id}/files` },
              { label: 'Analytics', to: `/project/${project._id}/analytics` },
              { label: 'Settings',  to: `/project/${project._id}/settings` },
            ].map(btn => (
              <Link key={btn.label} to={btn.to}
                className="text-[11px] font-medium px-2.5 py-1.5 rounded-lg transition-all"
                style={{ color: '#4b5563', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#e5e7eb'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#4b5563'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}>
                {btn.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }} />
          <div className="space-y-1.5 flex-1">
            <div className="h-3 rounded-md w-32" style={{ background: 'rgba(255,255,255,0.05)' }} />
            <div className="h-2.5 rounded-md w-16" style={{ background: 'rgba(255,255,255,0.03)' }} />
          </div>
        </div>
        <div className="h-2.5 rounded-md w-48" style={{ background: 'rgba(255,255,255,0.04)' }} />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-12 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }} />
          <div className="h-12 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }} />
        </div>
      </div>
    </div>
  )
}

function EmptyState({ navigate }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.15)' }}>
        <svg className="w-8 h-8" style={{ color: '#00e5ff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>
      <h3 className="font-syne font-black text-xl text-white mb-2">No projects yet</h3>
      <p className="text-sm mb-6" style={{ color: '#4b5563' }}>Deploy your first site or app in under 60 seconds.</p>
      <button onClick={() => navigate('/static/new')}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-black transition-all hover:scale-105"
        style={{ background: 'linear-gradient(135deg, #00e5ff, #00b8cc)', boxShadow: '0 4px 20px rgba(0,229,255,0.25)' }}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
        Deploy First Project
      </button>
    </div>
  )
}

export function Projects() {
  const navigate = useNavigate()
  const { api }  = useAuth()

  const [projects, setProjects]             = useState([])
  const [loading, setLoading]               = useState(true)
  const [error, setError]                   = useState(null)
  const [filter, setFilter]                 = useState('all')
  const [sort, setSort]                     = useState('recent')
  const [showTypeSelector, setShowTypeSelector] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get('/projects')
      .then(res => setProjects(res.data?.projects || []))
      .catch(() => setError('Failed to load projects.'))
      .finally(() => setLoading(false))
  }, [])

  const liveCount    = projects.filter(p => p.status === 'live').length
  const stoppedCount = projects.filter(p => p.status === 'stopped').length

  const filtered = projects
    .filter(p => filter === 'all' || p.status === filter)
    .sort((a, b) => {
      if (sort === 'name')     return a.name.localeCompare(b.name)
      if (sort === 'requests') return b.totalRequest - a.totalRequest
      return new Date(b.createdAt) - new Date(a.createdAt)
    })

  function handleMenuAction(action, projectId) {
    // wire up to your APIs when ready
    console.log(action, projectId)
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }} className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.15em] uppercase mb-1.5" style={{ color: '#00e5ff' }}>Projects</p>
          <h1 className="font-syne font-black text-[28px] text-white leading-none">Your Projects</h1>
          {!loading && (
            <p className="text-sm mt-1.5" style={{ color: '#4b5563' }}>
              <span className="text-emerald-400 font-medium">{liveCount} live</span>
              {' · '}{stoppedCount} stopped · {projects.length} total
            </p>
          )}
        </div>

        {/* New Project button */}
        <div className="relative flex-shrink-0">
          <button onClick={() => setShowTypeSelector(p => !p)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-black transition-all hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #00e5ff, #00b8cc)', boxShadow: '0 4px 20px rgba(0,229,255,0.25)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>

          {showTypeSelector && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowTypeSelector(false)} />
              <div className="absolute right-0 top-11 w-52 rounded-2xl overflow-hidden z-30 shadow-2xl"
                style={{ background: '#080c12', border: '1px solid rgba(255,255,255,0.09)' }}>
                <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, #00e5ff, transparent)' }} />
                <div className="p-1.5">
                  {[
                    { key: 'static', label: 'Static Site', desc: 'React, Vue, HTML/CSS', icon: (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    )},
                    { key: 'node', label: 'Node.js', desc: 'Express, Fastify, any Node app', icon: (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
                      </svg>
                    )},
                  ].map(t => (
                    <button key={t.key} onClick={() => { setShowTypeSelector(false); navigate(`/${t.key}/new`) }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                      style={{ color: '#9ca3af' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#fff' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9ca3af' }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(0,229,255,0.08)', color: '#00e5ff' }}>
                        {t.icon}
                      </div>
                      <div>
                        <div className="text-sm font-bold leading-none mb-0.5">{t.label}</div>
                        <div className="text-[10px]" style={{ color: '#374151' }}>{t.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 rounded-xl text-sm" style={{ color: '#f87171', background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.15)' }}>
          {error}
        </div>
      )}

      {/* Filter bar */}
      {!loading && projects.length > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { k: 'all',     l: `All (${projects.length})` },
              { k: 'live',    l: `Live (${liveCount})` },
              { k: 'stopped', l: `Stopped (${stoppedCount})` },
            ].map(t => (
              <button key={t.k} onClick={() => setFilter(t.k)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200"
                style={filter === t.k
                  ? { background: 'rgba(0,229,255,0.1)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.15)' }
                  : { color: '#4b5563', border: '1px solid transparent' }}>
                {t.l}
              </button>
            ))}
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="text-xs rounded-xl px-3 py-2 outline-none cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#6b7280' }}>
            <option value="recent">Recent first</option>
            <option value="name">Name A–Z</option>
            <option value="requests">Most requests</option>
          </select>
        </div>
      )}

      {/* Grid */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          [1,2,3].map(i => <SkeletonCard key={i} />)
        ) : filtered.length === 0 ? (
          <EmptyState navigate={navigate} />
        ) : (
          filtered.map(p => (
            <ProjectCard key={p._id} project={p} onMenuAction={handleMenuAction} />
          ))
        )}
      </div>

    </div>
  )
}

export default Projects