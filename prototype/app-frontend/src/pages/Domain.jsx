import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api/apiclient'

function Badge({ children, color = '#00e5ff' }) {
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{
        background: `${color}15`,
        color,
        border: `1px solid ${color}30`,
      }}>
      {children}
    </span>
  )
}

function StatusBadge({ status }) {
  const map = {
    active:       { label: 'Active',       color: '#34d399' },
    provisioning: { label: 'Provisioning', color: '#f59e0b' },
    failed:       { label: 'Failed',       color: '#f87171' },
  }
  const s = map[status] || { label: status, color: '#6b7280' }
  return (
    <span className="flex items-center gap-1.5">
      <span className={'w-1.5 h-1.5 rounded-full ' + (status === 'provisioning' ? 'animate-pulse' : '')}
        style={{ background: s.color }} />
      <span className="text-xs font-bold" style={{ color: s.color }}>{s.label}</span>
    </span>
  )
}

export default function Domains() {
  const { id: projectId } = useParams()

  const [data,        setData]        = useState(null)
  const [loading,     setLoading]     = useState(true)

  // Subdomain state
  const [subdomain,   setSubdomain]   = useState('')
  const [subSaving,   setSubSaving]   = useState(false)
  const [subToast,    setSubToast]    = useState(null)

  // Custom domain state
  const [customInput, setCustomInput] = useState('')
  const [checkResult, setCheckResult] = useState(null)  // { pointing, message }
  const [checking,    setChecking]    = useState(false)
  const [adding,      setAdding]      = useState(false)
  const [customToast, setCustomToast] = useState(null)

  const pollRef = useRef(null)

  // ── Fetch domains ─────────────────────────────────────
  useEffect(() => {
    fetchDomains()
    return () => clearInterval(pollRef.current)
  }, [projectId])

  async function fetchDomains() {
    try {
      const r = await api.get(`/projects/${projectId}/domains`)
      setData(r.data)
      setSubdomain(r.data.subdomain || '')

      // If provisioning → start polling
      if (r.data.customDomainStatus === 'provisioning') {
        startPolling()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function startPolling() {
    clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      try {
        const r = await api.get(`/projects/${projectId}/domains/custom/status`)
        if (r.data.customDomainStatus !== 'provisioning') {
          clearInterval(pollRef.current)
          setData(prev => ({ ...prev, ...r.data }))
          if (r.data.customDomainStatus === 'active') {
            setCustomToast({ type: 'success', msg: 'Custom domain is now active!' })
          } else if (r.data.customDomainStatus === 'failed') {
            setCustomToast({ type: 'error', msg: 'Provisioning failed. Check DNS and try again.' })
          }
        }
      } catch {}
    }, 4000)
  }

  function toast(setter, type, msg) {
    setter({ type, msg })
    setTimeout(() => setter(null), 4000)
  }

  // ── Subdomain save ────────────────────────────────────
  const subChanged = subdomain !== data?.subdomain && subdomain.length >= 3
  const subValid   = /^[a-z0-9-]{3,40}$/.test(subdomain)

  async function saveSubdomain() {
    if (!subValid || !subChanged) return
    setSubSaving(true)
    try {
      await api.patch(`/projects/${projectId}/domains/subdomain`, { subdomain })
      setData(prev => ({ ...prev, subdomain }))
      toast(setSubToast, 'success', 'Subdomain updated')
    } catch (err) {
      toast(setSubToast, 'error', err?.response?.data?.message || 'Failed')
    } finally {
      setSubSaving(false)
    }
  }

  // ── DNS Check ─────────────────────────────────────────
  async function checkDNS() {
    if (!customInput.trim()) return
    setChecking(true)
    setCheckResult(null)
    try {
      const r = await api.get(`/projects/${projectId}/domains/custom/check`, {
        params: { domain: customInput.trim() }
      })
      setCheckResult(r.data)
    } catch (err) {
      setCheckResult({ pointing: false, message: err?.response?.data?.message || 'Check failed' })
    } finally {
      setChecking(false)
    }
  }

  // ── Add custom domain ─────────────────────────────────
  async function addDomain() {
    if (!checkResult?.pointing) return
    setAdding(true)
    try {
      await api.post(`/projects/${projectId}/domains/custom`, { domain: customInput.trim() })
      setData(prev => ({ ...prev, customDomain: customInput.trim(), customDomainStatus: 'provisioning' }))
      setCustomInput('')
      setCheckResult(null)
      startPolling()
      toast(setCustomToast, 'info', 'Provisioning SSL certificate...')
    } catch (err) {
      toast(setCustomToast, 'error', err?.response?.data?.message || 'Failed')
    } finally {
      setAdding(false)
    }
  }

  // ── Remove custom domain ──────────────────────────────
  async function removeDomain() {
    if (!window.confirm(`Remove ${data.customDomain}?`)) return
    try {
      await api.delete(`/projects/${projectId}/domains/custom`)
      setData(prev => ({ ...prev, customDomain: null, hascustomDomain: false, customDomainStatus: null, ssl: null }))
      toast(setCustomToast, 'success', 'Custom domain removed')
    } catch (err) {
      toast(setCustomToast, 'error', err?.response?.data?.message || 'Failed')
    }
  }

  const isPro = data?.plan === 'pro'

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      {[1,2].map(i => (
        <div key={i} className="h-36 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)' }} />
      ))}
    </div>
  )

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }} className="space-y-5 pb-6">

      {/* Header */}
      <div>
        <p className="text-xs font-bold tracking-[0.15em] uppercase mb-1" style={{ color: '#00e5ff' }}>Domains</p>
        <h1 className="font-syne font-black text-[24px] text-white leading-none">Domain Settings</h1>
      </div>

      {/* ── Subdomain ───────────────────────────────────── */}
      <div className="rounded-2xl p-5 space-y-4"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-white">Subdomain</p>
            <p className="text-xs mt-0.5" style={{ color: '#374151' }}>Your project's default URL</p>
          </div>
          <Badge color="#00e5ff">Free</Badge>
        </div>

        {/* Input */}
        <div className="flex items-center gap-0 rounded-xl overflow-hidden"
          style={{ border: `1px solid ${subChanged && subValid ? 'rgba(0,229,255,0.35)' : 'rgba(255,255,255,0.08)'}` }}>
          <input
            value={subdomain}
            onChange={e => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            className="flex-1 px-4 py-2.5 bg-transparent outline-none text-sm text-white font-mono"
            placeholder="your-subdomain"
          />
          <span className="px-3 py-2.5 text-sm font-mono border-l flex-shrink-0"
            style={{ color: '#374151', borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
            .deployhub.online
          </span>
        </div>

        {/* Preview */}
        <a href={`https://${subdomain}.deployhub.online`} target="_blank" rel="noreferrer"
          className="flex items-center gap-1.5 text-xs transition-opacity hover:opacity-70"
          style={{ color: '#00e5ff' }}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          https://{subdomain}.deployhub.online
        </a>

        {/* Warning if changed */}
        {subChanged && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs"
            style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}>
            ⚠ Old URL <span className="font-mono">{data?.subdomain}.deployhub.online</span> will stop working
          </div>
        )}

        {subToast && (
          <div className="px-3 py-2 rounded-xl text-xs font-bold"
            style={{
              background: subToast.type === 'success' ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)',
              color:      subToast.type === 'success' ? '#34d399' : '#f87171',
              border:     `1px solid ${subToast.type === 'success' ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`,
            }}>
            {subToast.msg}
          </div>
        )}

        <button onClick={saveSubdomain}
          disabled={!subChanged || !subValid || subSaving}
          className="px-5 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
          style={{ background: 'rgba(0,229,255,0.1)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.2)' }}>
          {subSaving ? 'Saving...' : 'Save Subdomain'}
        </button>
      </div>

      {/* ── Custom Domain ────────────────────────────────── */}
      <div className="rounded-2xl p-5 space-y-4"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: `1px solid ${isPro ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.04)'}`,
          opacity: isPro ? 1 : 0.7,
        }}>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-white">Custom Domain</p>
            <p className="text-xs mt-0.5" style={{ color: '#374151' }}>Attach your own domain</p>
          </div>
          {isPro ? <Badge color="#a78bfa">Pro</Badge> : <Badge color="#6b7280">Pro Only</Badge>}
        </div>

        {!isPro ? (
          <div className="px-4 py-3 rounded-xl text-sm"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: '#4b5563' }}>
            Upgrade to Pro to attach a custom domain.
          </div>
        ) : data?.customDomain ? (
          /* Domain already attached */
          <div className="space-y-3">
            <div className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold text-white">{data.customDomain}</span>
                  <StatusBadge status={data.customDomainStatus} />
                </div>
                {data.ssl?.expiresAt && (
                  <p className="text-[11px]" style={{ color: '#374151' }}>
                    SSL expires: {new Date(data.ssl.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' · '}Auto-renews {new Date(data.ssl.nextRenewAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                )}
              </div>
              <button onClick={removeDomain}
                className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                style={{ background: 'rgba(248,113,113,0.08)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                Remove
              </button>
            </div>

            {data.customDomainStatus === 'provisioning' && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}>
                <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin flex-shrink-0" />
                Issuing SSL certificate... this may take 1-2 minutes
              </div>
            )}

            {data.customDomainStatus === 'failed' && (
              <div className="px-4 py-3 rounded-xl text-sm"
                style={{ background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171' }}>
                Provisioning failed. Make sure your A record points to <span className="font-mono">{process.env.SERVER_IP || 'server IP'}</span> and try again.
              </div>
            )}
          </div>
        ) : (
          /* Add new domain */
          <div className="space-y-4">

            {/* Instructions */}
            <div className="px-4 py-3 rounded-xl space-y-2 text-xs"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="font-bold text-white">Before adding your domain:</p>
              <div className="space-y-1.5" style={{ color: '#4b5563' }}>
                <p>1. Go to your DNS provider</p>
                <p>2. Add an <span className="font-mono text-white">A record</span>:</p>
                <div className="font-mono px-3 py-2 rounded-lg mt-1 space-y-1"
                  style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.1)' }}>
                  <p><span style={{ color: '#374151' }}>Type:</span>  <span className="text-white">A</span></p>
                  <p><span style={{ color: '#374151' }}>Name:</span>  <span className="text-white">name you want</span></p>
                  <p><span style={{ color: '#374151' }}>Value:</span> <span style={{ color: '#00e5ff' }}>194.164.150.185</span></p>
                </div>
                <p className="mt-1">3. Click "Check DNS" below</p>
              </div>
            </div>

            {/* Input + check */}
            <div className="flex gap-2">
              <input
                value={customInput}
                onChange={e => { setCustomInput(e.target.value); setCheckResult(null) }}
                placeholder="myapp.com"
                className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none font-mono"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}
                onFocus={e => e.target.style.borderColor = 'rgba(0,229,255,0.3)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                onKeyDown={e => e.key === 'Enter' && checkDNS()}
              />
              <button onClick={checkDNS} disabled={!customInput.trim() || checking}
                className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40 flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)' }}>
                {checking ? (
                  <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                ) : 'Check DNS'}
              </button>
            </div>

            {/* DNS result */}
            {checkResult && (
              <div className="px-4 py-3 rounded-xl text-sm space-y-2"
                style={{
                  background: checkResult.pointing ? 'rgba(52,211,153,0.07)' : 'rgba(248,113,113,0.07)',
                  border: `1px solid ${checkResult.pointing ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`,
                  color: checkResult.pointing ? '#34d399' : '#f87171',
                }}>
                <p className="font-bold">{checkResult.pointing ? '✓ DNS verified' : '✗ DNS not configured'}</p>
                <p className="text-xs opacity-80">{checkResult.message}</p>
              </div>
            )}

            {/* Add button — only show when DNS verified */}
            {checkResult?.pointing && (
              <button onClick={addDomain} disabled={adding}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-black transition-all disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #00e5ff, #00b8cc)' }}>
                {adding ? (
                  <><div className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin" /> Provisioning...</>
                ) : `Add ${customInput} & Issue SSL`}
              </button>
            )}
          </div>
        )}

        {customToast && (
          <div className="px-3 py-2 rounded-xl text-xs font-bold"
            style={{
              background: customToast.type === 'success' ? 'rgba(52,211,153,0.08)' : customToast.type === 'info' ? 'rgba(96,165,250,0.08)' : 'rgba(248,113,113,0.08)',
              color:      customToast.type === 'success' ? '#34d399' : customToast.type === 'info' ? '#60a5fa' : '#f87171',
              border:     `1px solid ${customToast.type === 'success' ? 'rgba(52,211,153,0.2)' : customToast.type === 'info' ? 'rgba(96,165,250,0.2)' : 'rgba(248,113,113,0.2)'}`,
            }}>
            {customToast.msg}
          </div>
        )}
      </div>

    </div>
  )
}