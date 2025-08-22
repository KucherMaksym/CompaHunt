"use client"

import { DashboardLayout } from "@/components/dashboard-layout"

export default function DocumentsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-y-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Documents
          </h1>
          <p className="text-muted-foreground">
            Manage your resumes, cover letters, and other documents
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Resumes</h3>
            <p className="text-muted-foreground">Upload and manage different resume versions</p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Cover Letters</h3>
            <p className="text-muted-foreground">AI-generated and custom cover letters</p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Portfolios</h3>
            <p className="text-muted-foreground">Project portfolios and work samples</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}