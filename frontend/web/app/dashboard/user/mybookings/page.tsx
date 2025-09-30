"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Sidebar from "@/app/dashboard/user/Sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiFetch } from "@/lib/api"

interface BookingItem {
  id: number
  bookingId: string
  startDate: string
  endDate: string
  kilometers: number
  withDriver: boolean
  totalPrice: number
  status: string
  vehicleType: string
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([])
  const [error, setError] = useState("")
  const [cancelId, setCancelId] = useState<number | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loadingCancel, setLoadingCancel] = useState(false)

  const loadBookings = async () => {
    try {
      const data = await apiFetch<BookingItem[]>("/booking")
      setBookings(data)
    } catch (e: any) {
      setError(e?.message || "Failed to load bookings")
    }
  }
  useEffect(() => {
    loadBookings()
  }, [])

  const handleCancelClick = (id: number) => {
    setCancelId(id)
    setConfirmOpen(true)
  }

  const handleConfirmCancel = async () => {
    if (!cancelId) return
    setLoadingCancel(true)
    setError("")
    try {
      await apiFetch(`/booking/${cancelId}/cancel`, { method: "PUT" })
      setConfirmOpen(false)
      setCancelId(null)
      await loadBookings()
    } catch (e: any) {
      setError(e?.message || "Failed to cancel booking")
    } finally {
      setLoadingCancel(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole="user" userName="Customer" />
      <div className="flex-1 md:ml-64 p-6">
        <h1 className="text-2xl font-bold mb-6">My Bookings</h1>
        {error && <p className="text-red-500 mb-3">{error}</p>}
        <div className="grid gap-4">
          {bookings.filter(b => b.status !== "Cancelled").map(b => (
            <Card key={b.id}>
              <CardHeader>
                <CardTitle>#{b.bookingId} • {b.vehicleType}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <p>Dates: {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}</p>
                <p>Kilometers: {b.kilometers}</p>
                <p>Total: LKR {b.totalPrice}</p>
                <p>Status: {b.status}</p>
                <p>Driver: Pending</p>
                {['Pending','Confirmed'].includes(b.status) && (
                  <Button variant="destructive" size="sm" onClick={() => handleCancelClick(b.id)} disabled={loadingCancel}>
                    Cancel Booking
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
          {bookings.length === 0 && (
            <Card><CardContent className="p-6">No upcoming bookings.</CardContent></Card>
          )}
        </div>
        {/* Confirmation Modal */}
        {confirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md mx-4 animate-fade-in">
              <h2 className="text-xl font-bold mb-2 text-center">Cancel Booking?</h2>
              <p className="mb-4 text-center text-muted-foreground">Are you sure you want to cancel this booking?</p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => { setConfirmOpen(false); setCancelId(null); }} disabled={loadingCancel}>No</Button>
                <Button variant="destructive" onClick={handleConfirmCancel} disabled={loadingCancel}>Yes, Cancel</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}





