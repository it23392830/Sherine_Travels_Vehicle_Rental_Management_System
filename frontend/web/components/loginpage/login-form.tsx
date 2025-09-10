"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import styles from "./login-form.module.css"

const LoginForm: React.FC = () => {
  const [signIn, setSignIn] = useState(true)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleToggle = (isSignIn: boolean) => {
    setSignIn(isSignIn)
    setError("") // Clear error when switching forms
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.target as HTMLFormElement)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

     // Hardcoded manager & owner credentials
    const validCredentials = [
      { email: "manager@sherine.com", password: "manager123", redirect: "/dashboard/manager" },
      { email: "owner@sherine.com", password: "owner123", redirect: "/dashboard/owner" },
    ]

    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (signIn) {
      // Check Manager/Owner first
    const matchedUser = validCredentials.find(
      (cred) => cred.email === email && cred.password === password
    )

   if (matchedUser) {
      router.push(matchedUser.redirect) // redirect to role-based dashboard
      } 
      else {
        /*Backend authentication simulation
        try {
          const res = await fetch("http://localhost:5000/api/signin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          })
          const data = await res.json()

          if (data.redirect) {
            router.push(data.redirect)
          } else {
            setError(data.msg || "Invalid email or password.")
          }
        } catch {
          setError("Server error. Please try again later.")
        } */

        setError("Invalid email or password. Please try again.")
      }

    } else {
      
      const name = formData.get("name") as string
      if (name && email && password) {
         /*Sign Up for Users/Drivers
         try {
          const res = await fetch("http://localhost:5000/api/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password, role: "user" }),
          })
          const data = await res.json()

          if (data.msg === "Sign up successful") {
            setError("Sign up successful! Please sign in with your credentials.")
            setSignIn(true)
          } else {
            setError(data.msg || "Sign up failed.")
          }
        } catch {
          setError("Server error. Please try again later.")
        }
      } else {
        setError("Please fill in all fields.")
      }
    }
    setLoading(false)
  } */
        setError("Sign up successful! Please sign in with your credentials.")
        setSignIn(true) // Switch to sign in form
      } else {
        setError("Please fill in all fields.")
      }
    }
    setLoading(false)
  }
  const handleGoogleSignIn = () => {
    console.log("Google sign-in clicked")
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Sherine Travels and Tours 🚗</h1>
      </header>
 
      <div className={styles.container}>
        <div className={`${styles.signUpContainer} ${!signIn ? styles.active : ""}`}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <h1 className={styles.title}>Create Account</h1>
            <input className={styles.input} type="text" name="name" placeholder="Name" required />
            <input className={styles.input} type="email" name="email" placeholder="Email" required />
            <input className={styles.input} type="password" name="password" placeholder="Password" required />

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
