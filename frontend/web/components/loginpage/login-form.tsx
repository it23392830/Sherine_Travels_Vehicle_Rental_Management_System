 "use client"

import React, { useState } from 'react'
import { useRouter } from "next/navigation"
import { AuthService } from "@/lib/auth"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/hooks/use-toast"
import { signIn as nextAuthSignIn } from "next-auth/react"
import { Car, Mail, Lock, Eye, EyeOff, ArrowRight, User, Sparkles } from 'lucide-react'
import styles from './animations.module.css'

const LoginForm = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const [signUpRole, setSignUpRole] = useState<"User" | "Driver">("User")
  
  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState("")

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      if (isSignUp) {
        if (!fullName || !email || !password) {
          setError("Please fill in all fields.")
          setIsLoading(false)
          return
        }
        if (password !== confirmPassword) {
          setError("Passwords do not match.")
          setIsLoading(false)
          return
        }
        try {
          await AuthService.signup(fullName, email, password, signUpRole)
          toast({ title: "Account created", description: "Please sign in to continue." })
          setIsSignUp(false)
        } catch (e: any) {
          const msg = e?.message || "Sign up failed."
          setError(msg)
          toast({ title: "Signup failed", description: msg })
        }
      } else {
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
      }
    } catch {
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setEmail('')
    setPassword('')
    setFullName('')
    setConfirmPassword('')
    setError("")
  }

  const handleGoogleSignIn = () => {
    // Button is displayed but no redirect functionality
    console.log("Google sign-up button clicked - no redirect configured")
  }

  return (
    <>
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated Cars - Top Road */}
        <div className="absolute top-20 left-0 right-0">
          {/* Road */}
          <div className="h-20 bg-gray-700/40 border-t-4 border-b-4 border-yellow-400/60 relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 border-t-4 border-dashed border-white/60"></div>
          </div>
          
          {/* Car 1 */}
          <div className={`absolute top-2 ${styles.animateDriveRight}`}>
            <div className="relative">
              <svg width="80" height="40" viewBox="0 0 80 40" className="drop-shadow-lg">
                <rect x="10" y="20" width="60" height="15" rx="3" fill="#3B82F6"/>
                <rect x="20" y="10" width="40" height="15" rx="3" fill="#60A5FA"/>
                <rect x="25" y="13" width="15" height="10" rx="2" fill="#DBEAFE"/>
                <rect x="45" y="13" width="10" height="10" rx="2" fill="#DBEAFE"/>
                <circle cx="25" cy="35" r="5" fill="#1F2937"/>
                <circle cx="25" cy="35" r="3" fill="#374151"/>
                <circle cx="55" cy="35" r="5" fill="#1F2937"/>
                <circle cx="55" cy="35" r="3" fill="#374151"/>
              </svg>
            </div>
          </div>

          {/* Car 2 */}
          <div className={`absolute top-2 ${styles.animateDriveRightDelayed}`}>
            <div className="relative">
              <svg width="70" height="35" viewBox="0 0 70 35" className="drop-shadow-lg">
                <rect x="8" y="18" width="54" height="13" rx="3" fill="#8B5CF6"/>
                <rect x="16" y="9" width="35" height="13" rx="3" fill="#A78BFA"/>
                <rect x="20" y="12" width="12" height="8" rx="2" fill="#EDE9FE"/>
                <rect x="38" y="12" width="9" height="8" rx="2" fill="#EDE9FE"/>
                <circle cx="22" cy="31" r="4" fill="#1F2937"/>
                <circle cx="22" cy="31" r="2.5" fill="#374151"/>
                <circle cx="48" cy="31" r="4" fill="#1F2937"/>
                <circle cx="48" cy="31" r="2.5" fill="#374151"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Animated Cars - Bottom Road */}
        <div className="absolute bottom-32 left-0 right-0">
          <div className="h-20 bg-gray-700/40 border-t-4 border-b-4 border-yellow-400/60 relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 border-t-4 border-dashed border-white/60"></div>
          </div>
          
          {/* Car 3 */}
          <div className={`absolute top-2 ${styles.animateDriveLeft}`}>
            <div className="relative">
              <svg width="75" height="38" viewBox="0 0 75 38" className="drop-shadow-lg transform scale-x-[-1]">
                <rect x="8" y="19" width="58" height="14" rx="3" fill="#10B981"/>
                <rect x="18" y="9" width="38" height="14" rx="3" fill="#34D399"/>
                <rect x="23" y="12" width="14" height="9" rx="2" fill="#D1FAE5"/>
                <rect x="42" y="12" width="10" height="9" rx="2" fill="#D1FAE5"/>
                <circle cx="23" cy="33" r="4.5" fill="#1F2937"/>
                <circle cx="23" cy="33" r="3" fill="#374151"/>
                <circle cx="52" cy="33" r="4.5" fill="#1F2937"/>
                <circle cx="52" cy="33" r="3" fill="#374151"/>
              </svg>
            </div>
          </div>

          {/* Car 4 */}
          <div className={`absolute top-2 ${styles.animateDriveLeftDelayed}`}>
            <div className="relative">
              <svg width="65" height="33" viewBox="0 0 65 33" className="drop-shadow-lg transform scale-x-[-1]">
                <rect x="7" y="17" width="50" height="12" rx="3" fill="#F59E0B"/>
                <rect x="15" y="8" width="33" height="12" rx="3" fill="#FBBF24"/>
                <rect x="19" y="11" width="11" height="8" rx="2" fill="#FEF3C7"/>
                <rect x="35" y="11" width="9" height="8" rx="2" fill="#FEF3C7"/>
                <circle cx="20" cy="29" r="4" fill="#1F2937"/>
                <circle cx="20" cy="29" r="2.5" fill="#374151"/>
                <circle cx="45" cy="29" r="4" fill="#1F2937"/>
                <circle cx="45" cy="29" r="2.5" fill="#374151"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Clouds */}
        <div className={`absolute top-12 right-1/4 ${styles.animateCloudFloat}`}>
          <svg width="100" height="50" viewBox="0 0 100 50">
            <ellipse cx="25" cy="35" rx="20" ry="15" fill="white" opacity="0.7"/>
            <ellipse cx="45" cy="30" rx="25" ry="18" fill="white" opacity="0.7"/>
            <ellipse cx="65" cy="35" rx="20" ry="15" fill="white" opacity="0.7"/>
          </svg>
        </div>

        <div className={`absolute top-40 left-1/4 ${styles.animateCloudFloatSlow}`}>
          <svg width="80" height="40" viewBox="0 0 80 40">
            <ellipse cx="20" cy="28" rx="15" ry="12" fill="white" opacity="0.6"/>
            <ellipse cx="35" cy="25" rx="20" ry="15" fill="white" opacity="0.6"/>
            <ellipse cx="52" cy="28" rx="15" ry="12" fill="white" opacity="0.6"/>
          </svg>
        </div>

        {/* Sun */}
        <div className={`absolute top-8 right-12 ${styles.animateSunPulse}`}>
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="25" fill="#FCD34D" opacity="0.8"/>
            <circle cx="40" cy="40" r="20" fill="#FDE047"/>
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              const x1 = 40 + Math.cos(rad) * 28;
              const y1 = 40 + Math.sin(rad) * 28;
              const x2 = 40 + Math.cos(rad) * 35;
              const y2 = 40 + Math.sin(rad) * 35;
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#FDE047"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
        </div>

        {/* Trees */}
        <div className={`absolute bottom-60 left-12 ${styles.animateTreeSway}`}>
          <svg width="40" height="80" viewBox="0 0 40 80">
            <rect x="16" y="50" width="8" height="30" fill="#92400E"/>
            <polygon points="20,10 5,50 35,50" fill="#16A34A"/>
            <polygon points="20,25 8,50 32,50" fill="#22C55E"/>
          </svg>
        </div>

        <div className={`absolute bottom-56 right-16 ${styles.animateTreeSwayDelayed}`}>
          <svg width="35" height="70" viewBox="0 0 35 70">
            <rect x="14" y="45" width="7" height="25" fill="#92400E"/>
            <polygon points="17,8 4,45 30,45" fill="#15803D"/>
            <polygon points="17,20 7,45 27,45" fill="#16A34A"/>
          </svg>
        </div>

        {/* Buildings */}
        <div className={`absolute top-1/3 left-8 ${styles.animateFadeIn}`}>
          <svg width="60" height="100" viewBox="0 0 60 100">
            <rect x="5" y="20" width="50" height="80" fill="#3B82F6" opacity="0.3"/>
            <rect x="10" y="30" width="8" height="8" fill="#DBEAFE" opacity="0.6"/>
            <rect x="22" y="30" width="8" height="8" fill="#DBEAFE" opacity="0.6"/>
            <rect x="34" y="30" width="8" height="8" fill="#DBEAFE" opacity="0.6"/>
            <rect x="10" y="45" width="8" height="8" fill="#DBEAFE" opacity="0.6"/>
            <rect x="22" y="45" width="8" height="8" fill="#DBEAFE" opacity="0.6"/>
            <rect x="34" y="45" width="8" height="8" fill="#DBEAFE" opacity="0.6"/>
          </svg>
        </div>

        <div className={`absolute top-1/4 right-12 ${styles.animateFadeInDelayed}`}>
          <svg width="50" height="120" viewBox="0 0 50 120">
            <rect x="5" y="10" width="40" height="110" fill="#8B5CF6" opacity="0.3"/>
            <rect x="10" y="20" width="7" height="7" fill="#EDE9FE" opacity="0.6"/>
            <rect x="22" y="20" width="7" height="7" fill="#EDE9FE" opacity="0.6"/>
            <rect x="10" y="35" width="7" height="7" fill="#EDE9FE" opacity="0.6"/>
            <rect x="22" y="35" width="7" height="7" fill="#EDE9FE" opacity="0.6"/>
          </svg>
        </div>
      </div>

        {/* Auth Form - Centered */}
        <div className="w-full max-w-md mx-auto relative z-20">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 lg:p-10 border border-white/50">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-lg mb-4">
                <Car className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Sherine Travels
              </h1>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-gray-600">
                {isSignUp ? 'Join us to manage your operations' : 'Sign in to manage your operations'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 block">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:bg-white outline-none transition-all duration-300 text-gray-800"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:bg-white outline-none transition-all duration-300 text-gray-800"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:bg-white outline-none transition-all duration-300 text-gray-800"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 block">Confirm Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:bg-white outline-none transition-all duration-300 text-gray-800"
                        placeholder="Confirm your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 block">Role</label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name="signup_role"
                          value="User"
                          checked={signUpRole === "User"}
                          onChange={() => setSignUpRole("User")}
                          className="text-blue-600"
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
                          className="text-blue-600"
                        />
                        Driver
                      </label>
                    </div>
                  </div>
                </>
              )}

              {!isSignUp && (
                <div className="flex items-center justify-end">
                  <button type="button" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-300">
                    Forgot password?
                  </button>
                </div>
              )}

              {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{isSignUp ? 'Creating account...' : 'Signing in...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {isSignUp && (
                <>
                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">or</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-medium py-3.5 rounded-xl transition-all duration-300 hover:shadow-md"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign up with Google
                  </button>
                </>
              )}

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">
                    {isSignUp ? 'Already have an account?' : 'New to Sherine Travels?'}
                  </span>
                </div>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={toggleMode}
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors duration-300"
                >
                  {isSignUp ? 'Sign in to existing account' : 'Create an account'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          <p className="text-center text-sm text-gray-600 mt-6">
            By {isSignUp ? 'signing up' : 'signing in'}, you agree to our{' '}
            <button className="text-blue-600 hover:underline">Terms</button>
            {' '}and{' '}
            <button className="text-blue-600 hover:underline">Privacy Policy</button>
          </p>
        </div>
      </div>
    </>
  )
}

export default LoginForm
