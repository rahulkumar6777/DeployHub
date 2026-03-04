import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../../api/apiclient'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'

function StatCard({ label, value, sub, color = '#00e5ff' }) {
  return (
    <div className="rounded-2xl p-5 space-y-1"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <p className="text-[10px] font-black tracking-[0.15em] uppercase" style={{ color: '#374151' }}>{label}</p>
      <p className="font-syne font-black text-2xl" style={{ color }}>{value}</p>
      {sub && <p className="text-xs" style={{ color: '#374151' }}>{sub}</p>}
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="px-3 py-2 rounded-xl text-xs"
      style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', color: '#e5e7eb' }}>
      <p className="font-bold mb-1" style={{ color: '#00e5ff' }}>{label}</p>
      <p>{payload[0].value.toLocaleString()} requests</p>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl p-5 space-y-3 animate-pulse"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="h-2 w-16 rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
      <div className="h-7 w-24 rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
    </div>
  )
}

export default function Metrics() {
  const { id: projectId } = useParams()

  const [range,     setRange]     = useState(7)
  const [data,      setData]      = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    api.get(`/projects/${projectId}/metrics?range=${range}`)
      .then(r => setData(r.data))
      .catch(() => setError('Failed to load metrics'))
      .finally(() => setLoading(false))
  }, [projectId, range])

  const chartData  = data?.chartData  || []
  const stats      = data?.stats      || {}
  const project    = data?.project    || {}

  const axisStyle  = { fill: '#1f2937', fontSize: 11 }
  const gridStyle  = { stroke: 'rgba(255,255,255,0.04)' }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }} className="space-y-5 pb-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs font-bold tracking-[0.15em] uppercase mb-1" style={{ color: '#00e5ff' }}>Metrics</p>
          <h1 className="font-syne font-black text-[24px] text-white leading-none">Request Analytics</h1>
        </div>

        {/* Range toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {[7, 30].map(r => (
            <button key={r} onClick={() => setRange(r)}
              className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{
                background: range === r ? 'rgba(0,229,255,0.1)' : 'transparent',
                color:      range === r ? '#00e5ff' : '#4b5563',
                border:     range === r ? '1px solid rgba(0,229,255,0.2)' : '1px solid transparent',
              }}>
              {r === 7 ? '7 Days' : '30 Days'}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl text-sm" style={{
          background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171'
        }}>
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {loading ? (
          [0,1,2,3].map(i => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard label="Total Requests" value={stats.total?.toLocaleString() ?? '—'}
              sub={`Last ${range} days`} color="#00e5ff" />
            <StatCard label="Daily Avg" value={stats.avg?.toLocaleString() ?? '—'}
              sub="requests/day" color="#a78bfa" />
            <StatCard label="Peak Day" value={stats.peak?.toLocaleString() ?? '—'}
              sub={stats.peakDate} color="#34d399" />
            <StatCard label="All Time" value={project.totalRequest?.toLocaleString() ?? '—'}
              sub="total requests" color="#f59e0b" />
          </>
        )}
      </div>

      {/* Area chart — trend */}
      <div className="rounded-2xl p-5 space-y-4"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <p className="text-[10px] font-black tracking-[0.15em] uppercase mb-0.5" style={{ color: '#374151' }}>
            Request Trend
          </p>
          <p className="text-xs" style={{ color: '#1f2937' }}>Daily request volume over time</p>
        </div>

        {loading ? (
          <div className="h-48 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00e5ff" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#00e5ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={gridStyle.stroke} />
              <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="requests" stroke="#00e5ff" strokeWidth={2}
                fill="url(#areaGrad)" dot={false}
                activeDot={{ r: 4, fill: '#00e5ff', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bar chart — comparison */}
      <div className="rounded-2xl p-5 space-y-4"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <p className="text-[10px] font-black tracking-[0.15em] uppercase mb-0.5" style={{ color: '#374151' }}>
            Daily Breakdown
          </p>
          <p className="text-xs" style={{ color: '#1f2937' }}>Per-day request count</p>
        </div>

        {loading ? (
          <div className="h-48 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              barSize={range === 7 ? 28 : 12}>
              <CartesianGrid vertical={false} stroke={gridStyle.stroke} />
              <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="requests" radius={[4, 4, 0, 0]}
                fill="rgba(167,139,250,0.6)"
                // Today bar highlighted
                label={false}>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <p className="text-[11px] text-center" style={{ color: '#1f2937' }}>
        Data snapshots at midnight daily · Today shows live count
      </p>
    </div>
  )
}