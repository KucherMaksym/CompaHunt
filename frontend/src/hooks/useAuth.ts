import { useSession } from 'next-auth/react'
import {User} from "next-auth";

export function useAuth() {
    const { data: session, status} = useSession()
    return {
        user: status === 'authenticated' ? session.user: null,
        isAuthenticated: status === 'authenticated',
        loading: status === 'loading',
        accessToken: status === 'authenticated' ? session.accessToken : undefined
    }
}