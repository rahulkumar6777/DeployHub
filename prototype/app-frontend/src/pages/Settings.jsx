import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/apiclient' 

// ── Helpers ───────────────────────────────────────────────
function Section({ title, desc, children }) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <h2 className="font-syne font-bold text-white text-[15px]">{title}</h2>
        {desc && <p className="text-xs mt-0.5" style={{ color: '#4b5563' }}>{desc}</p>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-white">{label}</label>
      {children}
      {hint && <p className="text-[11px]" style={{ color: '#374151' }}>{hint}</p>}
    </div>
  )
}

function Input({ value, onChange, placeholder, mono, disabled }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all ${mono ? 'font-mono' : ''}`}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: disabled ? '#4b5563' : '#e5e7eb',
      }}
      onFocus={e => !disabled && (e.target.style.borderColor = 'rgba(0,229,255,0.4)')}
      onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
    />
  )
}

function SaveBtn({ loading, disabled, onClick, label = 'Save Changes' }) {
  return (
    <button onClick={onClick} disabled={loading || disabled}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
      style={{ background: 'linear-gradient(135deg,#00e5ff,#00b8cc)', color: '#000' }}>
      {loading && <div className="w-3.5 h-3.5 rounded-full border-2 border-black border-t-transparent animate-spin" />}
      {label}
    </button>
  )
}

function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [msg])
  if (!msg) return null
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium"
      style={{
        background: type === 'success' ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
        border: `1px solid ${type === 'success' ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`,
        color: type === 'success' ? '#34d399' : '#f87171',
      }}>
      {type === 'success' ? '✓' : '✕'} {msg}
      <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100">✕</button>
    </div>
  )
}

function Skeleton({ w = 'w-full', h = 'h-10' }) {
  return <div className={`${w} ${h} rounded-xl animate-pulse`} style={{ background: 'rgba(255,255,255,0.05)' }} />
}

// ── Main ──────────────────────────────────────────────────
export default function Settings() {
  const { id: projectId } = useParams()
  const navigate          = useNavigate()

  const [loading,  setLoading]  = useState(true)
  const [project,  setProject]  = useState(null)
  const [toast,    setToast]    = useState({ msg: '', type: 'success' })

  // Section saving states
  const [savingGeneral, setSavingGeneral] = useState(false)
  const [savingBuild,   setSavingBuild]   = useState(false)
  const [savingEnv,     setSavingEnv]     = useState(false)
  const [deleting,      setDeleting]      = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')

  // Form states — General
  const [name,   setName]   = useState('')
  const [branch, setBranch] = useState('main')
  const [folder, setFolder] = useState({ enabled: false, name: '' })

  // Form states — Build
  const [buildCommand, setBuildCommand] = useState('')
  const [publishDir,   setPublishDir]   = useState('')
  const [startCommand, setStartCommand] = useState('')
  const [port,         setPort]         = useState('')

  // Form states — Env
  const [envVars, setEnvVars] = useState([]) // [{ key, value, isNew, isDirty }]
  const [newKey,  setNewKey]  = useState('')
  const [newVal,  setNewVal]  = useState('')
  const [showVals, setShowVals] = useState({})

  // ── Load project ─────────────────────────────────────
  useEffect(() => {
    api.get(`/projects/${projectId}/settings`)
      .then(res => {
        const p = res.data.project
        setProject(p)
        setName(p.name || '')
        setBranch(p.settings?.repoBranchName || 'main')
        setFolder(p.settings?.folder || { enabled: false, name: '' })
        setBuildCommand(p.buildCommand || '')
        setPublishDir(p.publishDir   || '')
        setStartCommand(p.startCommand || '')
        setPort(p.port ? String(p.port) : '')
        // env Map → array
        const envArr = Object.entries(p.env || {}).map(([key, value]) => ({ key, value, orig: value }))
        setEnvVars(envArr)
      })
      .catch(() => navigate('/projects'))
      .finally(() => setLoading(false))
  }, [projectId])

  const showToast = (msg, type = 'success') => setToast({ msg, type })

  // ── Save General ──────────────────────────────────────
  async function saveGeneral() {
    setSavingGeneral(true)
    try {
      await api.patch(`/projects/${projectId}/settings/general`, {
        name,
        repoBranchName: branch,
        folder,
      })
      setProject(p => ({ ...p, name, settings: { ...p.settings, repoBranchName: branch, folder } }))
      showToast('General settings saved')
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to save', 'error')
    } finally {
      setSavingGeneral(false)
    }
  }

  // ── Save Build ────────────────────────────────────────
  async function saveBuild() {
    setSavingBuild(true)
    try {
      await api.patch(`/projects/${projectId}/settings/build`, {
        buildCommand,
        publishDir,
        startCommand,
        port: port ? parseInt(port) : undefined,
      })
      showToast('Build settings saved')
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to save', 'error')
    } finally {
      setSavingBuild(false)
    }
  }

  // ── Env helpers ───────────────────────────────────────
  function addEnvVar() {
    if (!newKey.trim()) return
    if (envVars.find(e => e.key === newKey.trim())) {
      showToast('Key already exists', 'error')
      return
    }
    setEnvVars(prev => [...prev, { key: newKey.trim(), value: newVal, orig: null, isNew: true }])
    setNewKey('')
    setNewVal('')
  }

  function removeEnvVar(key) {
    setEnvVars(prev => prev.filter(e => e.key !== key))
  }

  function updateEnvVal(key, value) {
    setEnvVars(prev => prev.map(e => e.key === key ? { ...e, value } : e))
  }

  // ── Save Env ──────────────────────────────────────────
  async function saveEnv() {
    setSavingEnv(true)
    try {
      const env = Object.fromEntries(envVars.map(e => [e.key, e.value]))
      await api.patch(`/projects/${projectId}/settings/env`, { env })
      setEnvVars(prev => prev.map(e => ({ ...e, orig: e.value, isNew: false })))
      showToast('Environment variables saved')
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to save', 'error')
    } finally {
      setSavingEnv(false)
    }
  }

  // ── Delete project ────────────────────────────────────
  async function deleteProject() {
    if (deleteConfirm !== project?.name) return
    setDeleting(true)
    try {
      await api.delete(`/projects/${projectId}`)
      navigate('/projects')
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to delete', 'error')
      setDeleting(false)
    }
  }

  const isNode   = project?.projectType === 'node'
  const isStatic = project?.projectType === 'Static'

  // ── Render ────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }} className="space-y-5 pb-10">

      {/* Header */}
      <div>
        <p className="text-xs font-bold tracking-[0.15em] uppercase mb-1.5" style={{ color: '#00e5ff' }}>Settings</p>
        <h1 className="font-syne font-black text-[26px] text-white leading-none">Project Settings</h1>
      </div>

      {/* ── General ── */}
      <Section title="General" desc="Basic project configuration">
        {loading ? (
          <div className="space-y-4"><Skeleton /><Skeleton /><Skeleton /></div>
        ) : (
          <div className="space-y-4">
            <Field label="Project Name">
              <Input value={name} onChange={setName} placeholder="my-project" />
            </Field>

            <Field label="Git Branch" hint="Branch to deploy from">
              <Input value={branch} onChange={setBranch} placeholder="main" mono />
            </Field>

            <Field label="Root Directory" hint="Leave disabled to use repo root">
              <div className="space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <div onClick={() => setFolder(f => ({ ...f, enabled: !f.enabled }))}
                    className="w-9 h-5 rounded-full relative transition-all flex-shrink-0"
                    style={{ background: folder.enabled ? '#00e5ff' : 'rgba(255,255,255,0.1)' }}>
                    <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                      style={{ left: folder.enabled ? '18px' : '2px' }} />
                  </div>
                  <span className="text-xs" style={{ color: '#9ca3af' }}>
                    {folder.enabled ? 'Custom folder enabled' : 'Use repo root'}
                  </span>
                </label>
                {folder.enabled && (
                  <Input value={folder.name} onChange={v => setFolder(f => ({ ...f, name: v }))}
                    placeholder="packages/frontend" mono />
                )}
              </div>
            </Field>

            <div className="flex justify-end pt-2">
              <SaveBtn loading={savingGeneral} onClick={saveGeneral} />
            </div>
          </div>
        )}
      </Section>

      {/* ── Build ── */}
      <Section title="Build & Deploy" desc="Configure how your project is built and served">
        {loading ? (
          <div className="space-y-4"><Skeleton /><Skeleton />{isNode && <Skeleton />}</div>
        ) : (
          <div className="space-y-4">
            <Field label="Build Command" hint={isStatic ? 'e.g. npm run build' : 'e.g. npm install'}>
              <Input value={buildCommand} onChange={setBuildCommand}
                placeholder={isStatic ? 'npm run build' : 'npm install'} mono />
            </Field>

            {isStatic && (
              <Field label="Publish Directory" hint="Folder containing your built files">
                <Input value={publishDir} onChange={setPublishDir} placeholder="dist" mono />
              </Field>
            )}

            {isNode && (
              <>
                <Field label="Start Command" hint="Command to start your app">
                  <Input value={startCommand} onChange={setStartCommand} placeholder="node index.js" mono />
                </Field>
                <Field label="Port" hint="Port your app listens on">
                  <Input value={port} onChange={setPort} placeholder="3000" mono />
                </Field>
              </>
            )}

            <div className="flex justify-end pt-2">
              <SaveBtn loading={savingBuild} onClick={saveBuild} />
            </div>
          </div>
        )}
      </Section>

      {/* ── Environment Variables ── */}
      <Section title="Environment Variables" desc="Available at build time and runtime">
        {loading ? (
          <div className="space-y-3"><Skeleton /><Skeleton /><Skeleton /></div>
        ) : (
          <div className="space-y-3">
            {/* Existing vars */}
            {envVars.length > 0 && (
              <div className="space-y-2">
                {envVars.map(env => (
                  <div key={env.key} className="flex items-center gap-2">
                    {/* Key */}
                    <div className="flex-1 px-3 py-2.5 rounded-xl text-sm font-mono flex-shrink-0"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#9ca3af', minWidth: 0 }}>
                      <span className="truncate block">{env.key}</span>
                    </div>
                    {/* Value */}
                    <div className="flex-1 relative">
                      <input
                        type={showVals[env.key] ? 'text' : 'password'}
                        value={env.value}
                        onChange={e => updateEnvVal(env.key, e.target.value)}
                        className="w-full px-3 py-2.5 pr-8 rounded-xl text-sm font-mono outline-none"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: `1px solid ${env.value !== env.orig ? 'rgba(0,229,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                          color: '#e5e7eb',
                        }}
                        onFocus={e => e.target.style.borderColor = 'rgba(0,229,255,0.4)'}
                        onBlur={e => e.target.style.borderColor = env.value !== env.orig ? 'rgba(0,229,255,0.3)' : 'rgba(255,255,255,0.08)'}
                      />
                      <button onClick={() => setShowVals(p => ({ ...p, [env.key]: !p[env.key] }))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] transition-opacity opacity-40 hover:opacity-80"
                        style={{ color: '#9ca3af' }}>
                        {showVals[env.key] ? 'hide' : 'show'}
                      </button>
                    </div>
                    {/* Delete */}
                    <button onClick={() => removeEnvVar(env.key)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 transition-colors"
                      style={{ color: '#374151' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; e.currentTarget.style.color = '#f87171' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#374151' }}>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new var */}
            <div className="flex items-center gap-2 pt-1">
              <input value={newKey} onChange={e => setNewKey(e.target.value)}
                placeholder="VARIABLE_NAME"
                onKeyDown={e => e.key === 'Enter' && addEnvVar()}
                className="flex-1 px-3 py-2.5 rounded-xl text-sm font-mono outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#e5e7eb' }}
                onFocus={e => e.target.style.borderColor = 'rgba(0,229,255,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
              <input value={newVal} onChange={e => setNewVal(e.target.value)}
                placeholder="value"
                onKeyDown={e => e.key === 'Enter' && addEnvVar()}
                className="flex-1 px-3 py-2.5 rounded-xl text-sm font-mono outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#e5e7eb' }}
                onFocus={e => e.target.style.borderColor = 'rgba(0,229,255,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
              <button onClick={addEnvVar}
                className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0 font-bold transition-all hover:scale-105"
                style={{ background: 'rgba(0,229,255,0.1)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.2)' }}>
                +
              </button>
            </div>

            {envVars.length === 0 && (
              <p className="text-xs text-center py-4" style={{ color: '#374151' }}>
                No environment variables yet
              </p>
            )}

            <div className="flex items-center justify-between pt-2">
              <p className="text-[11px]" style={{ color: '#374151' }}>
                Changes take effect on next deploy
              </p>
              <SaveBtn loading={savingEnv} onClick={saveEnv} label="Save Env Vars" />
            </div>
          </div>
        )}
      </Section>

      {/* ── Danger Zone ── */}
      <Section title="Danger Zone" desc="Irreversible actions — proceed with caution">
        <div className="space-y-4">
          <div className="rounded-xl p-4 space-y-3"
            style={{ background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.12)' }}>
            <div>
              <p className="text-sm font-bold" style={{ color: '#f87171' }}>Delete this project</p>
              <p className="text-xs mt-0.5" style={{ color: '#4b5563' }}>
                This will permanently delete the project, all builds, and remove your deployment. This cannot be undone.
              </p>
            </div>
            <Field label={`Type "${project?.name}" to confirm`}>
              <Input value={deleteConfirm} onChange={setDeleteConfirm}
                placeholder={project?.name || 'project-name'} />
            </Field>
            <button
              onClick={deleteProject}
              disabled={deleteConfirm !== project?.name || deleting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-30"
              style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}
              onMouseEnter={e => { if (deleteConfirm === project?.name) e.currentTarget.style.background = 'rgba(248,113,113,0.2)' }}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'}>
              {deleting && <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />}
              Delete Project
            </button>
          </div>
        </div>
      </Section>

      <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg: '' })} />
    </div>
  )
}