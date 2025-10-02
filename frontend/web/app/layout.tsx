import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "../hooks/use-auth"
import NoSSR from "@/components/no-ssr"

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
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body suppressHydrationWarning={true}>
        <NoSSR 
          fallback={
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600">Loading Sherine Travels...</p>
            </div>
          }
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </NoSSR>
      </body>
    </html>
  )
}
