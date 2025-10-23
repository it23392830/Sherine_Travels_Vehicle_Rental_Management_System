"use client"

import React, { useEffect, useState } from "react"
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
  Download,
  RefreshCw,
} from "lucide-react"
import Sidebar from "@/app/dashboard/owner/Sidebar"
import { apiFetch } from "@/lib/api"

// Interfaces for Owner Dashboard data
interface OwnerDashboardStats {
  totalRevenue: number
  monthlyGrowth: number
  totalVehicles: number
  availableVehicles: number
  bookedVehicles: number
  maintenanceVehicles: number
  totalDrivers: number
  activeDrivers: number
  inactiveDrivers: number
  totalBookings: number
  pendingRequests: number
  completedBookings: number
}

interface RecentBooking {
  id: number
  bookingId: string
  customerName: string
  vehicleType: string
  startDate: string
  endDate: string
  totalPrice: number
  status: string
  paymentStatus: string
}

interface FinancialSummary {
  totalRevenue: number
  monthlyRevenue: number
  pendingPayments: number
  completedPayments: number
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://sherinetravels-api-frcsb2d3drabgbbd.eastasia-01.azurewebsites.net'

export default function OwnerDashboard() {
  // State management
  const [stats, setStats] = useState<OwnerDashboardStats | null>(null)
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([])
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Load dashboard data on component mount
  useEffect(() => {
    void loadOwnerDashboard()
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(() => {
      void refreshDashboard()
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  // Main function to load all dashboard data
  const loadOwnerDashboard = async () => {
    const token = localStorage.getItem("sherine_auth_token")
    if (!token) {
      console.error("No auth token found")
      setLoading(false)
      return
    }

    try {
      // Fetch data from multiple endpoints similar to Manager Dashboard
      const [resDrivers, resVehicles, resBookings] = await Promise.all([
        fetch(`${API_BASE}/api/Manager/drivers`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/Manager/vehicles`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/Manager/bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      const rawDrivers = resDrivers.ok ? await resDrivers.json() : []
      const rawVehicles = resVehicles.ok ? await resVehicles.json() : []
      const rawBookings = resBookings.ok ? await resBookings.json() : []

      // Process and calculate owner-specific statistics
      await processOwnerData(rawDrivers, rawVehicles, rawBookings)
      setLastUpdated(new Date())
    } catch (err) {
      console.error("Owner dashboard load failed:", err)
    } finally {
      setLoading(false)
    }
  }

  // Process raw data into owner dashboard statistics
  const processOwnerData = async (drivers: any[], vehicles: any[], bookings: any[]) => {
    // Calculate financial metrics
    const totalRevenue = bookings.reduce((sum: number, booking: any) => {
      const price = booking.TotalPrice || booking.totalPrice || 0
      return sum + price
    }, 0)

    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const monthlyRevenue = bookings
      .filter((booking: any) => {
        const bookingDate = new Date(booking.StartDate || booking.startDate)
        return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear
      })
      .reduce((sum: number, booking: any) => sum + (booking.TotalPrice || booking.totalPrice || 0), 0)

    const monthlyGrowth = totalRevenue > 0 ? ((monthlyRevenue / totalRevenue) * 100) : 0

    // Vehicle statistics
    const totalVehicles = vehicles.length
    const availableVehicles = vehicles.filter((v: any) => 
      (v.Status || v.status) === "Available"
    ).length
    const bookedVehicles = vehicles.filter((v: any) => 
      (v.Status || v.status) === "Booked" || (v.Status || v.status) === "In Service"
    ).length
    const maintenanceVehicles = vehicles.filter((v: any) => 
      (v.Status || v.status) === "Out of Service" || (v.Status || v.status) === "Maintenance"
    ).length

    // Driver statistics
    const totalDrivers = drivers.length
    const activeDrivers = drivers.filter((d: any) => 
      (d.Status || d.status) === "Available" || (d.Status || d.status) === "Assigned"
    ).length
    const inactiveDrivers = totalDrivers - activeDrivers

    // Booking statistics
    const totalBookings = bookings.length
    const pendingRequests = bookings.filter((b: any) => 
      (b.Status || b.status) === "Pending"
    ).length
    const completedBookings = bookings.filter((b: any) => 
      (b.Status || b.status) === "Completed"
    ).length

    // Set dashboard statistics
    setStats({
      totalRevenue,
      monthlyGrowth,
      totalVehicles,
      availableVehicles,
      bookedVehicles,
      maintenanceVehicles,
      totalDrivers,
      activeDrivers,
      inactiveDrivers,
      totalBookings,
      pendingRequests,
      completedBookings,
    })

    // Set financial summary
    const pendingPayments = bookings
      .filter((b: any) => (b.PaymentStatus || b.paymentStatus) === "Pending")
      .reduce((sum: number, b: any) => sum + (b.TotalPrice || b.totalPrice || 0), 0)
    
    const completedPayments = bookings
      .filter((b: any) => (b.PaymentStatus || b.paymentStatus) === "PaidOnline" || (b.PaymentStatus || b.paymentStatus) === "Paid")
      .reduce((sum: number, b: any) => sum + (b.TotalPrice || b.totalPrice || 0), 0)

    setFinancialSummary({
      totalRevenue,
      monthlyRevenue,
      pendingPayments,
      completedPayments,
    })

    // Set recent bookings (last 5)
    const recentBookingsData = bookings
      .slice(0, 5)
      .map((booking: any) => ({
        id: booking.Id || booking.id,
        bookingId: booking.BookingId || booking.bookingId || `BK${booking.Id || booking.id}`,
        customerName: booking.CustomerName || booking.customerName || "N/A",
        vehicleType: booking.VehicleType || booking.vehicleType || "Unknown",
        startDate: booking.StartDate || booking.startDate,
        endDate: booking.EndDate || booking.endDate,
        totalPrice: booking.TotalPrice || booking.totalPrice || 0,
        status: booking.Status || booking.status,
        paymentStatus: booking.PaymentStatus || booking.paymentStatus,
      }))

    setRecentBookings(recentBookingsData)
  }

  // Refresh dashboard data
  const refreshDashboard = async () => {
    setRefreshing(true)
    await loadOwnerDashboard()
    setRefreshing(false)
  }

  // Download financial report
  const downloadFinancialReport = async () => {
    try {
      const token = localStorage.getItem("sherine_auth_token")
      if (!token) return

      // Create a simple financial report
      const reportData = {
        generatedAt: new Date().toISOString(),
        totalRevenue: financialSummary?.totalRevenue || 0,
        monthlyRevenue: financialSummary?.monthlyRevenue || 0,
        pendingPayments: financialSummary?.pendingPayments || 0,
        completedPayments: financialSummary?.completedPayments || 0,
        vehicleStats: {
          total: stats?.totalVehicles || 0,
          available: stats?.availableVehicles || 0,
          booked: stats?.bookedVehicles || 0,
          maintenance: stats?.maintenanceVehicles || 0,
        },
        driverStats: {
          total: stats?.totalDrivers || 0,
          active: stats?.activeDrivers || 0,
          inactive: stats?.inactiveDrivers || 0,
        },
        bookingStats: {
          total: stats?.totalBookings || 0,
          pending: stats?.pendingRequests || 0,
          completed: stats?.completedBookings || 0,
        },
        recentBookings: recentBookings,
      }

      // Create and download JSON report
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `financial-report-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to download financial report:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar userRole="Owner" userName="Owner" />
        <div className="flex-1 md:ml-64">
          <div className="p-6 flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading owner dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar userRole="Owner" userName="Owner" />

      {/* Main Dashboard */}
      <div className="flex-1 md:ml-64">
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Owner Dashboard</h1>
                <p className="text-muted-foreground">Monitor finances, fleet, drivers, and overall operations</p>
                {lastUpdated && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshDashboard}
                  disabled={refreshing}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
                <Button
                  size="sm"
                  onClick={downloadFinancialReport}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Report
                </Button>
              </div>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  Rs. {stats?.totalRevenue?.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.monthlyGrowth ? `+${stats.monthlyGrowth.toFixed(1)}% this month` : 'No data available'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats?.totalVehicles || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.maintenanceVehicles || 0} under maintenance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats?.activeDrivers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.inactiveDrivers || 0} inactive
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats?.pendingRequests || 0}</div>
                {(stats?.pendingRequests || 0) > 0 ? (
                  <Badge variant="destructive" className="mt-1">Action Required</Badge>
                ) : (
                  <Badge variant="default" className="mt-1">All Clear</Badge>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Reports + Fleet Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Financial Reports</CardTitle>
                    <CardDescription>Revenue and expense tracking</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadFinancialReport}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {financialSummary ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          Rs. {financialSummary.totalRevenue.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">Total Revenue</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          Rs. {financialSummary.monthlyRevenue.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">This Month</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                        <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                          Rs. {financialSummary.pendingPayments.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">Pending</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          Rs. {financialSummary.completedPayments.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">Completed</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-muted-foreground border rounded-lg">
                    <FileBarChart className="h-10 w-10 mx-auto mb-2" />
                    Loading financial data...
                  </div>
                )}
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
                    <span className="text-sm font-medium">{stats?.availableVehicles || 0} vehicles</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Car className="h-4 w-4 text-primary" />
                      <span className="text-sm">Booked</span>
                    </div>
                    <span className="text-sm font-medium">{stats?.bookedVehicles || 0} vehicles</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm">Maintenance</span>
                    </div>
                    <span className="text-sm font-medium">{stats?.maintenanceVehicles || 0} vehicles</span>
                  </div>
                  {stats && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Total Fleet</span>
                        <span>{stats.totalVehicles} vehicles</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Bookings */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Latest booking activity and status updates</CardDescription>
            </CardHeader>
            <CardContent>
              {recentBookings.length > 0 ? (
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{booking.bookingId}</span>
                          <Badge 
                            variant={booking.status === 'Confirmed' ? 'default' : 
                                   booking.status === 'Pending' ? 'secondary' : 
                                   booking.status === 'Completed' ? 'outline' : 'destructive'}
                          >
                            {booking.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {booking.customerName} • {booking.vehicleType}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">Rs. {booking.totalPrice.toLocaleString()}</div>
                        <Badge 
                          variant={booking.paymentStatus === 'PaidOnline' || booking.paymentStatus === 'Paid' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {booking.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Car className="h-8 w-8 mx-auto mb-2" />
                  <p>No recent bookings found</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Management Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Owner Actions</CardTitle>
              <CardDescription>Quick access to management tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={downloadFinancialReport}
                >
                  <DollarSign className="h-6 w-6 mb-2" />
                  Download Reports
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={refreshDashboard}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-6 w-6 mb-2 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh Data'}
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => window.location.href = '/dashboard/manager/addvehicle'}
                >
                  <Car className="h-6 w-6 mb-2" />
                  Manage Fleet
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => window.location.href = '/dashboard/manager/drivers'}
                >
                  <Users className="h-6 w-6 mb-2" />
                  Manage Drivers
                </Button>
              </div>
              {lastUpdated && (
                <div className="mt-4 pt-4 border-t text-center">
                  <p className="text-xs text-muted-foreground">
                    Dashboard updates automatically every 5 minutes
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Next update: {new Date(lastUpdated.getTime() + 5 * 60 * 1000).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
