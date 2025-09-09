import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "../hooks/use-auth"

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
        <style>{`
html {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
}
        `}</style>
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
