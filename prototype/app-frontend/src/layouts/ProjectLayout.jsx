import { Outlet } from 'react-router-dom'
import ProjectSidebar from '../components/ProjectSidebar'
import TopNavbar from '../components/TopNavbar'
import { SidebarProvider } from '../components/SidebarContext'

export default function ProjectLayout() {
  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen bg-[#050810] text-white">
        {/* Top navbar spans full width */}
        <TopNavbar />

        {/* Below navbar: sidebar + page content */}
        <div className="flex flex-1 pt-16">
          <ProjectSidebar />

          {/* Page content — offset for project sidebar */}
          <main className="flex-1 md:ml-64 min-w-0 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}