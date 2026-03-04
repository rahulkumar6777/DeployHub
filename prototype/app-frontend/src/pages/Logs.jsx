import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { io } from 'socket.io-client'

const SOCKET_URL = 'http://localhost:5000'

function lineColor(line) {
  const l = line.toLowerCase()
  if (l.includes('error') || l.includes('err:') || l.includes('fatal')) return '#f87171'
  if (l.includes('warn'))  return '#f59e0b'
  if (l.includes('info'))  return '#60a5fa'
  if (l.includes('success') || l.includes('ready') || l.includes('started')) return '#34d399'
  return '#9ca3af'
}

function timestamp() {
  const d = new Date()
  return d.toTimeString().slice(0, 8)
}

export default function Logs() {
  const { id: projectId } = useParams()
  const bottomRef         = useRef(null)
  const socketRef         = useRef(null)

  const [lines,      setLines]      = useState([])
  const [connected,  setConnected]  = useState(false)
  const [error,      setError]      = useState(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const [filter,     setFilter]     = useState('')
  const [paused,     setPaused]     = useState(false)
  const pausedRef = useRef(false)

  useEffect(() => {
    pausedRef.current = paused
  }, [paused])

  // ── Socket setup ──────────────────────────────────────
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    })
    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      setError(null)
      socket.emit('joinLogs', { projectId })
    })

    socket.on('disconnect', () => {
      setConnected(false)
    })

    socket.on('connect_error', () => {
      setError('Could not connect to log server.')
      setConnected(false)
    })

    socket.on('logs', (log) => {
      if (pausedRef.current) return
      const raw = typeof log === 'string' ? log : JSON.stringify(log)
      // Docker prepends 8-byte header — strip non-printable prefix
      const clean = raw.replace(/[\x00-\x07]/g, '').replace(/^\s*[\x08]/, '').trimEnd()
      if (!clean) return

      const entry = { id: Date.now() + Math.random(), text: clean, time: timestamp() }
      setLines(prev => {
        const next = [...prev, entry]
        return next.length > 2000 ? next.slice(-2000) : next
      })
    })

    return () => {
      socket.disconnect()
    }
  }, [projectId])

  // ── Auto scroll ───────────────────────────────────────
  useEffect(() => {
    if (autoScroll && !paused) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [lines, autoScroll, paused])

  function clearLogs() {
    setLines([])
  }

  const filtered = filter
    ? lines.filter(l => l.text.toLowerCase().includes(filter.toLowerCase()))
    : lines

  // ── Status dot ────────────────────────────────────────
  const StatusDot = () => (
    <div className="flex items-center gap-1.5">
      <div className={'w-2 h-2 rounded-full ' + (connected ? 'animate-pulse' : '')}
        style={{ background: error ? '#f87171' : connected ? '#34d399' : '#f59e0b' }} />
      <span className="text-[11px] font-bold"
        style={{ color: error ? '#f87171' : connected ? '#34d399' : '#f59e0b' }}>
        {error ? 'Error' : connected ? 'Live' : 'Connecting…'}
      </span>
    </div>
  )

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }} className="space-y-4 pb-6 h-full flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs font-bold tracking-[0.15em] uppercase mb-1" style={{ color: '#00e5ff' }}>Logs</p>
          <h1 className="font-syne font-black text-[24px] text-white leading-none">Runtime Logs</h1>
        </div>
        <StatusDot />
      </div>

      {/* Error banner */}
      {error && (
        <div className="px-4 py-3 rounded-xl text-sm flex items-center gap-2"
          style={{ background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171' }}>
          <span>⚠</span> {error}
          <button onClick={() => { setError(null); socketRef.current?.connect() }}
            className="ml-auto text-xs font-bold opacity-70 hover:opacity-100">
            Retry
          </button>
        </div>
      )}

      {/* Terminal */}
      <div className="flex-1 rounded-2xl overflow-hidden flex flex-col"
        style={{ background: '#060a0f', border: '1px solid rgba(255,255,255,0.07)', minHeight: '0' }}>

        {/* Toolbar */}
        <div className="flex items-center gap-3 px-4 py-2.5 flex-wrap"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>

          {/* macOS dots */}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(248,113,113,0.6)' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(245,158,11,0.6)' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(52,211,153,0.6)' }} />
          </div>

          <span className="text-[10px] font-mono tracking-widest uppercase ml-1" style={{ color: '#374151' }}>
            stdout / stderr
          </span>

          <div className="flex items-center gap-2 ml-auto">
            {/* Filter input */}
            <div className="relative">
              <svg className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: '#374151' }}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
              </svg>
              <input
                value={filter}
                onChange={e => setFilter(e.target.value)}
                placeholder="Filter logs…"
                className="pl-7 pr-3 py-1.5 rounded-lg text-xs font-mono outline-none w-36"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#e5e7eb' }}
              />
            </div>

            {/* Pause */}
            <button onClick={() => setPaused(p => !p)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all"
              style={{
                background: paused ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.04)',
                color:      paused ? '#f59e0b' : '#6b7280',
                border:     paused ? '1px solid rgba(245,158,11,0.2)' : '1px solid rgba(255,255,255,0.06)',
              }}>
              {paused ? (
                <><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>Resume</>
              ) : (
                <><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>Pause</>
              )}
            </button>

            {/* Auto scroll toggle */}
            <button onClick={() => setAutoScroll(p => !p)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all"
              style={{
                background: autoScroll ? 'rgba(0,229,255,0.08)' : 'rgba(255,255,255,0.04)',
                color:      autoScroll ? '#00e5ff' : '#6b7280',
                border:     autoScroll ? '1px solid rgba(0,229,255,0.15)' : '1px solid rgba(255,255,255,0.06)',
              }}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Scroll
            </button>

            {/* Clear */}
            <button onClick={clearLogs}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.06)' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear
            </button>

            {/* Line count */}
            <span className="text-[10px] font-mono" style={{ color: '#1f2937' }}>
              {filtered.length} lines
            </span>
          </div>
        </div>

        {/* Log lines */}
        <div className="overflow-y-auto flex-1 p-4 font-mono text-[11.5px] leading-[1.6] space-y-0"
          style={{ minHeight: '400px', maxHeight: 'calc(100vh - 280px)' }}>

          {!connected && !error && lines.length === 0 && (
            <div className="flex items-center gap-2 py-4" style={{ color: '#374151' }}>
              <div className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
              Connecting to log stream…
            </div>
          )}

          {connected && lines.length === 0 && !paused && (
            <div className="py-4" style={{ color: '#374151' }}>
              Waiting for logs… Make a request to your project to see output here.
            </div>
          )}

          {paused && (
            <div className="sticky top-0 mb-2 px-3 py-1.5 rounded-lg text-[11px] font-bold inline-flex items-center gap-2"
              style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
              ⏸ Paused — new logs are buffered
            </div>
          )}

          {filtered.map((line, i) => (
            <div key={line.id}
              className="flex gap-3 px-1 py-0.5 rounded hover:bg-white/[0.02] group">
              {/* Line number */}
              <span className="select-none w-8 text-right flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: '#1f2937' }}>
                {i + 1}
              </span>
              {/* Timestamp */}
              <span className="flex-shrink-0 select-none" style={{ color: '#1f2937' }}>
                {line.time}
              </span>
              {/* Log text */}
              <span style={{ color: lineColor(line.text), whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {filter ? (
                  // Highlight matched text
                  line.text.split(new RegExp('(' + filter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'))
                    .map((part, j) =>
                      part.toLowerCase() === filter.toLowerCase()
                        ? <mark key={j} style={{ background: 'rgba(0,229,255,0.2)', color: '#00e5ff', borderRadius: '2px' }}>{part}</mark>
                        : part
                    )
                ) : line.text}
              </span>
            </div>
          ))}

          <div ref={bottomRef} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
          <div className="flex items-center gap-3 text-[10px]" style={{ color: '#1f2937' }}>
            <StatusDot />
            {paused && <span style={{ color: '#f59e0b' }}>· paused</span>}
            {filter && <span style={{ color: '#00e5ff' }}>· filtering: "{filter}" ({filtered.length}/{lines.length})</span>}
          </div>
          <span className="text-[10px] font-mono" style={{ color: '#1f2937' }}>
            {projectId.slice(-8)}
          </span>
        </div>
      </div>

    </div>
  )
}