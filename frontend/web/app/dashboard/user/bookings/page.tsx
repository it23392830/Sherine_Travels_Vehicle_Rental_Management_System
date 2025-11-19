"use client"

import Sidebar from "@/app/dashboard/user/Sidebar"
import BookingManagement from "@/components/dashboard/BookingManagement"

export default function UserBookingsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole="user" userName="Customer Alice" />
      
      <div className="flex-1 md:ml-64">
        <div className="p-6">
          <BookingManagement />
        </div>
      </div>
    </div>
  )
}
