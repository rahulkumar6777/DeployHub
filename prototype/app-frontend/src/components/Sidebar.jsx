import { Link, useLocation } from 'react-router-dom'
import { useSidebar } from './SidebarContext'
import { useAuth } from '../context/AuthContext'

const NAV_GROUPS = [
  {
    section: 'MAIN',
    links: [
      { to: '/', label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
      { to: '/projects', label: 'Projects', icon: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2' },
    ]
  },
  {
    section: 'ACCOUNT',
    links: [
      { to: '/profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    ]
  },
]

export default function Sidebar() {
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar()
  const { logout, user } = useAuth()
  const location = useLocation()

  const isActive = (to) => {
    if (to === '/' && location.pathname === '/') return true
    if (to === '/projects' && location.pathname.startsWith('/project')) return true
    return location.pathname === to
  }

  const close = () => setIsSidebarOpen(false)

  const fullname = user?.fullname || 'Account'
  const profilePic = user?.profilePic || ''
  const initials = fullname.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <>
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-10 md:hidden" onClick={close} />
      )}

      <div className={`fixed top-0 left-0 w-64 h-screen z-20 flex flex-col overflow-hidden
        transform transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        style={{ background: '#07090f', borderRight: '1px solid rgba(255,255,255,0.05)' }}
      >
        {/* Subtle top glow */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.3), transparent)' }} />

        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(124,58,237,0.15))', border: '1px solid rgba(0,229,255,0.2)' }}>
            <svg className="w-4 h-4" fill="none" stroke="#00e5ff" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
            </svg>
          </div>
          <div>
            <div className="font-syne font-black text-[15px] tracking-tight leading-none">
              Deploy<span style={{ color: '#00e5ff' }}>Hub</span>
            </div>
            <div className="text-[9px] tracking-[0.18em] uppercase mt-0.5" style={{ color: '#374151' }}>
              Web Hosting
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {NAV_GROUPS.map(group => (
            <div key={group.section}>
              <div className="text-[9px] font-black tracking-[0.2em] uppercase px-3 mb-2" style={{ color: '#1f2937' }}>
                {group.section}
              </div>
              <div className="space-y-0.5">
                {group.links.map(link => {
                  const active = isActive(link.to)
                  return (
                    <Link key={link.to} to={link.to} onClick={close}
                      className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                      style={active ? {
                        background: 'linear-gradient(90deg, rgba(0,229,255,0.1), rgba(0,229,255,0.02))',
                        border: '1px solid rgba(0,229,255,0.12)',
                        color: '#00e5ff',
                      } : {
                        border: '1px solid transparent',
                        color: '#4b5563',
                      }}>
                      {active && (
                        <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full" style={{ background: '#00e5ff' }} />
                      )}
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={link.icon} />
                      </svg>
                      <span className="flex-1">{link.label}</span>
                      {active && (
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#00e5ff', opacity: 0.6 }} />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Docs */}
          <div>
            <div className="text-[9px] font-black tracking-[0.2em] uppercase px-3 mb-2" style={{ color: '#1f2937' }}>HELP</div>
            <a
              href="https://docs.deployhub.cloud"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{ border: '1px solid transparent', color: '#4b5563' }}
              onMouseEnter={e => e.currentTarget.style.color = '#e5e7eb'}
              onMouseLeave={e => e.currentTarget.style.color = '#4b5563'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Docs
              <svg className="w-3 h-3 ml-auto opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </nav>

        {/* User */}
        <div className="px-3 pb-4 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '12px' }}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
            {profilePic ? (
              <img src={profilePic} alt={fullname} className="w-7 h-7 rounded-lg object-cover flex-shrink-0" />
            ) : (
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black text-black flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #00e5ff, #7c3aed)' }}>
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">{fullname}</div>
              <div className="text-[10px] truncate" style={{ color: '#374151' }}>{user?.email || ''}</div>
            </div>
          </div>
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 hover:bg-red-500/10"
            style={{ color: '#4b5563' }}
            onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
            onMouseLeave={e => e.currentTarget.style.color = '#4b5563'}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 16l4-4m0 0l-4-4m4 4H7m5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h3a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </div>
    </>
  )
}