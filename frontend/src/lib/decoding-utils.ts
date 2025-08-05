import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

const ALLOWED_ALGORITHMS = ['RS256'] as const
const MAX_TOKEN_AGE = 24 * 60 * 60 // 24 hours
const EXPECTED_ISSUER = 'nextauth'
const EXPECTED_AUDIENCE = 'compahunt-api'

interface JWTHeader {
    alg: string
    typ: string
}

interface JWTPayload {
    sub: string
    email: string
    name: string
    provider: string
    iat: number
    exp: number
    iss: string
    aud: string
}

export async function decodeJWT(token: string): Promise<JWTPayload | null> {
    try {
        // Format check
        if (!token || typeof token !== 'string') {
            console.warn('🔐 JWT: Invalid token format')
            return null
        }

        const parts = token.split('.')
        if (parts.length !== 3) {
            console.warn('🔐 JWT: Invalid token structure')
            return null
        }

        const [headerB64, payloadB64, signatureB64] = parts

        // Decode and check headers
        const headerStr = base64UrlDecode(headerB64)
        if (!headerStr) {
            console.warn('🔐 JWT: Invalid header encoding')
            return null
        }

        const header: JWTHeader = JSON.parse(headerStr)

        // Check algorithm (protection against algorithm confusion)
        if (!header.alg || !ALLOWED_ALGORITHMS.includes(header.alg as any)) {
            console.warn(`🔐 JWT: Unsupported algorithm: ${header.alg}`)
            return null
        }

        if (header.typ !== 'JWT') {
            console.warn(`🔐 JWT: Invalid token type: ${header.typ}`)
            return null
        }

        // Decode and check payload
        const payloadStr = base64UrlDecode(payloadB64)
        if (!payloadStr) {
            console.warn('🔐 JWT: Invalid payload encoding')
            return null
        }

        const payload: JWTPayload = JSON.parse(payloadStr)

        // Validate essential claims
        if (!payload.sub || !payload.email || !payload.iat || !payload.exp) {
            console.warn('🔐 JWT: Missing required claims')
            return null
        }

        // Check issuer and audience (token misuse protection)
        if (payload.iss !== EXPECTED_ISSUER) {
            console.warn(`🔐 JWT: Invalid issuer: ${payload.iss}`)
            return null
        }

        if (payload.aud !== EXPECTED_AUDIENCE) {
            console.warn(`🔐 JWT: Invalid audience: ${payload.aud}`)
            return null
        }

        // Time checks
        const now = Math.floor(Date.now() / 1000)

        if (payload.exp <= now) {
            console.warn('🔐 JWT: Token expired')
            return null
        }

        if (payload.iat > now + 60) {
            console.warn('🔐 JWT: Token issued in future')
            return null
        }

        if (now - payload.iat > MAX_TOKEN_AGE) {
            console.warn('🔐 JWT: Token too old')
            return null
        }

        // Verify RSA sign
        const isSignatureValid = await verifyRSASignature(
            `${headerB64}.${payloadB64}`,
            signatureB64
        )

        if (!isSignatureValid) {
            console.warn('🔐 JWT: Invalid signature')
            return null
        }

        console.log(`✅ JWT verified successfully for user: ${payload.sub}`)
        return payload

    } catch (error) {
        console.error('🔐 JWT verification failed:',
            process.env.NODE_ENV === 'development' ? error : 'Verification error')
        return null
    }
}

async function verifyRSASignature(data: string, signatureB64: string): Promise<boolean> {
    try {
        const publicKeyPem = process.env.JWT_PUBLIC_KEY
        if (!publicKeyPem) {
            console.error('🔐 JWT_PUBLIC_KEY not configured')
            return false
        }

        const publicKey = await importRSAPublicKey(publicKeyPem.replace(/\\n/g, '\n'))

        const encoder = new TextEncoder()
        const dataBuffer = encoder.encode(data)
        const signatureBuffer = base64UrlToArrayBuffer(signatureB64)

        if (!signatureBuffer) {
            console.warn('🔐 JWT: Invalid signature encoding')
            return false
        }

        const isValid = await crypto.subtle.verify(
            {
                name: 'RSASSA-PKCS1-v1_5',
                hash: 'SHA-256'
            },
            publicKey,
            signatureBuffer,
            dataBuffer
        )

        return isValid

    } catch (error) {
        console.error('🔐 RSA signature verification failed:',
            process.env.NODE_ENV === 'development' ? error : 'Verification error')
        return false
    }
}

async function importRSAPublicKey(pemKey: string): Promise<CryptoKey> {
    try {
        const b64 = pemKey
            .replace('-----BEGIN PUBLIC KEY-----', '')
            .replace('-----END PUBLIC KEY-----', '')
            .replace(/\s/g, '')

        if (!b64) {
            throw new Error('Empty key after PEM cleanup')
        }

        // Convert to ArrayBuffer
        const binaryKey = atob(b64)
        const keyBuffer = new Uint8Array(binaryKey.length)

        for (let i = 0; i < binaryKey.length; i++) {
            keyBuffer[i] = binaryKey.charCodeAt(i)
        }

        const cryptoKey = await crypto.subtle.importKey(
            'spki',
            keyBuffer.buffer,
            {
                name: 'RSASSA-PKCS1-v1_5',
                hash: 'SHA-256'
            },
            false,
            ['verify']
        )

        return cryptoKey

    } catch (error) {
        console.error('🔐 Failed to import RSA public key:', error)
        throw new Error('Invalid RSA public key')
    }
}

function base64UrlDecode(base64Url: string): string | null {
    try {
        if (!base64Url || typeof base64Url !== 'string') {
            return null
        }

        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')

        const padding = base64.length % 4
        if (padding) {
            base64 += '='.repeat(4 - padding)
        }

        const decoded = atob(base64)

        try {
            return decodeURIComponent(escape(decoded))
        } catch {
            return decoded // Fallback for ASCII
        }

    } catch (error) {
        console.warn('🔐 Base64URL decode failed:', error)
        return null
    }
}

function base64UrlToArrayBuffer(base64Url: string): ArrayBuffer | null {
    try {
        const decoded = base64UrlDecode(base64Url)
        if (!decoded) return null

        const binary = atob(base64Url.replace(/-/g, '+').replace(/_/g, '/'))
        const bytes = new Uint8Array(binary.length)

        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i)
        }

        return bytes.buffer

    } catch (error) {
        console.warn('🔐 Base64URL to ArrayBuffer failed:', error)
        return null
    }
}