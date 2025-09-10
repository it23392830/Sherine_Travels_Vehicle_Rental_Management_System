import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, CheckCircle, XCircle } from "lucide-react"
import Sidebar from "@/app/dashboard/user/Sidebar"
import Link from "next/link"

export default function UserDashboard() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole="user" userName="Customer Alice" />

      <div className="flex-1 md:ml-64">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">User Dashboard</h1>
            <p className="text-muted-foreground">View bookings, payment status, and ride history</p>
          </div>

          {/* Booking Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Bookings</CardTitle>
                <CardDescription>Your next rides</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-sm text-muted-foreground">Kurunegala → Jaffna</p>
                  <Badge className="bg-primary mt-2">Confirmed</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Booking History</CardTitle>
                <CardDescription>Completed rides</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-sm text-muted-foreground">Colombo → Galle</p>
                  <Badge className="bg-green-600 mt-2">Completed</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pending Payments</CardTitle>
                <CardDescription>Check invoices and pay online</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-sm text-muted-foreground">Mathara → Kandy</p>
                  <Badge className="bg-yellow-600 mt-2">Pending</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Book rides or download invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/dashboard/user/bookingride">
                  <Button className="h-20 flex flex-col items-center justify-center">Book Ride</Button>
                </Link>
                <Link href="/dashboard/user/cancelride">
                  <Button className="h-20 flex flex-col items-center justify-center">Cancel Ride</Button>
                </Link>
                <Link href="/dashboard/user/payonline">
                  <Button className="h-20 flex flex-col items-center justify-center">Pay Online</Button>
                </Link>
                <Link href="/dashboard/user/downloadinvoice">
                  <Button className="h-20 flex flex-col items-center justify-center">Download Invoice</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
