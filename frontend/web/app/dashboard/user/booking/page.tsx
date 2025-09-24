"use client";

import { useState } from "react";

interface BookingResponse {
  price: number;
  bookingId: string;
  message: string;
}

export default function BookingsPage() {
  const [dates, setDates] = useState({ start: "", end: "" });
  const [km, setKm] = useState("");
  const [withDriver, setWithDriver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState<BookingResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setConfirmation(null);

    if (!dates.start || !dates.end || !km) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("sherine_auth_token")}`,
        },
        body: JSON.stringify({
          startDate: dates.start,
          endDate: dates.end,
          kilometers: Number(km),
          withDriver,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create booking");
      }

      const data: BookingResponse = await response.json();
      setConfirmation(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

      <div className="max-w-md mx-auto p-6 rounded-2xl shadow-lg bg-white">
        <h2 className="text-xl font-semibold mb-4">Vehicle Booking</h2>

        {error && <p className="text-red-500 mb-3">{error}</p>}
        {confirmation && (
          <div className="p-3 mb-4 rounded bg-green-100 text-green-700">
            <p>{confirmation.message}</p>
            <p>
              <strong>Booking ID:</strong> {confirmation.bookingId}
            </p>
            <p>
              <strong>Price:</strong> ${confirmation.price}
            </p>
          </div>
        )}

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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Book Vehicle"}
          </button>
        </form>
      </div>
    </div>
  );
}
