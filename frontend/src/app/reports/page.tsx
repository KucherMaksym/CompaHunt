"use client"

import { DashboardLayout } from "@/components/dashboard-layout"

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-y-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Reports
          </h1>
          <p className="text-muted-foreground">
            Generate detailed reports on your job search progress
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Weekly Summary</h3>
            <p className="text-muted-foreground">Your job search activity this week</p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Monthly Report</h3>
            <p className="text-muted-foreground">Comprehensive monthly progress report</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}