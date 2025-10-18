"use client"

import { Home, Car, Users, Settings, LogOut, DollarSign, FileBarChart } from "lucide-react"
import Link from "next/link"
import { AuthService } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

interface SidebarProps {
  userRole: string
  userName: string
}

export default function Sidebar({ userRole, userName }: SidebarProps) {
  const router = useRouter()
  const [currentUserName, setCurrentUserName] = useState(userName)
  const [isClient, setIsClient] = useState(false)

  // Set client-side flag to avoid SSR hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load user name from localStorage and listen for updates
  useEffect(() => {
    if (!isClient) return

    const loadUserName = () => {
      if (typeof window !== "undefined") {
        const raw = window.localStorage.getItem("sherine_auth_user")
        if (raw) {
          try {
            const user = JSON.parse(raw)
            setCurrentUserName(user.fullName || userName)
          } catch {
            setCurrentUserName(userName)
          }
        }
      }
    }

    // Load initially
    loadUserName()

    // Listen for storage changes (when profile is updated)
    const handleStorageChange = () => {
      loadUserName()
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for custom event when profile is updated in same tab
    window.addEventListener('userProfileUpdated', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('userProfileUpdated', handleStorageChange)
    }
  }, [userName, isClient])

  const handleLogout = () => {
    AuthService.logout()
    router.push("/")
  }
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-card border-r">
      <div className="flex flex-col h-full">
        {/* Logo & Header */}
        <div className="px-6 py-4 border-b">
          <h1 className="text-xl font-bold text-primary">Sherine Travels</h1>
          <p className="text-sm text-muted-foreground">{userRole}</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link href="/dashboard/owner" className="flex items-center px-3 py-2 rounded-lg hover:bg-muted transition">
            <Home className="h-4 w-4 mr-2" />
            Owner Dashboard
          </Link>
          <Link href="/dashboard/owner/reports" className="flex items-center px-3 py-2 rounded-lg hover:bg-muted transition">
            <FileBarChart className="h-4 w-4 mr-2" />
            Reports
          </Link>
          <Link href="/dashboard/owner/managefleet" className="flex items-center px-3 py-2 rounded-lg hover:bg-muted transition">
            <Car className="h-4 w-4 mr-2" />
            Manage Fleet
          </Link>
          <Link href="/dashboard/owner/managedrivers" className="flex items-center px-3 py-2 rounded-lg hover:bg-muted transition">
            <Users className="h-4 w-4 mr-2" />
            Manage Drivers
          </Link>
          <Link href="/dashboard/owner/settings" className="flex items-center px-3 py-2 rounded-lg hover:bg-muted transition">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Link>
        </nav>

        {/* Footer User Info */}
        <div className="p-4 border-t">
          <p className="text-sm font-medium">{currentUserName}</p>
          <button
            onClick={handleLogout}
            className="flex items-center text-sm text-muted-foreground hover:text-primary mt-2"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  )
}
