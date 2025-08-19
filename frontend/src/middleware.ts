import {withAuth} from "next-auth/middleware";
import {NextResponse} from "next/server";
import {decodeJWT} from "@/lib/decoding-utils";

export default withAuth(
    function middleware(req) {
        console.log(`🔐 Middleware: ${req.nextUrl.pathname}`)
        return NextResponse.next()
    },
    {
        jwt: {
            decode: async ({token, secret}) => {
                if (!token) {
                    console.warn('🔐 No token provided')
                    return null
                }

                return await decodeJWT(token) as any;
            }
        },
        callbacks: {
            authorized: ({token, req}) => {
                const isProtectedRoute = [
                    '/dashboard',
                    '/profile',
                    '/settings'
                ].some(path => req.nextUrl.pathname.startsWith(path))

                if (isProtectedRoute) {
                    const isAuthorized = !!(token && token.sub && token.email)

                    console.log(`🔐 Authorization: ${isAuthorized ? 'GRANTED' : 'DENIED'} for ${req.nextUrl.pathname}`)

                    return isAuthorized
                }

                return true
            },
        },
    }
)

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/profile/:path*',
        '/settings/:path*',
        '/admin/:path*',
    ]
}