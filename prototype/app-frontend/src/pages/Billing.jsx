import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const DISCOUNTS = [
  { months: 1,  discount: 0,  label: '1 Month'  },
  { months: 3,  discount: 4,  label: '3 Months' },
  { months: 6,  discount: 8,  label: '6 Months' },
  { months: 12, discount: 10, label: '1 Year'   },
  { months: 24, discount: 15, label: '2 Years'  },
]
const BASE = 799

function daysLeft(d) {
  if (!d) return null
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
}
function fmtDate(d) {
  if (!d) return 'N/A'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
function timeAgo(d) {
  const diff = Date.now() - new Date(d).getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1)  return 'today'
  if (days < 30) return days + 'd ago'
  const mo = Math.floor(days / 30)
  if (mo < 12)   return mo + 'mo ago'
  return Math.floor(mo / 12) + 'yr ago'
}

function Skel({ w, h }) {
  return <div className={(w||'w-full')+' '+(h||'h-4')+' rounded-lg animate-pulse'}
    style={{background:'rgba(255,255,255,0.06)'}}/>
}

export default function Billing() {
  const { id: projectId } = useParams()
  const { api } = useAuth()

  const [project,   setProject]   = useState(null)
  const [orders,    setOrders]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [selMonths, setSelMonths] = useState(1)

  useEffect(() => {
    api.get('/projects/' + projectId + '/billing')
      .then(r => { setProject(r.data.project); setOrders(r.data.orders || []) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [projectId])

  const isPro      = project?.plan === 'pro'
  const days       = daysLeft(project?.endDate)
  const isExpiring = days !== null && days <= 7 && days > 0
  const isExpired  = days !== null && days <= 0
  const disc       = DISCOUNTS.find(d => d.months === selMonths)
  const perMonth   = Math.round(BASE * (1 - (disc?.discount || 0) / 100))
  const total      = perMonth * selMonths
  const saved      = BASE * selMonths - total

  return (
    <div style={{maxWidth:'720px',margin:'0 auto'}} className="space-y-5 pb-10">

      <div>
        <p className="text-xs font-bold tracking-[0.15em] uppercase mb-1.5" style={{color:'#00e5ff'}}>Billing</p>
        <h1 className="font-syne font-black text-[26px] text-white leading-none">Project Billing</h1>
      </div>

      {/* Current Plan */}
      <div className="rounded-2xl overflow-hidden"
        style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)'}}>
        <div className="px-6 py-4" style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
          <h2 className="font-syne font-bold text-white text-[15px]">Current Plan</h2>
          <p className="text-xs mt-0.5" style={{color:'#4b5563'}}>Your active subscription for this project</p>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="space-y-3">
              <Skel w="w-32" h="h-8"/><Skel w="w-48" h="h-4"/><Skel w="w-40" h="h-4"/>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="font-syne font-black text-3xl text-white">{isPro ? 'Pro' : 'Free'}</span>
                  <span className="text-[11px] font-black uppercase px-2 py-1 rounded-lg"
                    style={{
                      background: isPro ? 'rgba(0,229,255,0.08)' : 'rgba(255,255,255,0.04)',
                      color:      isPro ? '#00e5ff' : '#4b5563',
                      border:     isPro ? '1px solid rgba(0,229,255,0.2)' : '1px solid transparent',
                    }}>
                    {isPro ? 'Active' : 'Free Tier'}
                  </span>
                </div>
                {isPro ? (
                  <div className="space-y-1.5 text-sm">
                    {[
                      {label:'Started',   val: fmtDate(project.startDate), color:'#fff'},
                      {label:'Renews',    val: fmtDate(project.endDate),   color:'#fff'},
                      {label:'Days left', val: isExpired ? 'Expired' : days+' days',
                        color: isExpiring||isExpired ? '#f87171' : '#34d399'},
                    ].map(r => (
                      <div key={r.label} className="flex items-center gap-2">
                        <span style={{color:'#4b5563'}}>{r.label}:</span>
                        <span className="font-medium" style={{color:r.color}}>{r.val}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1 text-sm" style={{color:'#4b5563'}}>
                    <p>2,000 requests /days</p>
                    <p>512 MB RAM · 0.1 vCPU</p>
                    <p>nesthost.app subdomain only</p>
                  </div>
                )}
              </div>
              <div className="text-sm space-y-1.5" style={{color:'#4b5563'}}>
                <p className="text-white font-bold text-xs mb-2">{isPro ? 'Pro includes' : 'Free includes'}</p>
                {(isPro
                  ? ['1,00,000 req/day','2 GB RAM','1 vCPU','Custom Domain','Priority Support']
                  : ['2,000 req/day','512 MB RAM','0.1 vCPU','Shared infra']
                ).map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <span style={{color: isPro ? '#34d399' : '#374151'}}>✓</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expiry warning */}
      {!loading && (isExpiring || isExpired) && (
        <div className="px-4 py-3.5 rounded-xl flex items-start gap-3"
          style={{background:'rgba(248,113,113,0.07)',border:'1px solid rgba(248,113,113,0.2)'}}>
          <span className="text-base mt-0.5">⚠️</span>
          <div>
            <p className="text-sm font-bold" style={{color:'#f87171'}}>
              {isExpired ? 'Plan Expired' : 'Expiring in '+days+' day'+(days===1?'':'s')}
            </p>
            <p className="text-xs mt-0.5" style={{color:'#4b5563'}}>
              {isExpired
                ? 'Your project has been downgraded to Free. Renew to restore Pro features.'
                : 'Renew now to avoid interruption to your Pro features.'}
            </p>
          </div>
        </div>
      )}

      {/* Upgrade / Renew */}
      <div className="rounded-2xl overflow-hidden"
        style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)'}}>
        <div className="px-6 py-4" style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
          <h2 className="font-syne font-bold text-white text-[15px]">{isPro ? 'Renew Plan' : 'Upgrade to Pro'}</h2>
          <p className="text-xs mt-0.5" style={{color:'#4b5563'}}>
            {isPro ? 'Extend your subscription' : 'Unlock more power for this project'}
          </p>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <p className="text-xs font-bold text-white mb-3">Select Duration</p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {DISCOUNTS.map(d => {
                const price = Math.round(BASE * (1 - d.discount / 100))
                const sel   = selMonths === d.months
                return (
                  <button key={d.months} onClick={() => setSelMonths(d.months)}
                    className="rounded-xl p-3 text-center transition-all"
                    style={{
                      background: sel ? 'rgba(0,229,255,0.08)' : 'rgba(255,255,255,0.02)',
                      border:     sel ? '1px solid rgba(0,229,255,0.3)' : '1px solid rgba(255,255,255,0.06)',
                    }}>
                    <div className="text-xs font-bold text-white">{d.label}</div>
                    <div className="text-[10px] mt-0.5" style={{color: sel ? '#00e5ff' : '#4b5563'}}>
                      ₹{price}/mo
                    </div>
                    {d.discount > 0 && (
                      <div className="text-[9px] font-black mt-1 px-1.5 py-0.5 rounded-full inline-block"
                        style={{background:'rgba(52,211,153,0.1)',color:'#34d399'}}>
                        -{d.discount}%
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-xl p-4 space-y-2"
            style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.05)'}}>
            <div className="flex justify-between text-sm">
              <span style={{color:'#4b5563'}}>₹{BASE} × {selMonths} mo</span>
              <span style={{color:'#4b5563'}}>₹{(BASE*selMonths).toLocaleString()}</span>
            </div>
            {saved > 0 && (
              <div className="flex justify-between text-sm">
                <span style={{color:'#34d399'}}>Discount ({disc?.discount}%)</span>
                <span style={{color:'#34d399'}}>-₹{saved.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-2"
              style={{borderTop:'1px solid rgba(255,255,255,0.05)'}}>
              <span className="text-white">Total</span>
              <span style={{color:'#00e5ff'}}>₹{total.toLocaleString()}</span>
            </div>
          </div>

          {/* Pay btn — disabled, wire later */}
          <button disabled
            className="w-full py-3 rounded-xl font-bold text-sm opacity-50 cursor-not-allowed flex items-center justify-center gap-2"
            style={{background:'linear-gradient(135deg,#00e5ff,#00b8cc)',color:'#000'}}>
            {isPro ? 'Renew Pro' : 'Upgrade to Pro'} — ₹{total.toLocaleString()}
            <span className="text-[10px] opacity-60">(Payment coming soon)</span>
          </button>
        </div>
      </div>

      {/* Payment History */}
      <div className="rounded-2xl overflow-hidden"
        style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)'}}>
        <div className="px-6 py-4" style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
          <h2 className="font-syne font-bold text-white text-[15px]">Payment History</h2>
          <p className="text-xs mt-0.5" style={{color:'#4b5563'}}>All transactions for this project</p>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="space-y-3">
              {[1,2].map(i => (
                <div key={i} className="flex items-center gap-4">
                  <Skel w="w-9" h="h-9"/>
                  <div className="flex-1 space-y-1.5"><Skel w="w-36" h="h-3"/><Skel w="w-24" h="h-2.5"/></div>
                  <Skel w="w-16" h="h-3"/>
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <p className="text-sm text-center py-6" style={{color:'#374151'}}>No payment history yet</p>
          ) : (
            <div className="space-y-2">
              {orders.map(order => (
                <div key={order._id}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl"
                  style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.04)'}}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm"
                    style={{
                      background: order.status==='paid' ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)',
                      border:     order.status==='paid' ? '1px solid rgba(52,211,153,0.2)' : '1px solid rgba(248,113,113,0.2)',
                      color:      order.status==='paid' ? '#34d399' : '#f87171',
                    }}>
                    {order.status==='paid' ? '✓' : '✕'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white">
                      Pro · {order.months} month{order.months>1?'s':''}
                    </div>
                    <div className="text-[11px] flex items-center gap-2 mt-0.5" style={{color:'#374151'}}>
                      <span>{timeAgo(order.createdAt)}</span>
                      <span>·</span>
                      <span className="font-mono">{order.orderid?.slice(-10)}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold" style={{color:'#34d399'}}>
                      {order.amount ? '₹'+(order.amount/100).toLocaleString('en-IN') : 'N/A'}
                    </div>
                    <div className="text-[10px] capitalize" style={{color:'#374151'}}>{order.status}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}