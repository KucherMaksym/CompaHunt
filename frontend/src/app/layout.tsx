import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import {Providers} from "@/app/providers";
import {Toaster} from "@/components/Toaster";
import {PendingEventsManager} from "@/components/events/PendingEventsManager";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'CompaHunt',
    description: 'AI-Powered Career Management Platform',
}

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body className={inter.className} suppressHydrationWarning>
        <Providers>
            <Toaster/>
            <PendingEventsManager />
            {children}
        </Providers>
        </body>
        </html>
    )
}