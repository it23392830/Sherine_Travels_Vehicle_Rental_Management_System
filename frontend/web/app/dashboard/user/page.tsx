"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, CheckCircle, XCircle, Calendar, CreditCard, AlertCircle } from "lucide-react"
import Sidebar from "@/app/dashboard/user/Sidebar"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getUserDashboardStats, DashboardStats, BookingResponse } from "@/lib/api"
import ApiDebug from "@/components/debug/ApiDebug"
import { AuthService } from "@/lib/auth"
import { useRouter } from "next/navigation"

export default function UserDashboard() {
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Check authentication first
      const currentUser = AuthService.getCurrentUser()
      const token = AuthService.getToken()

      console.log("🔐 Auth Check:", {
        hasUser: !!currentUser,
        hasToken: !!token,
        userRole: currentUser?.role
      })

      if (!currentUser || !token) {
        setError("Please log in to view your dashboard")
        // Optionally redirect to login after a delay
        setTimeout(() => {
          router.push("/login")
        }, 3000)
        return
      }

      const data = await getUserDashboardStats()
      setDashboardData(data)
      setError(null)
    } catch (err: any) {
      console.error("Failed to load dashboard data:", err)
      setError(err.message || "Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string, paymentStatus: string) => {
    if (status === "Confirmed") return <Badge className="bg-green-600">Confirmed</Badge>
    if (status === "Pending") return <Badge className="bg-yellow-600">Pending</Badge>
    if (status === "Completed") return <Badge className="bg-blue-600">Completed</Badge>
    if (status === "Cancelled") return <Badge className="bg-red-600">Cancelled</Badge>
    return <Badge className="bg-gray-600">{status}</Badge>
  }

  const getPaymentBadge = (paymentStatus: string) => {
    if (paymentStatus === "Paid") return <Badge className="bg-green-600">Paid</Badge>
    if (paymentStatus === "Pending") return <Badge className="bg-yellow-600">Pending</Badge>
    if (paymentStatus === "PayAtPickup") return <Badge className="bg-orange-600">Pay at Pickup</Badge>
    return <Badge className="bg-gray-600">{paymentStatus}</Badge>
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar userRole="user" userName="Customer Alice" />
        <div className="flex-1 md:ml-64">
          <div className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading dashboard...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole="user" userName="Customer Alice" />

      <div className="flex-1 md:ml-64">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">User Dashboard</h1>
            <p className="text-muted-foreground">View bookings, payment status, and ride history</p>
          </div>

          {error && (
            <div className="space-y-4 mb-6">
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <p>{error}</p>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button
                      onClick={loadDashboardData}
                      variant="outline"
                      size="sm"
                    >
                      Retry
                    </Button>
                    {error?.includes("log in") && (
                      <Button
                        onClick={() => router.push("/login")}
                        size="sm"
                      >
                        Go to Login
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Debug component for troubleshooting */}
              <ApiDebug />
            </div>
          )}

          {/* Booking Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Bookings
                </CardTitle>
                <CardDescription>Your next rides</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData?.upcomingBookings.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No upcoming bookings</p>
                ) : (
                  <div className="space-y-3">
                    {dashboardData?.upcomingBookings.slice(0, 2).map((booking) => (
                      <div key={booking.id} className="border-b pb-2 last:border-b-0">
                        <p className="text-sm font-medium">{booking.bookingId}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                        </p>
                        <p className="text-xs text-muted-foreground">{booking.vehicleType}</p>
                        <div className="mt-1">
                          {getStatusBadge(booking.status, booking.paymentStatus)}
                        </div>
                      </div>
                    ))}
                    {(dashboardData?.upcomingBookings.length || 0) > 2 && (
                      <p className="text-xs text-muted-foreground">
                        +{(dashboardData?.upcomingBookings.length || 0) - 2} more bookings
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Booking History
                </CardTitle>
                <CardDescription>Completed rides</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData?.completedBookings.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No completed bookings</p>
                ) : (
                  <div className="space-y-3">
                    {dashboardData?.completedBookings.slice(0, 2).map((booking) => (
                      <div key={booking.id} className="border-b pb-2 last:border-b-0">
                        <p className="text-sm font-medium">{booking.bookingId}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                        </p>
                        <p className="text-xs text-muted-foreground">{booking.vehicleType}</p>
                        <div className="mt-1">
                          <Badge className={
                            booking.paymentStatus === "PaidOnline" 
                              ? "bg-blue-600" 
                              : "bg-green-600"
                          }>
                            {booking.paymentStatus === "PaidOnline" ? "Paid Online" : "Completed"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {(dashboardData?.completedBookings.length || 0) > 2 && (
                      <p className="text-xs text-muted-foreground">
                        +{(dashboardData?.completedBookings.length || 0) - 2} more bookings
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Pending Payments
                </CardTitle>
                <CardDescription>Check invoices and pay online</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData?.pendingPayments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No pending payments</p>
                ) : (
                  <div className="space-y-3">
                    {dashboardData?.pendingPayments.slice(0, 2).map((booking) => (
                      <div key={booking.id} className="border-b pb-2 last:border-b-0">
                        <p className="text-sm font-medium">{booking.bookingId}</p>
                        <p className="text-xs text-muted-foreground">
                          Amount: LKR {booking.balanceDue.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">{booking.vehicleType}</p>
                        <div className="mt-1">
                          {getPaymentBadge(booking.paymentStatus)}
                        </div>
                      </div>
                    ))}
                    {(dashboardData?.pendingPayments.length || 0) > 2 && (
                      <p className="text-xs text-muted-foreground">
                        +{(dashboardData?.pendingPayments.length || 0) - 2} more payments
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Book rides, manage bookings, and pay online</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/dashboard/user/bookride">
                  <div className="border border-neutral-300 rounded-lg p-1 flex items-center justify-center h-20 bg-background hover:bg-muted transition-colors">
                    <Button className="h-16 w-full flex flex-col items-center justify-center">
                      <Calendar className="h-5 w-5 mb-1" />
                      Book Ride
                    </Button>
                  </div>
                </Link>
                <Link href="/dashboard/user/bookings">
                  <div className="border border-neutral-300 rounded-lg p-1 flex items-center justify-center h-20 bg-background hover:bg-muted transition-colors">
                    <Button className="h-16 w-full flex flex-col items-center justify-center">
                      <CheckCircle className="h-5 w-5 mb-1" />
                      My Bookings
                    </Button>
                  </div>
                </Link>
                <Link href="/dashboard/user/bookings">
                  <div className="border border-neutral-300 rounded-lg p-1 flex items-center justify-center h-20 bg-background hover:bg-muted transition-colors">
                    <Button className="h-16 w-full flex flex-col items-center justify-center">
                      <CreditCard className="h-5 w-5 mb-1" />
                      Pay Online
                    </Button>
                  </div>
                </Link>
                <Link href="/dashboard/user/bookings">
                  <div className="border border-neutral-300 rounded-lg p-1 flex items-center justify-center h-20 bg-background hover:bg-muted transition-colors">
                    <Button className="h-16 w-full flex flex-col items-center justify-center">
                      <MapPin className="h-5 w-5 mb-1" />
                      View History
                    </Button>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Summary Statistics */}
          {dashboardData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {dashboardData.upcomingBookings.length + dashboardData.completedBookings.length}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    All time bookings
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Active Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {dashboardData.upcomingBookings.length}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Confirmed & pending
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Outstanding Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">
                    LKR {dashboardData.pendingPayments.reduce((sum, booking) => sum + booking.balanceDue, 0).toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total pending payments
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
