"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Booking {
  id: number
  bookingId: string
  vehicleId: number
  vehicleType: string
  startDate: string
  endDate: string
  kilometers: number
  totalPrice: number
  status: string
  paymentStatus: string
  withDriver: boolean
  driverId?: number
  driverName?: string
  driverEmail?: string
  userName: string
  userEmail: string
}

interface Driver {
  id: number
  name: string
  email: string
  status: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://sherinetravels-api-frcsb2d3drabgbbd.eastasia-01.azurewebsites.net'

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    void loadData()
  }, [])

  const loadData = async () => {
    const token = localStorage.getItem("sherine_auth_token")
    
    if (!token) {
      setError("No authentication token found. Please log in again.")
      setLoading(false)
      return
    }
    
    try {
      console.log("Loading bookings from:", `${API_BASE}/api/Manager/bookings`)
      console.log("Using token:", token.substring(0, 20) + "...")
      
      // Load bookings
      const resBookings = await fetch(`${API_BASE}/api/Manager/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      console.log("Bookings response status:", resBookings.status)
      
      if (!resBookings.ok) {
        const errorData = await resBookings.json().catch(() => ({ message: "Unknown error" }))
        console.error("Bookings API error:", errorData)
        throw new Error(`Failed to load bookings: ${errorData.message || resBookings.statusText}`)
      }
      const dataBookings = await resBookings.json()
      console.log("Bookings loaded:", dataBookings.length, "items")
      const mappedBookings = (Array.isArray(dataBookings) ? dataBookings : []).map((b: any) => ({
        id: b.Id ?? b.id,
        bookingId: b.BookingId ?? b.bookingId,
        vehicleId: b.VehicleId ?? b.vehicleId,
        vehicleType: b.VehicleType ?? b.vehicleType,
        startDate: b.StartDate ?? b.startDate,
        endDate: b.EndDate ?? b.endDate,
        kilometers: b.Kilometers ?? b.kilometers,
        totalPrice: b.TotalPrice ?? b.totalPrice,
        status: b.Status ?? b.status,
        paymentStatus: b.PaymentStatus ?? b.paymentStatus,
        withDriver: b.WithDriver ?? b.withDriver,
        driverId: b.DriverId ?? b.driverId,
        driverName: b.DriverName ?? b.driverName,
        driverEmail: b.DriverEmail ?? b.driverEmail,
        userName: b.UserName ?? b.userName,
        userEmail: b.UserEmail ?? b.userEmail,
      }))
      setBookings(mappedBookings)

      // Load drivers
      const resDrivers = await fetch(`${API_BASE}/api/Manager/drivers`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!resDrivers.ok) {
        const errorData = await resDrivers.json().catch(() => ({ message: "Unknown error" }))
        throw new Error(`Failed to load drivers: ${errorData.message || resDrivers.statusText}`)
      }
      const dataDrivers = await resDrivers.json()
      setDrivers(dataDrivers)

      setError("") // Clear any previous errors
    } catch (err: any) {
      console.error("Load data error:", err)
      setError(err.message || "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const handleAssignDriver = async (bookingId: number, driverId: string) => {
    const token = localStorage.getItem("sherine_auth_token")
    try {
      const res = await fetch(`${API_BASE}/api/Manager/assign-driver-to-booking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingId, driverId }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Unknown error" }))
        throw new Error(errorData.message || `HTTP ${res.status}: ${res.statusText}`)
      }

      await loadData()
      setError("") // Clear any previous errors
    } catch (err: any) {
      console.error("Assign driver error:", err)
      setError(`Failed to assign driver: ${err.message}`)
    }
  }

  const handleChangeDriver = async (bookingId: number, driverId: string) => {
    const token = localStorage.getItem("sherine_auth_token")
    try {
      const res = await fetch(`${API_BASE}/api/Manager/change-driver-for-booking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingId, driverId }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Unknown error" }))
        throw new Error(errorData.message || `HTTP ${res.status}: ${res.statusText}`)
      }

      await loadData()
      setError("")
    } catch (err: any) {
      console.error("Change driver error:", err)
      setError(`Failed to change driver: ${err.message}`)
    }
  }

  const handleUnassignDriver = async (bookingId: number) => {
    const token = localStorage.getItem("sherine_auth_token")
    try {
      const res = await fetch(`${API_BASE}/api/Manager/unassign-driver-from-booking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingId }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Unknown error" }))
        throw new Error(errorData.message || `HTTP ${res.status}: ${res.statusText}`)
      }

      await loadData()
      setError("")
    } catch (err: any) {
      console.error("Unassign driver error:", err)
      setError(`Failed to unassign driver: ${err.message}`)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-400"
      case "Pending":
        return "bg-yellow-100 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-400"
      case "Cancelled":
        return "bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "PaidOnline":
        return "bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-400"
      case "Pending":
        return "bg-yellow-100 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-400"
      case "PayAtPickup":
        return "bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  // Filter bookings
  const bookingsWithDriver = bookings.filter((b) => b.withDriver)
  const bookingsWithoutDriver = bookings.filter((b) => !b.withDriver)

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <p>Loading bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Bookings Management</h1>
        <p className="text-muted-foreground">Manage bookings and assign drivers</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <p>{error}</p>
        </div>
      )}

      {/* Bookings Requesting Driver */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Bookings Requesting Driver</h2>
        {bookingsWithDriver.length === 0 ? (
          <p className="text-muted-foreground italic">No bookings requesting driver found.</p>
        ) : (
          <div className="grid gap-4">
            {bookingsWithDriver.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>
                      #{booking.bookingId} • {booking.vehicleType}
                    </span>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                      <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
                        {booking.paymentStatus}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p>
                        <strong>Dates:</strong>{" "}
                        {new Date(booking.startDate).toLocaleDateString()} →{" "}
                        {new Date(booking.endDate).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Kilometers:</strong> {booking.kilometers}
                      </p>
                      <p>
                        <strong>Total Price:</strong> LKR{" "}
                        {booking.totalPrice.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p>
                        <strong>Customer:</strong> {booking.userName}
                      </p>
                      <p>
                        <strong>Email:</strong> {booking.userEmail}
                      </p>
                      <p>
                        <strong>Driver Required:</strong> Yes
                      </p>
                    </div>
                    <div>
                      {booking.driverName ? (
                        <p>
                          <strong>Assigned Driver:</strong> {booking.driverName} (
                          {booking.driverEmail})
                        </p>
                      ) : (
                        <p>
                          <strong>Assigned Driver:</strong>{" "}
                          <span className="text-red-600">Not Assigned</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">
                      {booking.driverName ? "Change Driver:" : "Assign Driver:"}
                    </label>
                    <div className="flex gap-2">
                      <select
                        className="border rounded p-2 flex-1"
                        defaultValue={booking.driverId || ""}
                        onChange={(e) => {
                          const val = e.target.value
                          if (val) {
                            booking.driverName
                              ? handleChangeDriver(booking.id, val)
                              : handleAssignDriver(booking.id, val)
                          }
                        }}
                      >
                        <option value="">-- Select Driver --</option>
                        {drivers
                          .filter((d) => d.status === "Available" || d.id === booking.driverId)
                          .map((driver) => (
                            <option key={driver.id} value={driver.id}>
                              {driver.name} ({driver.email}){" "}
                              {driver.id === booking.driverId ? "(Current)" : ""}
                            </option>
                          ))}
                      </select>
                      {booking.driverName && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleUnassignDriver(booking.id)}
                        >
                          Unassign
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Bookings Without Driver */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Bookings Without Driver</h2>
        {bookingsWithoutDriver.length === 0 ? (
          <p className="text-muted-foreground italic">No bookings without driver found.</p>
        ) : (
          <div className="grid gap-4">
            {bookingsWithoutDriver.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>
                      #{booking.bookingId} • {booking.vehicleType}
                    </span>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                      <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
                        {booking.paymentStatus}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p>
                        <strong>Dates:</strong>{" "}
                        {new Date(booking.startDate).toLocaleDateString()} →{" "}
                        {new Date(booking.endDate).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Kilometers:</strong> {booking.kilometers}
                      </p>
                      <p>
                        <strong>Total Price:</strong> LKR{" "}
                        {booking.totalPrice.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p>
                        <strong>Customer:</strong> {booking.userName}
                      </p>
                      <p>
                        <strong>Email:</strong> {booking.userEmail}
                      </p>
                      <p>
                        <strong>Driver Required:</strong> No
                      </p>
                    </div>
                    <div>
                      <p>
                        <strong>Type:</strong> Self-drive booking
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
