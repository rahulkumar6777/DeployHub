import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import TopNavbar from '../components/TopNavbar'
import { SidebarProvider } from '../components/SidebarContext'

export default function PrivateLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-[#050810] text-white">
        {/* Left sidebar */}
        <Sidebar />

        {/* Main content — offset for sidebar */}
        <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
          <TopNavbar />
          {/* Page content below topnav */}
          <main className="flex-1 pt-16 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}