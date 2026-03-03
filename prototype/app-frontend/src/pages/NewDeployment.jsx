import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const BASE_PRICE = 799
const DISCOUNTS = { 1: 0, 3: 4, 6: 8, 12: 10, 24: 15 }
const DURATION_LABELS = { 1: '1 Month', 3: '3 Months', 6: '6 Months', 12: '1 Year', 24: '2 Years' }

function calcPrice(months) {
  const disc     = DISCOUNTS[months]
  const perMonth = Math.round(BASE_PRICE * (1 - disc / 100))
  const total    = perMonth * months
  const saved    = BASE_PRICE * months - total
  return { disc, perMonth, total, saved }
}

function useRazorpay() {
  const [loaded, setLoaded] = useState(!!window.Razorpay)
  useEffect(() => {
    if (window.Razorpay) return
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.async = true
    s.onload = () => setLoaded(true)
    document.body.appendChild(s)
  }, [])
  return loaded
}

function GithubIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  )
}

function Input({ label, hint, error, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white">{label}</label>
          {hint && <span className="text-[10px]" style={{ color: '#374151' }}>{hint}</span>}
        </div>
      )}
      <input {...props}
        onFocus={e => { setFocused(true); props.onFocus?.(e) }}
        onBlur={e => { setFocused(false); props.onBlur?.(e) }}
        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: `1px solid ${focused ? 'rgba(0,229,255,0.35)' : error ? 'rgba(248,113,113,0.3)' : 'rgba(255,255,255,0.08)'}`,
          color: '#fff', transition: 'border-color 0.15s',
        }}
      />
      {error && <p className="text-[11px]" style={{ color: '#f87171' }}>{error}</p>}
    </div>
  )
}

function Toggle({ label, checked, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center gap-3">
      <div className="relative w-9 h-5 rounded-full flex-shrink-0 transition-all duration-200"
        style={{ background: checked ? '#00e5ff' : 'rgba(255,255,255,0.08)' }}>
        <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
          style={{ left: checked ? '20px' : '2px' }} />
      </div>
      <span className="text-sm" style={{ color: '#9ca3af' }}>{label}</span>
    </button>
  )
}

function RepoRow({ repo, selected, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all"
      style={{ background: selected ? 'rgba(0,229,255,0.05)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent' }}>
      <GithubIcon size={14} />
      <span className="flex-1 text-sm truncate" style={{ color: selected ? '#00e5ff' : '#9ca3af' }}>
        {repo.full_name}
      </span>
      {repo.private && (
        <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.04)', color: '#4b5563' }}>
          <LockIcon /> Private
        </span>
      )}
      {selected && (
        <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#00e5ff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  )
}

function PlanCard({ title, price, features, selected, onClick, highlight, verified }) {
  return (
    <button type="button" onClick={onClick}
      className="w-full text-left rounded-2xl p-4 transition-all duration-200 relative"
      style={{
        background: selected ? (highlight ? 'linear-gradient(135deg,rgba(0,229,255,0.08),rgba(124,58,237,0.06))' : 'rgba(255,255,255,0.04)') : 'rgba(255,255,255,0.02)',
        border: selected ? (highlight ? '1px solid rgba(0,229,255,0.3)' : '1px solid rgba(255,255,255,0.15)') : '1px solid rgba(255,255,255,0.06)',
      }}>
      {highlight && selected && (
        <div className="h-px absolute top-0 left-0 right-0 rounded-t-2xl"
          style={{ background: 'linear-gradient(90deg,transparent,#00e5ff,transparent)' }} />
      )}
      <div className="flex items-start justify-between mb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-syne font-black text-white text-sm">{title}</span>
            {verified && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>
                ✓ {highlight ? 'Paid' : 'Ready'}
              </span>
            )}
          </div>
          <div className="font-syne font-black text-base mt-0.5" style={{ color: highlight ? '#00e5ff' : '#9ca3af' }}>
            {price}
          </div>
        </div>
        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{
            borderColor: selected ? (highlight ? '#00e5ff' : '#9ca3af') : 'rgba(255,255,255,0.15)',
            background: selected ? (highlight ? '#00e5ff' : '#9ca3af') : 'transparent',
          }}>
          {selected && (
            <svg className="w-2.5 h-2.5" fill="none" stroke="#000" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      <div className="space-y-1">
        {features.map(f => (
          <div key={f} className="flex items-center gap-2">
            <svg className="w-3 h-3 flex-shrink-0" style={{ color: highlight ? '#00e5ff' : '#4b5563' }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-xs" style={{ color: '#6b7280' }}>{f}</span>
          </div>
        ))}
      </div>
    </button>
  )
}

export default function NewDeployment() {
  const { type }       = useParams()
  const navigate       = useNavigate()
  const { user, api }  = useAuth()
  const razorpayKey    = import.meta.env.VITE_RAZORPAY_KEY_ID
  const razorpayLoaded = useRazorpay()

  const isStatic = type === 'static'
  const isGithub = user?.provider === 'github'

  const [step, setStep] = useState('repo')
  const [tab, setTab]   = useState(isGithub ? 'github' : 'public')

  // Repo
  const [repos, setRepos]               = useState([])
  const [repoLoading, setRepoLoading]   = useState(false)
  const [repoError, setRepoError]       = useState(null)
  const [search, setSearch]             = useState('')
  const [selectedRepo, setSelectedRepo] = useState(null)
  const [publicUrl, setPublicUrl]       = useState('')

  // Form
  const [form, setForm] = useState({
    name: '', branchname: 'main',
    isFolder: false, folderName: '', env: '',
    buildCommand: '', publishDir: 'dist',
    startCommand: 'node index.js', port: '3000',
  })
  const [errors, setErrors] = useState({})

  // Plan
  const [selectedPlan, setSelectedPlan] = useState('free')
  const [selectedMonths, setSelectedMonths] = useState(1)
  const [projectId, setProjectId]       = useState(null)    // from init/verify response
  const [planVerified, setPlanVerified] = useState(false)
  const [planLoading, setPlanLoading]   = useState(false)
  const [planError, setPlanError]       = useState(null)

  // Deploy
  const [deploying, setDeploying]       = useState(false)
  const [deployError, setDeployError]   = useState(null)

  useEffect(() => {
    if (!isGithub) return
    setRepoLoading(true)
    api.get('/user/gitrepos')
      .then(res => setRepos(res.data?.repos || res.data || []))
      .catch(() => setRepoError('Failed to load repos'))
      .finally(() => setRepoLoading(false))
  }, [])

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const filtered = repos.filter(r => r.full_name.toLowerCase().includes(search.toLowerCase()))

  function handleSelectRepo(repo) {
    setSelectedRepo(repo)
    setF('name', repo.name)
    setStep('form')
  }

  function handlePublicContinue() {
    if (!publicUrl.trim()) return
    const name = publicUrl.split('/').pop()?.replace('.git', '') || ''
    setSelectedRepo({ full_name: publicUrl, html_url: publicUrl, name })
    setF('name', name)
    setStep('form')
  }

  function parseEnv(str) {
    if (!str.trim()) return undefined
    const obj = {}
    str.trim().split('\n').forEach(line => {
      const idx = line.indexOf('=')
      if (idx > 0) obj[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
    })
    return Object.keys(obj).length ? obj : undefined
  }

  function validateForm() {
    const e = {}
    if (!selectedRepo?.html_url) e.codeLink = 'Please select a repository'
    if (!form.name.trim())        e.name      = 'Required'
    if (!form.branchname.trim())  e.branchname = 'Required'
    if (isStatic) {
      if (!form.buildCommand.trim()) e.buildCommand = 'Required'
      if (!form.publishDir.trim())   e.publishDir   = 'Required'
    } else {
      if (!form.startCommand.trim()) e.startCommand = 'Required'
      if (!form.port.trim())         e.port = 'Required'
      else if (isNaN(Number(form.port)) || Number(form.port) < 1 || Number(form.port) > 65535)
        e.port = 'Enter a valid port (1–65535)'
    }
    if (form.isFolder && !form.folderName.trim()) e.folderName = 'Required'
    setErrors(e)
    return !Object.keys(e).length
  }

  function handlePlanChange(plan) {
    if (plan === selectedPlan) return
    setSelectedPlan(plan)
    setSelectedMonths(1)
    setProjectId(null)
    setPlanVerified(false)
    setPlanError(null)
  }

  // Free: POST /subscription/init → {success, project}
  async function handleFreePlanInit() {
    if (!validateForm()) return
    setPlanLoading(true)
    setPlanError(null)
    try {
      const { data } = await api.post('/subscription/init', { plan: 'free' })
      if (data.success) {
        setProjectId(data.project?._id || data.projectId)
        setPlanVerified(true)
      }
    } catch (err) {
      setPlanError(err?.response?.data?.message || 'Failed to confirm plan.')
    } finally {
      setPlanLoading(false)
    }
  }

  // Paid: POST /subscription/init → Razorpay → POST /subscription/verify → {success, projectId}
  async function handlePaidPlanInit() {
    if (!validateForm()) return
    if (!razorpayLoaded || planLoading) return
    setPlanLoading(true)
    setPlanError(null)
    try {
      const { data: orderData } = await api.post('/subscription/init', { plan: selectedPlan, months: selectedMonths })

      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: 'INR',
        name: 'NestHost',
        description: `${selectedPlan} plan`,
        order_id: orderData.id,
        handler: async function (response) {
          try {
            const { data } = await api.post('/subscription/verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_signature:  response.razorpay_signature,
            })
            if (data.success) {
              setProjectId(data.project?._id || data.projectId)
              setPlanVerified(true)
            } else {
              setPlanError('Payment verification failed.')
            }
          } catch {
            setPlanError('Verification error. Contact support.')
          } finally {
            setPlanLoading(false)
          }
        },
        prefill: { name: user?.fullname || '', email: user?.email || '' },
        modal: { ondismiss: () => setPlanLoading(false) },
      }

      new window.Razorpay(options).open()
    } catch {
      setPlanError('Payment init failed.')
      setPlanLoading(false)
    }
  }

  function handleConfirmPlan() {
    if (selectedPlan === 'free') handleFreePlanInit()
    else handlePaidPlanInit()
  }

  // Deploy: POST /deployment with projectId in body
  async function handleDeploy() {
    if (!planVerified || !projectId) return
    setDeploying(true)
    setDeployError(null)
    try {
      const payload = {
        projectId,
        name:        form.name.trim(),
        codeLink:    selectedRepo.html_url,
        projectType: type,
        branchname:  form.branchname.trim(),
        isFolder:    form.isFolder,
        ...(form.isFolder && { folderName: form.folderName.trim() }),
        ...(parseEnv(form.env) && { env: parseEnv(form.env) }),
        ...(isStatic
          ? { buildCommand: form.buildCommand.trim(), publishDir: form.publishDir.trim() }
          : { startCommand: form.startCommand.trim(), port: Number(form.port) }
        ),
      }
      await api.post('/deployment', payload)
      navigate('/projects')
    } catch (err) {
      setDeployError(err?.response?.data?.message || 'Deployment failed.')
    } finally {
      setDeploying(false)
    }
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }} className="space-y-5">

      {/* Header */}
      <div>
        <button onClick={() => step === 'form' ? setStep('repo') : navigate('/projects')}
          className="flex items-center gap-1.5 text-xs font-medium mb-4 transition-colors"
          style={{ color: '#374151' }}
          onMouseEnter={e => e.currentTarget.style.color = '#9ca3af'}
          onMouseLeave={e => e.currentTarget.style.color = '#374151'}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <p className="text-xs font-bold tracking-[0.15em] uppercase mb-1" style={{ color: '#00e5ff' }}>
          {isStatic ? 'Static Site' : 'Node.js'}
        </p>
        <h1 className="font-syne font-black text-[26px] text-white leading-none">
          {step === 'repo' ? 'Select Repository' : 'Configure & Deploy'}
        </h1>
      </div>

      {/* ── STEP 1: Repo ── */}
      {step === 'repo' && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            {[
              ...(isGithub ? [{ k: 'github', l: 'GitHub' }] : []),
              { k: 'public', l: 'Public Git URL' },
            ].map(t => (
              <button key={t.k} onClick={() => setTab(t.k)}
                className="flex items-center gap-2 px-5 py-3.5 text-sm font-bold relative"
                style={{ color: tab === t.k ? '#fff' : '#4b5563' }}>
                {t.k === 'github' && <GithubIcon size={13} />}
                {t.l}
                {tab === t.k && <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: '#00e5ff' }} />}
              </button>
            ))}
          </div>

          {tab === 'github' && isGithub && (
            <div>
              <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#374151' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search repositories..."
                    className="flex-1 bg-transparent outline-none text-sm" style={{ color: '#fff' }} />
                </div>
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {repoLoading && (
                  <div className="flex items-center justify-center gap-2.5 py-12">
                    <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                      style={{ borderColor: 'rgba(0,229,255,0.3)', borderTopColor: '#00e5ff' }} />
                    <span className="text-sm" style={{ color: '#374151' }}>Loading...</span>
                  </div>
                )}
                {repoError && <div className="py-12 text-center text-sm" style={{ color: '#f87171' }}>{repoError}</div>}
                {!repoLoading && !repoError && filtered.map(repo => (
                  <RepoRow key={repo.id} repo={repo} selected={selectedRepo?.id === repo.id}
                    onClick={() => handleSelectRepo(repo)} />
                ))}
                {!repoLoading && !repoError && filtered.length === 0 && (
                  <div className="py-12 text-center text-sm" style={{ color: '#374151' }}>No repositories found</div>
                )}
              </div>
            </div>
          )}

          {tab === 'public' && (
            <div className="p-5 space-y-4">
              <p className="text-sm" style={{ color: '#4b5563' }}>Enter a public Git repository URL.</p>
              <div className="flex gap-2">
                <input value={publicUrl} onChange={e => setPublicUrl(e.target.value)}
                  placeholder="https://github.com/user/repo"
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,229,255,0.35)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  onKeyDown={e => e.key === 'Enter' && handlePublicContinue()} />
                <button onClick={handlePublicContinue} disabled={!publicUrl.trim()}
                  className="px-4 py-2.5 rounded-xl font-bold text-sm text-black disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #00e5ff, #00b8cc)' }}>
                  Continue →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 2: Form + Plan ── */}
      {step === 'form' && (
        <div className="space-y-4">

          {/* Repo pill */}
          <div className="flex items-center justify-between px-4 py-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-2.5">
              <GithubIcon size={14} />
              <span className="text-sm font-medium text-white">{selectedRepo?.full_name}</span>
            </div>
            <button type="button" onClick={() => setStep('repo')}
              className="text-xs font-bold transition-colors" style={{ color: '#374151' }}
              onMouseEnter={e => e.currentTarget.style.color = '#00e5ff'}
              onMouseLeave={e => e.currentTarget.style.color = '#374151'}>
              Edit
            </button>
          </div>

          {/* Project info */}
          <div className="rounded-2xl p-5 space-y-4"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] font-black tracking-[0.15em] uppercase" style={{ color: '#374151' }}>Project</p>
            <Input label="Name" value={form.name} onChange={e => setF('name', e.target.value)}
              placeholder="my-app" error={errors.name} />
            <Input label="Branch" value={form.branchname} onChange={e => setF('branchname', e.target.value)}
              placeholder="main" error={errors.branchname} />
            <Toggle label="Project is in a subfolder" checked={form.isFolder} onChange={v => setF('isFolder', v)} />
            {form.isFolder && (
              <Input label="Folder Name" value={form.folderName} onChange={e => setF('folderName', e.target.value)}
                placeholder="packages/app" error={errors.folderName} />
            )}
          </div>

          {/* Build / Runtime */}
          <div className="rounded-2xl p-5 space-y-4"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] font-black tracking-[0.15em] uppercase" style={{ color: '#374151' }}>
              {isStatic ? 'Build' : 'Runtime'}
            </p>
            {isStatic ? (
              <>
                <Input label="Build Command" value={form.buildCommand}
                  onChange={e => setF('buildCommand', e.target.value)} placeholder="npm run build" error={errors.buildCommand} />
                <Input label="Publish Directory" hint="e.g. dist, build" value={form.publishDir}
                  onChange={e => setF('publishDir', e.target.value)} placeholder="dist" error={errors.publishDir} />
              </>
            ) : (
              <>
                <Input label="Start Command" value={form.startCommand}
                  onChange={e => setF('startCommand', e.target.value)} placeholder="node index.js" error={errors.startCommand} />
                <Input label="Port" hint="1–65535" value={form.port}
                  onChange={e => setF('port', e.target.value)} placeholder="3000" type="number" error={errors.port} />
              </>
            )}
          </div>

          {/* Env */}
          <div className="rounded-2xl p-5 space-y-3"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black tracking-[0.15em] uppercase" style={{ color: '#374151' }}>
                Environment Variables
              </p>
              <span className="text-[10px]" style={{ color: '#1f2937' }}>optional</span>
            </div>
            <textarea value={form.env} onChange={e => setF('env', e.target.value)}
              placeholder={'KEY=value\nANOTHER_KEY=value'} rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none font-mono resize-none"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#9ca3af' }}
              onFocus={e => e.target.style.borderColor = 'rgba(0,229,255,0.3)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'} />
          </div>

          {/* ── Plan section ── */}
          <div className="rounded-2xl p-5 space-y-4"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] font-black tracking-[0.15em] uppercase" style={{ color: '#374151' }}>
              Choose Plan
            </p>

            <div className="grid sm:grid-cols-2 gap-3">
              <PlanCard title="Free" price="₹0 / forever"
                features={['512MB RAM', '0.1 vCPU', '2,000 req/day', 'deployhub.online subdomain']}
                selected={selectedPlan === 'free'} onClick={() => handlePlanChange('free')}
                highlight={false} verified={planVerified && selectedPlan === 'free'} />
              <PlanCard title="Pro" price="₹799 / mo"
                features={['2GB RAM', '1 vCPU', '1,00,000 req/day', 'Custom domain']}
                selected={selectedPlan === 'pro'} onClick={() => handlePlanChange('pro')}
                highlight={true} verified={planVerified && selectedPlan === 'pro'} />
            </div>

            {/* Month selector — only for Pro */}
            {selectedPlan === 'pro' && !planVerified && (() => {
              const { disc, perMonth, total, saved } = calcPrice(selectedMonths)
              return (
                <div className="space-y-3">
                  <p className="text-[10px] font-black tracking-[0.15em] uppercase" style={{ color: '#374151' }}>Billing Duration</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(DISCOUNTS).map(([m, d]) => {
                      const mo = parseInt(m)
                      const active = selectedMonths === mo
                      return (
                        <button key={mo} type="button"
                          onClick={() => setSelectedMonths(mo)}
                          className="relative flex flex-col items-center px-3 py-2 rounded-xl text-xs font-bold transition-all"
                          style={{
                            background: active ? 'rgba(0,229,255,0.1)' : 'rgba(255,255,255,0.03)',
                            border: active ? '1px solid rgba(0,229,255,0.35)' : '1px solid rgba(255,255,255,0.07)',
                            color: active ? '#00e5ff' : '#6b7280',
                            minWidth: '60px',
                          }}>
                          {d > 0 && (
                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-black px-1.5 py-0.5 rounded-full whitespace-nowrap"
                              style={{ background: '#00e5ff', color: '#000' }}>
                              {d}% OFF
                            </span>
                          )}
                          <span className="mt-1">{DURATION_LABELS[mo]}</span>
                        </button>
                      )
                    })}
                  </div>
                  {/* Price breakdown */}
                  <div className="rounded-xl px-4 py-3 space-y-1.5"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: '#4b5563' }}>₹{BASE_PRICE} × {selectedMonths} month{selectedMonths > 1 ? 's' : ''}</span>
                      <span style={{ color: '#4b5563' }}>₹{BASE_PRICE * selectedMonths}</span>
                    </div>
                    {disc > 0 && (
                      <div className="flex items-center justify-between text-xs">
                        <span style={{ color: '#34d399' }}>Discount ({disc}%)</span>
                        <span style={{ color: '#34d399' }}>−₹{saved}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1"
                      style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <span className="text-sm font-black text-white">Total</span>
                      <div className="text-right">
                        <span className="text-sm font-black" style={{ color: '#00e5ff' }}>₹{total}</span>
                        {selectedMonths > 1 && (
                          <span className="text-[10px] block" style={{ color: '#374151' }}>₹{perMonth}/mo effective</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}

            {planError && (
              <div className="px-4 py-2.5 rounded-xl"
                style={{ background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.18)' }}>
                <span className="text-sm" style={{ color: '#f87171' }}>{planError}</span>
              </div>
            )}

            {/* Confirm plan button */}
            {!planVerified && (
              <button onClick={handleConfirmPlan}
                disabled={planLoading || (selectedPlan !== 'free' && !razorpayLoaded)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-60"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                {planLoading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    {selectedPlan === 'free' ? 'Confirming...' : 'Opening payment...'}
                  </>
                ) : selectedPlan === 'free' ? 'Confirm Free Plan' : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    {`Pay ₹${calcPrice(selectedMonths).total} & Confirm`}
                  </>
                )}
              </button>
            )}

            {/* Verified state */}
            {planVerified && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)' }}>
                <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#34d399' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium" style={{ color: '#34d399' }}>
                  {selectedPlan === 'free' ? 'Free plan confirmed' : 'Payment successful'} — ready to deploy
                </span>
                <button onClick={() => { setPlanVerified(false); setProjectId(null) }}
                  className="ml-auto text-xs transition-colors" style={{ color: '#374151' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#9ca3af'}
                  onMouseLeave={e => e.currentTarget.style.color = '#374151'}>
                  Change
                </button>
              </div>
            )}
          </div>

          {deployError && (
            <div className="px-4 py-3 rounded-xl"
              style={{ background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.18)' }}>
              <span className="text-sm" style={{ color: '#f87171' }}>{deployError}</span>
            </div>
          )}

          {/* Deploy button */}
          <button onClick={handleDeploy} disabled={!planVerified || deploying}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-black text-sm text-black transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40"
            style={{
              background: 'linear-gradient(135deg, #00e5ff, #00b8cc)',
              boxShadow: planVerified ? '0 4px 20px rgba(0,229,255,0.25)' : 'none',
            }}>
            {deploying ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {planVerified ? 'Deploy Project' : 'Confirm a plan to deploy'}
              </>
            )}
          </button>

        </div>
      )}
    </div>
  )
}