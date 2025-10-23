"use client"

import React, { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface DashboardStats {
  totalDrivers: number
  activeDrivers: number
  totalVehicles: number
  activeVehicles: number
  totalBookings: number
  bookingsWithDriver: number
  bookingsWithoutDriver: number
}

interface DriverSummary {
  name: string
  email: string
  status: string
  vehicleNumber?: string
  vehicleType?: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://sherinetravels-api-frcsb2d3drabgbbd.eastasia-01.azurewebsites.net'

export default function ManagerDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [drivers, setDrivers] = useState<DriverSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void loadDashboard()
  }, [])

  const loadDashboard = async () => {
    const token = localStorage.getItem("sherine_auth_token")
    try {
      const [resDrivers, resVehicles, resBookings] = await Promise.all([
        fetch(`${API_BASE}/manager/drivers`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/manager/vehicles`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      const dataDrivers = resDrivers.ok ? await resDrivers.json() : []
      const dataVehicles = resVehicles.ok ? await resVehicles.json() : []
      const dataBookings = resBookings.ok ? await resBookings.json() : []

      // Compute dynamic stats
      const totalDrivers = dataDrivers.length
      const activeDrivers = dataDrivers.filter(
        (d: any) => d.status === "Available" || d.status === "Assigned"
      ).length

      const totalVehicles = dataVehicles.length
      const activeVehicles = dataVehicles.filter(
        (v: any) => v.status === "Active"
      ).length

      const totalBookings = dataBookings.length
      const bookingsWithDriver = dataBookings.filter(
        (b: any) => b.withDriver === true
      ).length
      const bookingsWithoutDriver = totalBookings - bookingsWithDriver

      setStats({
        totalDrivers,
        activeDrivers,
        totalVehicles,
        activeVehicles,
        totalBookings,
        bookingsWithDriver,
        bookingsWithoutDriver,
      })

      // Show a few driver summaries
      setDrivers(
        dataDrivers.slice(0, 5).map((d: any) => ({
          name: d.name,
          email: d.email,
          status: d.status,
          vehicleNumber: d.vehicle?.number,
          vehicleType: d.vehicle?.type,
        }))
      )
    } catch (err) {
      console.error("Dashboard load failed:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6 text-muted-foreground italic">Loading dashboard...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-2">Manager Dashboard</h1>
      <p className="text-muted-foreground mb-6">
        Overview of fleet operations, drivers, and bookings in real-time.
      </p>

      {/* 🔹 Stats Summary */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Drivers</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              {stats.totalDrivers}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Drivers</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              {stats.activeDrivers}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Vehicles</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              {stats.totalVehicles}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Vehicles</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              {stats.activeVehicles}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Bookings</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              {stats.totalBookings}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bookings With Driver</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              {stats.bookingsWithDriver}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bookings Without Driver</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              {stats.bookingsWithoutDriver}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 🔹 Driver Overview */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Driver Status Overview</h2>
        <div className="grid gap-4">
          {drivers.map((d) => (
            <Card key={d.email}>
              <CardHeader>
                <CardTitle>{d.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Email: {d.email}</p>
                <p>Status: {d.status}</p>
                <p>
                  Vehicle:{" "}
                  {d.vehicleNumber
                    ? `${d.vehicleNumber} (${d.vehicleType})`
                    : "Not Assigned"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
