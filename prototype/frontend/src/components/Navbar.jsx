import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/',          label: 'Home' },
  { to: '/about',     label: 'About' },
  { to: '/pricing',   label: 'Pricing' },
  { to: '/developer', label: 'Developer' },
]


const DASHBOARD_URL = 'http://localhost:5173'

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [location])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'backdrop-blur-2xl bg-[#050810]/80 border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="font-syne font-black text-xl tracking-tight">
          Deploy<span className="text-[#00e5ff]">Hub</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors duration-200 ${
                  isActive ? 'text-[#00e5ff]' : 'text-gray-400 hover:text-white'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Desktop CTA — Dashboard button */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href={DASHBOARD_URL}
            className="bg-[#00e5ff] text-black text-sm font-bold px-5 py-2 rounded-lg
                       hover:bg-cyan-300 transition-all duration-200
                       hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/20"
          >
            Dashboard
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(prev => !prev)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Toggle menu"
        >
          <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0d1117] border-b border-white/5 px-6 py-4 flex flex-col gap-4">
          {NAV_LINKS.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `text-sm font-medium py-2 ${isActive ? 'text-[#00e5ff]' : 'text-gray-400'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <a
            href={DASHBOARD_URL}
            className="bg-[#00e5ff] text-black text-sm font-bold px-5 py-2.5 rounded-lg text-center mt-2"
          >
            Dashboard
          </a>
        </div>
      )}
    </nav>
  )
}