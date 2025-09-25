"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface BookingResponseDto {
  id: number;
  bookingId: string;
  totalPrice: number;
  message: string;
}

export default function BookingsPage() {
  const [dates, setDates] = useState({ start: "", end: "" });
  const [km, setKm] = useState("");
  const [withDriver, setWithDriver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastBooking, setLastBooking] = useState<BookingResponseDto | null>(null);
  const [showChoice, setShowChoice] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const vehicleId = useMemo(() => {
    const v = params?.get("vehicleId");
    return v ? parseInt(v, 10) : undefined;
  }, [params]);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!dates.start || !dates.end || !km) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        vehicleId: vehicleId || 0,
        startDate: dates.start,
        endDate: dates.end,
        kilometers: Number(km),
        withDriver,
      };
      const data = await apiFetch<BookingResponseDto>("/booking", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setLastBooking(data);
      setShowChoice(true);
    } catch (err: any) {
      setError(err?.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  const handlePayAtPickup = () => {
    setShowChoice(false);
    toast({ title: "Booking Successful", description: "Driver: Pending. Redirecting to Dashboard..." });
    router.push("/dashboard/user");
  };

  const handleProceedToPayment = () => {
    setShowChoice(false);
    router.push(`/dashboard/user/payment?bookingId=${encodeURIComponent(lastBooking?.bookingId || "")}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Book a Vehicle</h1>

      <Card className="max-w-md mx-auto p-6">
        {error && <p className="text-red-500 mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Start Date</label>
            <input
              type="date"
              value={dates.start}
              onChange={(e) => setDates({ ...dates, start: e.target.value })}
              className="w-full border rounded p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">End Date</label>
            <input
              type="date"
              value={dates.end}
              onChange={(e) => setDates({ ...dates, end: e.target.value })}
              className="w-full border rounded p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Kilometers</label>
            <input
              type="number"
              value={km}
              onChange={(e) => setKm(e.target.value)}
              className="w-full border rounded p-2"
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

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Processing..." : "Book Vehicle"}
          </Button>
        </form>
      </Card>

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
    </div>
  );
}
