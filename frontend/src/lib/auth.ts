import NextAuth, {NextAuthOptions} from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import {JWT} from 'next-auth/jwt'

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: 'consent',
                    access_type: 'offline',
                    response_type: 'code'
                }
            }
        }),
        CredentialsProvider({
            name: 'Email/Password',
            credentials: {
                name: {label: 'Name', type: 'text'},
                email: {label: 'Email', type: 'email'},
                password: {label: 'Password', type: 'password'},
                action: {label: 'Action', type: 'text'}
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                if (credentials.action === 'register') {
                    if (!credentials.name) {
                        throw new Error('Name is required for registration');
                    }
                    try {
                        const res = await fetch(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
                            {
                                method: 'POST',
                                headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify({
                                    name: credentials.name,
                                    email: credentials.email,
                                    password: credentials.password
                                })
                            }
                        )

                        if (!res.ok) {
                            const errorData = await res.json();
                            throw new Error(errorData.message || 'Failed to register');
                        }

                        const userData = await res.json()

                        return {
                            id: userData.id.toString(),
                            email: userData.email,
                            name: userData.name,
                            provider: 'credentials'
                        }
                    } catch (error: any) {
                        console.error('Registration error:', error);
                        throw new Error(error.message);
                    }
                }

                try {
                    const res = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/validate-credentials`,
                        {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({
                                email: credentials.email,
                                password: credentials.password
                            })
                        }
                    )

                    if (!res.ok) {
                        const errorData = await res.json();
                        throw new Error(errorData.message || 'Invalid credentials');
                    }

                    const userData = await res.json()

                    return {
                        id: userData.id.toString(),
                        email: userData.email,
                        name: userData.name,
                        provider: 'credentials'
                    }
                } catch (error: any) {
                    console.error('Credentials auth error:', error);
                    throw new Error(error.message);
                }
            }
        })
    ],

    session: {
        strategy: 'jwt',
        maxAge: 24 * 60 * 60, // 24 hours
    },

    jwt: {
        // Custom encoding logic ( RS256 )
        encode: async ({token, secret}) => {
            const jwt = require('jsonwebtoken')

            const payload = {
                sub: token?.sub,
                email: token?.email,
                name: token?.name,
                avatar: token?.avatar,
                provider: token?.provider,
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
                iss: 'nextauth',
                aud: 'compahunt-api'
            }

            return jwt.sign(payload, process.env.JWT_PRIVATE_KEY!.replace(/\\n/g, '\n'), {
                algorithm: 'RS256'
            })
        },

        decode: async ({token, secret}) => {
            const jwt = require('jsonwebtoken')

            try {
                const pubKey = process.env.JWT_PUBLIC_KEY!.replace(/\\n/g, '\n')
                const decoded = jwt.verify(token, pubKey, {algorithms: ['RS256']})

                return decoded as JWT
            } catch (error) {
                console.error('JWT decode error:', error)
                return null
            }
        }
    },

    callbacks: {
        async jwt({token, user, account}) {

            if (user) {
                token.sub = user.id;
                token.email = user.email;
                token.name = user.name;
                token.provider = account?.provider || 'credentials';
                token.avatar = user.image;

                // Sync with backend
                if (account?.provider === 'google') {
                    try {
                        const syncRes = await fetch(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/sync-google-user`,
                            {
                                method: 'POST',
                                headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify({
                                    googleId: user.id,
                                    email: user.email,
                                    name: user.name,
                                })
                            }
                        )

                        if (syncRes.ok) {
                            const syncData = await syncRes.json()
                            token.sub = syncData.userId.toString()
                            console.log("✅ Google user synced with backend")
                        }
                    } catch (error) {
                        console.error("❌ Failed to sync Google user:", error)
                    }
                }
            }

            return token
        },

        async session({session, token}) {
            // Pass only user-friendly data.
            session.user.id = token.sub as string
            session.user.email = token.email as string
            session.user.name = token.name as string
            session.user.avatar = token.avatar as string

            return session
        },
    },

    pages: {
        signIn: '/auth/signin',
        error: '/auth/error'
    },

    secret: process.env.NEXTAUTH_SECRET,

    debug: process.env.NODE_ENV === 'development'
}