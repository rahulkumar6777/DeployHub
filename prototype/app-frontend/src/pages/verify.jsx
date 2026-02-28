import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PaymentGateway from '../components/PaymentGateway'
import { useAuth } from '../context/AuthContext'

// ── What you CANNOT do unverified ─────────────────────────
const LOCKED_FEATURES = [
  { icon: '🚀', label: 'Deploy Projects', desc: 'Host static sites & Node.js apps' },
  { icon: '📊', label: 'Analytics Dashboard', desc: 'Requests, RAM, CPU insights' },
  { icon: '🔒', label: 'Free SSL on all apps', desc: 'Auto HTTPS for every deployment' },
  { icon: '🌐', label: 'Custom Subdomain', desc: 'yourapp.deployhub.app live URL' },
  { icon: '🔄', label: 'Auto-restart', desc: 'App restarts if it crashes' },
  { icon: '🔑', label: 'API Keys', desc: 'Programmatic deployments' },
]

// ── Why ₹99? ───────────────────────────────────────────────
const REASONS = [
  { icon: '🤖', text: 'Prevents spam & bot abuse' },
  { icon: '💯', text: 'One-time only — never charged again' },
  { icon: '🔓', text: 'Unlocks the full platform forever' },
]

export default function VerifyPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!loading && user?.verified) {
      navigate('/', { replace: true })
    }
  }, [user, loading, navigate])

  // Stagger in
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60)
    return () => clearTimeout(t)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#050810' }}>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'rgba(0,229,255,0.3)', borderTopColor: '#00e5ff' }} />
          <span className="text-sm" style={{ color: '#4b5563' }}>Checking status...</span>
        </div>
      </div>
    )
  }

  const firstName = user?.fullname?.split(' ')[0] || 'there'

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#050810' }}>

      {/* ── Background effects ── */}
      {/* Top center glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[100px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(0,229,255,0.07) 0%, transparent 70%)' }} />
      {/* Bottom violet glow */}
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.06) 0%, transparent 70%)' }} />
      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      {/* ── Top bar ── */}
      <div className="relative z-10 flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <div className="font-syne font-black text-xl tracking-tight">
          <span style={{ color: 'red' }}>Deploy</span>
          <span style={{ color: '#00e5ff' }}>Hub</span>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: '#374151' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Secured by Razorpay
        </div>
      </div>

      {/* ── Main content ── */}
      <div className={`relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pb-16 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        {/* ── Hero section ── */}
        <div className="text-center mb-10 mt-4">
          {/* Lock icon */}
          <div className="relative inline-flex mb-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.12), rgba(124,58,237,0.12))', border: '1px solid rgba(0,229,255,0.2)' }}>
              <svg className="w-7 h-7" style={{ color: '#00e5ff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-2xl animate-ping opacity-20" style={{ border: '2px solid #00e5ff' }} />
          </div>

          <h1 className="font-syne font-black text-3xl sm:text-4xl text-white mb-3 leading-tight">
            Hey {firstName}, one last step 👋
          </h1>
          <p className="text-base max-w-md mx-auto" style={{ color: '#6b7280' }}>
            Complete a <span className="text-white font-semibold">one-time ₹99 verification</span> to unlock the full DeployHub platform — forever.
          </p>
        </div>

        {/* ── Two column layout ── */}
        <div className="grid lg:grid-cols-2 gap-6 items-start">

          {/* Left — what's locked + why */}
          <div className="space-y-5" style={{ animationDelay: '100ms' }}>

            {/* Locked features */}
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <span className="text-xs font-black tracking-[0.15em] uppercase" style={{ color: '#6b7280' }}>
                  Locked until verified
                </span>
              </div>
              <div className="space-y-3">
                {LOCKED_FEATURES.map((f, i) => (
                  <div key={f.label}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.04)',
                      opacity: visible ? 1 : 0,
                      transform: visible ? 'translateX(0)' : 'translateX(-8px)',
                      transition: `all 0.4s ease ${i * 60}ms`,
                    }}>
                    {/* Lock overlay */}
                    <div className="relative flex-shrink-0">
                      <span className="text-xl grayscale opacity-40">{f.icon}</span>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                        style={{ background: '#ef4444' }}>
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white">{f.label}</div>
                      <div className="text-xs" style={{ color: '#4b5563' }}>{f.desc}</div>
                    </div>
                    <div className="ml-auto flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.15)' }}>
                      Locked
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Why ₹99 */}
            <div className="rounded-2xl p-4" style={{ background: 'rgba(0,229,255,0.03)', border: '1px solid rgba(0,229,255,0.08)' }}>
              <div className="text-xs font-black tracking-[0.15em] uppercase mb-3" style={{ color: '#374151' }}>Why ₹99?</div>
              <div className="space-y-2.5">
                {REASONS.map(r => (
                  <div key={r.text} className="flex items-center gap-3">
                    <span className="text-base flex-shrink-0">{r.icon}</span>
                    <span className="text-sm" style={{ color: '#6b7280' }}>{r.text}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right — payment card */}
          <div className="lg:sticky lg:top-6">
            <div className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>

              {/* Card header */}
              <div className="px-6 pt-6 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-syne font-black text-2xl text-white">₹99</span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(52,211,153,0.08)', color: '#34d399', border: '1px solid rgba(52,211,153,0.15)' }}>
                    One-time only
                  </span>
                </div>
                <p className="text-sm" style={{ color: '#4b5563' }}>Account Verification · Never charged again</p>
              </div>

              {/* What you unlock */}
              <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="text-[10px] font-black tracking-[0.15em] uppercase mb-3" style={{ color: '#374151' }}>
                  After payment you get
                </div>
                <div className="space-y-2">
                  {[
                    'Deploy up to 3 projects',
                    '2,000 monthly requests',
                    '512MB RAM per project',
                    'Free SSL on all apps',
                    'API access',
                  ].map(item => (
                    <div key={item} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(0,229,255,0.1)' }}>
                        <svg className="w-2.5 h-2.5" style={{ color: '#00e5ff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm" style={{ color: '#9ca3af' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment gateway */}
              <div className="px-6 py-5">
                <PaymentGateway
                  amount={9900}
                  description="Account Verification — NestHost"
                />
              </div>

              {/* Trust badges */}
              <div className="px-6 pb-5">
                <div className="flex items-center justify-center gap-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  {[
                    { icon: '🔒', text: '256-bit SSL' },
                    { icon: '⚡', text: 'Instant unlock' },
                    { icon: '💳', text: 'UPI / Cards' },
                  ].map(b => (
                    <div key={b.text} className="flex items-center gap-1.5">
                      <span className="text-sm">{b.icon}</span>
                      <span className="text-[10px]" style={{ color: '#374151' }}>{b.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer note */}
            <p className="text-center text-xs mt-3" style={{ color: '#1f2937' }}>
              By paying you agree to our{' '}
              <a href="#" className="underline" style={{ color: '#374151' }}>Terms of Service</a>
              {' & '}
              <a href="#" className="underline" style={{ color: '#374151' }}>Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}