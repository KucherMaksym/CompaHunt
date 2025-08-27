"use client"

import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar"
import {AppSidebar} from "@/components/app-sidebar"
import {Separator} from "@/components/ui/separator"
import {ThemeToggle} from "@/components/ThemeToggle"
import {useAuth} from "@/hooks/useAuth"
import Avatar from "@/components/ui/Avatar"
import {useRouter, usePathname} from "next/navigation"
import {Button} from "@/components/ui/button"
import {cn} from "@/lib/utils";

interface DashboardLayoutProps {
    children: React.ReactNode;
    className?: string;
}

function getPageTitle(pathname: string): string {
    const routeTitles: Record<string, string> = {
        '/dashboard': 'Dashboard',
        '/analytics': 'Analytics',
        '/vacancies': 'All Vacancies',
        '/vacancies/kanban': 'Kanban Board',
        '/vacancies/archive': 'Archive',
        '/career': 'Career Profile',
        '/interviews': 'Interviews',
        '/companies': 'Companies',
        '/contacts': 'Contacts',
        '/career-goals': 'Career Goals',
        '/documents': 'Documents',
        '/reports': 'Reports',
        '/profile': 'Profile',
        '/settings': 'Settings'
    }

    return routeTitles[pathname] || 'CompaHunt'
}

export function DashboardLayout({children, className}: DashboardLayoutProps) {
    const {user, loading} = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const pageTitle = getPageTitle(pathname)

    return (
        <SidebarProvider>
            <AppSidebar/>
            <SidebarInset className="overflow-x-hidden">
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1"/>
                    <Separator orientation="vertical" className="mr-2 h-4"/>
                    <div className="flex-1 flex items-center justify-between">
                        <h1 className="text-xl font-semibold">{pageTitle}</h1>
                        <div className="flex items-center gap-4">
                            <ThemeToggle/>
                            {user && !loading
                                ? <Avatar avatarUrl={user?.avatar} name={user.name}
                                          onClick={() => router.push("/profile")}/>
                                :
                                <Button onClick={() => router.push("/auth/signin")} variant={"default"}>Sign In</Button>
                            }
                        </div>
                    </div>
                </header>

                <div className={cn("flex flex-1 flex-col gap-4 p-4", className)}>
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}