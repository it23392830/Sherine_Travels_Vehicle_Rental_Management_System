"use client";
import React, { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Sidebar from "@/app/dashboard/user/Sidebar";

interface Vehicle {
  id: number;
  type: string;
  number: string;
  seats: number;
  pricePerKmWithDriver: number;
  pricePerKmWithoutDriver: number;
  priceForOvernight: number;
  status: string;
  imageUrl1?: string | null;
  imageUrl2?: string | null;
}

function BookingsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vehicleId = searchParams.get("vehicleId");
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [km, setKm] = useState("");
  const [withDriver, setWithDriver] = useState(false);
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showChoice, setShowChoice] = useState(false);
  const [lastBooking, setLastBooking] = useState<any>(null);
  const [apiHost, setApiHost] = useState<string>("");

  const ENV_API_BASE = process.env.NEXT_PUBLIC_API_URL;
  const API_CANDIDATES = [ENV_API_BASE, "http://localhost:5152/api", "https://localhost:7126/api"].filter(Boolean) as string[];

  // Fetch vehicle details
  useEffect(() => {
    if (!vehicleId) {
      setError("No vehicle selected");
      return;
    }

    const fetchVehicle = async () => {
      let lastErr: any = null;
      for (const base of API_CANDIDATES) {
        try {
          const url = `${base}/vehicle/${vehicleId}`;
          const res = await fetch(url);
          if (!res.ok) {
            const msg = await res.text().catch(() => "");
            console.error("Vehicle GET failed:", base, res.status, msg);
            lastErr = new Error(`GET failed ${res.status}`);
            continue;
          }
          const data: Vehicle = await res.json();
          setVehicle(data);
          setApiHost(base.replace(/\/?api$/, ""));
          return;
        } catch (e) {
          console.error("Vehicle GET network error:", base, e);
          lastErr = e;
        }
      }
      if (lastErr) {
        setError("Failed to load vehicle details");
      }
    };

    fetchVehicle();
  }, [vehicleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!km) {
      setError("Please enter the number of kilometers.");
      return;
    }
    if (withDriver && !address) {
      setError("Please enter the pickup address.");
      return;
    }
    if (!vehicle) {
      setError("Vehicle not loaded");
      return;
    }

    setLoading(true);

    try {
      // Calculate the total price
      // For rental: if start is Jan 1 and end is Jan 3, that's 2 nights (Jan 1-2, Jan 2-3)
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      const nights = Math.max(0, Math.floor((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)));
      const perKmPrice = withDriver ? vehicle.pricePerKmWithDriver : vehicle.pricePerKmWithoutDriver;
      const totalPrice = (Number(km) * perKmPrice) + (nights * vehicle.priceForOvernight);

      // Create booking data
      const bookingData = {
        vehicleId: vehicle.id,
        startDate: startDate,
        endDate: endDate,
        kilometers: Number(km),
        withDriver: withDriver,
        paymentStatus: "Pending" // Will be updated based on user choice
      };

      // Store the calculated price for display in the modal
      const mockBooking = {
        id: Math.floor(Math.random() * 10000),
        bookingId: `BK${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
        totalPrice: totalPrice,
        message: "Booking created successfully",
        bookingData: bookingData
      };

      setLastBooking(mockBooking);
      setShowChoice(true);
    } catch (err) {
      setError("Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  const handlePayAtPickup = async () => {
    setLoading(true);
    try {
      // Create booking with PayAtPickup status
      const bookingData = {
        vehicleId: vehicle!.id,
        startDate: startDate,
        endDate: endDate,
        kilometers: Number(km),
        withDriver: withDriver,
        paymentStatus: "PayAtPickup"
      };

      // Make API call to create the booking
      let lastErr: any = null;
      for (const base of API_CANDIDATES) {
        try {
          const url = `${base}/booking`;
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('sherine_auth_token')}`
            },
            body: JSON.stringify(bookingData)
          });
          
          if (!res.ok) {
            const msg = await res.text().catch(() => "");
            console.error("Booking POST failed:", base, res.status, msg);
            lastErr = new Error(`POST failed ${res.status}`);
            continue;
          }
          
          const response = await res.json();
          console.log("Booking created successfully:", response);
          
          setShowChoice(false);
          router.push("/dashboard/user/mybookings");
          return;
        } catch (e) {
          console.error("Booking POST network error:", base, e);
          lastErr = e;
        }
      }
      
      if (lastErr) {
        setError("Failed to create booking. Please try again.");
      }
    } catch (err) {
      setError("Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPayment = async () => {
    setLoading(true);
    try {
      // Create booking with Pending payment status
      const bookingData = {
        vehicleId: vehicle!.id,
        startDate: startDate,
        endDate: endDate,
        kilometers: Number(km),
        withDriver: withDriver,
        paymentStatus: "Pending"
      };

      // Make API call to create the booking
      let lastErr: any = null;
      for (const base of API_CANDIDATES) {
        try {
          const url = `${base}/booking`;
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('sherine_auth_token')}`
            },
            body: JSON.stringify(bookingData)
          });
          
          if (!res.ok) {
            const msg = await res.text().catch(() => "");
            console.error("Booking POST failed:", base, res.status, msg);
            lastErr = new Error(`POST failed ${res.status}`);
            continue;
          }
          
          const response = await res.json();
          console.log("Booking created successfully:", response);
          
          setShowChoice(false);
          router.push(`/dashboard/user/payment?bookingId=${encodeURIComponent(response.bookingId || "")}`);
          return;
        } catch (e) {
          console.error("Booking POST network error:", base, e);
          lastErr = e;
        }
      }
      
      if (lastErr) {
        setError("Failed to create booking. Please try again.");
      }
    } catch (err) {
      setError("Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  // Calculate pricing
  const numKm = Number(km) || 0;
  // For rental: if start is Jan 1 and end is Jan 3, that's 2 nights (Jan 1-2, Jan 2-3)
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  const nights = Math.max(0, Math.floor((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)));
  const pricePerKm = withDriver ? (vehicle?.pricePerKmWithDriver || 0) : (vehicle?.pricePerKmWithoutDriver || 0);
  const overnightPrice = vehicle?.priceForOvernight || 0;
  const baseCost = pricePerKm * numKm;
  const overnightCost = overnightPrice * nights;
  const totalCost = baseCost + overnightCost;

  if (!vehicle) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar userRole="user" userName="Customer" />
        <div className="flex-1 md:ml-64 p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-6">Loading Vehicle Details...</h1>
            {error && <p className="text-red-500">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole="user" userName="Customer" />
      <div className="flex-1 md:ml-64 p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push(`/dashboard/user/vehicles?startDate=${startDate}&endDate=${endDate}`)}
          >
            ← Back to Vehicle Selection
          </Button>
          <h1 className="text-2xl font-bold">Book Vehicle</h1>
        </div>
        <div className="max-w-2xl mx-auto">
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Vehicle Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Type:</span>
                <span className="ml-2 font-medium">{vehicle.type}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Number:</span>
                <span className="ml-2 font-medium">{vehicle.number}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Seats:</span>
                <span className="ml-2 font-medium">{vehicle.seats}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <span className="ml-2 font-medium">{vehicle.status}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Booking Details</h2>
            <div className="mb-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground">Start Date:</span>
                  <span className="ml-2 font-medium">{new Date(startDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">End Date:</span>
                  <span className="ml-2 font-medium">{new Date(endDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Number of Nights:</span>
                  <span className="ml-2 font-medium">{nights}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="ml-2 font-medium">{nights + 1} days</span>
                </div>
              </div>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Number of Kilometers</label>
                <input
                  type="number"
                  value={km}
                  onChange={(e) => setKm(e.target.value)}
                  className="w-full border-2 border-neutral-400 rounded p-2 focus:border-primary focus:outline-none"
                  min="1"
                  required
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="withDriver"
                  checked={withDriver}
                  onChange={() => setWithDriver(!withDriver)}
                />
                <label htmlFor="withDriver" className="text-sm font-medium">With Driver</label>
              </div>
              
              {withDriver && (
                <div>
                  <label className="block text-sm font-medium mb-2">Pickup Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full border-2 border-neutral-400 rounded p-2 focus:border-primary focus:outline-none"
                    placeholder="Enter pickup address"
                    required={withDriver}
                  />
                </div>
              )}

              {/* Price Breakdown */}
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mt-6">
                <h3 className="font-semibold mb-3">Price Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Price per km ({withDriver ? 'with driver' : 'without driver'}):</span>
                    <span>LKR {pricePerKm} × {numKm} = <span className="text-green-600 font-medium">LKR {baseCost.toLocaleString()}</span></span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overnight price:</span>
                    <span>LKR {overnightPrice} × {nights} = <span className="text-green-600 font-medium">LKR {overnightCost.toLocaleString()}</span></span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total Amount:</span>
                    <span className="text-blue-600">LKR {totalCost.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading || !km} 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg py-3 text-lg shadow transition mt-6"
              >
                {loading ? "Processing..." : "Proceed to Payment"}
              </Button>
            </form>

            {/* Payment Choice Modal */}
            {showChoice && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md mx-4">
                  <h2 className="text-2xl font-bold mb-2 text-center">Booking Created</h2>
                  <p className="text-muted-foreground mb-4 text-center">How would you like to pay?</p>
                  
                  {lastBooking && (
                    <div className="rounded-md border p-4 bg-card mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Booking ID</span>
                        <span className="font-medium">{lastBooking.bookingId}</span>
                      </div>
                      <Separator className="my-3" />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-semibold">LKR {lastBooking.totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <Button 
                      variant="outline" 
                      onClick={handlePayAtPickup} 
                      disabled={loading}
                      className="w-full"
                    >
                      Pay at Pickup
                    </Button>
                    <Button 
                      onClick={handleProceedToPayment} 
                      disabled={loading}
                      className="w-full"
                    >
                      Proceed to Payment
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <BookingsPageContent />
    </Suspense>
  );
}