"use client";
import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Dummy vehicle data for demonstration; replace with actual data fetching logic
const vehicle = {
  pricePerKmWithDriver: 100,
  pricePerKmWithoutDriver: 80,
  priceForOvernight: 2000,
};

function BookingsPageContent() {
  const router = useRouter();
  // Use Next.js useSearchParams hook for reliable query param access
  const searchParams = useSearchParams();
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const [km, setKm] = useState("");
  const [withDriver, setWithDriver] = useState(false);
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showChoice, setShowChoice] = useState(false);
  const [lastBooking, setLastBooking] = useState<any>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    // Only require kilometers and address if withDriver is checked
    if (!km) {
      setError("Please enter the number of kilometers.");
      return;
    }
    if (withDriver && !address) {
      setError("Please enter the pickup address.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowChoice(true);
      setLastBooking({ id: 1, bookingId: "B123", totalPrice: 12345, message: "Booking created successfully" });
    }, 1000);
  };

  const handlePayAtPickup = () => {
    setShowChoice(false);
    router.push("/dashboard/user");
  };

  const handleProceedToPayment = () => {
    setShowChoice(false);
    router.push(`/dashboard/user/payment?bookingId=${encodeURIComponent(lastBooking?.bookingId || "")}`);
  };

  // Calculation logic (overnight price always persists if dates are valid)
  let numKm = Number(km) || 0;
  let overnightCount = 0;
  let pricePerKm = withDriver ? vehicle.pricePerKmWithDriver : vehicle.pricePerKmWithoutDriver;
  let overnightPrice = vehicle.priceForOvernight;
  let overnightCost = 0;
  // Robust date parsing and overnight calculation
  function parseDate(dateStr) {
    // Accept YYYY-MM-DD or ISO format
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      // YYYY-MM-DD
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
    // fallback to Date constructor
    return new Date(dateStr);
  }
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (start && end && end > start) {
    // Calculate nights: each night between start and end
    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    overnightCount = diffDays > 0 ? diffDays : 0;
    overnightCost = overnightPrice * overnightCount;
  }
  const baseCost = pricePerKm * numKm;
  const totalCost = baseCost + overnightCost;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Book a Vehicle</h1>
      <Card className="max-w-md mx-auto p-6">
        {error && <p className="text-red-500 mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Kilometers</label>
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
              checked={withDriver}
              onChange={() => setWithDriver(!withDriver)}
            />
            <label>With Driver</label>
          </div>
          {withDriver && (
            <div>
              <label className="block text-sm font-medium">Pickup Address</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full border-2 border-neutral-400 rounded p-2 focus:border-primary focus:outline-none"
                required={withDriver}
              />
            </div>
          )}
          <div>
            {/* Price breakdown below form */}
            <div
              style={{
                background: '#FFF9E3', // butter yellow
                borderRadius: 8,
                border: '2px solid #FFE066',
                padding: 24,
                marginTop: 16,
                textAlign: 'left',
                fontSize: 16,
              }}
            >
              <div style={{ marginBottom: 8 }}>
                <strong>Price per kilometer:</strong> {pricePerKm} × {numKm} = <span style={{ color: 'green' }}>LKR {baseCost.toLocaleString()}</span>
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>Overnight price:</strong> {overnightPrice} × {overnightCount} = <span style={{ color: 'green' }}>LKR {overnightCost.toLocaleString()}</span>
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>Total amount payable:</strong> <span style={{ color: 'blue' }}>LKR {totalCost.toLocaleString()}</span>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg py-3 text-lg shadow transition" style={{marginTop: 16}}>
              {loading ? "Processing..." : "Book Vehicle"}
            </Button>
          </div>
        </form>
        {/* Custom Modal for Payment Choice */}
        {showChoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md mx-4 animate-fade-in">
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
                    <span className="font-semibold">LKR {lastBooking.totalPrice}</span>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Button variant="outline" onClick={handlePayAtPickup} className="w-full">Pay at Pickup</Button>
                <Button onClick={handleProceedToPayment} className="w-full">Proceed to Payment</Button>
              </div>
            </div>
          </div>
        )}
      </Card>
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
