import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "next-themes"
import { AuthProvider } from "../hooks/use-auth"
import { AppSessionProvider } from "@/components/auth/session-provider"

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
    // ✅ Add `className="light"` and enable dark mode toggling
    <html lang="en" className="light" suppressHydrationWarning>
      <body suppressHydrationWarning={true}>
        {/* ✅ Wrap the entire app with ThemeProvider */}
        <ThemeProvider
          attribute="class" // applies "class" or "dark" to <html>
          defaultTheme="light"
          enableSystem={true}
          disableTransitionOnChange={false}
        >
          <AppSessionProvider>
            <AuthProvider>{children}</AuthProvider>
          </AppSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
