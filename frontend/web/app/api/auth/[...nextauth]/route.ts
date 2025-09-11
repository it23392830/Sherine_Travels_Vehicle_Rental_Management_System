import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const backendBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "")

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      return true
    },
    async redirect({ url, baseUrl }: any) {
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
  pages: {},
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions as any)
export { handler as GET, handler as POST }
