"use client"

import React, { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Sidebar from "@/app/dashboard/user/Sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface Vehicle {
  id: number
  type: string
  number: string
  seats: number
  status: string
  imageUrl1?: string | null
  imageUrl2?: string | null
}

function AllVehiclesContent() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<number, number>>({})
  const router = useRouter()
  const ENV_API_BASE = process.env.NEXT_PUBLIC_API_URL
  const API_CANDIDATES = [ENV_API_BASE, "http://localhost:5152/api", "https://localhost:7126/api"].filter(Boolean) as string[]
  const [apiHost, setApiHost] = useState<string>("")
  const params = useSearchParams()
  const startDate = params?.get("startDate") || ""
  const endDate = params?.get("endDate") || ""

  useEffect(() => {
    if (!startDate || !endDate) {
      setVehicles([])
      return
    }
    const fetchVehicles = async () => {
      let lastErr: any = null
      for (const base of API_CANDIDATES) {
        try {
          const url = `${base}/vehicle/available?startDate=${startDate}&endDate=${endDate}`;
          const res = await fetch(url)
          if (!res.ok) {
            const msg = await res.text().catch(() => "")
            console.error("User vehicles GET failed:", base, res.status, msg)
            lastErr = new Error(`GET failed ${res.status}`)
            continue
          }
          const data: Vehicle[] = await res.json()
          setVehicles(data)
          setApiHost(base.replace(/\/?api$/, ""))
          return
        } catch (e) {
          console.error("User vehicles GET network error:", base, e)
          lastErr = e
        }
      }
      if (lastErr) throw lastErr
    }
    fetchVehicles()
  }, [startDate, endDate])

  const handlePrev = (id: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [id]: Math.max(0, ((prev[id] ?? 0) - 1)),
    }))
  }

  const handleNext = (id: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [id]: Math.min(1, ((prev[id] ?? 0) + 1)),
    }))
  }

  const getImageForVehicle = (v: Vehicle, idx: number) => {
    const images = [v.imageUrl1, v.imageUrl2].filter(Boolean) as string[]
    if (images.length === 0) return "/placeholder.jpg"
    const selected = images[Math.min(idx, images.length - 1)]
    // prefix API host for server-relative paths like /uploads/...
    if (selected.startsWith("/")) return `${apiHost}${selected}`
    return selected
  }

  const goToBooking = (vehicleId: number) => {
    router.push(`/dashboard/user/booking?vehicleId=${vehicleId}`)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole="user" userName="Customer" />
      <div className="flex-1 md:ml-64 p-6">
        <h1 className="text-3xl font-bold mb-6">All Vehicles</h1>
        {!startDate || !endDate ? (
          <div className="text-lg text-red-500">Please select your booking dates first.</div>
        ) : vehicles.length === 0 ? (
          <div className="text-lg text-muted-foreground">No vehicles available for the selected dates.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map(v => {
              const idx = currentImageIndex[v.id] ?? 0
              const imageSrc = getImageForVehicle(v, idx)
              return (
                <Card key={v.id} className="overflow-hidden group cursor-pointer" onClick={() => goToBooking(v.id)}>
                  <div className="relative aspect-[16/10] bg-muted">
                    {/* Image */}
                    <img
                      src={imageSrc}
                      alt={v.type}
                      className="w-full h-full object-cover"
                    />
                    {/* Arrows */}
                    <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="rounded-full"
                        onClick={(e) => { e.stopPropagation(); handlePrev(v.id) }}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="rounded-full"
                        onClick={(e) => { e.stopPropagation(); handleNext(v.id) }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{v.type}</div>
                        <div className="text-sm text-muted-foreground">{v.number}</div>
                      </div>
                      <div className="text-sm">{v.seats} seats</div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AllVehiclesPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <AllVehiclesContent />
    </Suspense>
  )
}


