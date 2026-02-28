import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PaymentGateway from '../components/PaymentGateway'
import { useAuth } from '../context/AuthContext'

export default function VerifyPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)

  // Redirect if already verified
  useEffect(() => {
    if (!loading && user?.verified) {
      navigate('/', { replace: true })
    }
  }, [user, loading, navigate])

  // Simple fade-in
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050810]">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin border-[#00e5ff]" />
          <span className="text-sm text-gray-500">Checking status...</span>
        </div>
      </div>
    )
  }

  const firstName = user?.fullname?.split(' ')[0] || 'there'

  return (
    <div className="min-h-screen bg-[#050810] text-white">
      {/* Simple background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a0f1a] to-[#03050b] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="font-syne font-black text-xl">
            <span className="text-red-500">Deploy</span>
            <span className="text-[#00e5ff]">Hub</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Secured by Razorpay
          </div>
        </div>

        {/* Main content with fade-in */}
        <div className={`transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#00e5ff]/10 border border-[#00e5ff]/20 mb-4">
              <svg className="w-7 h-7 text-[#00e5ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="font-syne font-black text-3xl sm:text-4xl mb-3">
              Hey {firstName}, one last step 👋
            </h1>
            <p className="text-gray-400 max-w-md mx-auto">
              Complete a <span className="text-white font-semibold">one-time ₹99 verification</span> to unlock the full DeployHub platform — forever.
            </p>
            {/* Key message: unlocks only after verification */}
            <p className="text-sm text-[#00e5ff] font-medium mt-4 bg-[#00e5ff]/10 inline-block px-4 py-2 rounded-full border border-[#00e5ff]/20">
              🔓 Platform fully unlocks only after successful verification
            </p>
          </div>

          {/* Single column: payment card centered */}
          <div className="max-w-md mx-auto">
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl overflow-hidden">
              {/* Price header */}
              <div className="p-6 border-b border-white/[0.05]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-syne font-black text-2xl">₹99</span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    One-time only
                  </span>
                </div>
                <p className="text-sm text-gray-500">Account verification · Never charged again</p>
              </div>

              {/* What you get */}
              <div className="p-6 border-b border-white/[0.05]">
                <h3 className="text-xs font-bold tracking-wider text-gray-600 uppercase mb-3">After payment you get</h3>
                <div className="space-y-2">
                  {[
                    'Deploy up to 3 projects',
                    '2,000 monthly requests',
                    '512MB RAM per project',
                    'Free SSL on all apps',
                    'API access',
                  ].map(item => (
                    <div key={item} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-[#00e5ff]/10 flex items-center justify-center flex-shrink-0">
                        <svg className="w-2.5 h-2.5 text-[#00e5ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment component */}
              <div className="p-6">
                <PaymentGateway amount={9900} description="Account Verification — Deployhub" />
              </div>

              {/* Trust badges */}
              <div className="px-6 pb-6">
                <div className="flex items-center justify-center gap-4 pt-4 border-t border-white/[0.04]">
                  {[
                    { icon: '🔒', text: '256-bit SSL' },
                    { icon: '⚡', text: 'Instant unlock' },
                    { icon: '💳', text: 'UPI / Cards' },
                  ].map(b => (
                    <div key={b.text} className="flex items-center gap-1.5">
                      <span className="text-sm">{b.icon}</span>
                      <span className="text-[10px] text-gray-600">{b.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer note */}
            <p className="text-center text-xs text-gray-700 mt-4">
              By paying you agree to our{' '}
              <a href="#" className="underline text-gray-500 hover:text-gray-400">Terms of Service</a>
              {' & '}
              <a href="#" className="underline text-gray-500 hover:text-gray-400">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}