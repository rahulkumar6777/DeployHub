import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const DUMMY_PROJECTS = [
  { id: '1', name: 'my-portfolio',  type: 'static', status: 'live',    url: 'my-portfolio.nesthost.app',  requests: 847,  ram: 128, cpu: 0.02, uptime: '99.9%', deployedAt: '2 hours ago', createdAt: 'Jan 12, 2025' },
  { id: '2', name: 'node-backend',  type: 'nodejs', status: 'live',    url: 'node-backend.nesthost.app',  requests: 1203, ram: 256, cpu: 0.05, uptime: '99.7%', deployedAt: '1 day ago',   createdAt: 'Jan 8, 2025' },
  { id: '3', name: 'test-site',     type: 'static', status: 'stopped', url: 'test-site.nesthost.app',     requests: 0,    ram: 0,   cpu: 0,    uptime: '—',     deployedAt: '3 days ago',  createdAt: 'Dec 28, 2024' },
]

const STATUS = {
  live:     { text: 'Live',     dot: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.18)',  color: '#34d399' },
  stopped:  { text: 'Stopped',  dot: '#6b7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.18)', color: '#6b7280' },
  building: { text: 'Building', dot: '#00e5ff', bg: 'rgba(0,229,255,0.08)',   border: 'rgba(0,229,255,0.18)',   color: '#00e5ff' },
  error:    { text: 'Error',    dot: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.18)', color: '#f87171' },
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

function ProjectCard({ project }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const isLive = project.status === 'live'

  return (
    <div className="relative rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 group"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
      onMouseEnter={e => e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'}
      onMouseLeave={e => e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'}>

      {/* Top accent bar */}
      <div className="h-px w-full" style={{ background: isLive ? 'linear-gradient(90deg, #34d399, transparent)' : 'linear-gradient(90deg, rgba(107,114,128,0.5), transparent)' }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-syne font-black text-sm"
              style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.12), rgba(124,58,237,0.08))', border: '1px solid rgba(0,229,255,0.12)', color: '#00e5ff' }}>
              {project.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="font-syne font-bold text-white text-[15px] truncate">{project.name}</div>
              <span className="text-[10px] font-bold tracking-[0.1em] uppercase px-1.5 py-0.5 rounded-md"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#4b5563' }}>
                {project.type === 'nodejs' ? 'Node.js' : 'Static'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <StatusPill status={project.status} />
            {/* 3-dot menu */}
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
                <div className="absolute right-0 top-8 w-44 rounded-xl py-1.5 z-30 shadow-2xl"
                  style={{ background: '#0c1118', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {[
                    { label: isLive ? '⏹ Stop Project' : '▶ Start Project' },
                    { label: '🔄 Redeploy' },
                    { label: '🗑 Delete', danger: true },
                  ].map(item => (
                    <button key={item.label} onClick={() => setMenuOpen(false)}
                      className="w-full text-left px-4 py-2 text-sm transition-colors"
                      style={{ color: item.danger ? '#f87171' : '#9ca3af' }}
                      onMouseEnter={e => e.currentTarget.style.background = item.danger ? 'rgba(248,113,113,0.08)' : 'rgba(255,255,255,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* URL */}
        <a href={`https://${project.url}`} target="_blank" rel="noreferrer"
          className="flex items-center gap-1.5 text-xs mb-4 transition-colors"
          style={{ color: '#374151' }}
          onMouseEnter={e => e.currentTarget.style.color = '#00e5ff'}
          onMouseLeave={e => e.currentTarget.style.color = '#374151'}>
          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <span className="truncate">{project.url}</span>
        </a>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Requests', value: project.requests ? project.requests.toLocaleString() : '—' },
            { label: 'RAM',      value: project.ram ? `${project.ram}MB` : '—' },
            { label: 'Uptime',   value: project.uptime },
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
          <span className="text-[11px]" style={{ color: '#374151' }}>Deployed {project.deployedAt}</span>
          <div className="flex gap-1">
            {[
              { label: 'Files',     to: `/project/${project.id}/files` },
              { label: 'Analytics', to: `/project/${project.id}/analytics` },
              { label: 'Settings',  to: `/project/${project.id}/settings` },
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

function EmptyState() {
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
      <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-black transition-all hover:scale-105"
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
  const [filter, setFilter] = useState('all')
  const [sort,   setSort]   = useState('recent')
  const [showTypeSelector, setShowTypeSelector] = useState(false)

  const liveCount    = DUMMY_PROJECTS.filter(p => p.status === 'live').length
  const stoppedCount = DUMMY_PROJECTS.filter(p => p.status === 'stopped').length

  const filtered = DUMMY_PROJECTS
    .filter(p => filter === 'all' || p.status === filter)
    .sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : sort === 'requests' ? b.requests - a.requests : 0)

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }} className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.15em] uppercase mb-1.5" style={{ color: '#00e5ff' }}>Projects</p>
          <h1 className="font-syne font-black text-[28px] text-white leading-none">Your Projects</h1>
          <p className="text-sm mt-1.5" style={{ color: '#4b5563' }}>
            <span className="text-emerald-400 font-medium">{liveCount} live</span>
            {' · '}{stoppedCount} stopped · {DUMMY_PROJECTS.length} total
          </p>
        </div>
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

      {/* Filter bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { k: 'all',     l: `All (${DUMMY_PROJECTS.length})` },
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

      {/* Grid */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.length === 0 ? <EmptyState /> : filtered.map(p => <ProjectCard key={p.id} project={p} />)}
      </div>

      {/* Plan limit notice */}
      {DUMMY_PROJECTS.length >= 3 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.12)' }}>
          <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#00e5ff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm" style={{ color: '#00e5ff' }}>
            You've reached the <strong>3 project limit</strong> on the Free plan.
          </span>
          <Link to="/billing" className="ml-auto text-xs font-black" style={{ color: '#00e5ff' }}>Upgrade →</Link>
        </div>
      )}
    </div>
  )
}

export default Projects