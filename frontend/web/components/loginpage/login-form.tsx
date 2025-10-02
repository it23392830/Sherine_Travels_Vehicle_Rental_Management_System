 "use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { AuthService } from "@/lib/auth"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/hooks/use-toast"
import styles from "./login-form.module.css"

const LoginForm: React.FC = () => {
  const [signIn, setSignIn] = useState(true)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const [signUpRole, setSignUpRole] = useState<"User" | "Driver">("User")

  const router = useRouter()

  const handleToggle = (isSignIn: boolean) => {
    setSignIn(isSignIn)
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.target as HTMLFormElement)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      if (signIn) {
        try {
          // Use provider so it sets user and redirects based on role
          const result = await login(email, password)
          if (!result.success) {
            const msg = result.error || "Invalid email or password."
            setError(msg)
            toast({ title: "Login failed", description: msg })
          }
        } catch (e: any) {
          const msg = e?.message || "Invalid email or password."
          setError(msg)
          toast({ title: "Login failed", description: msg })
        }
      } else {
        const name = formData.get("name") as string
        if (!name || !email || !password) {
          setError("Please fill in all fields.")
          setLoading(false)
          return
        }
        try {
          await AuthService.signup(name, email, password, signUpRole)
          // Auto-login after successful signup
          const result = await login(email, password)
          if (!result.success) {
            const msg = result.error || "Login after signup failed."
            setError(msg)
            toast({ title: "Signup succeeded, login failed", description: msg })
          }
        } catch (e: any) {
          const msg = e?.message || "Sign up failed."
          setError(msg)
          toast({ title: "Signup failed", description: msg })
        }
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Sherine Travels and Tours 🚗</h1>
      </header>

      <div className={styles.container}>
        {/* Sign Up */}
        <div className={`${styles.signUpContainer} ${!signIn ? styles.active : ""}`}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <h1 className={styles.title}>Create Account</h1>
            <input className={styles.input} type="text" name="name" placeholder="Name" required />
            <input className={styles.input} type="email" name="email" placeholder="Email" required />
            <input className={styles.input} type="password" name="password" placeholder="Password" required />
            <p className="text-xs text-gray-500 mb-1">Sign up is only for User or Driver roles.</p>

            <div className="flex items-center gap-4 my-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="signup_role"
                  value="User"
                  checked={signUpRole === "User"}
                  onChange={() => setSignUpRole("User")}
                />
                User
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="signup_role"
                  value="Driver"
                  checked={signUpRole === "Driver"}
                  onChange={() => setSignUpRole("Driver")}
                />
                Driver
              </label>
            </div>

            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

            <button className={styles.button} type="submit" disabled={loading}>
              {loading ? "Creating Account..." : "Sign Up"}
            </button>

          </form>
        </div>

        {/* Sign In */}
        <div className={`${styles.signInContainer} ${!signIn ? styles.inactive : ""}`}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <h1 className={styles.title}>Sign In</h1>
            <input className={styles.input} type="email" name="email" placeholder="Email" required />
            <input className={styles.input} type="password" name="password" placeholder="Password" required />
            <a className={styles.anchor} href="ForgotPassword">
              Forgot your password?
            </a>

            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

            <button className={styles.button} type="submit" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>

        {/* Overlay */}
        <div className={`${styles.overlayContainer} ${!signIn ? styles.inactive : ""}`}>
          <div className={`${styles.overlay} ${!signIn ? styles.inactive : ""}`}>
            <div className={`${styles.overlayPanel} ${styles.leftOverlayPanel} ${!signIn ? styles.active : ""}`}>
              <h1 className={styles.overlayTitle}>Welcome Back!</h1>
              <p className={styles.paragraph}>To keep connected with us please login with your personal info</p>
              <button className={styles.ghostButton} type="button" onClick={() => handleToggle(true)}>
                Sign In
              </button>
            </div>

            <div className={`${styles.overlayPanel} ${styles.rightOverlayPanel} ${!signIn ? styles.inactive : ""}`}>
              <h1 className={styles.overlayTitle}>Hello!</h1>
              <p className={styles.paragraph}>Enter your personal details and start journey with us</p>
              <button className={styles.ghostButton} type="button" onClick={() => handleToggle(false)}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
