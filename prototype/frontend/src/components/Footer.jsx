import { Link } from 'react-router-dom'

const LINKS = [
  { to: '/',          label: 'Home' },
  { to: '/about',     label: 'About' },
  { to: '/pricing',   label: 'Pricing' },
  { to: '/developer', label: 'Developer' },
]

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-10 px-6 mt-10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">

        {/* Logo */}
        <div className="font-syne font-black text-lg">
          Deploy<span className="text-[#00e5ff]">Hub</span>
        </div>

        {/* Links */}
        <div className="flex gap-6 text-sm text-gray-500">
          {LINKS.map(l => (
            <Link key={l.to} to={l.to} className="hover:text-white transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

        {/* Copyright */}
        <div className="text-xs text-gray-600">
          © 2026 DeployHub · Built with <span className="text-[#00e5ff]">♥</span>
        </div>
      </div>
    </footer>
  )
}