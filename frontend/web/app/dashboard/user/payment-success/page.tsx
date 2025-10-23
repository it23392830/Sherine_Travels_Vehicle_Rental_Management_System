"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Sidebar from "@/app/dashboard/user/Sidebar"

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)
  
  const bookingId = searchParams.get("bookingId")
  const transactionId = searchParams.get("transactionId")
  const amount = searchParams.get("amount")

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push("/dashboard/user/bookings")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your payment has been processed successfully. Thank you for choosing Sherine Travels!
          </p>
          
          {bookingId && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Booking ID:</span>
                  <span className="font-medium">{bookingId}</span>
                </div>
                {transactionId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction ID:</span>
                    <span className="font-medium">{transactionId}</span>
                  </div>
                )}
                {amount && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount Paid:</span>
                    <span className="font-medium">${amount} USD</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Redirecting to your bookings in {countdown} seconds...
            </p>
            
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={() => router.push("/dashboard/user/bookings")}
                className="bg-green-600 hover:bg-green-700"
              >
                View My Bookings
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push("/dashboard/user")}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole="user" userName="Customer" />
      <div className="flex-1 md:ml-64 p-6">
        <Suspense fallback={
          <div className="max-w-2xl mx-auto">
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading payment details...</p>
              </CardContent>
            </Card>
          </div>
        }>
          <PaymentSuccessContent />
        </Suspense>
      </div>
    </div>
  )
}
