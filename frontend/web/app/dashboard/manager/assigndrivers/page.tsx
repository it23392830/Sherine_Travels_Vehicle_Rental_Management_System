"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface Driver {
  id: string
  name: string
  email: string
  status: string
  vehicle?: {
    id: number
    number: string
    type: string
  } | null
}

interface Vehicle {
  id: number
  number: string
  type: string
  seats: number
  status: string
}

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5152/api"
const API_BASE = BASE.endsWith("/api") ? BASE : `${BASE}/api`

export default function AssignDriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])

  useEffect(() => {
    void loadData()
  }, [])

  const loadData = async () => {
    const token = localStorage.getItem("sherine_auth_token")
    try {
      const resDrivers = await fetch(`${API_BASE}/manager/drivers`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!resDrivers.ok) throw new Error("Failed to load drivers")
      const dataDrivers = await resDrivers.json()
      setDrivers(dataDrivers)

      const resVehicles = await fetch(`${API_BASE}/manager/vehicles`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!resVehicles.ok) throw new Error("Failed to load vehicles")
      const dataVehicles = await resVehicles.json()
      setVehicles(dataVehicles)
    } catch (err) {
      console.error(err)
    }
  }

  const handleAssign = async (driverId: string, vehicleId: number) => {
    const token = localStorage.getItem("sherine_auth_token")
    try {
      const res = await fetch(`${API_BASE}/manager/assign-driver`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ driverId, vehicleId }),
      })
      if (!res.ok) throw new Error("Failed to assign driver")
      await loadData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleUnassign = async (driverEmail: string) => {
    const token = localStorage.getItem("sherine_auth_token")
    try {
      const res = await fetch(`${API_BASE}/manager/unassign-driver/${driverEmail}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Failed to unassign driver")
      await loadData()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Assign Drivers</h1>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
        <p>
          <strong>Note:</strong> Drivers now register themselves via the signup page. Managers can only assign or unassign vehicles for registered drivers.
        </p>
      </div>

      {drivers.length === 0 ? (
        <p className="italic text-neutral-500">No registered drivers found. Once drivers sign up, they'll appear here.</p>
      ) : (
        <div className="grid gap-4">
          {drivers.map((driver) => (
            <Card key={driver.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{driver.name} – {driver.email}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Status: <span className="font-medium">{driver.status}</span></p>
                <p>Vehicle: <span className="font-medium">{driver.vehicle ? `${driver.vehicle.number} (${driver.vehicle.type})` : "Not Assigned"}</span></p>

                <div className="mt-3 flex gap-3">
                  {driver.vehicle ? (
                    <Button variant="destructive" onClick={() => handleUnassign(driver.email)}>
                      Unassign
                    </Button>
                  ) : (
                    <select
                      className="border rounded p-2"
                      defaultValue=""
                      onChange={(e) => handleAssign(driver.id, Number(e.target.value))}
                    >
                      <option value="">-- Assign to Vehicle --</option>
                      {vehicles.filter(v => v.status === "Available").map((v) => (
                        <option key={v.id} value={v.id}>{v.number} – {v.type}</option>
                      ))}
                    </select>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
