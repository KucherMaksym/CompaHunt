"use client"

import { DashboardLayout } from "@/components/dashboard-layout"

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-y-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Settings
          </h1>
          <p className="text-muted-foreground">
            Configure your application preferences
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Account Settings</h3>
            <p className="text-muted-foreground">Manage your account and profile</p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Notifications</h3>
            <p className="text-muted-foreground">Configure email and push notifications</p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Privacy</h3>
            <p className="text-muted-foreground">Data privacy and security settings</p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Integrations</h3>
            <p className="text-muted-foreground">Connect external services</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}