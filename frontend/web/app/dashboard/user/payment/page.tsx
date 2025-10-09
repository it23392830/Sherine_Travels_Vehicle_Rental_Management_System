"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Sidebar from "@/app/dashboard/user/Sidebar"
import { apiFetch } from "@/lib/api"
import Script from "next/script"

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
  const [sdkReady, setSdkReady] = useState(false)

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

  const handlePayPalButtons = () => {
    if (!(window as any).paypal || !booking) return
    const paypal = (window as any).paypal
    const containerId = `paypal-buttons-${booking.id}`
    const container = document.getElementById(containerId)
    if (!container) return
    container.innerHTML = ""

    const fundingSources = [
      paypal.FUNDING.IDEAL,
      paypal.FUNDING.BANCONTACT,
      paypal.FUNDING.BLIK,
      paypal.FUNDING.EPS,
      paypal.FUNDING.P24,
      paypal.FUNDING.SOFORT,
      paypal.FUNDING.MYBANK,
      paypal.FUNDING.SEPA,
      paypal.FUNDING.PAYPAL, // wallet fallback
    ]

    fundingSources.forEach((source: any) => {
      if (!paypal.isFundingEligible || !paypal.isFundingEligible(source)) return
      const btn = paypal.Buttons({
        fundingSource: source,
        createOrder: async () => {
          const { orderId } = await apiFetch<{ orderId: string }>(`/booking/${booking.id}/paypal/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: booking.totalPrice - 0, currency: "PHP" }),
          })
          return orderId
        },
        onApprove: async (data: any) => {
          try {
            await apiFetch(`/booking/${booking.id}/paypal/capture?orderId=${data.orderID}`, { method: "POST" })
            router.push(`/dashboard/user/payment-success?bookingId=${encodeURIComponent(booking.bookingId)}`)
          } catch (e: any) {
            setError(e?.message || "Failed to capture payment")
          }
        },
        onError: (err: any) => {
          setError(err?.message || "PayPal error")
        },
      })
      if (btn.isEligible()) {
        btn.render(`#${containerId}`)
      }
    })
  }

  useEffect(() => {
    if (sdkReady && booking) {
      handlePayPalButtons()
    }
  }, [sdkReady, booking])

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
                  <h3 className="font-semibold mb-2">PayPal</h3>
                  <p className="text-sm text-muted-foreground mb-4">Checkout with Visa/Master via PayPal Sandbox</p>
                  <div id={`paypal-buttons-${booking.id}`} />
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
                </div>
              </div>
            </CardContent>
          </Card>
          <Script
            src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=PHP&intent=capture&enable-funding=ideal,bancontact,blik,eps,p24,sofort,mybank,sepa&disable-funding=card`}
            strategy="afterInteractive"
            onLoad={() => setSdkReady(true)}
          />
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

