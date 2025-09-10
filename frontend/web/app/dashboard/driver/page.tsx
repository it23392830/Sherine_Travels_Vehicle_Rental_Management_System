import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import Sidebar from "@/app/dashboard/driver/Sidebar"

export default function DriverDashboard() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole="driver" userName="Driver John" />

      <div className="flex-1 md:ml-64">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Driver Dashboard</h1>
            <p className="text-muted-foreground">Track your assigned rides and update ride statuses</p>
          </div>

          {/* Assigned Rides */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Assigned Rides</CardTitle>
                <CardDescription>Today's rides and details</CardDescription>
              </CardHeader>
              <CardContent>
                {[
                  {
                    route: "Kurunegala → Jaffna",
                    vehicle: "XYZ-456",
                    status: "In Progress",
                    badgeColor: "bg-primary",
                    eta: "ETA: 3:45 PM",
                  },
                  {
                    route: "Colombo → Galle",
                    vehicle: "ABC-123",
                    status: "Pending",
                    badgeColor: "bg-yellow-600",
                    eta: "Start: 2:00 PM",
                  },
                ].map((ride, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg mb-2">
                    <div>
                      <h4 className="font-semibold">{ride.route}</h4>
                      <p className="text-sm text-muted-foreground">{ride.vehicle}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={ride.badgeColor}>{ride.status}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">{ride.eta}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Vehicle Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Alerts</CardTitle>
                <CardDescription>Maintenance or route alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Maintenance Due</p>
                      <p className="text-xs text-muted-foreground">Vehicle XYZ-456 needs service in 2 days</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Vehicle Ready</p>
                      <p className="text-xs text-muted-foreground">Vehicle ABC-123 ready for next ride</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
