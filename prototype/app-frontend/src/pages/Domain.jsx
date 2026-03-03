import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Toast({ msg, type, onClose }) {
  useEffect(() => {
    if (!msg) return
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [msg])
  if (!msg) return null
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium"
      style={{
        background: type === 'success' ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
        border: '1px solid ' + (type === 'success' ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'),
        color: type === 'success' ? '#34d399' : '#f87171',
      }}>
      {type === 'success' ? '✓' : '✕'} {msg}
      <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100">✕</button>
    </div>
  )
}

function Skeleton({ w, h }) {
  return <div className={(w || 'w-full') + ' ' + (h || 'h-4') + ' rounded-lg animate-pulse'}
    style={{ background: 'rgba(255,255,255,0.06)' }} />
}

export default function Domains() {
  const { id: projectId } = useParams()
  const { api }           = useAuth()

  const [project,    setProject]    = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [subdomain,  setSubdomain]  = useState('')
  const [subSaving,  setSubSaving]  = useState(false)
  const [subError,   setSubError]   = useState('')
  const [toast,      setToast]      = useState({ msg: '', type: 'success' })

  useEffect(() => {
    api.get('/projects/' + projectId + '/domains')
      .then(r => {
        console.log(r)
        setProject(r.data.project)
        setSubdomain(r.data.project.subdomain || '')
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [projectId])

  const isPro = project?.plan === 'pro'

  // Subdomain validation
  function validateSubdomain(val) {
    if (!val) return 'Subdomain cannot be empty'
    if (val.length < 3) return 'Minimum 3 characters'
    if (val.length > 40) return 'Maximum 40 characters'
    if (!/^[a-z0-9-]+$/.test(val)) return 'Only lowercase letters, numbers and hyphens allowed'
    if (val.startsWith('-') || val.endsWith('-')) return 'Cannot start or end with a hyphen'
    return ''
  }

  function handleSubdomainChange(val) {
    const clean = val.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setSubdomain(clean)
    setSubError(validateSubdomain(clean))
  }

  async function saveSubdomain() {
    const err = validateSubdomain(subdomain)
    if (err) { setSubError(err); return }
    if (subdomain === project?.subdomain) {
      setToast({ msg: 'No changes to save', type: 'error' })
      return
    }
    setSubSaving(true)
    try {
      await api.patch('/projects/' + projectId + '/domains/subdomain', { subdomain })
      setProject(p => ({ ...p, subdomain }))
      setToast({ msg: 'Subdomain updated successfully', type: 'success' })
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to update subdomain'
      setToast({ msg, type: 'error' })
    } finally {
      setSubSaving(false)
    }
  }

  const currentDomain = project?.subdomain + '.deployhub.online'

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }} className="space-y-5 pb-10">

      {/* Header */}
      <div>
        <p className="text-xs font-bold tracking-[0.15em] uppercase mb-1.5" style={{ color: '#00e5ff' }}>Domains</p>
        <h1 className="font-syne font-black text-[26px] text-white leading-none">Domains</h1>
      </div>

      {/* ── Current Domain ── */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 className="font-syne font-bold text-white text-[15px]">Active Domain</h2>
          <p className="text-xs mt-0.5" style={{ color: '#4b5563' }}>Your project is live at this address</p>
        </div>
        <div className="p-6">
          {loading ? (
            <Skeleton w="w-64" h="h-6" />
          ) : (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                style={{ background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.15)' }}>
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#34d399' }} />
                <span className="font-mono text-sm font-bold" style={{ color: '#00e5ff' }}>
                  {project?.hascustomDomain && project?.customDomain
                    ? project.customDomain
                    : currentDomain}
                </span>
              </div>
              <a href={'https://' + (project?.hascustomDomain && project?.customDomain ? project.customDomain : currentDomain)}
                target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.04)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.07)' }}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Visit
              </a>
            </div>
          )}
        </div>
      </div>

      {/* ── Change Subdomain ── */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 className="font-syne font-bold text-white text-[15px]">Change Subdomain</h2>
          <p className="text-xs mt-0.5" style={{ color: '#4b5563' }}>
            Update your free <span style={{ color: '#6b7280' }}>.deployhub.online</span> subdomain
          </p>
        </div>
        <div className="p-6 space-y-4">
          {loading ? (
            <div className="space-y-3"><Skeleton h="h-11" /><Skeleton w="w-32" h="h-9" /></div>
          ) : (
            <>
              {/* Input with suffix */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white">Subdomain</label>
                <div className="flex items-stretch rounded-xl overflow-hidden"
                  style={{ border: '1px solid ' + (subError ? 'rgba(248,113,113,0.4)' : subdomain !== project?.subdomain ? 'rgba(0,229,255,0.4)' : 'rgba(255,255,255,0.08)') }}>
                  <input
                    value={subdomain}
                    onChange={e => handleSubdomainChange(e.target.value)}
                    placeholder="my-project"
                    className="flex-1 px-4 py-2.5 text-sm font-mono outline-none bg-transparent"
                    style={{ color: '#e5e7eb', background: 'rgba(255,255,255,0.02)' }}
                  />
                  <div className="flex items-center px-3 text-sm font-mono flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.03)', color: '#374151', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
                    .deployhub.online
                  </div>
                </div>
                {subError && (
                  <p className="text-[11px]" style={{ color: '#f87171' }}>{subError}</p>
                )}
                {!subError && subdomain && subdomain !== project?.subdomain && (
                  <p className="text-[11px]" style={{ color: '#00e5ff' }}>
                    Preview: {subdomain}.deployhub.online
                  </p>
                )}
              </div>

              {/* Warning */}
              <div className="px-3 py-2.5 rounded-xl flex items-start gap-2 text-xs"
                style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', color: '#d97706' }}>
                <span className="flex-shrink-0 mt-0.5">⚠</span>
                <span>Changing your subdomain will immediately break existing links. Your old subdomain will not be reserved.</span>
              </div>

              <div className="flex justify-end">
                <button onClick={saveSubdomain}
                  disabled={subSaving || !!subError || subdomain === project?.subdomain}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
                  style={{ background: 'linear-gradient(135deg,#00e5ff,#00b8cc)', color: '#000' }}>
                  {subSaving && <div className="w-3.5 h-3.5 rounded-full border-2 border-black border-t-transparent animate-spin" />}
                  Save Subdomain
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Custom Domain (Pro — Coming Soon) ── */}
      <div className="rounded-2xl overflow-hidden relative"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', opacity: 0.7 }}>

        {/* Coming soon overlay */}
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl backdrop-blur-[1px]"
          style={{ background: 'rgba(5,8,16,0.6)' }}>
          <div className="text-center px-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-2"
              style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', color: '#00e5ff' }}>
              🚧 Coming Soon
            </div>
            <p className="text-sm text-white font-bold">Custom Domain Support</p>
            <p className="text-xs mt-1" style={{ color: '#4b5563' }}>Infrastructure in progress — available soon for Pro users</p>
          </div>
        </div>

        <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-2">
            <h2 className="font-syne font-bold text-white text-[15px]">Custom Domain</h2>
            <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md"
              style={{ background: 'rgba(0,229,255,0.08)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.15)' }}>
              Pro
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: '#4b5563' }}>Point your own domain to this project</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white">Your Domain</label>
            <input disabled placeholder="yourdomain.com"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono outline-none"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#374151' }} />
          </div>

          {/* DNS instructions preview */}
          <div className="rounded-xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="px-4 py-2.5 text-[10px] font-bold tracking-widest uppercase"
              style={{ background: 'rgba(255,255,255,0.02)', color: '#374151', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              DNS Records to add
            </div>
            <div className="p-4 space-y-2">
              {[
                { type: 'A',     name: '@',   value: '123.123.123.123' },
                { type: 'CNAME', name: 'www', value: 'yourdomain.deployhub.online' },
              ].map(r => (
                <div key={r.type} className="grid grid-cols-3 gap-2 text-[11px] font-mono"
                  style={{ color: '#374151' }}>
                  <span className="px-2 py-1 rounded-md text-center"
                    style={{ background: 'rgba(255,255,255,0.03)', color: '#6b7280' }}>{r.type}</span>
                  <span className="px-2 py-1 rounded-md" style={{ background: 'rgba(255,255,255,0.02)' }}>{r.name}</span>
                  <span className="px-2 py-1 rounded-md truncate" style={{ background: 'rgba(255,255,255,0.02)' }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          <button disabled
            className="w-full py-2.5 rounded-xl font-bold text-sm opacity-30 cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg,#00e5ff,#00b8cc)', color: '#000' }}>
            Add Custom Domain
          </button>
        </div>
      </div>

      <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg: '' })} />
    </div>
  )
}