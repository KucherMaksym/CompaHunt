"use client"

import { DashboardLayout } from "@/components/dashboard-layout"

export default function CareerGoalsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-y-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Career Goals
          </h1>
          <p className="text-muted-foreground">
            Set and track your career objectives and progress
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Short-term Goals</h3>
            <p className="text-muted-foreground">Goals for the next 6-12 months</p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Long-term Goals</h3>
            <p className="text-muted-foreground">Career vision for 2-5 years</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}