import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import {Providers} from "@/app/providers";
import {Toaster} from "@/components/Toaster";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'JobTracker Pro',
    description: 'AI-Powered Career Management Platform',
}

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body className={inter.className} suppressHydrationWarning>
        <Providers>
            <Toaster/>
            <Header />
            <div className="min-h-app-height">
                {children}
            </div>
        </Providers>
        </body>
        </html>
    )
}