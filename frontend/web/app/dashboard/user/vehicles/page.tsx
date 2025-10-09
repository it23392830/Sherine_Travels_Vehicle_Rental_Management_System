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
  pricePerKmWithDriver: number
  pricePerKmWithoutDriver: number
  priceForOvernight: number
  imageUrl1?: string | null
  imageUrl2?: string | null
}

function AllVehiclesContent() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5152/api';
  const [apiHost, setApiHost] = useState<string>("")
  const params = useSearchParams()
  const startDate = params?.get("startDate") || ""
  const endDate = params?.get("endDate") || ""

  useEffect(() => {
    if (!startDate || !endDate) {
      setVehicles([])
      setError("")
      return
    }
    
    const fetchVehicles = async () => {
      setLoading(true)
      setError("")
      try {
        const url = `${API_BASE_URL}/api/Vehicle/available?startDate=${startDate}&endDate=${endDate}`
        const res = await fetch(url)
        if (!res.ok) {
          const msg = await res.text().catch(() => "")
          throw new Error(`GET /vehicle/available failed: ${res.status} ${msg}`)
        }
        const data: Vehicle[] = await res.json()
        setVehicles(data)
        setApiHost(API_BASE_URL.replace(/\/?api$/, ""))
      } catch (err) {
        console.error("User vehicles GET error:", err)
        setError("Failed to load vehicles. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    
    fetchVehicles()
  }, [startDate, endDate, API_BASE_URL])

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
    router.push(`/dashboard/user/booking?vehicleId=${vehicleId}&startDate=${startDate}&endDate=${endDate}`)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole="user" userName="Customer" />
      <div className="flex-1 md:ml-64 p-6">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push("/dashboard/user/bookride")}
            >
              ← Back to Date Selection
            </Button>
            <h1 className="text-3xl font-bold">Available Vehicles</h1>
          </div>
          {startDate && endDate && (
            <p className="text-muted-foreground">
              For dates: <span className="font-medium">{new Date(startDate).toLocaleDateString()}</span> to{' '}
              <span className="font-medium">{new Date(endDate).toLocaleDateString()}</span>
            </p>
          )}
        </div>
        {!startDate || !endDate ? (
          <div className="text-lg text-red-500">Please select your booking dates first.</div>
        ) : loading ? (
          <div className="text-center py-8">
            <div className="text-lg text-muted-foreground">Loading available vehicles...</div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-lg text-red-500 mb-4">{error}</div>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-lg text-muted-foreground mb-4">No vehicles available for the selected dates.</div>
            <Button variant="outline" onClick={() => router.push("/dashboard/user/bookride")}>
              Change Dates
            </Button>
          </div>
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
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-lg">{v.type}</div>
                          <div className="text-sm text-muted-foreground">{v.number}</div>
                        </div>
                        <div className="text-sm font-medium">{v.seats} seats</div>
                      </div>
                      
                      {/* Pricing Information */}
                      <div className="border-t pt-3">
                        <h4 className="font-medium text-sm mb-2">Pricing</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Per km (no driver):</span>
                            <span className="font-medium">LKR {v.pricePerKmWithoutDriver}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Per km (with driver):</span>
                            <span className="font-medium">LKR {v.pricePerKmWithDriver}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Overnight:</span>
                            <span className="font-medium">LKR {v.priceForOvernight}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Button */}
                      <Button 
                        className="w-full mt-3 bg-green-600 hover:bg-green-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          goToBooking(v.id);
                        }}
                      >
                        Select This Vehicle
                      </Button>
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


