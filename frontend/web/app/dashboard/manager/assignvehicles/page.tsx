"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Pencil, Trash2, PlusCircle } from "lucide-react"

interface Vehicle {
  id: number
  type: string
  number: string
  status: "Available" | "In Service" | "Out of Service"
  seats: number
  priceWithoutDriver: number
  priceWithDriver: number
  imageUrl1?: string | null
  imageUrl2?: string | null
}

// ✅ Preferred API base from env (falls back at runtime in fetch logic)
const API_BASE = process.env.NEXT_PUBLIC_API_URL

export default function AssignVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [form, setForm] = useState({
    type: "",
    number: "",
    status: "Available",
    seats: "",
    priceWithoutDriver: "",
    priceWithDriver: "",
    imageUrl1: "",
    imageUrl2: "",
    imageFile1: null as File | null,
    imageFile2: null as File | null,
  })
  const [editingId, setEditingId] = useState<number | null>(null)

  // 🔹 Load vehicles from backend (resilient across backend profiles)
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const bases = [
          API_BASE,
          "http://localhost:5152/api",
          "https://localhost:7126/api",
        ].filter(Boolean) as string[]

        let lastErr: any = null
        for (const base of bases) {
          try {
            const res = await fetch(`${base}/vehicle`)
            if (!res.ok) {
              const msg = await res.text().catch(() => "")
              console.error("GET /vehicle failed:", base, res.status, msg)
              lastErr = new Error(`GET failed ${res.status}`)
              continue
            }
            const data: Vehicle[] = await res.json()
            setVehicles(data)
            return
          } catch (e) {
            console.error("GET /vehicle network error:", base, e)
            lastErr = e
          }
        }
        if (lastErr) throw lastErr
      } catch (error) {
        console.error(error)
      }
    }
    fetchVehicles()
  }, [])

  const handleAddOrUpdate = async () => {
    if (!form.type || !form.number || !form.seats || !form.priceWithoutDriver || !form.priceWithDriver) return

    const formData = new FormData()
    formData.append("Type", form.type)
    formData.append("Number", form.number)
    formData.append("Status", form.status)
    formData.append("Seats", String(Number(form.seats)))
    formData.append("PriceWithoutDriver", String(Number(form.priceWithoutDriver)))
    formData.append("PriceWithDriver", String(Number(form.priceWithDriver)))
    if (form.imageUrl1) formData.append("ImageUrl1", form.imageUrl1)
    if (form.imageUrl2) formData.append("ImageUrl2", form.imageUrl2)
    if (form.imageFile1) formData.append("ImageFile1", form.imageFile1)
    if (form.imageFile2) formData.append("ImageFile2", form.imageFile2)

    try {
      const token = localStorage.getItem("sherine_auth_token")

      if (editingId) {
        // 🔹 Update
        const res = await fetch(`${API_BASE}/vehicle/${editingId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        })
        if (!res.ok) {
          const msg = await res.text().catch(() => "")
          console.error("Update vehicle failed:", res.status, msg)
          throw new Error("Failed to update vehicle")
        }

        const updatedVehicle: Vehicle = await res.json()
        setVehicles((prev) => prev.map((v) => (v.id === editingId ? updatedVehicle : v)))
        setEditingId(null)
      } else {
        // 🔹 Add new
        const res = await fetch(`${API_BASE}/vehicle`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        })
        if (!res.ok) {
          const msg = await res.text().catch(() => "")
          console.error("Add vehicle failed:", res.status, msg)
          throw new Error("Failed to add vehicle")
        }

        const newVehicle: Vehicle = await res.json()
        setVehicles((prev) => [...prev, newVehicle])
      }

      // reset form
      setForm({ type: "", number: "", status: "Available", seats: "", priceWithoutDriver: "", priceWithDriver: "", imageUrl1: "", imageUrl2: "", imageFile1: null, imageFile2: null })
    } catch (error) {
      console.error(error)
    }
  }

  const handleEdit = (vehicle: Vehicle) => {
    setForm({
      type: vehicle.type,
      number: vehicle.number,
      status: vehicle.status,
      seats: vehicle.seats.toString(),
      priceWithoutDriver: vehicle.priceWithoutDriver.toString(),
      priceWithDriver: vehicle.priceWithDriver.toString(),
      imageUrl1: vehicle.imageUrl1 ?? "",
      imageUrl2: vehicle.imageUrl2 ?? "",
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
            placeholder="Vehicle Number (e.g. ABC-1234)"
            value={form.number}
            onChange={(e) => setForm({ ...form, number: e.target.value })}
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
          {/* Removed Image URL inputs as requested */}
          <div className="flex gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setForm({ ...form, imageFile1: e.target.files?.[0] || null })}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setForm({ ...form, imageFile2: e.target.files?.[0] || null })}
            />
          </div>
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
