"use client"

import { DashboardLayout } from "@/components/dashboard-layout"

export default function CompaniesPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-y-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Companies
          </h1>
          <p className="text-muted-foreground">
            Track companies you're interested in or have applied to
          </p>
        </div>
        
        <div className="p-6 border rounded-lg">
          <p className="text-muted-foreground">
            Company profiles and insights will be displayed here
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}