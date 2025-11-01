import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function BookRidePage() {
  const router = useRouter();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return;
    }
    router.push(`/dashboard/user/vehicles?startDate=${startDate}&endDate=${endDate}`);
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-8 bg-white rounded shadow">
      <Card>
        <CardHeader>
          <CardTitle>Book a Ride</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <label className="block font-semibold">From (date)</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              data-testid="start-date-input"
            />
            <label className="block font-semibold">To (date)</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              data-testid="end-date-input"
            />
            {error && <div className="text-red-600 mt-2">{error}</div>}
            <Button onClick={handleNext}>Next</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
