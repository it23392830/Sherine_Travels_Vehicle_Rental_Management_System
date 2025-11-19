import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

// Log environment variables for debugging
console.log('[NextAuth] GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET')
console.log('[NextAuth] GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET')
console.log('[NextAuth] NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET')
console.log('[NextAuth] NEXTAUTH_URL:', process.env.NEXTAUTH_URL)

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      console.log('[NextAuth] signIn callback:', { email: user?.email, provider: account?.provider })
      return true
    },
    async redirect({ url, baseUrl }: any) {
      console.log('[NextAuth] redirect callback:', { url, baseUrl })
      // Preserve the provided callbackUrl (e.g., /oauth-bridge?role=Driver)
      try {
        const u = new URL(url, baseUrl)
        if (u.origin === baseUrl) return u.toString()
      } catch {
        if (url?.startsWith('/')) return `${baseUrl}${url}`
      }
      return `${baseUrl}/oauth-bridge`
    },
    async session({ session }: any) {
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login', // Redirect to login page on error
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debug mode for better error messages
}

const handler = NextAuth(authOptions as any)
export { handler as GET, handler as POST }
