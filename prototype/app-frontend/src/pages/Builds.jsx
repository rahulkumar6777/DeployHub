import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/apiclient' 

function timeAgo(d) {
  if (!d) return '—'
  const diff = Date.now() - new Date(d).getTime()
  const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), dy = Math.floor(diff / 86400000)
  if (m < 1) return 'just now'
  if (m < 60) return m + 'm ago'
  if (h < 24) return h + 'h ago'
  return dy + 'd ago'
}

function calcDur(s, e) {
  if (!s || !e) return null
  const sec = Math.floor((new Date(e) - new Date(s)) / 1000)
  return sec < 60 ? sec + 's' : Math.floor(sec / 60) + 'm ' + (sec % 60) + 's'
}

const ST = {
  success: { label: 'Success', color: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.2)'  },
  failed:  { label: 'Failed',  color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)' },
  pending: { label: 'Building',color: '#00e5ff', bg: 'rgba(0,229,255,0.08)',   border: 'rgba(0,229,255,0.2)'   },
}

function StatusIcon({ status }) {
  if (status === 'success') return <span>&#10003;</span>
  if (status === 'failed')  return <span>&#10005;</span>
  return <span className="animate-pulse">&#9675;</span>
}

function SkeletonRow() {
  return (
    <div className="rounded-xl px-4 py-3.5 animate-pulse flex items-center gap-4"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="w-7 h-7 rounded-lg flex-shrink-0" style={{ background: 'rgba(255,255,255,0.05)' }} />
      <div className="flex-1 space-y-2">
        <div className="h-3 rounded w-40" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <div className="h-2.5 rounded w-56" style={{ background: 'rgba(255,255,255,0.03)' }} />
      </div>
      <div className="h-7 rounded-lg w-14 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.04)' }} />
    </div>
  )
}

export default function Builds() {
  const { id: projectId } = useParams()
  const navigate = useNavigate()

  const [builds,  setBuilds]  = useState([])
  const [total,   setTotal]   = useState(0)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    api.get('/projects/' + projectId + '/builds')
      .then(r => { setBuilds(r.data.builds || []); setTotal(r.data.total || 0) })
      .catch(() => setError('Failed to load builds.'))
      .finally(() => setLoading(false))
  }, [projectId])

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }} className="space-y-5 pb-10">

      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.15em] uppercase mb-1.5" style={{ color: '#00e5ff' }}>Builds</p>
          <h1 className="font-syne font-black text-[26px] text-white leading-none">Build History</h1>
        </div>
        {!loading && (
          <span className="text-sm mb-1" style={{ color: '#4b5563' }}>
            {total} total build{total !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl text-sm"
          style={{ color: '#f87171', background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.15)' }}>
          {error}
        </div>
      )}

      <div className="space-y-2">
        {loading ? (
          [1, 2, 3, 4].map(i => <SkeletonRow key={i} />)
        ) : builds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <svg className="w-6 h-6" style={{ color: '#374151' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-sm font-medium text-white mb-1">No builds yet</p>
            <p className="text-xs" style={{ color: '#374151' }}>Push to your repo to trigger the first build.</p>
          </div>
        ) : builds.map((build, i) => {
          const s   = ST[build.status] || ST.pending
          const dur = calcDur(build.startedAt, build.finishedAt)
          const num = total - i
          return (
            <div key={build._id}
              className="rounded-xl px-4 py-3.5 flex items-center gap-4 transition-all"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}>

              <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{ background: s.bg, border: '1px solid ' + s.border, color: s.color }}>
                <StatusIcon status={build.status} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-white">Build #{num}</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: s.bg, color: s.color }}>{s.label}</span>
                  {build.commitSha && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md"
                      style={{ background: 'rgba(255,255,255,0.05)', color: '#6b7280' }}>
                      {build.commitSha.slice(0, 7)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap text-[11px]" style={{ color: '#374151' }}>
                  <span>{timeAgo(build.createdAt)}</span>
                  {dur && <><span style={{ color: '#1f2937' }}>·</span><span>took {dur}</span></>}
                  {build.createdAt && (
                    <><span style={{ color: '#1f2937' }}>·</span>
                    <span style={{ color: '#1f2937' }}>
                      {new Date(build.createdAt).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </span></>
                  )}
                </div>
              </div>

              {build.logUrl ? (
                <button
                  onClick={() => navigate('/project/' + projectId + '/logs/' + build._id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold flex-shrink-0 transition-all hover:scale-105"
                  style={{ background: 'rgba(0,229,255,0.08)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.15)' }}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12h6m-6 4h6M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" />
                  </svg>
                  Logs
                </button>
              ) : (
                <span className="text-[11px] flex-shrink-0" style={{ color: '#1f2937' }}>No logs</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}