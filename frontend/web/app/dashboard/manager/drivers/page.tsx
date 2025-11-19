"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface Driver {
  id: string
  name: string
  email: string
  status: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://sherinetravels-api-frcsb2d3drabgbbd.eastasia-01.azurewebsites.net'

export default function RegisteredDriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])

  useEffect(() => {
    void loadData()
  }, [])

  const loadData = async () => {
    const token = localStorage.getItem("sherine_auth_token")
    try {
      const resDrivers = await fetch(`${API_BASE}/api/Manager/drivers`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!resDrivers.ok) throw new Error("Failed to load drivers")
      const dataDrivers = await resDrivers.json()
      const mapped = (Array.isArray(dataDrivers) ? dataDrivers : []).map((d: any) => ({
        id: d.Id ?? d.id,
        name: d.Name ?? d.name,
        email: d.Email ?? d.email,
        status: d.Status ?? d.status ?? "Available",
      }))
      setDrivers(mapped)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Registered Drivers</h1>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
        <p>
          <strong>Note:</strong> Drivers register themselves via the signup page. This page shows all registered drivers in the system.
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
                <p>Email: <span className="font-medium">{driver.email}</span></p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
