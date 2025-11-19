"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function BookRideDatePage() {
  const [dates, setDates] = useState({ start: "", end: "" })
  const router = useRouter()
  const [error, setError] = useState("")

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!dates.start || !dates.end) {
      setError("Please select both dates.")
      return
    }
    router.push(`/dashboard/user/vehicles?startDate=${dates.start}&endDate=${dates.end}`)
  }

  return (
    <div className="flex min-h-screen bg-background items-center justify-center">
      <Card className="max-w-md w-full p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Book a Ride</h1>
        <form onSubmit={handleNext} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">From (Date)</label>
            <input
              type="date"
              value={dates.start}
              onChange={e => setDates({ ...dates, start: e.target.value })}
              className="w-full border rounded p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">To (Date)</label>
            <input
              type="date"
              value={dates.end}
              onChange={e => setDates({ ...dates, end: e.target.value })}
              className="w-full border rounded p-2"
              required
            />
          </div>
          {error && <p className="text-red-500 mb-2">{error}</p>}
          <Button type="submit" className="w-full">Next</Button>
        </form>
      </Card>
    </div>
  )
}
