"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    // 🧹 Clear all stored tokens/session data
    localStorage.removeItem("sherine_auth_token")
    localStorage.removeItem("sherine_user_role")
    localStorage.removeItem("sherine_user_email")

    // optional: clear everything
    // localStorage.clear()

    // Redirect to login (adjust path if your login page is elsewhere)
    setTimeout(() => {
      router.push("/")
    }, 500)
  }, [router])

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2 text-gray-800">
          Logging out...
        </h1>
        <p className="text-gray-500">Please wait while we redirect you to the login page.</p>
      </div>
    </div>
  )
}
