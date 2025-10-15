"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Sidebar from "@/app/dashboard/user/Sidebar"
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"

export default function PayPalDemoPage() {
  const [paymentStatus, setPaymentStatus] = useState("")
  const [paymentDetails, setPaymentDetails] = useState<any>(null)
  const [processing, setProcessing] = useState(false)

  // Mock booking data
  const mockBooking = {
    bookingId: "BK000001",
    vehicleType: "KIA Sedan",
    startDate: "2025-10-13",
    endDate: "2025-10-15",
    kilometers: 100,
    withDriver: false,
    totalPrice: 36990 // LKR
  }

  const amountInUSD = Math.round(mockBooking.totalPrice / 300 * 100) / 100

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole="user" userName="Customer" />
      <div className="flex-1 md:ml-64 p-6">
        <h1 className="text-2xl font-bold mb-6">PayPal Demo - Frontend Only</h1>
        
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Booking Details */}
          <Card>
            <CardHeader>
              <CardTitle>Mock Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Booking ID:</span>
                <span className="font-medium">#{mockBooking.bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vehicle:</span>
                <span className="font-medium">{mockBooking.vehicleType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dates:</span>
                <span className="font-medium">
                  {new Date(mockBooking.startDate).toLocaleDateString()} → {new Date(mockBooking.endDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kilometers:</span>
                <span className="font-medium">{mockBooking.kilometers} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Driver:</span>
                <span className="font-medium">{mockBooking.withDriver ? 'Included' : 'Not Required'}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Amount:</span>
                <span className="text-green-600">LKR {mockBooking.totalPrice.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* PayPal Payment */}
          <Card>
            <CardHeader>
              <CardTitle>PayPal Payment Demo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">PayPal Sandbox</h3>
                  <p className="text-sm text-muted-foreground mb-2">Test PayPal integration with sandbox credentials</p>
                  <p className="text-sm text-blue-600 mb-4">
                    Amount: <strong>${amountInUSD} USD</strong> (converted from LKR {mockBooking.totalPrice.toLocaleString()})
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
                      clientId: "AVs6vSPJ7iDGl8H8WbZaK0GbVg6Uu2XQ4zIbNX24BXi__fu2JsVQ1V4UENjCU6ckMIzn9Ss3Nu8D5Tw9",
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
                        return actions.order.create({
                          intent: "CAPTURE",
                          purchase_units: [
                            {
                              amount: {
                                currency_code: "USD",
                                value: amountInUSD.toFixed(2),
                              },
                              description: `Vehicle Rental - ${mockBooking.vehicleType} (${mockBooking.bookingId})`
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
                          
                          // Show success message
                          alert(`🎉 Payment Successful!\n\nTransaction ID: ${data.orderID}\nPayer: ${details?.payer?.name?.given_name || 'Test User'}\nAmount: $${amountInUSD} USD`)
                          
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
                  
                  {/* Demo Info */}
                  <div className="mt-4 p-3 bg-gray-50 border rounded text-xs">
                    <p className="font-semibold mb-2">🧪 Demo Information:</p>
                    <p>• This is a <strong>frontend-only demo</strong> using PayPal Sandbox</p>
                    <p>• No backend API calls are made</p>
                    <p>• Use PayPal test account or create one at developer.paypal.com</p>
                    <p>• Test email: <code>sb-test@example.com</code></p>
                    <p>• Test password: <code>testpassword</code></p>
                  </div>
                </div>

                {/* Payment Details */}
                {paymentDetails && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-600">Payment Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Transaction ID:</span>
                          <span className="font-mono">{paymentDetails.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <span className="text-green-600 font-semibold">{paymentDetails.status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Payer Name:</span>
                          <span>{paymentDetails.payer?.name?.given_name} {paymentDetails.payer?.name?.surname}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Payer Email:</span>
                          <span>{paymentDetails.payer?.email_address}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Amount:</span>
                          <span className="font-semibold">${amountInUSD} USD</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPaymentStatus("")
                      setPaymentDetails(null)
                      setProcessing(false)
                    }}
                    disabled={processing}
                    className="flex-1"
                  >
                    Reset Demo
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
