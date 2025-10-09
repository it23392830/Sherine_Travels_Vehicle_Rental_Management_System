  // Add missing state hooks and mock vehicle data
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [km, setKm] = useState("");
  const [withDriver, setWithDriver] = useState(false);
  type Vehicle = {
    id: number;
    name: string;
    pricePerKmWithoutDriver: number;
    pricePerKmWithDriver: number;
    priceForOvernight: number;
  };
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const vehicles: Vehicle[] = [
    {
      id: 1,
      name: "Toyota Prius",
      pricePerKmWithoutDriver: 80,
      pricePerKmWithDriver: 100,
      priceForOvernight: 2000
    },
    {
      id: 2,
      name: "Suzuki Swift",
      pricePerKmWithoutDriver: 90,
      pricePerKmWithDriver: 120,
      priceForOvernight: 4000
    },
    {
      id: 3,
      name: "Nissan Caravan",
      pricePerKmWithoutDriver: 150,
      pricePerKmWithDriver: 200,
      priceForOvernight: 6000
    }
  ];
  // Calculate number of nights
  // For rental: if start is Jan 1 and end is Jan 3, that's 2 nights (Jan 1-2, Jan 2-3)
  function getNights() {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    return diff > 0 ? Math.floor(diff / (1000 * 60 * 60 * 24)) : 0;
  }
  const nights = getNights();
import { useState } from "react";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Dummy vehicle data for demonstration
const vehicle = {
  pricePerKmWithoutDriver: 50,
  pricePerKmWithDriver: 80,
  priceForOvernight: 2000,
};

function parseDate(dateStr: string) {
  // yyyy-mm-dd to Date (midnight)
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  if (isNaN(d) || isNaN(m) || isNaN(y)) return null;
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

export default function BookRidePage() {
  type Vehicle = {
      <div className="max-w-xl mx-auto mt-8 p-8 bg-white rounded shadow">
        <div className="space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              {/* ...existing code for step 1... */}
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <label className="block font-semibold">Select Vehicle</label>
              <select
                value={selectedVehicle ? selectedVehicle.id : ""}
                onChange={e => {
                  const v = vehicles.find(v => v.id === Number(e.target.value));
                  setSelectedVehicle(v || null);
                }}
                className="border-2 border-neutral-400 rounded p-2 w-full mb-2"
              >
                {/* ...existing code for select options... */}
              </select>
              {/* ...existing code for price breakdown... */}
              <button
                type="submit"
                className="w-full py-3 text-lg font-bold text-white rounded-md shadow-md transition-colors duration-200"
                style={{ backgroundColor: '#27ae60', border: 'none', outline: 'none', boxShadow: '0 2px 8px rgba(39,174,96,0.15)' }}
              >
                Book Vehicle
              </button>
            </div>
          )}
        </div>
      </div>
    );
}
        type: "SUV",
        seats: 6,
        pricePerKmWithoutDriver: 90,
        pricePerKmWithDriver: 120,
        priceForOvernight: 4000,
      },
    ]);
  }, []);
  const [nights, setNights] = useState(0);
  const [overnightPrice, setOvernightPrice] = useState(0);
  const [dateError, setDateError] = useState("");
  useEffect(() => {
    if (!startDate || !endDate || !selectedVehicle) {
      setNights(0);
      setOvernightPrice(0);
      setDateError("");
      return;
    }
    const d1 = parseDate(startDate);
    const d2 = parseDate(endDate);
    if (!d1 || !d2) {
      setDateError("Please enter valid dates.");
      setNights(0);
      setOvernightPrice(0);
      return;
    }
    if (d2 < d1) {
      setDateError("End date cannot be before start date.");
      setNights(0);
      setOvernightPrice(0);
      return;
    }
  setDateError("");
  // For rental: if start is Jan 1 and end is Jan 3, that's 2 nights (Jan 1-2, Jan 2-3)
  const nightsVal = Math.max(0, Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
  setNights(nightsVal);
  setOvernightPrice(selectedVehicle ? nightsVal * selectedVehicle.priceForOvernight : 0);
  }, [startDate, endDate, selectedVehicle.priceForOvernight]);
  const [km, setKm] = useState("");
  const [needDriver, setNeedDriver] = useState(false);
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");

  // Step 1: Date selection
  const handleNext = () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return;
    }
    if (dateError) {
      setError(dateError);
      return;
    }
    setError("");
      <div className="max-w-xl mx-auto mt-8 p-8 bg-white rounded shadow">
        {step === 1 && (
          <div className="space-y-4">
            {/* ...existing code for step 1 (date pickers, address, etc.)... */}
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <label className="block font-semibold">Select Vehicle</label>
            <select
              value={selectedVehicle ? selectedVehicle.id : ""}
              onChange={e => {
                const v = vehicles.find(v => v.id === Number(e.target.value));
                setSelectedVehicle(v || null);
              }}
              className="border-2 border-neutral-400 rounded p-2 w-full mb-2"
            >
              {/* ...existing code for select options... */}
            </select>
            {/* ...existing code for price breakdown... */}
            <button
              type="submit"
              className="w-full py-3 text-lg font-bold text-white rounded-md shadow-md transition-colors duration-200"
              style={{ backgroundColor: '#27ae60', border: 'none', outline: 'none', boxShadow: '0 2px 8px rgba(39,174,96,0.15)' }}
            >
              Book Vehicle
            </button>
          </div>
        )}
      </div>
  );
}
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="border-2 border-neutral-400 rounded p-2 w-full"
              />
              <label className="block font-semibold">To (date)</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="border-2 border-neutral-400 rounded p-2 w-full"
              />
              <div className="mb-2">Number of nights: <span className="font-bold">{nights}</span></div>
              <div className="mb-2">Overnight Price: <span className="font-bold">Rs. {overnightPrice}</span></div>
              {dateError && <div className="text-red-600 mt-2">{dateError}</div>}
              <Button onClick={handleNext}>Next</Button>
              {error && <div className="text-red-600 mt-2">{error}</div>}
            </div>
                      <button
                        type="submit"
                        className="w-full py-3 text-lg font-bold text-white rounded-md shadow-md transition-colors duration-200"
                        style={{ backgroundColor: '#27ae60', border: 'none', outline: 'none', boxShadow: '0 2px 8px rgba(39,174,96,0.15)' }}
                      >
                        Book Vehicle
                      </button>
                  const v = vehicles.find(v => v.id === Number(e.target.value));
                  setSelectedVehicle(v || null);
                }}
                className="border-2 border-neutral-400 rounded p-2 w-full mb-2"
              >
                <option value="">-- Select --</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.type} (Seats: {v.seats})
                  </option>
                ))}
              </select>
              {selectedVehicle && (
                <div className="mb-2">Selected Vehicle: <span className="font-bold">{selectedVehicle.type}</span></div>
              )}
              <div className="mb-2">Number of nights: <span className="font-bold">{nights}</span></div>
              <div className="mb-2">Overnight Price: <span className="font-bold">Rs. {overnightPrice}</span></div>
              {dateError && <div className="text-red-600 mt-2">{dateError}</div>}
              <Input
                type="number"
                placeholder="Number of kilometers"
                value={km}
                onChange={e => setKm(e.target.value)}
                className="border-2 border-neutral-400 rounded p-2"
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={needDriver}
                  onChange={e => setNeedDriver(e.target.checked)}
                  id="needDriver"
                />
                <label htmlFor="needDriver">Need a driver?</label>
              </div>
              {needDriver && (
                <>
                  <Input
                    placeholder="Address"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="border-2 border-neutral-400 rounded p-2"
                  />
                  <Input
                    placeholder="Contact Number"
                    value={contact}
                    onChange={e => setContact(e.target.value)}
                    className="border-2 border-neutral-400 rounded p-2"
                  />
                </>
              )}
              <Button onClick={handleCalculate}>Calculate Total</Button>
              {error && <div className="text-red-600 mt-2">{error}</div>}
              {total > 0 && (
                <div className="mt-4 p-3 rounded bg-yellow-100 border border-yellow-300 text-yellow-900 font-bold text-lg">
                  Total Amount: Rs. {total}
                </div>
              )}
            </div>
          )}
        </CardContent>
  return (
    <div className="max-w-xl mx-auto mt-8 p-8 bg-white rounded shadow">
      <div className="space-y-4">
        <label className="block font-semibold">From (date)</label>
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          className="border-2 border-neutral-400 rounded p-2 w-full mb-2"
        />
        <label className="block font-semibold">To (date)</label>
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          className="border-2 border-neutral-400 rounded p-2 w-full mb-2"
        />
        <label className="block font-semibold">Kilometers</label>
        <input
          type="number"
          value={km}
          onChange={e => setKm(e.target.value)}
          className="border-2 border-neutral-400 rounded p-2 w-full mb-2"
        />
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={withDriver}
            onChange={e => setWithDriver(e.target.checked)}
            className="mr-2"
          />
          With Driver
        </label>
        <label className="block font-semibold">Select Vehicle</label>
        <select
          value={selectedVehicle ? selectedVehicle.id : ""}
          onChange={e => {
            const v = vehicles.find(v => v.id === Number(e.target.value));
            setSelectedVehicle(v || null);
          }}
          className="border-2 border-neutral-400 rounded p-2 w-full mb-2"
        >
          <option value="">Select a vehicle</option>
          {vehicles.map(v => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
        {/* Price breakdown */}
        {selectedVehicle && (
          <div className="bg-yellow-50 border border-yellow-300 rounded p-4 mb-4">
            <div className="mb-2 font-bold">
              Price per kilometer: {withDriver ? selectedVehicle.pricePerKmWithDriver : selectedVehicle.pricePerKmWithoutDriver} × {km || 0} = <span className="text-green-700 font-bold">LKR {((withDriver ? selectedVehicle.pricePerKmWithDriver : selectedVehicle.pricePerKmWithoutDriver) * (parseInt(km) || 0))}</span>
            </div>
            {(startDate && endDate) && (
              <div className="mb-2 font-bold">
                Overnight price: {selectedVehicle.priceForOvernight} × {nights} = <span className="text-green-700 font-bold">LKR {selectedVehicle.priceForOvernight * nights}</span>
              </div>
            )}
            <div className="mb-2 font-bold">
              Total amount payable: <span className="text-blue-700 font-bold">LKR {((withDriver ? selectedVehicle.pricePerKmWithDriver : selectedVehicle.pricePerKmWithoutDriver) * (parseInt(km) || 0) + ((startDate && endDate) ? (selectedVehicle.priceForOvernight * nights) : 0))}</span>
            </div>
          </div>
        )}
        <button
          type="submit"
          className="w-full py-3 text-lg font-bold text-white rounded-md shadow-md transition-colors duration-200"
          style={{ backgroundColor: '#27ae60', border: 'none', outline: 'none', boxShadow: '0 2px 8px rgba(39,174,96,0.15)' }}
        >
          Book Vehicle
        </button>
      </div>
    </div>
  );
}
