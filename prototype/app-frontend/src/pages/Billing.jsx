import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PLAN_LIMITS } from '../constant/planLimits'

const DURATION_LABELS = {
  1: '1 Month', 3: '3 Months', 6: '6 Months', 12: '1 Year', 24: '2 Years'
}

function StatusBadge({ status }) {
  const map = {
    completed:    { bg: 'rgba(52,211,153,0.08)',  color: '#34d399', border: 'rgba(52,211,153,0.2)',  label: 'Paid' },
    pending: { bg: 'rgba(245,158,11,0.08)', color: '#f59e0b', border: 'rgba(245,158,11,0.2)', label: 'Pending' },
    failed:  { bg: 'rgba(248,113,113,0.08)', color: '#f87171', border: 'rgba(248,113,113,0.2)', label: 'Failed' },
    refunded:  { bg: 'rgba(248,113,113,0.08)', color: '#250ce742', border: 'rgba(244,189,113,0.2)', label: 'Failed' },
  }
  const s = map[status?.toLowerCase()] || map.pending
  return (
    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {s.label}
    </span>
  )
}

// Helper function to format dates
function formatDate(dateString) {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Helper function to calculate days remaining
function getDaysRemaining(endDate) {
  if (!endDate) return null
  const end = new Date(endDate)
  const now = new Date()
  const diffTime = end - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export function Billing() {
  const { user, api } = useAuth()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentInvoice, setCurrentInvoice] = useState(null)

  const subscription = user?.subscriptionid
  const currentPlan = subscription?.plan || 'free'
  const limits = PLAN_LIMITS[currentPlan]

  // Find the current invoice that matches the subscription paymentId
  useEffect(() => {
    if (invoices.length > 0 && subscription?.paymentId) {
      const current = invoices.find(inv => inv._id === subscription.paymentId)
      setCurrentInvoice(current || null)
    }
  }, [invoices, subscription?.paymentId])

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const res = await api.get('/invoice')
        if (!res.status === 200) throw new Error('Failed to fetch')
        const data = res.data.data
        setInvoices(Array.isArray(data) ? data : [])
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchInvoices()
  }, [])

  // Calculate subscription status
  const daysRemaining = subscription?.endDate ? getDaysRemaining(subscription.endDate) : null
  const isExpired = daysRemaining !== null && daysRemaining <= 0
  const isExpiringSoon = daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 7
  const shouldShowRenewButton = daysRemaining !== null && daysRemaining <= 10 && daysRemaining > 0 && currentPlan !== 'free'

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }} className="space-y-6">

      {/* Header */}
      <div>
        <p className="text-xs font-bold tracking-[0.15em] uppercase mb-1.5" style={{ color: '#00e5ff' }}>Billing</p>
        <h1 className="font-syne font-black text-[28px] text-white leading-none">Billing & Invoices</h1>
      </div>

      {/* Current plan card with subscription details */}
      <div className="rounded-2xl p-5"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        
        {/* Main plan info */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.12)' }}>
              <svg className="w-5 h-5" style={{ color: '#00e5ff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-syne font-black text-white capitalize">{currentPlan} Plan</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ 
                    background: isExpired ? 'rgba(248,113,113,0.08)' : 'rgba(52,211,153,0.08)', 
                    color: isExpired ? '#f87171' : '#34d399', 
                    border: `1px solid ${isExpired ? 'rgba(248,113,113,0.15)' : 'rgba(52,211,153,0.15)'}` 
                  }}>
                  {isExpired ? 'Expired' : 'Active'}
                </span>
                
                {/* Show expiring soon badge */}
                {isExpiringSoon && !isExpired && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ 
                      background: 'rgba(245,158,11,0.08)', 
                      color: '#f59e0b', 
                      border: '1px solid rgba(245,158,11,0.15)' 
                    }}>
                    Expiring Soon
                  </span>
                )}
              </div>
              <p className="text-xs" style={{ color: '#374151' }}>
                {limits.projects} projects · {limits.requests.toLocaleString()} req/mo · {limits.ram}MB RAM
              </p>
            </div>
          </div>
          
          {/* Right side buttons/price */}
          {currentPlan === 'free' ? (
            <Link to="/billing/upgrade"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-black transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #00e5ff, #00b8cc)', boxShadow: '0 4px 16px rgba(0,229,255,0.2)' }}>
              Upgrade to Pro →
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              {/* Renew button - shown when less than 10 days remaining */}
              {shouldShowRenewButton && (
                <Link 
                  to="/billing/renew"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-black transition-all hover:scale-105 animate-pulse"
                  style={{ 
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)', 
                    boxShadow: '0 4px 16px rgba(245,158,11,0.3)'
                  }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Renew Now ({daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left)
                </Link>
              )}
              <div className="text-right">
                <div className="font-syne font-black text-lg text-white">₹{currentInvoice?.amount ? (currentInvoice.amount / 100).toLocaleString() : '799'}<span className="text-sm font-normal" style={{ color: '#374151' }}>/mo</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Subscription details - only show for paid plans */}
        {currentPlan !== 'free' && subscription && (
          <div className="mt-4 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            
            {/* Start Date */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.1em] uppercase mb-1" style={{ color: '#374151' }}>
                Started On
              </p>
              <p className="text-sm text-white font-medium">
                {formatDate(subscription.startDate || subscription.createdAt)}
              </p>
            </div>

            {/* End Date / Expiry */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.1em] uppercase mb-1" style={{ color: '#374151' }}>
                {isExpired ? 'Expired On' : 'Expires On'}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm text-white font-medium">
                  {formatDate(subscription.endDate)}
                </p>
                {!isExpired && daysRemaining !== null && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ 
                      background: daysRemaining <= 10 ? 'rgba(245,158,11,0.08)' : 'rgba(52,211,153,0.08)', 
                      color: daysRemaining <= 10 ? '#f59e0b' : '#34d399', 
                      border: `1px solid ${daysRemaining <= 10 ? 'rgba(245,158,11,0.15)' : 'rgba(52,211,153,0.15)'}` 
                    }}>
                    {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
                  </span>
                )}
                
                {/* Small renew link for mobile/compact view */}
                {shouldShowRenewButton && (
                  <Link 
                    to="/billing/renew"
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full sm:hidden"
                    style={{ 
                      background: 'rgba(245,158,11,0.08)', 
                      color: '#f59e0b', 
                      border: '1px solid rgba(245,158,11,0.15)' 
                    }}>
                    Renew
                  </Link>
                )}
              </div>
            </div>

            {/* Current Invoice / Payment Info */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.1em] uppercase mb-1" style={{ color: '#374151' }}>
                Current Payment
              </p>
              {currentInvoice ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white font-medium">
                    ₹{(currentInvoice.amount / 100).toLocaleString()}
                  </span>
                  <StatusBadge status={currentInvoice.status} />
                </div>
              ) : (
                <p className="text-sm" style={{ color: '#6b7280' }}>
                  Invoice #{subscription.paymentId?.slice(-8) || '—'}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Show purchase date for free plan if they had previous subscription */}
        {currentPlan === 'free' && subscription && (
          <div className="mt-4 pt-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] font-bold tracking-[0.1em] uppercase mb-1" style={{ color: '#374151' }}>
              Previous Subscription Ended
            </p>
            <p className="text-sm text-white font-medium">
              {formatDate(subscription.endDate)}
            </p>
          </div>
        )}
      </div>

      {/* Renewal reminder banner - shows when 5-10 days remaining */}
      {shouldShowRenewButton && daysRemaining <= 10 && daysRemaining > 5 && (
        <div className="rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3"
          style={{ 
            background: 'rgba(245,158,11,0.05)', 
            border: '1px solid rgba(245,158,11,0.15)'
          }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(245,158,11,0.1)' }}>
              <svg className="w-4 h-4" style={{ color: '#f59e0b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Your plan expires in {daysRemaining} days</p>
              <p className="text-xs" style={{ color: '#6b7280' }}>Renew now to avoid service interruption</p>
            </div>
          </div>
          <Link 
            to="/billing/renew"
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs text-black transition-all hover:scale-105"
            style={{ 
              background: 'linear-gradient(135deg, #f59e0b, #d97706)', 
              boxShadow: '0 4px 12px rgba(245,158,11,0.2)'
            }}>
            Renew Subscription →
          </Link>
        </div>
      )}

      {/* Expired banner */}
      {isExpired && currentPlan !== 'free' && (
        <div className="rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3"
          style={{ 
            background: 'rgba(248,113,113,0.05)', 
            border: '1px solid rgba(248,113,113,0.15)'
          }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(248,113,113,0.1)' }}>
              <svg className="w-4 h-4" style={{ color: '#f87171' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Your plan has expired</p>
              <p className="text-xs" style={{ color: '#6b7280' }}>Renew now to continue using Pro features</p>
            </div>
          </div>
          <Link 
            to="/billing/renew"
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs text-black transition-all hover:scale-105"
            style={{ 
              background: 'linear-gradient(135deg, #00e5ff, #00b8cc)', 
              boxShadow: '0 4px 12px rgba(0,229,255,0.2)'
            }}>
            Reactivate Subscription →
          </Link>
        </div>
      )}

      {/* Invoice table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Table header */}
        <div className="px-5 py-3 grid grid-cols-4 gap-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          {['Order ID', 'Plan', 'Duration', 'Amount', 'Status'].map(h => (
            <span key={h} className="text-[10px] font-black tracking-[0.12em] uppercase hidden sm:block first:block last:block"
              style={{ color: '#374151' }}>{h}</span>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16 gap-3">
            <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'rgba(0,229,255,0.3)', borderTopColor: '#00e5ff' }} />
            <span className="text-sm" style={{ color: '#374151' }}>Loading invoices...</span>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex items-center justify-center py-16">
            <span className="text-sm" style={{ color: '#f87171' }}>Failed to load invoices</span>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && invoices.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <svg className="w-5 h-5" style={{ color: '#374151' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-white mb-1">No invoices yet</p>
            <p className="text-xs" style={{ color: '#374151' }}>Your payment history will appear here.</p>
          </div>
        )}

        {/* Rows */}
        {!loading && !error && invoices.map((inv, i) => {
          // Check if this invoice is the current one
          const isCurrentInvoice = subscription?.paymentId === inv._id
          
          return (
            <div key={inv.orderid || i}
              className="px-5 py-4 grid grid-cols-4 sm:grid-cols-5 gap-4 items-center transition-colors relative"
              style={{ 
                borderBottom: i < invoices.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                background: isCurrentInvoice ? 'rgba(0,229,255,0.02)' : 'transparent'
              }}
              onMouseEnter={e => e.currentTarget.style.background = isCurrentInvoice ? 'rgba(0,229,255,0.03)' : 'rgba(255,255,255,0.015)'}
              onMouseLeave={e => e.currentTarget.style.background = isCurrentInvoice ? 'rgba(0,229,255,0.02)' : 'transparent'}>

              {/* Current invoice indicator */}
              {isCurrentInvoice && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5"
                  style={{ background: '#00e5ff' }} />
              )}

              {/* Order ID */}
              <div className="min-w-0">
                <span className="text-xs font-mono" style={{ color: '#4b5563' }}>
                  #{inv.orderid?.slice(-8) || '—'}
                </span>
                {isCurrentInvoice && (
                  <span className="ml-2 text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(0,229,255,0.1)', color: '#00e5ff' }}>
                    Current
                  </span>
                )}
              </div>

              {/* Plan */}
              <div className="hidden sm:block">
                <span className="text-sm font-semibold capitalize text-white">{inv.plan || '—'}</span>
              </div>

              {/* Duration */}
              <div className="hidden sm:block">
                <span className="text-sm" style={{ color: '#6b7280' }}>
                  {DURATION_LABELS[inv.months] || `${inv.months} mo`}
                </span>
              </div>

              {/* Amount */}
              <div>
                <span className="font-syne font-bold text-white">
                  ₹{inv.amount ? (inv.amount / 100).toLocaleString() : '—'}
                </span>
              </div>

              {/* Status */}
              <div>
                <StatusBadge status={inv.status} />
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}

export default Billing