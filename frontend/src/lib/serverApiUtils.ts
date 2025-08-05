'use server';

import { cookies, headers } from 'next/headers';
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";

export async function getServerAccessToken(): Promise<string | null> {
    try {
        const session = await getServerSession(authOptions);
        return session?.accessToken || null;
    } catch (error) {
        console.warn('Failed to get server session:', error);
        return null;
    }
}

export async function getRequestCookies(): Promise<string> {
    try {
        const cookiesList = cookies();
        if (cookiesList) {
            return (await cookiesList).getAll()
                .map(cookie => `${cookie.name}=${cookie.value}`)
                .join('; ');
        }

        const headersList = await headers();
        return headersList.get('cookie') || '';
    } catch (error) {
        console.error('Error getting request cookies:', error);
        return '';
    }
}