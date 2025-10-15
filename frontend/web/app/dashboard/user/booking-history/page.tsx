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
  paidAmount?: number
}

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([])
  const [error, setError] = useState("")
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loadingDelete, setLoadingDelete] = useState(false)
  const router = useRouter()

  const loadBookings = async () => {
    try {
      const data = await apiFetch<BookingItem[]>("/api/Booking")
      // Filter only bookings that were paid online through PayPal
      const onlinePaidBookings = data.filter(b => 
        b.paymentStatus === 'PaidOnline'  // Only show PayPal paid bookings
      )
      setBookings(onlinePaidBookings)
    } catch (e: any) {
      setError(e?.message || "Failed to load booking history")
    }
  }

  useEffect(() => {
    loadBookings()
  }, [])

  const handleDeleteClick = (bookingId: number) => {
    setDeleteId(bookingId)
    setConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteId) return
    
    setLoadingDelete(true)
    try {
      await apiFetch(`/api/Booking/${deleteId}`, {
        method: "DELETE",
      })
      
      // Remove the booking from local state
      setBookings(prev => prev.filter(b => b.id !== deleteId))
      setConfirmOpen(false)
      setDeleteId(null)
    } catch (e: any) {
      setError(e?.message || "Failed to delete booking")
    } finally {
      setLoadingDelete(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'Cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'PaidOnline':
        return 'bg-green-100 text-green-800'
      case 'PayAtPickup':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole="user" userName="Customer" />
      <div className="flex-1 md:ml-64 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Booking History</h1>
        </div>
        
        {error && <p className="text-red-500 mb-3">{error}</p>}
        
        <div className="grid gap-4">
          {bookings.map(b => (
            <Card key={b.id} className="relative">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>#{b.bookingId} • {b.vehicleType}</span>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(b.status)}`}>
                      {b.status}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPaymentStatusColor(b.paymentStatus)}`}>
                      {b.paymentStatus === 'PayAtPickup' ? 'Paid via Slip' : 
                       b.paymentStatus === 'PaidOnline' ? 'Paid Online (PayPal)' : b.paymentStatus}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Booking Period</p>
                    <p className="font-medium">
                      {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">
                      {Math.ceil((new Date(b.endDate).getTime() - new Date(b.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Distance</p>
                    <p className="font-medium">{b.kilometers} km</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Driver</p>
                    <p className="font-medium">{b.withDriver ? 'Included' : 'Self Drive'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="font-medium text-lg">LKR {b.totalPrice.toLocaleString()}</p>
                  </div>
                  {b.paidAmount && (
                    <div>
                      <p className="text-sm text-muted-foreground">Paid Amount</p>
                      <p className="font-medium text-green-600">LKR {b.paidAmount.toLocaleString()}</p>
                    </div>
                  )}
                </div>
                
                {b.status === 'Cancelled' && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-600">
                      <strong>Cancelled:</strong> This booking was cancelled. 
                      {b.paymentStatus === 'Paid' && ' Refund will be processed within 5-7 business days.'}
                    </p>
                  </div>
                )}
                
                {b.status === 'Completed' && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm text-green-600">
                      <strong>Completed:</strong> Thank you for choosing our service! 
                      We hope you had a great experience.
                    </p>
                  </div>
                )}

                {/* Delete Button */}
                <div className="mt-4 flex justify-end">
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDeleteClick(b.id)}
                    disabled={loadingDelete}
                  >
                    🗑️ Delete from History
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {bookings.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No booking history found.</p>
                <Button 
                  className="mt-4" 
                  onClick={() => router.push("/dashboard/user/booking")}
                >
                  Make Your First Booking
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Confirmation Modal */}
        {confirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md mx-4 animate-fade-in">
              <h2 className="text-xl font-bold mb-2 text-center">Delete Booking History?</h2>
              <p className="mb-4 text-center text-muted-foreground">
                Are you sure you want to permanently delete this booking from your history? This action cannot be undone.
              </p>
              <div className="flex gap-4 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => { setConfirmOpen(false); setDeleteId(null); }} 
                  disabled={loadingDelete}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteConfirm} 
                  disabled={loadingDelete}
                >
                  {loadingDelete ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
