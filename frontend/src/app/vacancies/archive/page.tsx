"use client"

import { DashboardLayout } from "@/components/dashboard-layout"

export default function VacanciesArchivePage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-y-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Archive
          </h1>
          <p className="text-muted-foreground">
            Archived job applications
          </p>
        </div>
        
        <div className="p-6 border rounded-lg">
          <p className="text-muted-foreground">
            Archived vacancies will be displayed here
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}