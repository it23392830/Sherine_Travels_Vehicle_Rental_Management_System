 "use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Pencil, Trash2, PlusCircle } from "lucide-react"

interface Vehicle {
  id: number
  plate: string
  model: string
  status: "Available" | "In Service" | "Out of Service"
  seats: number
  priceVehicleOnly: number
  priceWithDriver: number
}

export default function AssignVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: 1,
      plate: "ABC-123",
      model: "Toyota Sienna",
      status: "Available",
      seats: 7,
      priceVehicleOnly: 50000,
      priceWithDriver: 60000,
    },
    {
      id: 2,
      plate: "XYZ-456",
      model: "Kia Carnival",
      status: "In Service",
      seats: 7,
      priceVehicleOnly: 45000,
      priceWithDriver: 55000,
    },
    {
      id: 3,
      plate: "Ml-7456",
      model: "Nissan Caravan",
      status: "Available",
      seats: 12,
      priceVehicleOnly: 65000,
      priceWithDriver: 75000,
    },
    {
      id: 4,
      plate: "KLo98",
      model: "Toyota HiAce",
      status: "In Service",
      seats: 12,
      priceVehicleOnly: 35000,
      priceWithDriver: 45000,
    },
    {
      id: 5,
      plate: "Vby-780o",
      model: "Toyota HiAce High Roo",
      status: "Out of Service",
      seats: 12,
      priceVehicleOnly: 62000,
      priceWithDriver: 72000,
    },

  ])

  const [form, setForm] = useState({
    plate: "",
    model: "",
    status: "Available",
    seats: "",
    priceVehicleOnly: "",
    priceWithDriver: "",
  })

  const [editingId, setEditingId] = useState<number | null>(null)

  const handleAddOrUpdate = () => {
    if (!form.plate || !form.model || !form.seats || !form.priceVehicleOnly || !form.priceWithDriver) return

     if (editingId) {
  // Update
  setVehicles((prev) =>
    prev.map((v) =>
      v.id === editingId
        ? {
            ...v,
            plate: form.plate,
            model: form.model,
            status: form.status as Vehicle["status"], // <-- cast here
            seats: Number(form.seats),
            priceVehicleOnly: Number(form.priceVehicleOnly),
            priceWithDriver: Number(form.priceWithDriver),
          }
        : v
    )
  )
  setEditingId(null)
} else {
  // Add new
  const newVehicle: Vehicle = {
    id: Date.now(),
    plate: form.plate,
    model: form.model,
    status: form.status as Vehicle["status"], // <-- cast here too
    seats: Number(form.seats),
    priceVehicleOnly: Number(form.priceVehicleOnly),
    priceWithDriver: Number(form.priceWithDriver),
  }
  setVehicles((prev) => [...prev, newVehicle])
}

    setForm({ plate: "", model: "", status: "Available", seats: "", priceVehicleOnly: "", priceWithDriver: "" })
  }

  const handleEdit = (vehicle: Vehicle) => {
    setForm({
      plate: vehicle.plate,
      model: vehicle.model,
      status: vehicle.status,
      seats: vehicle.seats.toString(),
      priceVehicleOnly: vehicle.priceVehicleOnly.toString(),
      priceWithDriver: vehicle.priceWithDriver.toString(),
    })
    setEditingId(vehicle.id)
  }

  const handleDelete = (id: number) => {
    setVehicles((prev) => prev.filter((v) => v.id !== id))
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
            placeholder="License Plate"
            value={form.plate}
            onChange={(e) => setForm({ ...form, plate: e.target.value })}
          />
          <Input
            placeholder="Vehicle Model"
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
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
            value={form.priceVehicleOnly}
            onChange={(e) => setForm({ ...form, priceVehicleOnly: e.target.value })}
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
            onChange={(e) => setForm({ ...form, status: e.target.value })
          }
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
              <CardTitle>{vehicle.plate} - {vehicle.model}</CardTitle>
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
              <p>Status: <span className="font-medium">{vehicle.status}</span></p>
              <p>Seats: <span className="font-medium">{vehicle.seats}</span></p>
              <p>Price - Vehicle Only: <span className="font-medium">LKR {vehicle.priceVehicleOnly.toLocaleString()}</span></p>
              <p>Price - Vehicle + Driver: <span className="font-medium">LKR {vehicle.priceWithDriver.toLocaleString()}</span></p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
