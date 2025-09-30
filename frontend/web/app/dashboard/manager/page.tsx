"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Car, Users, MapPin, Clock, TrendingUp, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import Sidebar from "@/app/dashboard/manager/Sidebar"
import { AuthService } from "@/lib/auth"

export default function ManagerDashboard() {
  const [displayName, setDisplayName] = useState<string>("Manager")
  const [roleName, setRoleName] = useState<string>("Manager")

  useEffect(() => {
    const user = AuthService.getCurrentUser()
    if (user) {
      setDisplayName(user.fullName || user.email?.split("@")[0] || "Manager")
      setRoleName(user.role || "Manager")
    }
  }, [])

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar userRole={roleName} userName={displayName} />

      {/* Main Dashboard */}
      <div className="flex-1 md:ml-64">
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Fleet Management Dashboard</h1>
            <p className="text-muted-foreground">Oversee fleet operations and driver management</p>
          </div>

          {/* Fleet Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">15</div>
                <p className="text-xs text-muted-foreground">4 on break, 2 off duty</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fleet Utilization</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">78%</div>
                <p className="text-xs text-muted-foreground">20 of 23 vehicles active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Routes</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">42</div>
                <p className="text-xs text-muted-foreground">13 completed, 6 in progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">12m</div>
                <p className="text-xs text-muted-foreground">-2m from yesterday</p>
              </CardContent>
            </Card>
          </div>

          {/* Driver Status + Fleet Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Driver Status */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Driver Status & Assignments</CardTitle>
                <CardDescription>Current driver availability and active routes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: "Nuwan Kumar",
                      route: "Kurunegala → Jaffna • Vehicle XYZ-456",
                      status: "Active",
                      badgeColor: "bg-primary",
                      eta: "Strat: 6:30 AM",
                    },
                    {
                      name: "Milinda Wilson",
                      route: "Break • Vehicle Ml-7456",
                      status: "On Break",
                      badgeColor: "bg-yellow-600",
                      eta: "Back: 3:00 PM",
                    },
                    {
                      name: "Aruna Dissanayake",
                      route: "Anuradhapura → Galle • Vehicle KLo98",
                      status: "Active",
                      badgeColor: "bg-primary",
                      eta: "Strat: 8:45 PM",
                    },
                  ].map((driver, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{driver.name}</h4>
                          <p className="text-sm text-muted-foreground">{driver.route}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={driver.badgeColor}>{driver.status}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">{driver.eta}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Fleet Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Fleet Alerts</CardTitle>
                <CardDescription>Maintenance and operational alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Maintenance Due</p>
                      <p className="text-xs text-muted-foreground">Vehicle Vby-780o needs service in 2 days</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <Clock className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Route Delay</p>
                      <p className="text-xs text-muted-foreground">Galle route experiencing 15min delays</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Service Complete</p>
                      <p className="text-xs text-muted-foreground">Vehicle KLo98 back in service</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Route Performance + Vehicle Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Route Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Route Performance</CardTitle>
                <CardDescription>Most popular routes and efficiency metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                    <div>
                      <h4 className="font-semibold">Kurunegala ↔ Jaffna</h4>
                      <p className="text-sm text-muted-foreground">8 trips today</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-primary">98% On-time</span>
                      <p className="text-xs text-muted-foreground">Avg: 4h 15m</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Anuradhapura ↔ Galle</h4>
                      <p className="text-sm text-muted-foreground">1 trips today</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium">75% On-time</span>
                      <p className="text-xs text-muted-foreground">Avg: 22h 30m</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Mathara ↔ Kandy</h4>
                      <p className="text-sm text-muted-foreground">4 trips today</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium">92% On-time</span>
                      <p className="text-xs text-muted-foreground">Avg: 3h 45m</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Status */}
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Status Overview</CardTitle>
                <CardDescription>Fleet condition and availability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Operational</span>
                    </div>
                    <span className="text-sm font-medium">15 vehicles</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">Maintenance</span>
                    </div>
                    <span className="text-sm font-medium">4 vehicles</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm">Out of Service</span>
                    </div>
                    <span className="text-sm font-medium">4 vehicles</span>
                  </div>
                  <div className="pt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full w-[78%]"></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">78% fleet availability</p>
                  </div>
                  <div className="pt-2">
                    <h5 className="text-sm font-medium mb-2">Fuel Efficiency</h5>
                    <div className="flex items-center justify-between text-sm">
                      <span>Average MPG</span>
                      <span className="font-medium text-primary">28.5</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Management Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Fleet Management Actions</CardTitle>
              <CardDescription>Quick access to management tools and controls</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button className="h-20 flex flex-col items-center justify-center">
                  <Users className="h-6 w-6 mb-2" />
                  Assign Drivers
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center bg-transparent">
                  <Car className="h-6 w-6 mb-2" />
                  Schedule Maintenance
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center bg-transparent">
                  <MapPin className="h-6 w-6 mb-2" />
                  Route Planning
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center bg-transparent">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  Performance Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
