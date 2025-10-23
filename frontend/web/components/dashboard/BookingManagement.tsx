"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar, CreditCard, Download, X, AlertCircle, CheckCircle, Clock, ExternalLink } from "lucide-react"
import { getUserBookings, cancelBooking, BookingResponse } from "@/lib/api"
import { toast } from "sonner"
import Link from "next/link"

interface BookingManagementProps {
  onRefresh?: () => void
}

export default function BookingManagement({ onRefresh }: BookingManagementProps) {
  const [bookings, setBookings] = useState<BookingResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    try {
      setLoading(true)
      const data = await getUserBookings()
      setBookings(data)
    } catch (error: any) {
      toast.error("Failed to load bookings: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId: number) => {
    try {
      setActionLoading(bookingId)
      await cancelBooking(bookingId)
      toast.success("Booking cancelled successfully")
      await loadBookings()
      onRefresh?.()
    } catch (error: any) {
      toast.error("Failed to cancel booking: " + error.message)
    } finally {
      setActionLoading(null)
    }
  }

  // Payment is now handled by the dedicated payment page

  const handleDownloadInvoice = async (booking: BookingResponse) => {
    try {
      setActionLoading(booking.id)
      
      // Create PDF using HTML and CSS
      const invoiceHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice ${booking.bookingId}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
            .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
            .company-name { font-size: 28px; font-weight: bold; color: #2563eb; margin-bottom: 5px; }
            .invoice-title { font-size: 24px; color: #666; margin-top: 10px; }
            .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 18px; font-weight: bold; color: #2563eb; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
            .detail-label { font-weight: 500; color: #666; }
            .detail-value { font-weight: 600; }
            .total-row { background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-top: 20px; }
            .total-amount { font-size: 20px; font-weight: bold; color: #059669; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
            .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
            .status-paid { background-color: #dcfce7; color: #166534; }
            .status-confirmed { background-color: #dbeafe; color: #1d4ed8; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">SHERINE TRAVELS</div>
            <div class="invoice-title">INVOICE</div>
          </div>
          
          <div class="invoice-info">
            <div>
              <strong>Invoice #:</strong> ${booking.bookingId}<br>
              <strong>Date:</strong> ${new Date().toLocaleDateString()}
            </div>
            <div>
              <span class="status-badge ${booking.paymentStatus === 'PaidOnline' ? 'status-paid' : 'status-confirmed'}">
                ${booking.paymentStatus}
              </span>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Booking Details</div>
            <div class="detail-row">
              <span class="detail-label">Vehicle Type:</span>
              <span class="detail-value">${booking.vehicleType}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Start Date:</span>
              <span class="detail-value">${formatDate(booking.startDate)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">End Date:</span>
              <span class="detail-value">${formatDate(booking.endDate)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Distance:</span>
              <span class="detail-value">${booking.kilometers} km</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Driver Required:</span>
              <span class="detail-value">${booking.withDriver ? 'Yes' : 'No'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Booking Status:</span>
              <span class="detail-value">${booking.status}</span>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Payment Summary</div>
            <div class="total-row">
              <div class="detail-row" style="border: none; margin-bottom: 10px;">
                <span class="detail-label">Total Amount:</span>
                <span class="detail-value total-amount">LKR ${booking.totalPrice.toLocaleString()}</span>
              </div>
              <div class="detail-row" style="border: none;">
                <span class="detail-label">Payment Status:</span>
                <span class="detail-value">${booking.paymentStatus}</span>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>Thank you for choosing Sherine Travels!</strong></p>
            <p>Contact: info@sherinetravels.com | Phone: +94 XX XXX XXXX</p>
            <p style="font-size: 12px; color: #999;">This is a computer-generated invoice.</p>
          </div>
        </body>
        </html>
      `
      
      // Create PDF using browser's print functionality
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(invoiceHTML)
        printWindow.document.close()
        
        // Wait for content to load, then trigger print dialog
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print()
            printWindow.close()
          }, 500)
        }
      } else {
        // Fallback: create downloadable HTML file
        const blob = new Blob([invoiceHTML], { type: 'text/html;charset=utf-8' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Invoice_${booking.bookingId}_${new Date().toISOString().split('T')[0]}.html`
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
      
      toast.success("Invoice ready for download/print")
    } catch (error: any) {
      console.error("Error generating invoice:", error)
      toast.error("Failed to generate invoice: " + error.message)
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      "Confirmed": { color: "bg-green-600", icon: CheckCircle },
      "Pending": { color: "bg-yellow-600", icon: Clock },
      "Completed": { color: "bg-blue-600", icon: CheckCircle },
      "Cancelled": { color: "bg-red-600", icon: X },
      "have to ride": { color: "bg-yellow-200 text-yellow-800", icon: Calendar }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || { color: "bg-gray-600", icon: AlertCircle }
    const Icon = config.icon
    
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    )
  }

  const getPaymentBadge = (paymentStatus: string) => {
    const statusConfig = {
      "Paid": { color: "bg-green-600", icon: CheckCircle },
      "Pending": { color: "bg-yellow-600", icon: Clock },
      "PayAtPickup": { color: "bg-orange-600", icon: CreditCard },
      "PaidOnline": { color: "bg-purple-200 text-purple-800", icon: CreditCard }
    }
    
    const config = statusConfig[paymentStatus as keyof typeof statusConfig] || { color: "bg-gray-600", icon: AlertCircle }
    const Icon = config.icon
    
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {paymentStatus === "PayAtPickup" ? "Pay at Pickup" : paymentStatus}
      </Badge>
    )
  }

  const filterBookings = (filter: string) => {
    const now = new Date()
    switch (filter) {
      case "upcoming":
        return bookings.filter(b => 
          (b.status === "Confirmed" || b.status === "Pending") && 
          new Date(b.startDate) >= now
        )
      case "completed":
        return bookings.filter(b => 
          b.status === "Completed" || 
          b.paymentStatus === "PaidOnline" ||
          (b.paymentStatus === "Paid" && new Date(b.endDate) < now)
        )
      case "pending-payment":
        return bookings.filter(b => 
          b.paymentStatus === "Pending" || 
          (b.paymentStatus === "PayAtPickup" && b.balanceDue > 0)
        )
      default:
        return bookings
    }
  }

  const BookingCard = ({ booking }: { booking: BookingResponse }) => (
    <Card key={booking.id} className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{booking.bookingId}</CardTitle>
            <CardDescription>
              {booking.vehicleType} • {booking.withDriver ? "With Driver" : "Self Drive"}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {getStatusBadge(booking.status)}
            {getPaymentBadge(booking.paymentStatus)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Duration</p>
            <p className="font-medium">
              {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Distance</p>
            <p className="font-medium">{booking.kilometers} km</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="font-medium">LKR {booking.totalPrice.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Balance Due</p>
            <p className="font-medium text-red-600">LKR {booking.balanceDue.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {booking.balanceDue > 0 && booking.paymentStatus !== "Paid" && (
            <Link href={`/dashboard/user/payment/${booking.bookingId}`}>
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700"
              >
                <CreditCard className="h-4 w-4 mr-1" />
                Pay Now
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          )}
          
          {(booking.paymentStatus === "Paid" || booking.paymentStatus === "PayAtPickup" || booking.paymentStatus === "PaidOnline") && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleDownloadInvoice(booking)}
              disabled={actionLoading === booking.id}
            >
              <Download className="h-4 w-4 mr-1" />
              {actionLoading === booking.id ? "Downloading..." : "Download Invoice"}
            </Button>
          )}
          
          {(booking.status === "Pending" || booking.status === "Confirmed") && (
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="destructive">
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancel Booking</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to cancel booking {booking.bookingId}? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => {}}>
                    Keep Booking
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => handleCancelBooking(booking.id)}
                    disabled={actionLoading === booking.id}
                  >
                    {actionLoading === booking.id ? "Cancelling..." : "Cancel Booking"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Booking Management</h2>
        <Button onClick={loadBookings} variant="outline">
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Bookings ({bookings.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({filterBookings("upcoming").length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({filterBookings("completed").length})</TabsTrigger>
          <TabsTrigger value="pending-payment">Pending Payment ({filterBookings("pending-payment").length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          {bookings.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No bookings found</p>
              </CardContent>
            </Card>
          ) : (
            bookings.map(booking => <BookingCard key={booking.id} booking={booking} />)
          )}
        </TabsContent>
        
        <TabsContent value="upcoming" className="mt-6">
          {filterBookings("upcoming").map(booking => <BookingCard key={booking.id} booking={booking} />)}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6">
          {filterBookings("completed").map(booking => <BookingCard key={booking.id} booking={booking} />)}
        </TabsContent>
        
        <TabsContent value="pending-payment" className="mt-6">
          {filterBookings("pending-payment").map(booking => <BookingCard key={booking.id} booking={booking} />)}
        </TabsContent>
      </Tabs>
    </div>
  )
}
