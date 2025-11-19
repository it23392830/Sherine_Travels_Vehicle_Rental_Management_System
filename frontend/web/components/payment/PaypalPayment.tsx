"use client"

import { useState } from "react"
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Loader2 } from "lucide-react"
import { createPayPalOrder, capturePayPalOrder, BookingResponse } from "@/lib/api"
import { toast } from "sonner"

interface PayPalPaymentProps {
  booking: BookingResponse
  onPaymentSuccessAction: () => void
  onPaymentErrorAction: (error: string) => void
}

export default function PayPalPayment({ booking, onPaymentSuccessAction, onPaymentErrorAction }: PayPalPaymentProps) {
  const [loading, setLoading] = useState(false)
  const [showPayPal, setShowPayPal] = useState(false)

  const paypalOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
    currency: "PHP",
    intent: "capture"
  }

  const handleCreateOrder = async () => {
    try {
      setLoading(true)
      const { orderId } = await createPayPalOrder(booking.id, booking.balanceDue)
      return orderId
    } catch (error: any) {
      onPaymentErrorAction(error.message || "Failed to create PayPal order")
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (data: any) => {
    try {
      setLoading(true)
      await capturePayPalOrder(booking.id, data.orderID)
      toast.success("Payment completed successfully!")
      onPaymentSuccessAction()
    } catch (error: any) {
      onPaymentErrorAction(error.message || "Payment capture failed")
    } finally {
      setLoading(false)
    }
  }

  const handleError = (error: any) => {
    console.error("PayPal error:", error)
    onPaymentErrorAction("PayPal payment failed")
  }

  if (!showPayPal) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Required
          </CardTitle>
          <CardDescription>
            Complete your booking payment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Booking ID:</span>
              <span className="text-sm font-medium">{booking.bookingId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Vehicle:</span>
              <span className="text-sm font-medium">{booking.vehicleType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Amount:</span>
              <span className="text-sm font-medium">LKR {booking.totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Paid Amount:</span>
              <span className="text-sm font-medium">LKR {booking.paidAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium">Balance Due:</span>
              <span className="font-bold text-red-600">LKR {booking.balanceDue.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Badge className={
              booking.paymentStatus === "Paid" ? "bg-green-600" :
              booking.paymentStatus === "Pending" ? "bg-yellow-600" :
              booking.paymentStatus === "PayAtPickup" ? "bg-orange-600" : "bg-gray-600"
            }>
              {booking.paymentStatus === "PayAtPickup" ? "Pay at Pickup" : booking.paymentStatus}
            </Badge>
          </div>

          {booking.balanceDue > 0 && (
            <div className="space-y-2">
              <Button 
                onClick={() => setShowPayPal(true)}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay with PayPal
                  </>
                )}
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                Secure payment powered by PayPal
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Complete Payment</CardTitle>
        <CardDescription>
          Pay LKR {booking.balanceDue.toFixed(2)} for booking {booking.bookingId}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PayPalScriptProvider options={paypalOptions}>
          <PayPalButtons
            createOrder={handleCreateOrder}
            onApprove={handleApprove}
            onError={handleError}
            disabled={loading}
            style={{
              layout: "vertical",
              color: "blue",
              shape: "rect",
              label: "paypal"
            }}
          />
        </PayPalScriptProvider>
        
        <div className="mt-4">
          <Button 
            variant="outline" 
            onClick={() => setShowPayPal(false)}
            className="w-full"
            disabled={loading}
          >
            Back to Payment Options
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
