import { Outlet } from 'react-router-dom'
import ProjectSidebar from '../components/ProjectSidebar'
import TopNavbar from '../components/TopNavbar'
import { SidebarProvider } from '../components/SidebarContext'

export default function ProjectLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-[#050810] text-white">
        <ProjectSidebar />
        <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
          <TopNavbar />
          <main className="flex-1 pt-16 p-6" style={{ background: '#050810' }}>
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}