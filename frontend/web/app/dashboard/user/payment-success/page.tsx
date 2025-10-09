"use client"

import { useRouter, useSearchParams } from "next/navigation"
import Sidebar from "@/app/dashboard/user/Sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const params = useSearchParams()
  const bookingId = params.get("bookingId")

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole="user" userName="Customer" />
      <div className="flex-1 md:ml-64 p-6">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Payment Successful</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-green-600 font-medium">Your payment has been processed successfully.</p>
            {bookingId && (
              <p className="text-sm">Booking ID: <span className="font-semibold">#{bookingId}</span></p>
            )}
            {bookingId && (
              <div>
                <a
                  className="text-blue-600 hover:underline"
                  href={`${process.env.NEXT_PUBLIC_API_URL || "/api"}/booking/${(bookingId || "").replace(/^BK/, "")}/invoice`}
                >
                  Download Invoice (PDF)
                </a>
              </div>
            )}
            <div className="flex gap-3">
              <Button onClick={() => router.push("/dashboard/user/mybookings")}>View My Bookings</Button>
              <Button variant="outline" onClick={() => router.push("/dashboard/user")}>Go to Dashboard</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


