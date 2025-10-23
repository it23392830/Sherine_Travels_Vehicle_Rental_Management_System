"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const navItems = [
    { name: "Manager Dashboard", href: "/dashboard/manager" },
    { name: "Add Vehicle", href: "/dashboard/manager/addvehicle" },
    { name: "Registered Drivers", href: "/dashboard/manager/drivers" },
    { name: "Bookings", href: "/dashboard/manager/bookings" },
    { name: "Settings", href: "/dashboard/manager/settings" },
  ]

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-900 border-r dark:border-gray-700 shadow-sm p-5 flex flex-col justify-between text-gray-900 dark:text-gray-100">
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-green-800">Sherine Travels</h2>
            <ThemeToggle />
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-md transition ${
                  pathname === item.href
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-semibold"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer section */}
        <div className="text-sm mt-6 border-t dark:border-gray-700 pt-4">
          <p className="font-medium">Manager</p>
          <Link href="/logout" className="text-red-600 hover:underline">
            Logout
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-8 overflow-y-auto">{children}</main>
    </div>
  )
}
