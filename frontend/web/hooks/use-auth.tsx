"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { type User, AuthService, type UserRole, ROLE_ROUTES } from "../lib/auth"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  hasRole: (role: UserRole) => boolean
  canAccess: (roles: UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for existing session on mount
    try {
      const currentUser = AuthService.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      // Handle any errors silently
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const user = await AuthService.login(email, password)
      setUser(user)

      const secureFlag = window.location.protocol === "https:" ? "; Secure" : ""
      document.cookie = `sherine_auth_token=${AuthService.getToken()}; path=/; max-age=86400; SameSite=Strict${secureFlag}`
      document.cookie = `sherine_auth_user=${JSON.stringify(user)}; path=/; max-age=86400; SameSite=Strict${secureFlag}`

      const dashboardRoute = ROLE_ROUTES[user.role]
      router.push(dashboardRoute)
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err?.message || "Login failed" }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    AuthService.logout()
    setUser(null)

    // Clear cookies securely
    document.cookie = "sherine_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict"
    document.cookie = "sherine_auth_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict"

    router.push("/")
  }

  const hasRole = (role: UserRole) => {
    return user?.role === role
  }

  const canAccess = (roles: UserRole[]) => {
    return user ? roles.includes(user.role) : false
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        hasRole,
        canAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
