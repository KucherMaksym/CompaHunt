"use client"

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DashboardLayout } from "@/components/dashboard-layout"
import { InterviewsList } from "@/components/interviews/InterviewsList"
import { InterviewSummaryCards } from "@/components/interviews/InterviewSummaryCards"
import {EditInterviewModal} from "@/components/interviews/EditInterviewModal"
import {CreateInterviewModal} from "@/components/interviews/CreateInterviewModal"
import { InterviewDetailModal } from "@/components/interviews/InterviewDetailModal"
import { Interview } from "@/types/vacancy"
import apiClient from "@/lib/api-client"

async function fetchInterviews(): Promise<Interview[]> {
  const response = await apiClient.getD<any[]>("/api/interviews")
  return response || []
}

export default function InterviewsPage() {
  const { data: interviews, isLoading, error } = useQuery({
    queryKey: ['interviews'],
    queryFn: fetchInterviews,
  })

  const queryClient = useQueryClient()
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalState, setEditModalState] = useState<{
    isOpen: boolean
    interview: Interview | null
  }>({ isOpen: false, interview: null })
  
  const [detailModalState, setDetailModalState] = useState<{
    isOpen: boolean
    interview?: Interview
  }>({ isOpen: false })

  const deleteMutation = useMutation({
    mutationFn: async (interviewId: string) => {
      return await apiClient.delete(`/api/interviews/${interviewId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] })
    }
  })

  const handleAddInterview = () => {
    setCreateModalOpen(true)
  }

  const handleEditInterview = (interview: Interview) => {
    setEditModalState({ isOpen: true, interview })
  }

  const handleDeleteInterview = (interviewId: string) => {
    deleteMutation.mutate(interviewId)
  }

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false)
  }

  const handleCloseEditModal = () => {
    setEditModalState({ isOpen: false, interview: null })
  }

  const handleSaveInterview = () => {
    queryClient.invalidateQueries({ queryKey: ['interviews'] })
  }

  const handleViewInterview = (interview: Interview) => {
    setDetailModalState({ isOpen: true, interview })
  }

  const handleCloseDetailModal = () => {
    setDetailModalState({ isOpen: false })
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading interviews...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-destructive mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-1.732-.833-2.5 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Error loading interviews</h3>
            <p className="text-muted-foreground">Please try refreshing the page</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/*<InterviewSummaryCards*/}
        {/*  interviews={interviews || []}*/}
        {/*/>*/}
        
        <InterviewsList
          interviews={interviews || []}
          onAddInterview={handleAddInterview}
          onEditInterview={handleEditInterview}
          onDeleteInterview={handleDeleteInterview}
          onViewInterview={handleViewInterview}
        />
      </div>

      <CreateInterviewModal
        isOpen={createModalOpen}
        onClose={handleCloseCreateModal}
        onSave={handleSaveInterview}
      />

      {editModalState.interview && (
        <EditInterviewModal
          isOpen={editModalState.isOpen}
          onClose={handleCloseEditModal}
          interview={editModalState.interview}
          onSave={handleSaveInterview}
        />
      )}

      {detailModalState.interview && (
        <InterviewDetailModal
          isOpen={detailModalState.isOpen}
          interview={detailModalState.interview}
          onClose={handleCloseDetailModal}
          onEdit={handleEditInterview}
        />
      )}
    </DashboardLayout>
  )
}