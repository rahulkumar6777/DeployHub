import { useState, useEffect } from 'react'
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom'
import { useSidebar } from './SidebarContext'
import { api } from '../api/apiclient' 


const BackIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
)
const HomeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)
const AnalyticsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)
const SettingsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)
const LogsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
      d="M9 12h6m-6 4h6M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" />
  </svg>
)
const BuildsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
)
const DomainIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
)
const BillingIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
)


function NavItem({ to, label, icon, active, onClick, state }) {
  return (
    <Link
      to={to}
      state={state}
      onClick={onClick}
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/20'
          : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
      }`}
    >
      <span className={`flex-shrink-0 transition-colors ${active ? 'text-[#00e5ff]' : 'text-gray-500 group-hover:text-white'}`}>
        {icon}
      </span>
      {label}
      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00e5ff]" />}
    </Link>
  )
}


function SidebarSkeleton({ isSidebarOpen }) {
  return (
    <div
      className={`fixed top-16 left-0 w-64 min-h-[calc(100vh-4rem)] z-20
        bg-[#0d1117] border-r border-white/5 flex flex-col
        transform transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
    >
      <div className="px-5 py-5 border-b border-white/5">
        <div className="h-5 w-32 bg-white/5 rounded-lg animate-pulse" />
        <div className="h-3 w-20 bg-white/5 rounded mt-2 animate-pulse" />
      </div>
      <div className="px-3 py-4 space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/3 animate-pulse">
            <div className="w-4 h-4 rounded bg-white/5" />
            <div className="h-3 w-24 bg-white/5 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}


export default function ProjectSidebar() {
  const { id: projectId } = useParams()
  const navigate = useNavigate()
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar()
  const location = useLocation()
  const [projectName, setProjectName]     = useState(location.state?.projectName || '')
  const [plan, setPlan]                   = useState(null)
  const [bootstrapLoading, setBootstrap]  = useState(!location.state?.projectName)

  useEffect(() => {
    if (!projectId) return
    api.get(`/projects/${projectId}/meta`)
      .then(res => {
        setProjectName(res.data?.name || 'Project')
        setPlan(res.data?.plan || null)
      })
      .catch(() => navigate('/projects'))
      .finally(() => setBootstrap(false))
  }, [projectId])

  const isActive = (path) => location.pathname === path
  const close = () => setIsSidebarOpen(false)

  
  const navGroups = [
    {
      label: 'Project',
      links: [
        { to: `/project/${projectId}`,           label: 'Overview',  icon: <HomeIcon />     },
        { to: `/project/${projectId}/logs`,       label: 'Logs',      icon: <LogsIcon />     },
        { to: `/project/${projectId}/builds`,     label: 'Builds',    icon: <BuildsIcon />   },
        { to: `/project/${projectId}/metrics`,    label: 'Metrics',   icon: <AnalyticsIcon />},
      ],
    },
    {
      label: 'Configuration',
      links: [
        { to: `/project/${projectId}/settings`,   label: 'Settings',  icon: <SettingsIcon /> },
        { to: `/project/${projectId}/domains`,    label: 'Domains',   icon: <DomainIcon />, proBadge: plan === 'pro' },
      ],
    },
    {
      label: 'Account',
      links: [
        { to: `/project/${projectId}/billing`,    label: 'Billing',   icon: <BillingIcon />  },
      ],
    },
  ]

  if (bootstrapLoading) return <SidebarSkeleton isSidebarOpen={isSidebarOpen} />

  return (
    <>
      
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-10 md:hidden"
          onClick={close}
        />
      )}

      
      <div
        className={`fixed top-16 left-0 w-64 min-h-[calc(100vh-4rem)] z-20 flex flex-col
          bg-[#0d1117] border-r border-white/5
          transform transition-transform duration-300
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        
        <div className="px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00e5ff]/20 to-[#7c3aed]/20 border border-[#00e5ff]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-[#00e5ff] text-xs font-black font-syne">
                {projectName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate font-syne">{projectName}</div>
              <div className="text-[10px] text-gray-500 tracking-wide">Active Project</div>
            </div>
          </div>
        </div>

        
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-4">
          {navGroups.map(group => (
            <div key={group.label}>
              <div className="text-[10px] font-semibold text-gray-600 tracking-widest uppercase px-3 mb-1">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.links.map(link => (
                  <div key={link.to} className="relative">
                    <NavItem
                      to={link.to}
                      label={link.label}
                      icon={link.icon}
                      active={isActive(link.to)}
                      onClick={close}
                      state={{ projectName }}
                    />
                    {link.proBadge && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black px-1.5 py-0.5 rounded-md pointer-events-none"
                        style={{ background: 'rgba(0,229,255,0.1)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.2)' }}>
                        PRO
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/5">
          <Link
            to="/projects"
            onClick={close}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-white hover:bg-white/5 border border-transparent transition-all duration-200"
          >
            <BackIcon />
            Back to Workspace
          </Link>
        </div>
      </div>
    </>
  )
}