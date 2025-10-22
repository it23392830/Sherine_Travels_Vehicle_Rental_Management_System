"use client"

import Sidebar from "@/app/dashboard/manager/Sidebar"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState("Manager")
  const [userName, setUserName] = useState("Manager")
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("sherine_auth_token")
    if (!token) {
      router.push("/login")
      return
    }
    
    // Decode token to get user info (basic implementation)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const roles = payload.role || payload.roles || []
      const userRoles = Array.isArray(roles) ? roles : [roles]
      
      // Set role based on priority: Owner > Manager > User > Driver
      if (userRoles.includes("Owner")) {
        setUserRole("Owner")
      } else if (userRoles.includes("Manager")) {
        setUserRole("Manager")
      } else if (userRoles.includes("User")) {
        setUserRole("User")
      } else if (userRoles.includes("Driver")) {
        setUserRole("Driver")
      } else {
        setUserRole("Manager") // Default fallback
      }
      
      setUserName(payload.name || payload.FullName || "User")
      setIsAuthenticated(true)
    } catch (error) {
      console.error("Invalid token:", error)
      localStorage.removeItem("sherine_auth_token")
      router.push("/login")
    }
  }, [router])

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 bg-white">
        <Sidebar userRole={userRole} userName={userName} />
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  )
}
