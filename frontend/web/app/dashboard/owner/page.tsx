"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Car,
  Users,
  DollarSign,
  FileBarChart,
  AlertCircle,
  TrendingUp,
  Settings,
  CheckCircle,
  XCircle,
} from "lucide-react"
import Sidebar from "@/app/dashboard/owner/Sidebar"

export default function OwnerDashboard() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar userRole="Owner" userName="Owner Fernando" />

      {/* Main Dashboard */}
      <div className="flex-1 md:ml-64">
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Owner Dashboard</h1>
            <p className="text-muted-foreground">Monitor finances, fleet, drivers, and overall operations</p>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">Rs. 124,500</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">45</div>
                <p className="text-xs text-muted-foreground">5 under maintenance</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">28</div>
                <p className="text-xs text-muted-foreground">3 inactive</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">7</div>
                <Badge variant="destructive" className="mt-1">Action Required</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Reports + Fleet Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Financial Reports</CardTitle>
                <CardDescription>Revenue and expense tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 text-center text-muted-foreground border rounded-lg">
                  <FileBarChart className="h-10 w-10 mx-auto mb-2" />
                  Charts and reports coming soon...
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fleet Status</CardTitle>
                <CardDescription>Vehicle availability overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Available</span>
                    </div>
                    <span className="text-sm font-medium">30 vehicles</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Car className="h-4 w-4 text-primary" />
                      <span className="text-sm">Booked</span>
                    </div>
                    <span className="text-sm font-medium">10 vehicles</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm">Maintenance</span>
                    </div>
                    <span className="text-sm font-medium">5 vehicles</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Management Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Owner Actions</CardTitle>
              <CardDescription>Quick access to management tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button className="h-20 flex flex-col items-center justify-center">
                  <DollarSign className="h-6 w-6 mb-2" />
                  View Reports
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Car className="h-6 w-6 mb-2" />
                  Manage Fleet
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Users className="h-6 w-6 mb-2" />
                  Manage Drivers
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
