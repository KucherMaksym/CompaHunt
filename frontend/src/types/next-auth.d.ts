import NextAuth from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
    interface Session {
        accessToken?: string
        provider: string
        user: {
            id: string
            email: string
            name: string
            avatar: string
        }
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        backendToken?: string
    }
}