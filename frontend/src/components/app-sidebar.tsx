"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { 
  Home,
  BarChart3,
  Briefcase,
  Calendar,
  FileText,
  Settings,
  User,
  Building2,
  Users,
  Target,
  TrendingUp,
  Kanban,
  Archive
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
]

const vacancyItems = [
  {
    title: "All Vacancies",
    url: "/vacancies",
    icon: Briefcase,
  },
  {
    title: "Kanban Board",
    url: "/vacancies/kanban",
    icon: Kanban,
  },
]

const careerItems = [
  {
    title: "Interviews",
    url: "/interviews",
    icon: Calendar,
  },
  {
    title: "Companies",
    url: "/companies",
    icon: Building2,
  },
]

const resourceItems = [
  {
    title: "Documents",
    url: "/documents",
    icon: FileText,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: TrendingUp,
  },
]

const systemItems = [
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-2 py-4">
          <h2 className="text-lg font-semibold">CompaHunt</h2>
          <p className="text-sm text-muted-foreground">AI Career Platform</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Vacancies</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {vacancyItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Career</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {careerItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/*<SidebarGroup>*/}
        {/*  <SidebarGroupLabel>Resources</SidebarGroupLabel>*/}
        {/*  <SidebarGroupContent>*/}
        {/*    <SidebarMenu>*/}
        {/*      {resourceItems.map((item) => (*/}
        {/*        <SidebarMenuItem key={item.title}>*/}
        {/*          <SidebarMenuButton */}
        {/*            asChild */}
        {/*            isActive={pathname === item.url}*/}
        {/*          >*/}
        {/*            <Link href={item.url}>*/}
        {/*              <item.icon />*/}
        {/*              <span>{item.title}</span>*/}
        {/*            </Link>*/}
        {/*          </SidebarMenuButton>*/}
        {/*        </SidebarMenuItem>*/}
        {/*      ))}*/}
        {/*    </SidebarMenu>*/}
        {/*  </SidebarGroupContent>*/}
        {/*</SidebarGroup>*/}
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarMenu>
          {systemItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild 
                isActive={pathname === item.url}
              >
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}