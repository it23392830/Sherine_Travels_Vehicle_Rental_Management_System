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
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://sherinetravels-api-frcsb2d3drabgbbd.eastasia-01.azurewebsites.net'

export default function AssignDriversPage() {
    const isFormEmpty = () => {
        return !form.name && !form.licenseNumber && !form.contact && (!form.vehicleId || form.vehicleId === "") && (!form.status || form.status === "Available")
    }
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
    const [showCancelConfirm, setShowCancelConfirm] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [successMsg, setSuccessMsg] = useState("")

    // 🔹 Load drivers + vehicles
    useEffect(() => {
        void loadData()
    }, [])

    const loadData = async () => {
        const token = localStorage.getItem("sherine_auth_token")
        if (!API_BASE) {
            console.error("NEXT_PUBLIC_API_BASE_URL is not configured")
            return
        }
        // Fetch drivers first
        let fetchedDrivers: Driver[] = []
		try {
			const res = await fetch(`${API_BASE}/api/Driver`, {
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
			const res = await fetch(`${API_BASE}/api/Vehicle`, {
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
				const res = await fetch(`${API_BASE}/api/Driver/${editingId}` , {
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
                setShowSuccess(true)
                setSuccessMsg("Driver updated successfully!")
			} else {
                // 🔹 Add new
				const res = await fetch(`${API_BASE}/api/Driver`, {
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
                setShowSuccess(true)
                setSuccessMsg("Driver added successfully!")
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
        setShowCancelConfirm(false)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const handleDelete = async (id: number) => {
		try {
            const token = localStorage.getItem("sherine_auth_token")
			const res = await fetch(`${API_BASE}/api/Driver/${id}`, {
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
                    {showSuccess && (
                        <div className="mb-2 p-2 rounded bg-green-100 text-green-700 text-center font-medium animate-fade-in">
                            {successMsg}
                            <button className="ml-2 text-green-900 underline" onClick={() => setShowSuccess(false)}>Close</button>
                        </div>
                    )}
                    <Input
                        placeholder="Driver Name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="border-2 border-neutral-400 rounded p-2 focus:border-primary focus:outline-none"
                    />
                    <Input
                        placeholder="License Number"
                        value={form.licenseNumber}
                        onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                        className="border-2 border-neutral-400 rounded p-2 focus:border-primary focus:outline-none"
                    />
                    <Input
                        placeholder="Contact Number"
                        value={form.contact}
                        onChange={(e) => setForm({ ...form, contact: e.target.value })}
                        className="border-2 border-neutral-400 rounded p-2 focus:border-primary focus:outline-none"
                    />
                    <select
                        aria-label="Driver Status"
                        className="border-2 border-neutral-400 rounded p-2 w-full focus:border-primary focus:outline-none"
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
                        className="border-2 border-neutral-400 rounded p-2 w-full focus:border-primary focus:outline-none"
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

                    <div className="flex gap-3 w-full mt-2">
                        <div className="flex gap-3 justify-center w-full">
                            <Button onClick={handleAddOrUpdate} className="min-w-[110px] px-4 py-1 flex items-center justify-center gap-2 text-base font-semibold text-white rounded-full bg-green-600 hover:bg-green-700 transition-all">
                                {editingId ? <Pencil className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
                                {editingId ? "Update Driver" : "Add Driver"}
                            </Button>
                            <Button
                                onClick={() => {
                                    if (isFormEmpty()) {
                                        window.location.href = "/dashboard/manager"
                                    } else {
                                        setShowCancelConfirm(true)
                                    }
                                }}
                                className="min-w-[110px] px-4 py-1 flex items-center justify-center gap-2 text-base font-semibold text-white rounded-full bg-red-600 hover:bg-red-700 transition-all"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                    {/* Cancel confirmation modal */}
                    {showCancelConfirm && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                            <div className="mb-2 p-3 rounded border border-neutral-300 bg-neutral-50 text-center font-medium shadow-sm flex flex-col items-center max-w-md mx-4 animate-fade-in">
                                <span className="mb-3 text-base text-neutral-700">Discard changes?</span>
                                <div className="flex gap-2 justify-center">
                                    <button className="py-2 px-4 text-base font-semibold rounded border border-red-500 text-red-600 bg-white hover:bg-red-50 shadow-sm transition" onClick={() => {
                                        setEditingId(null);
                                        setEditingVehicleId(null);
                                        setForm({ name: "", licenseNumber: "", contact: "", status: "Available", vehicleId: "" });
                                        setShowCancelConfirm(false);
                                        window.location.href = "/dashboard/manager"
                                    }}>Yes</button>
                                    <button className="py-2 px-4 text-base font-semibold rounded border border-green-500 text-green-700 bg-white hover:bg-green-50 shadow-sm transition" onClick={() => setShowCancelConfirm(false)}>No</button>
                                </div>
                            </div>
                        </div>
                    )}
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