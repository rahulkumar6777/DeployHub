import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import { api } from '../api/apiclient'



// Project status types
const nodeenv = "production"
const SOCKET_URL = nodeenv === 'production' ? 'https://api.deployhub.cloud' : 'http://localhost:5000';

const STATUS = {
    building: 'building',
    live: 'live',
    failed: 'failed-deploy',
    pending: 'pending',
}

function lineColor(line) {
    const l = line.toLowerCase()
    if (l.includes('error') || l.includes('err:') || l.includes('fatal')) return '#f87171'
    if (l.includes('warn')) return '#f59e0b'
    if (l.includes('info')) return '#60a5fa'
    if (l.includes('success') || l.includes('ready') || l.includes('done') || l.includes('started')) return '#34d399'
    if (l.includes('[deployhub]')) return '#a78bfa'
    return '#9ca3af'
}

function StatusBadge({ status }) {
    const map = {
        building: { label: 'Building', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', pulse: true },
        live: { label: 'Live', color: '#34d399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.2)', pulse: true },
        'failed-deploy': { label: 'Failed', color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)', pulse: false },
        pending: { label: 'Pending', color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.2)', pulse: true },
    }
    const s = map[status] || { label: status, color: '#4b5563', bg: 'rgba(255,255,255,0.04)', border: 'transparent', pulse: false }
    return (
        <div className="flex items-center gap-1.5">
            <div className={'w-2 h-2 rounded-full ' + (s.pulse ? 'animate-pulse' : '')}
                style={{ background: s.color }} />
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                {s.label}
            </span>
        </div>
    )
}

export default function Logs() {
    const { id: projectId } = useParams()
    const socketRef = useRef(null)
    const bottomRef = useRef(null)

    const [projectStatus, setProjectStatus] = useState(null)  // 'building' | 'live' | 'failed-deploy'
    const [lastBuild, setLastBuild] = useState(null)
    const [lines, setLines] = useState([])
    const [mode, setMode] = useState(null)   // 'build' | 'live' | 'static'
    const [socketStatus, setSocketStatus] = useState('disconnected')
    const [filter, setFilter] = useState('')
    const [autoScroll, setAutoScroll] = useState(true)
    const [paused, setPaused] = useState(false)
    const [staticLoading, setStaticLoading] = useState(false)
    const [buildDone, setBuildDone] = useState(null)   // { status, logUrl }

    const pausedRef = useRef(false)
    useEffect(() => { pausedRef.current = paused }, [paused])

    // ── 1. Fetch status on mount ──────────────────────────
    useEffect(() => {
        api.get(`/projects/${projectId}/logs-status`)
            .then(r => {
                setProjectStatus(r.data.projectStatus)
                setLastBuild(r.data.lastBuild)
            })
            .catch(console.error)
    }, [projectId])

    // ── 2. Connect socket based on status ────────────────
    useEffect(() => {
        if (!projectStatus) return

        const socket = io(SOCKET_URL, {
            transports: ['websocket'],
            reconnectionAttempts: 5,
        })
        socketRef.current = socket

        socket.on('connect', () => {
            setSocketStatus('connected')

            if (projectStatus === STATUS.building || projectStatus === STATUS.pending) {
                // Join build logs room
                setMode('build')
                setLines([{ id: Date.now(), text: '[deployhub] Connecting to build stream...', time: '' }])
                socket.emit('joinBuildLogs', { projectId })

            } else if (projectStatus === STATUS.live) {
                // Join runtime logs room
                setMode('live')
                socket.emit('joinLogs', { projectId })

            } else {
                // Failed or other — load static logs from Minio
                setMode('static')
                socket.disconnect()
                if (lastBuild?.logUrl) loadStaticLogs(lastBuild.logUrl)
            }
        })

        socket.on('disconnect', () => setSocketStatus('disconnected'))
        socket.on('connect_error', () => setSocketStatus('error'))

        // ── Build log line ──────────────────────────────────
        socket.on('buildLog', (log) => {
            if (pausedRef.current) return
            appendLine(log)
        })

        // ── Build complete ──────────────────────────────────
        socket.on('buildComplete', ({ status, logUrl }) => {
            setBuildDone({ status, logUrl })
            appendLine(`[deployhub] Build ${status}`)
            // setProjectStatus(status === 'success' ? STATUS.live : STATUS.failed)
        })

        // ── Runtime log line ────────────────────────────────
        socket.on('logs', (log) => {
            if (pausedRef.current) return
            const clean = log.toString().replace(/[\x00-\x07]/g, '').trimEnd()
            if (clean) appendLine(clean)
        })

        return () => socket.disconnect()
    }, [projectStatus])

    // ── Auto scroll ───────────────────────────────────────
    useEffect(() => {
        if (autoScroll && !paused) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [lines])

    function appendLine(text) {
        const time = new Date().toISOString().slice(11, 19)
        setLines(prev => {
            const next = [...prev, { id: Date.now() + Math.random(), text, time }]
            return next.length > 3000 ? next.slice(-3000) : next
        })
    }

    async function loadStaticLogs(logUrl) {
        setStaticLoading(true)
        try {
            const res = await fetch(logUrl)
            const text = await res.text()
            const parsed = text.split('\n')
                .filter(Boolean)
                .map((text, i) => ({ id: i, text, time: '' }))
            setLines(parsed)
        } catch {
            setLines([{ id: 0, text: '[deployhub] Failed to load log file.', time: '' }])
        } finally {
            setStaticLoading(false)
        }
    }

    const filtered = filter
        ? lines.filter(l => l.text.toLowerCase().includes(filter.toLowerCase()))
        : lines

    // ── Mode label ────────────────────────────────────────
    const modeLabel = {
        build: 'Build Output',
        live: 'Runtime Logs',
        static: 'Last Build Logs',
    }

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }} className="space-y-4 pb-6 flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <p className="text-xs font-bold tracking-[0.15em] uppercase mb-1" style={{ color: '#00e5ff' }}>Logs</p>
                    <h1 className="font-syne font-black text-[24px] text-white leading-none">
                        {modeLabel[mode] || 'Logs'}
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    {projectStatus && <StatusBadge status={projectStatus} />}
                    {mode === 'live' && (
                        <div className="flex items-center gap-1.5">
                            <div className={'w-2 h-2 rounded-full ' + (socketStatus === 'connected' ? 'animate-pulse' : '')}
                                style={{ background: socketStatus === 'connected' ? '#34d399' : '#f87171' }} />
                            <span className="text-[11px]" style={{ color: socketStatus === 'connected' ? '#34d399' : '#f87171' }}>
                                {socketStatus === 'connected' ? 'Live' : 'Disconnected'}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Build complete banner */}
            {buildDone && (
                <div className="px-4 py-3 rounded-xl flex items-center gap-3"
                    style={{
                        background: buildDone.status === 'success' ? 'rgba(52,211,153,0.07)' : 'rgba(248,113,113,0.07)',
                        border: `1px solid ${buildDone.status === 'success' ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`,
                    }}>
                    <span>{buildDone.status === 'success' ? '✓' : '✕'}</span>
                    <span className="text-sm font-bold" style={{ color: buildDone.status === 'success' ? '#34d399' : '#f87171' }}>
                        Build {buildDone.status === 'success' ? 'succeeded' : 'failed'}
                    </span>
                    {buildDone.logUrl && (
                        <a href={buildDone.logUrl} target="_blank" rel="noreferrer"
                            className="ml-auto text-xs font-bold" style={{ color: '#00e5ff' }}>
                            Download full log ↗
                        </a>
                    )}
                </div>
            )}

            {/* Terminal */}
            <div className="rounded-2xl overflow-hidden flex flex-col"
                style={{ background: '#060a0f', border: '1px solid rgba(255,255,255,0.07)' }}>

                {/* Toolbar */}
                <div className="flex items-center gap-3 px-4 py-2.5 flex-wrap"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>

                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(248,113,113,0.6)' }} />
                        <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(245,158,11,0.6)' }} />
                        <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(52,211,153,0.6)' }} />
                    </div>

                    <span className="text-[10px] font-mono tracking-widest uppercase ml-1" style={{ color: '#374151' }}>
                        {modeLabel[mode] || '...'}
                    </span>

                    <div className="flex items-center gap-2 ml-auto">
                        {/* Filter */}
                        <div className="relative">
                            <svg className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: '#374151' }}
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
                            </svg>
                            <input value={filter} onChange={e => setFilter(e.target.value)}
                                placeholder="Filter..." className="pl-7 pr-3 py-1.5 rounded-lg text-xs font-mono outline-none w-32"
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#e5e7eb' }} />
                        </div>

                        {/* Pause (only for live modes) */}
                        {mode !== 'static' && (
                            <button onClick={() => setPaused(p => !p)}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                                style={{
                                    background: paused ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.04)',
                                    color: paused ? '#f59e0b' : '#6b7280',
                                    border: paused ? '1px solid rgba(245,158,11,0.2)' : '1px solid rgba(255,255,255,0.06)',
                                }}>
                                {paused ? '▶ Resume' : '⏸ Pause'}
                            </button>
                        )}

                        {/* Auto scroll */}
                        <button onClick={() => setAutoScroll(p => !p)}
                            className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                            style={{
                                background: autoScroll ? 'rgba(0,229,255,0.08)' : 'rgba(255,255,255,0.04)',
                                color: autoScroll ? '#00e5ff' : '#6b7280',
                                border: autoScroll ? '1px solid rgba(0,229,255,0.15)' : '1px solid rgba(255,255,255,0.06)',
                            }}>
                            ↓ Scroll
                        </button>

                        {/* Clear */}
                        <button onClick={() => setLines([])}
                            className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                            style={{ background: 'rgba(255,255,255,0.04)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.06)' }}>
                            Clear
                        </button>

                        <span className="text-[10px] font-mono" style={{ color: '#1f2937' }}>
                            {filtered.length} lines
                        </span>
                    </div>
                </div>

                {/* Log lines */}
                <div className="overflow-y-auto p-4 font-mono text-[11.5px] leading-[1.6]"
                    style={{ minHeight: '420px', maxHeight: 'calc(100vh - 300px)' }}>

                    {/* Loading states */}
                    {!projectStatus && (
                        <div className="flex items-center gap-2 py-4" style={{ color: '#374151' }}>
                            <div className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
                            Checking project status...
                        </div>
                    )}

                    {staticLoading && (
                        <div className="flex items-center gap-2 py-4" style={{ color: '#374151' }}>
                            <div className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
                            Loading build logs...
                        </div>
                    )}

                    {mode === 'static' && !staticLoading && !lastBuild?.logUrl && (
                        <div className="py-4" style={{ color: '#374151' }}>
                            No logs available for the last build.
                        </div>
                    )}

                    {paused && (
                        <div className="sticky top-0 mb-2 px-3 py-1.5 rounded-lg text-[11px] font-bold inline-flex items-center gap-2"
                            style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
                            ⏸ Paused
                        </div>
                    )}

                    {filtered.map((line, i) => (
                        <div key={line.id} className="flex gap-3 px-1 py-0.5 rounded hover:bg-white/[0.02] group">
                            <span className="select-none w-7 text-right flex-shrink-0 opacity-0 group-hover:opacity-100"
                                style={{ color: '#1f2937' }}>{i + 1}</span>
                            {line.time && (
                                <span className="flex-shrink-0 select-none" style={{ color: '#1f2937' }}>{line.time}</span>
                            )}
                            <span style={{ color: lineColor(line.text), whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                {filter ? (
                                    line.text.split(new RegExp('(' + filter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'))
                                        .map((part, j) => part.toLowerCase() === filter.toLowerCase()
                                            ? <mark key={j} style={{ background: 'rgba(0,229,255,0.2)', color: '#00e5ff', borderRadius: '2px' }}>{part}</mark>
                                            : part)
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
                        <span className="font-bold" style={{ color: mode === 'build' ? '#f59e0b' : mode === 'live' ? '#34d399' : '#4b5563' }}>
                            {mode === 'build' ? '⚙ build' : mode === 'live' ? '● live' : '○ static'}
                        </span>
                        {filter && <span style={{ color: '#00e5ff' }}>· "{filter}" ({filtered.length}/{lines.length})</span>}
                    </div>
                    <span className="text-[10px] font-mono" style={{ color: '#1f2937' }}>{projectId.slice(-8)}</span>
                </div>
            </div>
        </div>
    )
}