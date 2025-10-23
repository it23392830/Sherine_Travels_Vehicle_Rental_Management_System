"use client"

import { Home, Car, Users, Settings, LogOut, ClipboardList } from "lucide-react"
import Link from "next/link"

interface SidebarProps {
  userRole: string
  userName: string
}

export default function Sidebar({ userRole, userName }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-card border-r">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <h1 className="text-xl font-bold text-primary">Sherine Travels</h1>
          <p className="text-sm text-muted-foreground">{userRole}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link
            href="/dashboard/manager"
            className="flex items-center px-3 py-2 rounded-lg hover:bg-muted transition"
          >
            <Home className="h-4 w-4 mr-2" />
            Manager Dashboard
          </Link>

          <Link
            href="/dashboard/manager/addvehicle"
            className="flex items-center px-3 py-2 rounded-lg hover:bg-muted transition"
          >
            <Car className="h-4 w-4 mr-2" />
            Add Vehicle
          </Link>

          <Link
            href="/dashboard/manager/registereddrivers"
            className="flex items-center px-3 py-2 rounded-lg hover:bg-muted transition"
          >
            <Users className="h-4 w-4 mr-2" />
            Registered Drivers
          </Link>

          <Link
            href="/dashboard/manager/bookings"
            className="flex items-center px-3 py-2 rounded-lg hover:bg-muted transition"
          >
            <ClipboardList className="h-4 w-4 mr-2" />
            Bookings
          </Link>

          <Link
            href="/dashboard/manager/settings"
            className="flex items-center px-3 py-2 rounded-lg hover:bg-muted transition"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Link>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t">
          <p className="text-sm font-medium">{userName}</p>
          <Link
            href="/logout"
            className="flex items-center text-sm text-red-600 hover:text-red-700 mt-2 transition"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Link>
        </div>
      </div>
    </aside>
  )
}
