"use client"

import { DashboardLayout } from "@/components/dashboard-layout"

export default function VacanciesKanbanPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-y-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Kanban Board
          </h1>
          <p className="text-muted-foreground">
            Visual pipeline of your job applications
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 min-h-[600px]">
          <div className="p-4 border rounded-lg bg-gray-600/20">
            <h3 className="font-semibold mb-4">Applied</h3>
            <p className="text-sm text-muted-foreground">Drag and drop cards here</p>
          </div>
          
          <div className="p-4 border rounded-lg bg-blue-600/20">
            <h3 className="font-semibold mb-4">Interview</h3>
            <p className="text-sm text-muted-foreground">Drag and drop cards here</p>
          </div>
          
          <div className="p-4 border rounded-lg bg-yellow-600/20">
            <h3 className="font-semibold mb-4">Final Round</h3>
            <p className="text-sm text-muted-foreground">Drag and drop cards here</p>
          </div>
          
          <div className="p-4 border rounded-lg bg-green-600/20">
            <h3 className="font-semibold mb-4">Offer</h3>
            <p className="text-sm text-muted-foreground">Drag and drop cards here</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}