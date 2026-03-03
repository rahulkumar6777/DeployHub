import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function duration(start, end) {
  if (!start || !end) return null
  const s = Math.floor((new Date(end) - new Date(start)) / 1000)
  return s < 60 ? `${s}s` : `${Math.floor(s/60)}m ${s%60}s`
}

const S = {
  success: { label:'Success', color:'#34d399', bg:'rgba(52,211,153,0.08)',  border:'rgba(52,211,153,0.2)'  },
  failed:  { label:'Failed',  color:'#f87171', bg:'rgba(248,113,113,0.08)', border:'rgba(248,113,113,0.2)' },
  pending: { label:'Building',color:'#00e5ff', bg:'rgba(0,229,255,0.08)',   border:'rgba(0,229,255,0.2)'   },
}

function lineColor(line) {
  const l = line.toLowerCase()
  if (l.includes('error') || l.includes('err!') || l.includes('failed')) return '#f87171'
  if (l.includes('warn'))  return '#f59e0b'
  if (l.includes('success') || l.includes('done') || l.includes('built in')) return '#34d399'
  if (line.startsWith('>') || line.startsWith('$') || line.startsWith('+ ')) return '#00e5ff'
  return '#9ca3af'
}

export default function BuildLogs() {
  const { id: projectId, buildId } = useParams()
  const navigate = useNavigate()
  const { api }  = useAuth()
  const bottomRef = useRef(null)

  const [build,   setBuild]   = useState(null)
  const [lines,   setLines]   = useState([])
  const [loading, setLoading] = useState(true)
  const [logErr,  setLogErr]  = useState(null)

  useEffect(() => {
    // Fetch build meta
    api.get(`/projects/${projectId}/builds/${buildId}`)
      .then(async res => {
        const b = res.data.build
        setBuild(b)

        if (!b.logUrl) { setLoading(false); return }

        // Fetch log file directly from logUrl (S3/storage)
        try {
          const r = await fetch(b.logUrl)
          if (!r.ok) throw new Error()
          const text = await r.text()
          setLines(text.split('\n').filter(Boolean))
        } catch {
          setLogErr('Could not load log file.')
        } finally {
          setLoading(false)
        }
      })
      .catch(() => navigate(`/project/${projectId}/builds`))
  }, [buildId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  const s   = S[build?.status] || S.pending
  const dur = duration(build?.startedAt, build?.finishedAt)

  return (
    <div style={{maxWidth:'900px', margin:'0 auto'}} className="space-y-4 pb-10">

      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => navigate(`/project/${projectId}/builds`)}
          className="flex items-center gap-1.5 text-xs font-bold transition-opacity hover:opacity-70"
          style={{color:'#4b5563'}}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Back to Builds
        </button>
        <span style={{color:'#1f2937'}}>·</span>
        <p className="text-xs font-bold tracking-[0.15em] uppercase" style={{color:'#00e5ff'}}>Logs</p>
      </div>

      {/* Build meta card */}
      {build && (
        <div className="rounded-2xl px-5 py-4 flex items-center gap-4 flex-wrap"
          style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)'}}>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold flex-shrink-0"
              style={{background:s.bg, border:`1px solid ${s.border}`, color:s.color}}>
              {build.status === 'success' ? '✓' : build.status === 'failed' ? '✕' : '◌'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Build Log</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={{background:s.bg, color:s.color}}>{s.label}</span>
                {build.commitSha && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md"
                    style={{background:'rgba(255,255,255,0.05)',color:'#6b7280'}}>
                    {build.commitSha.slice(0,7)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-[11px]" style={{color:'#374151'}}>
                {dur && <span>Duration: {dur}</span>}
                {dur && build.createdAt && <span>·</span>}
                {build.createdAt && (
                  <span>{new Date(build.createdAt).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</span>
                )}
              </div>
            </div>
          </div>
          {build.logUrl && (
            <a href={build.logUrl} target="_blank" rel="noreferrer"
              className="text-[11px] font-bold hover:opacity-70 transition-opacity flex-shrink-0"
              style={{color:'#00e5ff'}}>
              Raw ↗
            </a>
          )}
        </div>
      )}

      {/* Log viewer */}
      <div className="rounded-2xl overflow-hidden"
        style={{background:'#060a0f', border:'1px solid rgba(255,255,255,0.06)'}}>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5"
          style={{borderBottom:'1px solid rgba(255,255,255,0.05)', background:'rgba(255,255,255,0.02)'}}>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{background:'rgba(248,113,113,0.5)'}}/>
            <div className="w-3 h-3 rounded-full" style={{background:'rgba(245,158,11,0.5)'}}/>
            <div className="w-3 h-3 rounded-full" style={{background:'rgba(52,211,153,0.5)'}}/>
            <span className="text-[10px] font-mono ml-2 tracking-widest uppercase" style={{color:'#374151'}}>
              build output
            </span>
          </div>
          {!loading && !logErr && (
            <span className="text-[10px]" style={{color:'#374151'}}>{lines.length} lines</span>
          )}
        </div>

        {/* Lines */}
        <div className="overflow-y-auto p-4 font-mono text-[11px] leading-5"
          style={{minHeight:'300px', maxHeight:'65vh'}}>
          {loading ? (
            <div className="flex items-center gap-2 p-2" style={{color:'#374151'}}>
              <div className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin"/>
              Loading logs…
            </div>
          ) : logErr ? (
            <span style={{color:'#f87171'}}>{logErr}</span>
          ) : !build?.logUrl ? (
            <span style={{color:'#374151'}}>No log file available for this build.</span>
          ) : lines.length === 0 ? (
            <span style={{color:'#374151'}}>No output captured.</span>
          ) : (
            lines.map((line, i) => (
              <div key={i} className="flex gap-3 hover:bg-white/[0.02] px-1 rounded">
                <span className="select-none w-8 text-right flex-shrink-0 pt-px" style={{color:'#1f2937'}}>
                  {i+1}
                </span>
                <span style={{color:lineColor(line), whiteSpace:'pre-wrap', wordBreak:'break-all'}}>
                  {line}
                </span>
              </div>
            ))
          )}
          <div ref={bottomRef}/>
        </div>
      </div>
    </div>
  )
}