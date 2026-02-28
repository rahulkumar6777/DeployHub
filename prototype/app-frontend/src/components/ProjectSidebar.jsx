import { useEffect } from 'react'
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom'
import { useSidebar } from './SidebarContext'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'

// ── Icons ────────────────────────────────────────────────
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
const FilesIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
const KeyIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
)

// ── NavItem ───────────────────────────────────────────────
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

// ── Skeleton ──────────────────────────────────────────────
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

// ── ProjectSidebar ────────────────────────────────────────
export default function ProjectSidebar() {
  const { id: projectId } = useParams()
  const navigate = useNavigate()
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar()
  const location = useLocation()
  const { projects, loading: bootstrapLoading } = useSelector((state) => state.bootstrap)
  const project = projects?.find((p) => p.id === projectId)
  const projectName = project?.name || 'Project'

  useEffect(() => {
    if (!bootstrapLoading && projects?.length > 0 && !project) {
      toast.error("Project not found or you don't have access.")
      navigate('/')
    }
  }, [project, projects, bootstrapLoading, navigate])

  const isActive = (path) => location.pathname === path
  const close = () => setIsSidebarOpen(false)

  // Project nav links
  const projectLinks = [
    { to: `/project/${projectId}`,          label: 'Getting Started', icon: <HomeIcon /> },
    { to: `/project/${projectId}/files`,     label: 'Files',           icon: <FilesIcon /> },
    { to: `/project/${projectId}/analytics`, label: 'Analytics',       icon: <AnalyticsIcon /> },
    { to: `/project/${projectId}/settings`,  label: 'Settings',        icon: <SettingsIcon /> },
    { to: `/project/${projectId}/apikeys`,   label: 'API Keys',        icon: <KeyIcon /> },
  ]

  if (bootstrapLoading) return <SidebarSkeleton isSidebarOpen={isSidebarOpen} />

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-10 md:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar panel */}
      <div
        className={`fixed top-16 left-0 w-64 min-h-[calc(100vh-4rem)] z-20 flex flex-col
          bg-[#0d1117] border-r border-white/5
          transform transition-transform duration-300
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        {/* Project name header */}
        <div className="px-5 py-4 border-b border-white/5">
          {/* Project pill */}
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

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-semibold text-gray-600 tracking-widest uppercase px-3 mb-2">
            Project
          </div>
          {projectLinks.map(link => (
            <NavItem
              key={link.to}
              to={link.to}
              label={link.label}
              icon={link.icon}
              active={isActive(link.to)}
              onClick={close}
              state={{ projectName }}
            />
          ))}
        </nav>

        {/* Back to workspace */}
        <div className="px-3 py-4 border-t border-white/5">
          <Link
            to="/"
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