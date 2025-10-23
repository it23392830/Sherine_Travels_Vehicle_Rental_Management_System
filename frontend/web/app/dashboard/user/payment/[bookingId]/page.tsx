"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Sidebar from "@/app/dashboard/user/Sidebar"
import { apiFetch } from "@/lib/api"
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"

interface BookingDetails {
  id?: number
  bookingId: string
  startDate: string
  endDate: string
  kilometers: number
  withDriver: boolean
  totalPrice: number
  status: string
  paymentStatus: string
  vehicleType: string
  vehicleNumber?: string
}

export default function BookingPaymentPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.bookingId as string
  
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [processing, setProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState("")
  const [paymentDetails, setPaymentDetails] = useState<any>(null)

  const downloadInvoice = () => {
    if (!booking) {
      alert("Booking information not available")
      return
    }
    
    console.log("Downloading invoice for booking:", booking.bookingId)
    console.log("Payment details:", paymentDetails)
    
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
          .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; background-color: #dcfce7; color: #166534; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">SHERINE TRAVELS</div>
          <div class="invoice-title">PAYMENT INVOICE</div>
        </div>
        
        <div class="invoice-info">
          <div>
            <strong>Invoice #:</strong> ${booking.bookingId}<br>
            <strong>Transaction ID:</strong> ${paymentDetails?.id || paymentDetails?.orderID || 'N/A'}<br>
            <strong>Date:</strong> ${new Date().toLocaleDateString()}
          </div>
          <div>
            <span class="status-badge">Paid Online</span>
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
            <span class="detail-value">${new Date(booking.startDate).toLocaleDateString()}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">End Date:</span>
            <span class="detail-value">${new Date(booking.endDate).toLocaleDateString()}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Distance:</span>
            <span class="detail-value">${booking.kilometers} km</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Driver Required:</span>
            <span class="detail-value">${booking.withDriver ? 'Yes' : 'No'}</span>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Payment Summary</div>
          <div class="total-row">
            <div class="detail-row" style="border: none; margin-bottom: 10px;">
              <span class="detail-label">Total Amount:</span>
              <span class="detail-value total-amount">LKR ${booking.totalPrice.toLocaleString()}</span>
            </div>
            <div class="detail-row" style="border: none; margin-bottom: 10px;">
              <span class="detail-label">Amount Paid (USD):</span>
              <span class="detail-value">$${Math.round(booking.totalPrice / 300 * 100) / 100}</span>
            </div>
            <div class="detail-row" style="border: none;">
              <span class="detail-label">Payment Method:</span>
              <span class="detail-value">PayPal</span>
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
    
    try {
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
        const link = document.createElement('a')
        link.href = url
        link.download = `Invoice_${booking.bookingId}_${new Date().toISOString().split('T')[0]}.html`
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }
      console.log("Invoice PDF generation triggered successfully")
    } catch (error) {
      console.error("Error generating invoice PDF:", error)
      alert("Failed to generate invoice PDF. Please try again.")
    }
  }

  useEffect(() => {
    if (!bookingId) {
      setError("No booking ID provided")
      setLoading(false)
      return
    }

    const fetchBooking = async () => {
      try {
        console.log("Fetching booking details for:", bookingId)
        
        // Try the booking endpoint to get real booking data
        const bookings = await apiFetch<BookingDetails[]>("/booking")
        console.log("Booking endpoint response:", bookings)
        const foundBooking = bookings.find(b => b.bookingId === bookingId)
        if (foundBooking) {
          console.log("Found booking:", foundBooking)
          setBooking(foundBooking)
        } else {
          console.log("Booking not found in list")
          setError("Booking not found")
        }
      } catch (e: any) {
        console.error("Failed to load booking:", e)
        setError(e?.message || "Failed to load booking details")
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId])

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar userRole="user" userName="Customer" />
        <div className="flex-1 md:ml-64 p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-6">Loading Payment Details...</h1>
          </div>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar userRole="user" userName="Customer" />
        <div className="flex-1 md:ml-64 p-6">
          <h1 className="text-2xl font-bold mb-6">Payment</h1>
          <Card className="p-6 max-w-xl">
            <p className="text-red-500 mb-4">{error || "Booking not found"}</p>
            <Button onClick={() => router.push("/dashboard/user")}>Back to Dashboard</Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole="user" userName="Customer" />
      <div className="flex-1 md:ml-64 p-6">
        <h1 className="text-2xl font-bold mb-6">Payment</h1>
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Booking Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Booking ID:</span>
                <span className="font-medium">#{booking.bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vehicle:</span>
                <span className="font-medium">{booking.vehicleType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dates:</span>
                <span className="font-medium">
                  {new Date(booking.startDate).toLocaleDateString()} → {new Date(booking.endDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kilometers:</span>
                <span className="font-medium">{booking.kilometers} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Driver:</span>
                <span className="font-medium">{booking.withDriver ? 'Included' : 'Not Required'}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Amount:</span>
                <span className="text-green-600">LKR {booking.totalPrice.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Card */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">PayPal</h3>
                  <p className="text-sm text-muted-foreground mb-2">Checkout with Visa/Master via PayPal Sandbox</p>
                  <p className="text-sm text-blue-600 mb-4">
                    Amount: ~${Math.round(booking.totalPrice / 300 * 100) / 100} USD (converted from LKR {booking.totalPrice.toLocaleString()})
                  </p>
                  
                  {processing && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-sm text-blue-600">🔄 Processing payment...</p>
                    </div>
                  )}
                  
                  {paymentStatus && (
                    <div className={`mb-4 p-3 rounded ${
                      paymentStatus === 'success' 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <p className={`text-sm ${
                        paymentStatus === 'success' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {paymentStatus === 'success' ? '✅ Payment Successful!' : '❌ Payment Failed'}
                      </p>
                    </div>
                  )}

                  <PayPalScriptProvider
                    options={{
                      clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "AVs6vSPJ7iDGl8H8WbZaK0GbVg6Uu2XQ4zIbNX24BXi__fu2JsVQ1V4UENjCU6ckMIzn9Ss3Nu8D5Tw9",
                      currency: "USD",
                      intent: "capture"
                    }}
                  >
                    <PayPalButtons
                      style={{ 
                        layout: "vertical",
                        color: "gold",
                        shape: "rect",
                        label: "paypal"
                      }}
                      createOrder={(data, actions) => {
                        const amountInUSD = Math.round(booking.totalPrice / 300 * 100) / 100
                        return actions.order.create({
                          intent: "CAPTURE",
                          purchase_units: [
                            {
                              amount: {
                                currency_code: "USD",
                                value: amountInUSD.toFixed(2),
                              },
                              description: `Vehicle Rental - ${booking.vehicleType} (${booking.bookingId})`
                            },
                          ],
                        })
                      }}
                      onApprove={async (data, actions) => {
                        try {
                          setProcessing(true)
                          setPaymentStatus("")
                          
                          // Simulate payment processing delay
                          await new Promise(resolve => setTimeout(resolve, 2000))
                          
                          const details = await actions.order?.capture()
                          console.log("Payment Details:", details)
                          
                          setPaymentDetails(details)
                          setPaymentStatus("success")
                          setProcessing(false)
                          
                          // Update booking status in backend
                          try {
                            console.log("Updating booking status for:", booking.bookingId, "Transaction:", data.orderID)
                            const updateResponse = await apiFetch('/testpayment/update-booking-simple', {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                bookingId: booking.bookingId,
                                transactionId: data.orderID
                              }),
                            })
                            console.log("Booking status updated successfully:", updateResponse)
                          } catch (updateError: any) {
                            console.error("Failed to update booking status:", updateError)
                            console.error("Update error details:", updateError?.message || updateError)
                            alert("⚠️ Payment successful but failed to update booking status. Please refresh My Bookings page.")
                          }
                          
                          // Update the local booking state
                          setBooking(prev => prev ? {
                            ...prev,
                            paymentStatus: "PaidOnline",
                            status: "have to ride"
                          } : null)
                          
                          // Show success message
                          alert(`🎉 Payment Successful!\n\nTransaction ID: ${data.orderID}\nPayer: ${details?.payer?.name?.given_name || 'Test User'}\nAmount: $${Math.round(booking.totalPrice / 300 * 100) / 100} USD\n\nBooking: ${booking.bookingId}\n\nPayment Status: Done ✅`)
                          
                          // Redirect to bookings page
                          setTimeout(() => {
                            router.push('/dashboard/user/bookings')
                          }, 2000)
                          
                        } catch (error) {
                          console.error("Payment error:", error)
                          setPaymentStatus("error")
                          setProcessing(false)
                          alert("❌ Payment processing failed. Please try again.")
                        }
                      }}
                      onError={(err) => {
                        console.error("PayPal Checkout Error:", err)
                        setPaymentStatus("error")
                        setProcessing(false)
                        alert("❌ PayPal error occurred. Please try again.")
                      }}
                      onCancel={() => {
                        setProcessing(false)
                        setPaymentStatus("")
                        alert("💔 Payment cancelled by user.")
                      }}
                    />
                  </PayPalScriptProvider>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex gap-3">
                  {paymentStatus === 'success' && (
                    <Button
                      onClick={downloadInvoice}
                      disabled={processing}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Download Invoice
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => router.push("/dashboard/user/bookings")}
                    disabled={processing}
                    className="flex-1"
                  >
                    {paymentStatus === 'success' ? 'Back to My Bookings' : 'Cancel'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
