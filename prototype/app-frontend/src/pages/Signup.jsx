import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { BaseUrl } from '../api/ApiUrl'

const EmailIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
  </svg>
)
const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)
const LockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
)
const EyeIcon = ({ off }) => off ? (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
) : (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)
const SpinIcon = () => (
  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
)
const GithubIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
)

function InputField({ label, id, name, type = 'text', value, onChange, placeholder, disabled, icon, rightEl }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-gray-500 tracking-widest uppercase">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-600">{icon}</div>
        <input type={type} id={id} name={name} value={value} onChange={onChange}
          placeholder={placeholder} required disabled={disabled}
          className="w-full pl-10 pr-10 py-3 text-sm text-white rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-[#00e5ff]/50 focus:outline-none focus:ring-2 focus:ring-[#00e5ff]/10 placeholder:text-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" />
        {rightEl && <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">{rightEl}</div>}
      </div>
    </div>
  )
}

function ErrorAlert({ message }) {
  if (!message) return null
  return (
    <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
      <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
      <span className="text-red-400 text-sm">{message}</span>
    </div>
  )
}

function OTPBox({ formData, setShowOTP }) {
  const [otp, setOtp]             = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]         = useState('')
  const [cooldown, setCooldown]   = useState(30)
  const inputRefs                 = useRef([])
  const navigate                  = useNavigate()

  useEffect(() => {
    const t = setInterval(() => setCooldown(p => p > 0 ? p - 1 : 0), 1000)
    return () => clearInterval(t)
  }, [])
  useEffect(() => { inputRefs.current[0]?.focus() }, [])

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]; next[i] = val; setOtp(next)
    if (val && i < 5) inputRefs.current[i + 1]?.focus()
  }
  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus()
  }
  const handlePaste = (e) => {
    e.preventDefault()
    const chars = e.clipboardData.getData('text').slice(0, 6).split('')
    const next = [...otp]
    chars.forEach((c, i) => { if (/^\d$/.test(c)) next[i] = c })
    setOtp(next)
    inputRefs.current[Math.min(chars.length, 5)]?.focus()
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length !== 6) { setError('Enter all 6 digits'); return }
    setIsLoading(true); setError('')
    try {
      const res = await axios.post(`${BaseUrl}/register/verify`, { ...formData, otp: code })
      if (res.status === 201) setTimeout(() => navigate('/login'), 0)
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Try again.')
    } finally { setIsLoading(false) }
  }
  const handleResend = async () => {
    setCooldown(30); setError('')
    try { await axios.post(`${BaseUrl}/register/init`, formData) }
    catch { setError('Failed to resend. Please try again.') }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#00e5ff]/10 border border-[#00e5ff]/20 mx-auto flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-[#00e5ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="font-syne font-black text-xl text-white mb-1">Check your inbox</h3>
        <p className="text-gray-500 text-sm leading-relaxed">
          We sent a 6-digit code to<br />
          <span className="text-gray-300 font-medium">{formData.email}</span>
        </p>
      </div>
      <ErrorAlert message={error} />
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex justify-center gap-2.5">
          {otp.map((digit, i) => (
            <input key={i} ref={el => inputRefs.current[i] = el}
              type="text" inputMode="numeric" maxLength={1} value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)} onPaste={handlePaste} disabled={isLoading}
              className={`w-11 h-12 text-center text-xl font-black rounded-xl border-2 outline-none transition-all duration-200 bg-white/[0.03] disabled:opacity-50 ${digit ? 'border-[#00e5ff]/60 text-[#00e5ff] bg-[#00e5ff]/5' : 'border-white/10 text-white focus:border-[#00e5ff]/40 focus:bg-[#00e5ff]/5'}`} />
          ))}
        </div>
        <button type="submit" disabled={isLoading || otp.join('').length !== 6}
          className="w-full py-3.5 rounded-xl bg-[#00e5ff] text-black font-bold text-sm hover:bg-cyan-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#00e5ff]/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0">
          {isLoading ? <><SpinIcon /> Verifying...</> : 'Verify & Continue →'}
        </button>
      </form>
      <div className="text-center space-y-3">
        <button onClick={handleResend} disabled={cooldown > 0}
          className={`text-sm font-medium transition-colors ${cooldown > 0 ? 'text-gray-700 cursor-not-allowed' : 'text-[#00e5ff] hover:text-cyan-300'}`}>
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
        </button>
        <button onClick={() => setShowOTP(false)}
          className="block w-full text-sm text-gray-700 hover:text-gray-500 transition-colors">
          ← Back to signup
        </button>
      </div>
    </div>
  )
}

function LeftPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-center p-10 w-[400px] flex-shrink-0 bg-[#080d14] border-r border-white/5 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[#00e5ff]/3 via-transparent to-[#7c3aed]/3 pointer-events-none" />
      <div className="relative z-10 space-y-8">
        <div>
          <h2 className="font-syne font-black text-3xl leading-tight text-white mb-3">
            Host smarter.<br /><span className="text-[#00e5ff]">Ship faster.</span>
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Deploy static sites and Node.js apps in seconds. Free forever.
          </p>
        </div>
        <div className="space-y-3">
          {[['⚡','Deploy in under 60 seconds'],['🔒','Free SSL on every project'],['📊','Request tracking built-in'],['🔄','Auto-restart on crash']].map(([icon, text]) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#00e5ff]/10 border border-[#00e5ff]/15 flex items-center justify-center text-xs flex-shrink-0">{icon}</div>
              <span className="text-gray-400 text-sm">{text}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-6 pt-6 border-t border-white/5">
          {[['2.8k+','Projects'],['99.9%','Uptime'],['Free','To start']].map(([n, l]) => (
            <div key={l}>
              <div className="font-syne font-black text-lg text-[#00e5ff]">{n}</div>
              <div className="text-xs text-gray-600 mt-0.5">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const Signup = () => {
  const [formData, setFormData]           = useState({ email: '', fullname: '', password: '' })
  const [error, setError]                 = useState('')
  const [isLoading, setIsLoading]         = useState(false)
  const [showOTP, setShowOTP]             = useState(false)
  const [showPass, setShowPass]           = useState(false)
  const [githubLoading, setGithubLoading] = useState(false)  // 👈 GitHub OAuth loading
  const navigate = useNavigate()

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleGithubSignup = () => {
    setGithubLoading(true)
    setTimeout(() => {
      window.location.href = `${BaseUrl}/auth/github`
    }, 300)
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setIsLoading(true)
    try {
      const res = await axios.post(`${BaseUrl}/register/init`, formData)
      if (res.status === 200) setShowOTP(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.')
    } finally { setIsLoading(false) }
  }

  const anyLoading = isLoading || githubLoading

  return (
    <div className="min-h-screen bg-[#050810] flex">
      <LeftPanel />

      <div className="flex-1 flex items-center justify-center px-8 py-10 relative overflow-y-auto">
        <div className="w-full max-w-sm relative z-10">

          {/* Top progress bar */}
          {anyLoading && (
            <div className="absolute -top-8 left-0 right-0 h-0.5 overflow-hidden rounded-full">
              <div className="h-full bg-gradient-to-r from-[#00e5ff] to-[#7c3aed]"
                style={{ animation: 'progress 1.2s ease-in-out infinite' }} />
            </div>
          )}

          {!showOTP ? (
            <div className="space-y-5">
              <div>
                <h1 className="font-syne font-black text-2xl text-white mb-1">Create account</h1>
                <p className="text-gray-500 text-sm">Start hosting your projects for free</p>
              </div>

              {/* GitHub OAuth Button */}
              <button
                type="button"
                onClick={handleGithubSignup}
                disabled={anyLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm font-medium text-gray-300 hover:bg-white/[0.08] hover:border-white/20 hover:text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {githubLoading ? (
                  <>
                    <SpinIcon />
                    Redirecting to GitHub...
                  </>
                ) : (
                  <>
                    <GithubIcon />
                    Continue with GitHub
                  </>
                )}
              </button>

              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-xs text-gray-700 font-medium">or with email</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>

              <ErrorAlert message={error} />

              <form onSubmit={handleSubmit} className="space-y-3">
                <InputField label="Email" id="email" name="email" type="email"
                  value={formData.email} onChange={handleChange}
                  placeholder="you@example.com" disabled={anyLoading} icon={<EmailIcon />} />
                <InputField label="Full Name" id="fullname" name="fullname"
                  value={formData.fullname} onChange={handleChange}
                  placeholder="John Doe" disabled={anyLoading} icon={<UserIcon />} />
                <InputField label="Password" id="password" name="password"
                  type={showPass ? 'text' : 'password'}
                  value={formData.password} onChange={handleChange}
                  placeholder="Min. 8 characters" disabled={anyLoading} icon={<LockIcon />}
                  rightEl={
                    <button type="button" onClick={() => setShowPass(p => !p)}
                      className="text-gray-600 hover:text-gray-400 transition-colors">
                      <EyeIcon off={showPass} />
                    </button>
                  } />
                <button type="submit" disabled={anyLoading}
                  className="w-full py-3.5 rounded-xl bg-[#00e5ff] text-black font-bold text-sm mt-1 hover:bg-cyan-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#00e5ff]/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0">
                  {isLoading ? <><SpinIcon /> Creating account...</> : 'Create Account →'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-[#00e5ff] hover:text-cyan-300 font-medium transition-colors">Sign in</Link>
              </p>
              <p className="text-center text-xs text-gray-700">
                By continuing, you agree to our{' '}
                <a href="#" className="hover:text-gray-500 transition-colors">Terms</a>
                {' & '}
                <a href="#" className="hover:text-gray-500 transition-colors">Privacy Policy</a>
              </p>
            </div>
          ) : (
            <OTPBox formData={formData} setShowOTP={setShowOTP} />
          )}
        </div>
      </div>
      <style>{`@keyframes progress { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }`}</style>
    </div>
  )
}

export default Signup