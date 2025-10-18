"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, User, UserCheck, Phone, ExternalLink } from "lucide-react"
import { AuthService } from "@/lib/auth"

// API Base URL configuration
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://sherinetravels-api-frcsb2d3drabgbbd.eastasia-01.azurewebsites.net'
import { toast } from "sonner"
import Sidebar from "../Sidebar"

interface ChatContact {
  id: number
  name: string
  phoneNumber: string
  role: string
  isActive: boolean
}

interface Booking {
  id: number
  vehicleId: number
  status: string
  startDate: string
  endDate: string
  vehicle?: {
    make: string
    model: string
  }
}

export default function ChatPage() {
  const [managerContact, setManagerContact] = useState<ChatContact | null>(null)
  const [userBookings, setUserBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = AuthService.getCurrentUser()
    if (userData) {
      setUser(userData)
      fetchChatData()
    }
  }, [])

  const fetchChatData = async () => {
    try {
      setLoading(true)
      
      // Fetch manager contact
      const managerResponse = await fetch(`${API_BASE}/api/chat/contacts/manager`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      })
      
      if (managerResponse.ok) {
        const manager = await managerResponse.json()
        setManagerContact(manager)
      }

      // Fetch user bookings to show driver chat options
      const bookingsResponse = await fetch(`${API_BASE}/api/Booking`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      })
      
      if (bookingsResponse.ok) {
        const bookings = await bookingsResponse.json()
        setUserBookings(bookings.filter((b: Booking) => b.status === 'Confirmed' || b.status === 'Active'))
      }

    } catch (error) {
      console.error('Error fetching chat data:', error)
      toast.error('Failed to load chat information')
    } finally {
      setLoading(false)
    }
  }

  const openWhatsAppChat = (phoneNumber: string, contactName: string) => {
    // Format phone number (remove any non-digit characters except +)
    const formattedNumber = phoneNumber.replace(/[^\d+]/g, '')
    
    // Create WhatsApp URL without pre-filled message - just open the chat
    const whatsappUrl = `https://wa.me/${formattedNumber}`
    
    console.log('Opening WhatsApp with:', { phoneNumber, formattedNumber, contactName, whatsappUrl })
    
    // Open WhatsApp in a new tab/window
    const newWindow = window.open(whatsappUrl, '_blank')
    
    // Check if popup was blocked
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      toast.error('Popup blocked! Please allow popups and try again.')
      // Fallback: try to navigate in the same window
      window.location.href = whatsappUrl
    } else {
      toast.success(`Opening WhatsApp chat with ${contactName}`)
    }
  }

  const getDriverContactForBooking = async (bookingId: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/chat/contacts/driver/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      })
      
      if (response.ok) {
        const driverContact = await response.json()
        openWhatsAppChat(driverContact.phoneNumber, driverContact.name)
      } else {
        toast.error('Driver contact not available for this booking')
      }
    } catch (error) {
      console.error('Error fetching driver contact:', error)
      toast.error('Failed to get driver contact information')
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar userRole={user?.role || 'User'} userName={user?.fullName || 'User'} />
        <main className="flex-1 ml-64 p-8">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading chat information...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole={user?.role || 'User'} userName={user?.fullName || 'User'} />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Chat with us</h1>
            <p className="text-muted-foreground">
              Get in touch with our team for support, questions, or special service requests.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Chat with Manager */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Chat with Manager</CardTitle>
                    <CardDescription>
                      Get help with bookings and general inquiries
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-3">
                    Contact our manager for support:
                  </p>
                  <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Sherine Travels Manager</p>
                        <p className="text-sm text-muted-foreground">
                          Available for assistance
                        </p>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => openWhatsAppChat('+94771234567', 'Sherine Travels Manager')}
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Chat
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chat with Assigned Driver */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <UserCheck className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Chat with Assigned Driver</CardTitle>
                    <CardDescription>
                      Contact your driver for active bookings
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {userBookings.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground mb-3">
                      Select a booking to chat with the assigned driver:
                    </p>
                    {userBookings.map((booking) => (
                      <div key={booking.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {booking.vehicle?.make} {booking.vehicle?.model}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Booking #{booking.id} • {booking.status}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                            </p>
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => getDriverContactForBooking(booking.id)}
                          >
                            <MessageCircle className="h-3 w-3 mr-1" />
                            Chat
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground mb-3">
                      Contact your assigned driver:
                    </p>
                    <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Assigned Driver</p>
                          <p className="text-sm text-muted-foreground">
                            Available for assistance
                          </p>
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => openWhatsAppChat('+94777654321', 'Assigned Driver')}
                        >
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Chat
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Need Special Services?</CardTitle>
              <CardDescription>
                Request additional services like Wi-Fi, child seats, or extra luggage space
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl mb-2">📶</div>
                  <p className="font-medium">Wi-Fi Access</p>
                  <p className="text-sm text-muted-foreground">Stay connected during your ride</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl mb-2">🚼</div>
                  <p className="font-medium">Child Seat</p>
                  <p className="text-sm text-muted-foreground">Safe travel for your little ones</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl mb-2">🧳</div>
                  <p className="font-medium">Extra Luggage</p>
                  <p className="text-sm text-muted-foreground">Additional storage space</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Contact our manager or your assigned driver to request these services
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
