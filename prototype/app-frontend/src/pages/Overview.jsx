import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/apiclient' 

// ── Helpers ───────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

// ── Animated counter ──────────────────────────────────────
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

// ── Configs ───────────────────────────────────────────────
const STATUS = {
  live:           { label: 'Live',      color: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.2)',  pulse: true  },
  stopped:        { label: 'Stopped',   color: '#6b7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.2)', pulse: false },
  building:       { label: 'Building',  color: '#00e5ff', bg: 'rgba(0,229,255,0.08)',   border: 'rgba(0,229,255,0.2)',   pulse: true  },
  pending:        { label: 'Pending',   color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)',  pulse: false },
  'failed-deploy':{ label: 'Failed',    color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)', pulse: false },
}

const BUILD_STATUS = {
  success: { label: 'Success', color: '#34d399', icon: '✓' },
  failed:  { label: 'Failed',  color: '#f87171', icon: '✕' },
  pending: { label: 'Pending', color: '#f59e0b', icon: '◌' },
}

// ── Skeleton ──────────────────────────────────────────────
function Skeleton({ w = 'w-24', h = 'h-3' }) {
  return <div className={`${w} ${h} rounded-lg animate-pulse`} style={{ background: 'rgba(255,255,255,0.06)' }} />
}

export default function Overview() {
  const { id: projectId } = useParams()

  const [project,   setProject]   = useState(null)
  const [lastBuild, setLastBuild] = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    setLoading(true)
    api.get(`/projects/${projectId}/overview`)
      .then(res => {
        setProject(res.data.project)
        setLastBuild(res.data.lastBuild)
      })
      .catch(() => setError('Failed to load project.'))
      .finally(() => setLoading(false))
  }, [projectId])

  if (error) return (
    <div className="flex items-center justify-center h-48">
      <div className="text-sm px-4 py-3 rounded-xl" style={{ color: '#f87171', background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.15)' }}>
        {error}
      </div>
    </div>
  )

  const p  = project
  const s  = STATUS[p?.status] || STATUS.stopped
  const bs = BUILD_STATUS[lastBuild?.status] || BUILD_STATUS.pending

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }} className="space-y-5 pb-8">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-bold tracking-[0.15em] uppercase mb-1.5" style={{ color: '#00e5ff' }}>Overview</p>
          {loading
            ? <Skeleton w="w-40" h="h-7" />
            : <h1 className="font-syne font-black text-[26px] text-white leading-none">{p.name}</h1>
          }
          <div className="flex items-center gap-2.5 mt-2 flex-wrap">
            {loading ? (
              <><Skeleton w="w-16" h="h-5" /><Skeleton w="w-10" h="h-5" /><Skeleton w="w-14" h="h-5" /></>
            ) : (
              <>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.pulse ? 'animate-pulse' : ''}`}
                    style={{ background: s.color }} />
                  {s.label}
                </span>
                <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md"
                  style={{
                    background: p.plan === 'pro' ? 'rgba(0,229,255,0.08)' : 'rgba(255,255,255,0.04)',
                    color: p.plan === 'pro' ? '#00e5ff' : '#4b5563',
                    border: p.plan === 'pro' ? '1px solid rgba(0,229,255,0.15)' : '1px solid transparent',
                  }}>
                  {p.plan}
                </span>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md"
                  style={{ background: 'rgba(255,255,255,0.04)', color: '#4b5563' }}>
                  {p.projectType === 'node' ? 'Node.js' : 'Static'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {loading ? <Skeleton w="w-24" h="h-9" /> : (
            <>
              <a href={`https://${p.domain}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
                style={{ background: 'rgba(0,229,255,0.08)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.15)' }}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Visit Site
              </a>
              <Link to={`/project/${projectId}/builds`}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.04)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.07)' }}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Redeploy
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { label: 'Total Requests', accent: true,  color: '#00e5ff', val: p?.totalRequest || 0 },
          { label: 'Total Builds',                  color: '#34d399', val: p?.totalBuilds  || 0 },
          { label: 'Project Type',                  color: '#a78bfa', custom: !loading && (
            <div className="font-syne font-black text-2xl" style={{ color: '#a78bfa' }}>
              {p?.projectType === 'node' ? 'Node.js' : 'Static'}
            </div>
          )},
        ].map(card => (
          <div key={card.label}
            className="relative rounded-2xl p-4 overflow-hidden transition-all hover:-translate-y-0.5"
            style={card.accent
              ? { background: 'linear-gradient(135deg,rgba(0,229,255,0.07),rgba(0,229,255,0.02))', border: '1px solid rgba(0,229,255,0.15)' }
              : { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {card.accent && <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl" style={{ background: 'rgba(0,229,255,0.1)' }} />}
            <div className="text-[10px] font-bold tracking-[0.15em] uppercase relative z-10"
              style={{ color: card.accent ? 'rgba(0,229,255,0.6)' : '#4b5563' }}>
              {card.label}
            </div>
            <div className="mt-1 relative z-10">
              {loading
                ? <Skeleton w="w-16" h="h-8" />
                : card.custom || (
                  <div className="font-syne font-black text-3xl" style={{ color: card.color }}>
                    <Counter to={card.val} />
                  </div>
                )
              }
            </div>
          </div>
        ))}
      </div>

      {/* ── Last Build + Deployment Info ── */}
      <div className="grid lg:grid-cols-2 gap-4">

        {/* Last build */}
        <div className="rounded-2xl p-5 flex flex-col gap-4"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: '#4b5563' }}>Latest Build</p>
            <Link to={`/project/${projectId}/builds`}
              className="text-[10px] font-bold hover:opacity-70 transition-opacity" style={{ color: '#00e5ff' }}>
              All builds →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton w="w-9 h-9" h="h-9" />
                <div className="space-y-1.5"><Skeleton w="w-20" /><Skeleton w="w-28" /></div>
              </div>
              <Skeleton w="w-full" h="h-16" />
            </div>
          ) : !lastBuild ? (
            <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <svg className="w-5 h-5" style={{ color: '#374151' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-sm" style={{ color: '#374151' }}>No builds yet</p>
            </div>
          ) : (
            <>
              {/* Status row */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0"
                  style={{ background: `${bs.color}15`, border: `1px solid ${bs.color}30`, color: bs.color }}>
                  {bs.icon}
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: bs.color }}>{bs.label}</div>
                  <div className="text-[10px]" style={{ color: '#374151' }}>
                    {timeAgo(lastBuild.createdAt)}
                    {lastBuild.duration && ` · ${lastBuild.duration}`}
                  </div>
                </div>
              </div>

              {/* Build details */}
              <div className="rounded-xl p-3 space-y-2"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                {lastBuild.commitSha && (
                  <div className="flex items-center gap-2">
                    <svg className="w-3 h-3 flex-shrink-0" style={{ color: '#4b5563' }} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12c0-5.523-4.477-10-10-10z"/>
                    </svg>
                    <span className="text-[11px] font-mono" style={{ color: '#6b7280' }}>
                      {lastBuild.commitSha.slice(0, 7)}
                    </span>
                  </div>
                )}
                <div className="text-[10px]" style={{ color: '#374151' }}>
                  Build ID: <span className="font-mono" style={{ color: '#4b5563' }}>{String(lastBuild._id).slice(-8)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Deployment info */}
        <div className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-4" style={{ color: '#4b5563' }}>
            Deployment Info
          </p>
          {loading ? (
            <div className="space-y-3">{[1,2,3,4,5].map(i => (
              <div key={i} className="flex justify-between"><Skeleton w="w-16" /><Skeleton w="w-32" /></div>
            ))}</div>
          ) : (
            <div className="space-y-3">
              {[
                { k: 'Domain',    v: p.domain,                                          link: `https://${p.domain}` },
                { k: 'Repo',      v: p.repoLink.replace('https://github.com/', ''),     link: p.repoLink },
                { k: 'Branch',    v: p.settings?.repoBranchName || 'main' },
                { k: 'Build Cmd', v: p.buildCommand || '—' },
                p.projectType === 'Static'
                  ? { k: 'Publish Dir', v: p.publishDir   || '—' }
                  : { k: 'Start Cmd',   v: p.startCommand || '—' },
                p.port ? { k: 'Port', v: String(p.port) } : null,
              ].filter(Boolean).map(row => (
                <div key={row.k} className="flex items-center justify-between gap-4">
                  <span className="text-xs flex-shrink-0" style={{ color: '#4b5563' }}>{row.k}</span>
                  {row.link ? (
                    <a href={row.link} target="_blank" rel="noreferrer"
                      className="text-xs font-mono truncate max-w-[60%] text-right transition-colors"
                      style={{ color: '#6b7280' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#00e5ff'}
                      onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}>
                      {row.v}
                    </a>
                  ) : (
                    <span className="text-xs font-mono truncate max-w-[60%] text-right" style={{ color: '#9ca3af' }}>
                      {row.v}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Quick links ── */}
      <div className="rounded-2xl p-5"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-4" style={{ color: '#4b5563' }}>Quick Links</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { to: `/project/${projectId}/logs`,     label: 'View Logs',     color: '#00e5ff', icon: 'M9 12h6m-6 4h6M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8' },
            { to: `/project/${projectId}/builds`,   label: 'Build History', color: '#a78bfa', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
            { to: `/project/${projectId}/metrics`,  label: 'Metrics',       color: '#34d399', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
            { to: `/project/${projectId}/settings`, label: 'Settings',      color: '#f59e0b', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
            { to: `/project/${projectId}/domains`,  label: 'Domains',       color: '#60a5fa', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' },
            { to: `/project/${projectId}/billing`,  label: 'Billing',       color: '#f87171', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
          ].map(item => (
            <Link key={item.to} to={item.to}
              className="flex items-center gap-2.5 p-3 rounded-xl transition-all"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)' }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${item.color}12`, color: item.color }}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={item.icon} />
                </svg>
              </div>
              <span className="text-xs font-medium text-white">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Footer meta ── */}
      {!loading && p && (
        <div className="flex items-center gap-4 text-[11px] px-1 flex-wrap" style={{ color: '#1f2937' }}>
          <span>Created {formatDate(p.createdAt)}</span>
          <span>·</span>
          <span>Updated {timeAgo(p.updatedAt)}</span>
          <span>·</span>
          <span className="font-mono">{String(p._id)}</span>
        </div>
      )}

    </div>
  )
}