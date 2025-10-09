"use client"
import { Suspense, useEffect } from "react"
import { useSession, signIn } from "next-auth/react"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"
import { ROLE_ROUTES } from "@/lib/auth"
import { useSearchParams } from "next/navigation"

function OAuthBridgeWorker() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const run = async () => {
      if (status === "loading") return
      if (status === "unauthenticated") {
        await signIn("google")
        return
      }
      try {
        const email = session?.user?.email as string
        const name = (session?.user?.name as string) || email?.split("@")[0]
        const requestedRoleParam = searchParams?.get("role")
        const requestedRole = requestedRoleParam === "Driver" ? "Driver" : "User"
        const { token, roles } = await apiFetch<{ token: string; roles: string[] }>(
          "/api/Auth/oauth",
          {
            method: "POST",
            body: JSON.stringify({ provider: "google", email, fullName: name, requestedRole }),
          }
        )

        localStorage.setItem("sherine_auth_token", token)
        const role = (roles && roles[0]) || "User"
        const user = { email, fullName: name, role, token }
        localStorage.setItem("sherine_auth_user", JSON.stringify(user))

        toast({ title: "Signed in with Google" })
        router.replace(ROLE_ROUTES[role as keyof typeof ROLE_ROUTES])
      } catch (e: any) {
        toast({ title: "Google sign-in failed", description: e?.message || "Unknown error" })
        router.replace("/")
      }
    }
    run()
  }, [status, session, router, searchParams])

  return <div className="p-6">Signing you in…</div>
}

export default function OAuthBridgePage() {
  return (
    <Suspense fallback={<div className="p-6">Preparing sign-in…</div>}>
      <OAuthBridgeWorker />
    </Suspense>
  )
}


