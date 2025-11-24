import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email as string),
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        const dbUser = await db.query.users.findFirst({
          where: eq(users.id, user.id as string),
        })
        if (dbUser) {
          token.subscriptionStatus = dbUser.subscriptionStatus
          token.subscriptionEndsAt = dbUser.subscriptionEndsAt?.toISOString()
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.subscriptionStatus = token.subscriptionStatus as string
        session.user.subscriptionEndsAt = token.subscriptionEndsAt as string | undefined
      }
      return session
    },
  },
})

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      subscriptionStatus?: string
      subscriptionEndsAt?: string
    }
  }
  interface User {
    id: string
    email: string
    name: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    subscriptionStatus?: string
    subscriptionEndsAt?: string
  }
}

