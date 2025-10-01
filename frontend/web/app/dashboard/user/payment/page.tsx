"use client"

import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

function PaymentContent() {
  const params = useSearchParams()
  const router = useRouter()
  const bookingId = params.get("bookingId")

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Payment</h1>
      <Card className="p-6 max-w-xl">
        <p className="mb-2">Payment portal coming soon.</p>
        {bookingId && <p className="text-sm text-muted-foreground">Booking ID: {bookingId}</p>}
        <div className="mt-4">
          <Button onClick={() => router.push("/dashboard/user")}>Back to Dashboard</Button>
        </div>
      </Card>
    </div>
  )
}

export default function PaymentPlaceholderPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <PaymentContent />
    </Suspense>
  )
}

