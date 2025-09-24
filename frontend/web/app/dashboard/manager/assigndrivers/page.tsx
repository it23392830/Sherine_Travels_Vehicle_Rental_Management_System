"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Pencil, Trash2, PlusCircle, Link2 } from "lucide-react"

interface Driver {
    id: number
    name: string
    licenseNumber: string
    contact: string
    status: "Available" | "Assigned" | "Inactive"
    vehicleId?: number | null
}

interface Vehicle {
    id: number
    type: string
    seats: number
    status: string
}

// ✅ API base from .env.local
const API_BASE = process.env.NEXT_PUBLIC_API_URL

export default function AssignDriversPage() {
    const [drivers, setDrivers] = useState<Driver[]>([])
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [form, setForm] = useState({
        name: "",
        licenseNumber: "",
        contact: "",
        status: "Available",
        vehicleId: "",
    })
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null)

    // 🔹 Load drivers + vehicles
    useEffect(() => {
        void loadData()
    }, [])

    const loadData = async () => {
        const token = localStorage.getItem("sherine_auth_token")
        // Fetch drivers first
        let fetchedDrivers: Driver[] = []
        try {
            const res = await fetch(`${API_BASE}/driver`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (!res.ok) throw new Error("Failed to fetch drivers")
            fetchedDrivers = await res.json()
            setDrivers(fetchedDrivers)
        } catch (err) {
            console.error(err)
        }
        // Then fetch vehicles and filter
        try {
            const res = await fetch(`${API_BASE}/vehicle`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (!res.ok) throw new Error("Failed to fetch vehicles")
            const data: Vehicle[] = await res.json()
            const assignedIds = new Set(
                fetchedDrivers
                    .filter(d => d.vehicleId != null)
                    .map(d => d.vehicleId as number)
            )
            // Allow currently editing driver's vehicle to remain visible
            if (editingVehicleId != null) {
                assignedIds.delete(editingVehicleId)
            }
            const available = data.filter(v => v.status === "Available" && !assignedIds.has(v.id))
            setVehicles(available)
        } catch (err) {
            console.error(err)
        }
    }

    const handleAddOrUpdate = async () => {
        if (!form.name || !form.licenseNumber || !form.contact) return

        const driverData: Omit<Driver, "id"> = {
            name: form.name,
            licenseNumber: form.licenseNumber,
            contact: form.contact,
            status: form.status as Driver["status"],
            vehicleId: form.vehicleId ? Number(form.vehicleId) : null,
        }

        try {
            const token = localStorage.getItem("sherine_auth_token")

            if (editingId) {
                // 🔹 Update
                const res = await fetch(`${API_BASE}/driver/${editingId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(driverData),
                })
                if (!res.ok) throw new Error("Failed to update driver")

                const updatedDriver: Driver = await res.json()
                setDrivers((prev) => prev.map((d) => (d.id === editingId ? updatedDriver : d)))
                setEditingId(null)
                setEditingVehicleId(null)
            } else {
                // 🔹 Add new
                const res = await fetch(`${API_BASE}/driver`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(driverData),
                })
                if (!res.ok) throw new Error("Failed to add driver")

                const newDriver: Driver = await res.json()
                setDrivers((prev) => [...prev, newDriver])
            }

            // reset form
            setForm({ name: "", licenseNumber: "", contact: "", status: "Available", vehicleId: "" })
            // Refresh vehicles list to reflect new assignment
            void loadData()
        } catch (error) {
            console.error(error)
        }
    }

    const handleEdit = (driver: Driver) => {
        setForm({
            name: driver.name,
            licenseNumber: driver.licenseNumber,
            contact: driver.contact,
            status: driver.status,
            vehicleId: driver.vehicleId ? driver.vehicleId.toString() : "",
        })
        setEditingId(driver.id)
        setEditingVehicleId(driver.vehicleId ?? null)
        // Refresh available vehicles keeping current assignment visible
        void loadData()
    }

    const handleDelete = async (id: number) => {
        try {
            const token = localStorage.getItem("sherine_auth_token")
            const res = await fetch(`${API_BASE}/driver/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            })
            if (!res.ok) throw new Error("Failed to delete driver")

            setDrivers((prev) => prev.filter((d) => d.id !== id))
            // Refresh vehicles list to free up previously assigned vehicle
            void loadData()
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Assign Drivers</h1>

            {/* Add / Edit Form */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>{editingId ? "Update Driver" : "Add Driver"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Input
                        placeholder="Driver Name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                    <Input
                        placeholder="License Number"
                        value={form.licenseNumber}
                        onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                    />
                    <Input
                        placeholder="Contact Number"
                        value={form.contact}
                        onChange={(e) => setForm({ ...form, contact: e.target.value })}
                    />
                    <select
                        aria-label="Driver Status"
                        className="border rounded p-2 w-full"
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                        <option>Available</option>
                        <option>Assigned</option>
                        <option>Inactive</option>
                    </select>

                    {/* Vehicle Assignment */}
                    <select
                        aria-label="Assign Vehicle"
                        className="border rounded p-2 w-full"
                        value={form.vehicleId}
                        onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
                    >
                        <option value="">-- Assign to Vehicle (optional) --</option>
                        {vehicles.map((v) => (
                            <option key={v.id} value={v.id}>
                                {v.type} (Seats: {v.seats}, Status: {v.status})
                            </option>
                        ))}
                    </select>

                    <Button onClick={handleAddOrUpdate} className="w-full">
                        {editingId ? "Update Driver" : "Add Driver"} <PlusCircle className="ml-2 h-4 w-4" />
                    </Button>
                </CardContent>
            </Card>

            {/* Driver List */}
            <div className="grid gap-4">
                {drivers.map((driver) => (
                    <Card key={driver.id}>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>
                                {driver.name} - License: {driver.licenseNumber}
                            </CardTitle>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleEdit(driver)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleDelete(driver.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p>
                                Contact: <span className="font-medium">{driver.contact}</span>
                            </p>
                            <p>
                                Status: <span className="font-medium">{driver.status}</span>
                            </p>
                            <p>
                                Vehicle:{" "}
                                <span className="font-medium">
                                    {driver.vehicleId
                                        ? vehicles.find((v) => v.id === driver.vehicleId)?.type || "Assigned"
                                        : "Not Assigned"}
                                </span>
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
