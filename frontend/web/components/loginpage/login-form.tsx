 "use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { AuthService } from "@/lib/auth"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/hooks/use-toast"
import { signIn as nextAuthSignIn } from "next-auth/react"
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

  const handleGoogleSignIn = async () => {
    try {
      await nextAuthSignIn("google", { callbackUrl: `/oauth-bridge?role=${signUpRole}` })
    } catch (e: any) {
      toast({ title: "Google sign-in failed", description: e?.message || "Unknown error" })
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

            <div className={styles.divider}>or</div>
            <button className={styles.googleButton} type="button" onClick={handleGoogleSignIn}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
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
