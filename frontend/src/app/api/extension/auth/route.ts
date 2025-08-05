import { getServerSession } from "next-auth/next"
import {authOptions} from "@/lib/auth";
import {NextRequest, NextResponse} from "next/server";

export async function GET(req: NextRequest, res: NextResponse) {

    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ status: 401, message: 'Unauthorized' })
    }

    const jwt = require('jsonwebtoken')
    const payload = {
        sub: session.user.id,
        email: session.user.email,
        name: session.user.name,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
        iss: 'nextauth',
        aud: 'compahunt-api'
    }

    const token = jwt.sign(payload, process.env.JWT_PRIVATE_KEY!.replace(/\\n/g, '\n'), {
        algorithm: 'RS256'
    })

    console.log("generated token for extension: ", token)

    return NextResponse.json({
        status: 200,
        token,
        user: {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name
        }
    })
}