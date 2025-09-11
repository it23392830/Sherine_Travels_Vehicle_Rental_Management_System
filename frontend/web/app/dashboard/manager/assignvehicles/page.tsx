"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Pencil, Trash2, PlusCircle } from "lucide-react"

interface Vehicle {
  id: number
  type: string
  status: "Available" | "In Service" | "Out of Service"
  seats: number
  priceWithoutDriver: number
  priceWithDriver: number
}

// ✅ Use API base from .env.local
const API_BASE = process.env.NEXT_PUBLIC_API_URL

export default function AssignVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [form, setForm] = useState({
    type: "",
    status: "Available",
    seats: "",
    priceWithoutDriver: "",
    priceWithDriver: "",
  })
  const [editingId, setEditingId] = useState<number | null>(null)

  // 🔹 Load vehicles from backend
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const token = localStorage.getItem("sherine_auth_token")
        const res = await fetch(`${API_BASE}/vehicle`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Failed to fetch vehicles")
        const data: Vehicle[] = await res.json()
        setVehicles(data)
      } catch (error) {
        console.error(error)
      }
    }
    fetchVehicles()
  }, [])

  const handleAddOrUpdate = async () => {
    if (!form.type || !form.seats || !form.priceWithoutDriver || !form.priceWithDriver) return

    const vehicleData: Omit<Vehicle, "id"> = {
      type: form.type,
      status: form.status as Vehicle["status"],
      seats: Number(form.seats),
      priceWithoutDriver: Number(form.priceWithoutDriver),
      priceWithDriver: Number(form.priceWithDriver),
    }

    try {
      const token = localStorage.getItem("sherine_auth_token")

      if (editingId) {
        // 🔹 Update
        const res = await fetch(`${API_BASE}/vehicle/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(vehicleData),
        })
        if (!res.ok) throw new Error("Failed to update vehicle")

        const updatedVehicle: Vehicle = await res.json()
        setVehicles((prev) => prev.map((v) => (v.id === editingId ? updatedVehicle : v)))
        setEditingId(null)
      } else {
        // 🔹 Add new
        const res = await fetch(`${API_BASE}/vehicle`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(vehicleData),
        })
        if (!res.ok) throw new Error("Failed to add vehicle")

        const newVehicle: Vehicle = await res.json()
        setVehicles((prev) => [...prev, newVehicle])
      }

      // reset form
      setForm({ type: "", status: "Available", seats: "", priceWithoutDriver: "", priceWithDriver: "" })
    } catch (error) {
      console.error(error)
    }
  }

  const handleEdit = (vehicle: Vehicle) => {
    setForm({
      type: vehicle.type,
      status: vehicle.status,
      seats: vehicle.seats.toString(),
      priceWithoutDriver: vehicle.priceWithoutDriver.toString(),
      priceWithDriver: vehicle.priceWithDriver.toString(),
    })
    setEditingId(vehicle.id)
  }

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem("sherine_auth_token")
      const res = await fetch(`${API_BASE}/vehicle/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Failed to delete vehicle")

      setVehicles((prev) => prev.filter((v) => v.id !== id))
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Assign Vehicles</h1>

      {/* Add / Edit Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{editingId ? "Update Vehicle" : "Add Vehicle"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Vehicle Type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Seats"
            value={form.seats}
            onChange={(e) => setForm({ ...form, seats: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Price - Vehicle Only (LKR)"
            value={form.priceWithoutDriver}
            onChange={(e) => setForm({ ...form, priceWithoutDriver: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Price - Vehicle + Driver (LKR)"
            value={form.priceWithDriver}
            onChange={(e) => setForm({ ...form, priceWithDriver: e.target.value })}
          />
          <select
            aria-label="Vehicle Status"
            className="border rounded p-2 w-full"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option>Available</option>
            <option>In Service</option>
            <option>Out of Service</option>
          </select>

          <Button onClick={handleAddOrUpdate} className="w-full">
            {editingId ? "Update Vehicle" : "Add Vehicle"} <PlusCircle className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Vehicle List */}
      <div className="grid gap-4">
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {vehicle.type} - Seats: {vehicle.seats}
              </CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(vehicle)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(vehicle.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p>
                Status: <span className="font-medium">{vehicle.status}</span>
              </p>
              <p>
                Price - Vehicle Only:{" "}
                <span className="font-medium">LKR {vehicle.priceWithoutDriver.toLocaleString()}</span>
              </p>
              <p>
                Price - Vehicle + Driver:{" "}
                <span className="font-medium">LKR {vehicle.priceWithDriver.toLocaleString()}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
