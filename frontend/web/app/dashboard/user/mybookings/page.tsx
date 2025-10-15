"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Sidebar from "@/app/dashboard/user/Sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiFetch } from "@/lib/api"
import { useRouter } from "next/navigation"

interface BookingItem {
  id: number
  bookingId: string
  startDate: string
  endDate: string
  kilometers: number
  withDriver: boolean
  totalPrice: number
  status: string
  paymentStatus: string
  vehicleType: string
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([])
  const [error, setError] = useState("")
  const [cancelId, setCancelId] = useState<number | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loadingCancel, setLoadingCancel] = useState(false)
  const router = useRouter()

  const loadBookings = async () => {
    try {
      const data = await apiFetch<BookingItem[]>("/api/Booking")
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
      await apiFetch(`/api/Booking/${cancelId}/cancel`, { method: "PUT" })
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold">My Bookings</h1>
        </div>
        {error && <p className="text-red-500 mb-3">{error}</p>}
        <div className="grid gap-4">
          {bookings.filter(b => 
            b.status !== "Cancelled" && 
            b.status !== "Completed"
            // Show PaidOnline bookings temporarily so user can see "Done" status
          ).map(b => (
            <Card key={b.id}>
              <CardHeader>
                <CardTitle>#{b.bookingId} • {b.vehicleType}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <p>Dates: {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}</p>
                <p>Kilometers: {b.kilometers}</p>
                <p>Total: LKR {b.totalPrice.toLocaleString()}</p>
                <p>Status: <span className={`px-2 py-1 rounded text-xs font-medium ${
                  (b.status === 'Confirmed' || b.status === 'Confirmed pending payment') ? 'bg-green-100 text-green-800' :
                  b.status === 'have to ride' ? 'bg-blue-100 text-blue-800' :
                  b.status === 'In the ride' ? 'bg-orange-100 text-orange-800' :
                  b.status === 'Completed the ride' ? 'bg-green-100 text-green-800' :
                  b.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>{b.status}</span></p>
                <p>Payment: <span className={`px-2 py-1 rounded text-xs font-medium ${
                  b.paymentStatus === 'PaidOnline' ? 'bg-green-100 text-green-800' :
                  b.paymentStatus === 'PayAtPickup' ? 'bg-orange-100 text-orange-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>{b.paymentStatus === 'PayAtPickup' ? 'Paid via Slip' : b.paymentStatus === 'PaidOnline' ? 'Done ✅' : b.paymentStatus}</span></p>
                <p>Driver: {b.withDriver ? 'Included' : 'Not Required'}</p>
                {b.paymentStatus === 'PaidOnline' && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm text-green-600">
                      <strong>✅ Payment Successful!</strong> Your booking is confirmed. This will move to Booking History shortly.
                    </p>
                  </div>
                )}
                <div className="flex gap-2">
                  {['Pending','Confirmed','Confirmed pending payment'].includes(b.status) && b.paymentStatus !== 'PaidOnline' && (
                    <Button variant="destructive" size="sm" onClick={() => handleCancelClick(b.id)} disabled={loadingCancel}>
                      Cancel Booking
                    </Button>
                  )}
                  {b.paymentStatus === 'Pending' && (
                    <Button size="sm" onClick={() => router.push(`/dashboard/user/payment?bookingId=${encodeURIComponent(b.bookingId)}`)}>
                      Pay Now
                    </Button>
                  )}
                </div>

                {/* View in History Link - Right aligned without box */}
                {b.paymentStatus === 'PaidOnline' && (
                  <div className="mt-4 flex justify-end">
                    <button 
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer"
                      onClick={() => router.push("/dashboard/user/booking-history")}
                    >
                      📋 View in History →
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {bookings.filter(b => 
            b.status !== "Cancelled" && 
            b.status !== "Completed"
            // Show all active bookings including temporarily paid ones
          ).length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground mb-4">No active bookings found.</p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => router.push("/dashboard/user/booking")}>
                    Make New Booking
                  </Button>
                  <Button variant="outline" onClick={() => router.push("/dashboard/user/booking-history")}>
                    View History
                  </Button>
                </div>
              </CardContent>
            </Card>
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





