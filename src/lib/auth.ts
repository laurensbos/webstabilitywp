import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { redis } from "./redis"
import bcrypt from "bcryptjs"

export interface User {
  id: string
  email: string
  name: string
  password: string
  createdAt: number
  emailVerified?: boolean
  verificationToken?: string
}

async function getUser(email: string): Promise<User | null> {
  const userId = await redis.get(`user:email:${email.toLowerCase()}`)
  if (!userId) return null
  
  const user = await redis.hgetall(`user:${userId}`)
  if (!user) return null
  
  return {
    id: user.id as string,
    email: user.email as string,
    name: user.name as string,
    password: user.password as string,
    createdAt: user.createdAt as number,
    emailVerified: user.emailVerified === 'true',
    verificationToken: user.verificationToken as string | undefined,
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await getUser(credentials.email as string)
        if (!user) return null

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!passwordMatch) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
  },
})
