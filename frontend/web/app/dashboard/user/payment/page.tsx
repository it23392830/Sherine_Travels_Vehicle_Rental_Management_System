"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Sidebar from "@/app/dashboard/user/Sidebar"
import { apiFetch } from "@/lib/api"

interface BookingDetails {
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

function PaymentContent() {
  const params = useSearchParams()
  const router = useRouter()
  const bookingId = params.get("bookingId")
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (!bookingId) {
      setError("No booking ID provided")
      setLoading(false)
      return
    }

    const fetchBooking = async () => {
      try {
        const bookings = await apiFetch<BookingDetails[]>("/booking")
        const foundBooking = bookings.find(b => b.bookingId === bookingId)
        if (foundBooking) {
          setBooking(foundBooking)
        } else {
          setError("Booking not found")
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load booking details")
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId])

  const handlePayment = async () => {
    if (!booking) return
    
    setProcessing(true)
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mark booking as paid in backend
      await apiFetch(`/booking/${booking.id}/pay`, { method: "PUT" })

      alert("Payment processed successfully! You will receive a confirmation email shortly.")
      router.push("/dashboard/user/mybookings")
    } catch (err) {
      setError("Payment failed. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar userRole="user" userName="Customer" />
        <div className="flex-1 md:ml-64 p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-6">Loading Payment Details...</h1>
          </div>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar userRole="user" userName="Customer" />
        <div className="flex-1 md:ml-64 p-6">
          <h1 className="text-2xl font-bold mb-6">Payment</h1>
          <Card className="p-6 max-w-xl">
            <p className="text-red-500 mb-4">{error || "Booking not found"}</p>
            <Button onClick={() => router.push("/dashboard/user")}>Back to Dashboard</Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole="user" userName="Customer" />
      <div className="flex-1 md:ml-64 p-6">
        <h1 className="text-2xl font-bold mb-6">Payment</h1>
        <div className="max-w-2xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Booking ID:</span>
                <span className="font-medium">#{booking.bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vehicle:</span>
                <span className="font-medium">{booking.vehicleType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dates:</span>
                <span className="font-medium">
                  {new Date(booking.startDate).toLocaleDateString()} → {new Date(booking.endDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kilometers:</span>
                <span className="font-medium">{booking.kilometers} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Driver:</span>
                <span className="font-medium">{booking.withDriver ? 'Included' : 'Not Required'}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Amount:</span>
                <span className="text-green-600">LKR {booking.totalPrice.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Credit/Debit Card</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Secure payment processing powered by our payment gateway
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Card Number</label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="w-full border rounded p-2"
                        disabled
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full border rounded p-2"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">CVV</label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full border rounded p-2"
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/dashboard/user/mybookings")}
                    disabled={processing}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePayment}
                    disabled={processing}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {processing ? "Processing..." : `Pay LKR ${booking.totalPrice.toLocaleString()}`}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  This is a demo payment interface. In production, this would integrate with a real payment gateway.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <PaymentContent />
    </Suspense>
  )
}

