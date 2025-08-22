"use client"

import { DashboardLayout } from "@/components/dashboard-layout"

export default function ContactsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-y-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Contacts
          </h1>
          <p className="text-muted-foreground">
            Manage your professional network and referrals
          </p>
        </div>
        
        <div className="p-6 border rounded-lg">
          <p className="text-muted-foreground">
            Professional contacts and network will be managed here
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}