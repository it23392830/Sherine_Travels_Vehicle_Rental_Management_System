 "use client"

import { Home, MapPin, ClipboardList, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/ui/theme-toggle"

interface SidebarProps {
  userRole: string
  userName: string
}

export default function Sidebar({ userRole, userName }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-card border-r">
      <div className="flex flex-col h-full">
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-primary">Sherine Travels</h1>
              <p className="text-sm text-muted-foreground">{userRole}</p>
            </div>
            <ThemeToggle />
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link href="/dashboard/driver" className="flex items-center px-3 py-2 rounded-lg hover:bg-muted transition">
            <Home className="h-4 w-4 mr-2" />
            Driver Dashboard
          </Link>
          <Link href="/dashboard/driver/history" className="flex items-center px-3 py-2 rounded-lg hover:bg-muted transition">
            <ClipboardList className="h-4 w-4 mr-2" />
            Rides History
          </Link>
          <Link href="/dashboard/driver/assignedrides" className="flex items-center px-3 py-2 rounded-lg hover:bg-muted transition">
            <MapPin className="h-4 w-4 mr-2" />
            Assigned Rides
          </Link>
          <Link href="/dashboard/driver/settings" className="flex items-center px-3 py-2 rounded-lg hover:bg-muted transition">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Link>
        </nav>

        <div className="p-4 border-t">
          <p className="text-sm font-medium">{userName}</p>
          <button className="flex items-center text-sm text-muted-foreground hover:text-primary mt-2">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  )
}
