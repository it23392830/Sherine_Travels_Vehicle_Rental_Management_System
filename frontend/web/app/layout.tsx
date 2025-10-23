import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "../hooks/use-auth"
import { AppSessionProvider } from "@/components/auth/session-provider"
import { Toaster } from "sonner"

export const metadata: Metadata = {
  title: "Sherine_Travels",
  description: "Manage your travels with us",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      
      <body suppressHydrationWarning={true}>
        <AppSessionProvider>
          <AuthProvider>
            {children}
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </AppSessionProvider>
      </body>
    </html>
  )
}
