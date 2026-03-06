import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSidebar } from './SidebarContext'
import { useAuth } from '../context/AuthContext'

function usePageTitle() {
  const { pathname } = useLocation()
  const map = {
    '/':          'Dashboard',
    '/projects':  'Projects',
    '/profile':   'Profile',
  }
  if (map[pathname]) return map[pathname]
  if (pathname.startsWith('/project/')) {
    if (pathname.endsWith('/settings'))  return 'Settings'
    return 'Project'
  }
  return ''
}

export default function TopNavbar() {
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar()
  const { logout, user } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)
  const dropdownRef = useRef(null)
  const location = useLocation()
  const title = usePageTitle()

  const fullname   = user?.fullname || 'Account'
  const provider   = user?.provider || 'local'
  const profilePic = user?.profilePic || ''
  const initials   = fullname.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => setProfileOpen(false), [location])

  return (
    <nav className="fixed top-0 left-0 right-0 md:left-64 z-30 h-14 flex items-center"
      style={{ background: 'rgba(7,9,15,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>

      
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.2), transparent)' }} />

      <div className="w-full px-4 sm:px-6 flex items-center justify-between gap-4">

       
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: '#6b7280' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.background = 'transparent' }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d={isSidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>

          
          <span className="font-syne font-black text-white text-base">{title}</span>
        </div>

        
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setProfileOpen(p => !p)}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition-all duration-200"
            style={profileOpen
              ? { background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.15)' }
              : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>

            
            {profilePic ? (
              <img src={profilePic} alt={fullname}
                className="w-7 h-7 rounded-lg object-cover flex-shrink-0" />
            ) : (
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black text-black flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #00e5ff, #7c3aed)' }}>
                {initials}
              </div>
            )}

            
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-white leading-none">{fullname.split(' ')[0]}</div>
              <div className="text-[10px] mt-0.5" style={{ color: '#374151' }}>{user?.email || ''}</div>
            </div>

            
            <svg className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200" style={{ color: '#4b5563', transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl py-1.5 z-50 shadow-2xl"
              style={{ background: '#080c12', border: '1px solid rgba(255,255,255,0.08)' }}>

              
              <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-3 mb-2">
                  {profilePic ? (
                    <img src={profilePic} alt={fullname} className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-black flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #00e5ff, #7c3aed)' }}>
                      {initials}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{fullname}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {provider === 'github' && (
                        <span className="text-[10px]" style={{ color: '#4b5563' }}>via GitHub</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              
              <div className="py-1">
                {[
                  { to: '/',        label: 'Dashboard' },
                  { to: '/profile', label: 'Profile' },
                ].map(item => (
                  <Link key={item.to} to={item.to} onClick={() => setProfileOpen(false)}
                    className="flex items-center px-4 py-2 text-sm transition-colors"
                    style={{ color: '#6b7280' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.background = 'transparent' }}>
                    {item.label}
                  </Link>
                ))}
              </div>

              
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '4px' }}>
                <button onClick={logout}
                  className="w-full text-left px-4 py-2 text-sm transition-colors"
                  style={{ color: '#6b7280' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.06)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.background = 'transparent' }}>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}