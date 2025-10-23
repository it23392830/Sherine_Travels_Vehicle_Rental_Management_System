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
  pricePerKmWithoutDriver: number
  pricePerKmWithDriver: number
  priceForOvernight: number
  imageUrl1?: string | null
  imageUrl2?: string | null
}

// ✅ Preferred API base from env (Azure first, then local)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://sherinetravels-api-frcsb2d3drabgbbd.eastasia-01.azurewebsites.net'

export default function AddVehiclePage() {
  const [showDiscard, setShowDiscard] = useState(false)
  const [pendingCancelAction, setPendingCancelAction] = useState<"dashboard"|"list"|null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [form, setForm] = useState({
    type: "",
    number: "",
    status: "Available",
    seats: "",
    pricePerKmWithoutDriver: "",
    pricePerKmWithDriver: "",
    priceForOvernight: "",
    imageUrl1: "",
    imageUrl2: "",
    imageFile1: null as File | null,
    imageFile2: null as File | null,
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  // 🔹 Load vehicles from backend (resilient across backend profiles)
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const base = API_BASE_URL
        if (!base) {
          console.error("NEXT_PUBLIC_API_BASE_URL is not set. Please configure your environment.")
          return
        }

        const res = await fetch(`${base}/api/Vehicle`)
        if (!res.ok) {
          const msg = await res.text().catch(() => "")
          throw new Error(`GET /vehicle failed: ${res.status} ${msg}`)
        }
        const data: Vehicle[] = await res.json()
        setVehicles(data)
      } catch (error) {
        console.error(error)
      }
    }
    fetchVehicles()
  }, [])

  const handleAddOrUpdate = async () => {
  console.log("Form values:", JSON.stringify(form, null, 2))
  if (
  !form.type.trim() ||
  !form.number.trim() ||
  form.seats === "" || isNaN(parseInt(form.seats)) || parseInt(form.seats) < 1 ||
  form.pricePerKmWithoutDriver === "" || isNaN(parseFloat(form.pricePerKmWithoutDriver)) || parseFloat(form.pricePerKmWithoutDriver) < 0 ||
  form.pricePerKmWithDriver === "" || isNaN(parseFloat(form.pricePerKmWithDriver)) || parseFloat(form.pricePerKmWithDriver) < 0 ||
  form.priceForOvernight === "" || isNaN(parseFloat(form.priceForOvernight)) || parseFloat(form.priceForOvernight) < 0
  ) {
    setErrorMsg("Please fill in all required fields with valid values.")
    console.warn("Validation failed", form)
    return
  }

  const formData = new FormData()
  console.log("FormData before send:", Array.from(formData.entries()))
  formData.append("Type", form.type)
  formData.append("Number", form.number)
  formData.append("Status", form.status)
  formData.append("Seats", String(Number(form.seats)))
  formData.append("PricePerKmWithoutDriver", String(Number(form.pricePerKmWithoutDriver)))
  formData.append("PricePerKmWithDriver", String(Number(form.pricePerKmWithDriver)))
  formData.append("PriceForOvernight", String(Number(form.priceForOvernight)))
  if (form.imageUrl1) formData.append("ImageUrl1", form.imageUrl1)
  if (form.imageUrl2) formData.append("ImageUrl2", form.imageUrl2)
  if (form.imageFile1) formData.append("ImageFile1", form.imageFile1)
  if (form.imageFile2) formData.append("ImageFile2", form.imageFile2)

    try {
      setErrorMsg("")
      const token = localStorage.getItem("sherine_auth_token")
      console.log("Token:", token)

      if (editingId) {
        // 🔹 Update
        const res = await fetch(`${API_BASE_URL}/api/Vehicle/${editingId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        })
        console.log("Update response status:", res.status)
        if (!res.ok) {
          const msg = await res.text().catch(() => "")
          setErrorMsg(`Update vehicle failed: ${res.status} ${msg}`)
          console.error("Update vehicle failed:", res.status, msg)
          return
        }

        const updatedVehicle: Vehicle = await res.json()
        setVehicles((prev) => prev.map((v) => (v.id === editingId ? updatedVehicle : v)))
        setEditingId(null)
        setShowSuccess(true)
        setSuccessMsg("Vehicle updated successfully!")
      } else {
        // 🔹 Add new
        const res = await fetch(`${API_BASE_URL}/api/Vehicle`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        })
        console.log("Add response status:", res.status)
        if (!res.ok) {
          const msg = await res.text().catch(() => "")
          setErrorMsg(`Add vehicle failed: ${res.status} ${msg}`)
          console.error("Add vehicle failed:", res.status, msg)
          return
        }

        const newVehicle: Vehicle = await res.json()
        setVehicles((prev) => [...prev, newVehicle])
        setShowSuccess(true)
        setSuccessMsg("Vehicle added successfully!")
        // Clear file inputs manually
        const fileInputs = document.querySelectorAll<HTMLInputElement>("input[type='file']")
        fileInputs.forEach(input => { input.value = "" })
      }

      // reset form
      setForm({ 
        type: "", 
        number: "", 
        status: "Available", 
        seats: "", 
        pricePerKmWithoutDriver: "", 
        pricePerKmWithDriver: "", 
        priceForOvernight: "", 
        imageUrl1: "", 
        imageUrl2: "", 
        imageFile1: null, 
        imageFile2: null 
      })
      setErrorMsg("")
    } catch (error) {
      console.error(error)
      setErrorMsg("Unexpected error: " + error)
    }
  }

  const handleEdit = (vehicle: Vehicle) => {
    setForm({
      type: vehicle.type,
      number: vehicle.number,
      status: vehicle.status,
      seats: vehicle.seats.toString(),
      pricePerKmWithoutDriver: vehicle.pricePerKmWithoutDriver.toString(),
      pricePerKmWithDriver: vehicle.pricePerKmWithDriver.toString(),
      priceForOvernight: vehicle.priceForOvernight.toString(),
      imageUrl1: vehicle.imageUrl1 ?? "",
      imageUrl2: vehicle.imageUrl2 ?? "",
      imageFile1: null,
      imageFile2: null,
    })
    setEditingId(vehicle.id)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Helper to check if any field is filled
  const isFormDirty = () => {
    // Only consider dirty if at least one field is non-empty/non-default
    return (
      form.type.trim() !== "" ||
      form.number.trim() !== "" ||
      form.seats !== "" ||
      form.pricePerKmWithoutDriver !== "" ||
      form.pricePerKmWithDriver !== "" ||
      form.priceForOvernight !== "" ||
      form.imageFile1 !== null ||
      form.imageFile2 !== null
    );
  };

  // Cancel button handler
  const handleCancel = (mode: "add"|"edit") => {
    if (!isFormDirty()) {
      // If form is empty, just cancel immediately
      if (mode === "add") {
        window.location.href = "/dashboard/manager";
      } else {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        setEditingId(null);
        setForm({ type: "", number: "", status: "Available", seats: "", pricePerKmWithoutDriver: "", pricePerKmWithDriver: "", priceForOvernight: "", imageUrl1: "", imageUrl2: "", imageFile1: null, imageFile2: null });
      }
      return;
    }
    // Only show discard popup if form is dirty
    setShowDiscard(true);
    setPendingCancelAction(mode === "add" ? "dashboard" : "list");
  };

  // Confirm discard changes
  const confirmDiscard = () => {
    setShowDiscard(false);
    setForm({ type: "", number: "", status: "Available", seats: "", pricePerKmWithoutDriver: "", pricePerKmWithDriver: "", priceForOvernight: "", imageUrl1: "", imageUrl2: "", imageFile1: null, imageFile2: null });
    setEditingId(null);
    if (pendingCancelAction === "dashboard") {
      window.location.href = "/dashboard/manager";
    } else if (pendingCancelAction === "list") {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
    setPendingCancelAction(null);
  };

  // Cancel discard changes
  const cancelDiscard = () => {
    setShowDiscard(false);
    setPendingCancelAction(null);
  };

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem("sherine_auth_token")
      const res = await fetch(`${API_BASE_URL}/api/Vehicle/${id}`, {
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
      <h1 className="text-2xl font-bold mb-6">Add a Vehicle</h1>

      {/* Add / Edit Form */}
      <Card className="mb-6">
        {/* Only one success message will be shown below in CardContent */}
        <CardHeader>
          <CardTitle>{editingId ? "Update Vehicle" : "Add Vehicle"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
        {/* Discard changes popup */}
        {showDiscard && (
          <div className="mb-2 p-3 rounded border border-neutral-300 bg-neutral-50 text-center font-medium shadow-sm flex flex-col items-center">
            <span className="mb-3 text-base text-neutral-700">Discard changes?</span>
            <div className="flex gap-2 justify-center">
              <button className="px-4 py-1 rounded bg-red-100 text-red-700 font-semibold hover:bg-red-200 border border-red-300" onClick={confirmDiscard}>Yes</button>
              <button className="px-4 py-1 rounded bg-green-100 text-green-700 font-semibold hover:bg-green-200 border border-green-300" onClick={cancelDiscard}>No</button>
            </div>
          </div>
        )}
        {/* Success message will only be shown once above the form */}
        {showSuccess && (
          <div className="mb-2 p-2 rounded bg-green-100 text-green-700 text-center font-medium animate-fade-in">
            {successMsg}
            <button className="ml-2 text-green-900 underline" onClick={() => setShowSuccess(false)}>Close</button>
          </div>
        )}
        {errorMsg && (
          <div className="mb-2 p-2 rounded bg-red-100 text-red-700 text-center font-medium animate-fade-in">
            {errorMsg}
          </div>
        )}
          <Input
            placeholder="Vehicle Type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          />
          <Input
            placeholder="Vehicle Number"
            value={form.number}
            onChange={(e) => setForm({ ...form, number: e.target.value })}
          />
          <Input
            type="number"
            min={0}
            placeholder="Seats"
            value={form.seats}
            onChange={(e) => setForm({ ...form, seats: e.target.value })}
          />
          <Input
            type="number"
            min={0}
            placeholder="Price per km (Vehicle Only)"
            value={form.pricePerKmWithoutDriver}
            onChange={(e) => setForm({ ...form, pricePerKmWithoutDriver: e.target.value })}
          />
          <Input
            type="number"
            min={0}
            placeholder="Price per km (Vehicle + Driver)"
            value={form.pricePerKmWithDriver}
            onChange={(e) => setForm({ ...form, pricePerKmWithDriver: e.target.value })}
          />
          <Input
            type="number"
            min={0}
            placeholder="Price for Overnights (LKR)"
            value={form.priceForOvernight}
            onChange={(e) => setForm({ ...form, priceForOvernight: e.target.value })}
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
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="Available">Available</option>
            <option value="In Service">In Service</option>
            <option value="Out of Service">Out of Service</option>
          </select>

          <div className="flex gap-3 w-full mt-2">
            <div className="flex gap-3 justify-center w-full">
              <Button onClick={handleAddOrUpdate} className="min-w-[110px] px-4 py-1 flex items-center justify-center gap-2 text-base font-semibold text-white rounded-full bg-green-600 hover:bg-green-700 transition-all">
                <PlusCircle className="h-4 w-4" />
                {editingId ? "Update Vehicle" : "Add Vehicle"}
              </Button>
              <Button onClick={() => handleCancel(editingId ? "edit" : "add")} className="min-w-[110px] px-4 py-1 flex items-center justify-center gap-2 text-base font-semibold text-white rounded-full bg-red-600 hover:bg-red-700 transition-all">
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Added Vehicles Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Added Vehicles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              {/* Vehicle Images */}
              <div className="relative h-48 bg-gray-100">
                {vehicle.imageUrl1 ? (
                  <>
                    <img 
                      src={`${API_BASE_URL.replace('/api', '')}${vehicle.imageUrl1}`} 
                      alt={`${vehicle.type} vehicle`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Hide the image if it fails to load and show fallback
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100" style={{display: 'none'}}>
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-2 bg-blue-200 rounded-full flex items-center justify-center">
                          <span className="text-2xl">🚗</span>
                        </div>
                        <p className="text-gray-500 text-sm">Image not available</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-2 bg-blue-200 rounded-full flex items-center justify-center">
                        <span className="text-2xl">🚗</span>
                      </div>
                      <p className="text-gray-500 text-sm">No image available</p>
                    </div>
                  </div>
                )}
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    vehicle.status === 'Available' ? 'bg-green-100 text-green-800' :
                    vehicle.status === 'In Service' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {vehicle.status}
                  </span>
                </div>
                {/* Action Buttons */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="bg-white/90 hover:bg-white"
                    onClick={() => handleEdit(vehicle)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    className="bg-red-500/90 hover:bg-red-600"
                    onClick={() => handleDelete(vehicle.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="mb-3">
                  <h3 className="font-semibold text-lg text-gray-900">{vehicle.type}</h3>
                  <p className="text-sm text-gray-600">Vehicle #{vehicle.number}</p>
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-gray-500">👥 {vehicle.seats} seats</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-600">Vehicle Only:</span>
                    <span className="font-medium text-green-600">LKR {vehicle.pricePerKmWithoutDriver.toLocaleString()}/km</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-600">With Driver:</span>
                    <span className="font-medium text-blue-600">LKR {vehicle.pricePerKmWithDriver.toLocaleString()}/km</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-600">Overnight:</span>
                    <span className="font-medium text-purple-600">LKR {vehicle.priceForOvernight.toLocaleString()}/night</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
