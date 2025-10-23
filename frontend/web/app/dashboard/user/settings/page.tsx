"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import Sidebar from "@/app/dashboard/user/Sidebar"
import { apiFetch } from "@/lib/api"
import { getCurrentUserName } from "@/lib/user-utils"

export default function UserSettingsPage() {
  // Check for valid auth token and redirect if missing
  useEffect(() => {
    const token = typeof window !== "undefined" ? window.localStorage.getItem("sherine_auth_token") : null;
    if (!token) {
      alert("You must be logged in to view this page.");
      window.location.href = "/login";
    }
  }, []);

  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
  })

  const [profile, setProfile] = useState({ fullName: "", email: "", phoneNumber: "" })
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmNewPassword: "" })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const me = await apiFetch<{ email: string; fullName: string; phoneNumber?: string }>("/User/me")
        setProfile({ fullName: me.fullName, email: me.email, phoneNumber: me.phoneNumber ?? "" })
      } catch (e: any) {
        // eslint-disable-next-line no-alert
        alert(`Failed to load profile: ${e?.message || "Unknown error"}`)
      }
    }
    load()
  }, [])

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await apiFetch("/User/profile", {
        method: "PUT",
        body: JSON.stringify({
          fullName: profile.fullName,
          email: profile.email,
          phoneNumber: profile.phoneNumber || undefined,
        }),
      })
      // Persist updated name to localStorage so dashboards/sidebars reflect immediately
      if (typeof window !== "undefined") {
        const raw = window.localStorage.getItem("sherine_auth_user")
        if (raw) {
          try {
            const user = JSON.parse(raw)
            user.fullName = profile.fullName
            user.email = profile.email
            window.localStorage.setItem("sherine_auth_user", JSON.stringify(user))
            
            // Trigger custom event to update sidebar
            window.dispatchEvent(new Event('userProfileUpdated'))
          } catch { }
        }
      }
      // eslint-disable-next-line no-alert
      alert("Profile updated successfully!")
    } catch (e: any) {
      // eslint-disable-next-line no-alert
      alert(e?.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      // eslint-disable-next-line no-alert
      alert("New passwords do not match")
      return
    }
    setLoading(true)
    try {
      await apiFetch("/User/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword }),
      })
      setPasswords({ currentPassword: "", newPassword: "", confirmNewPassword: "" })
      // eslint-disable-next-line no-alert
      alert("Password updated successfully!")
    } catch (e: any) {
      // eslint-disable-next-line no-alert
      alert(e?.message || "Failed to update password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole="user" userName="Customer" />
      <div className="flex-1 md:ml-64 p-6">
        <h1 className="text-3xl font-bold mb-6">Settings ⚙️</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleProfileSave}>
                <div>
                  <label className="block text-sm mb-1">Full Name</label>
                  <Input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Email</label>
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Phone</label>
                  <Input
                    type="tel"
                    value={profile.phoneNumber}
                    onChange={(e) => setProfile((p) => ({ ...p, phoneNumber: e.target.value }))}
                  />
                </div>
                <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
              </form>
            </CardContent>
          </Card>

          {/* Notifications Section */}
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage how you get updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="capitalize">{key} Notifications</span>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({ ...prev, [key]: checked }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Appearance Section */}
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Choose your theme</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span>Dark Mode</span>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>
            </CardContent>
          </Card>

          {/* Security Section */}
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your password</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handlePasswordChange}>
                <div>
                  <label className="block text-sm mb-1">Current Password</label>
                  <Input
                    type="password"
                    required
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">New Password</label>
                  <Input
                    type="password"
                    required
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Confirm New Password</label>
                  <Input
                    type="password"
                    required
                    value={passwords.confirmNewPassword}
                    onChange={(e) => setPasswords((p) => ({ ...p, confirmNewPassword: e.target.value }))}
                  />
                </div>
                <Button type="submit" disabled={loading}>{loading ? "Updating..." : "Update Password"}</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
