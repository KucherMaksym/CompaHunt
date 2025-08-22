'use client'

import {useState} from 'react'
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query'
import apiClient from "@/lib/api-client";
import dynamic from 'next/dynamic'
import {VacanciesList} from "@/components/vacancies/VacanciesList"
import {VacancyEditModal} from "@/components/vacancies/VacancyEditModal"
import {VacancyDetailModal} from "@/components/vacancies/VacancyDetailModal"
import {InterviewDashboard} from "@/components/dashboard/InterviewDashboard"
import {Vacancy, VacancyStatus} from "@/types/vacancy"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {DashboardLayout} from "@/components/dashboard-layout"

const DynamicHome = dynamic(() => Promise.resolve(Home), {
    ssr: false
})

async function fetchApplications(): Promise<Vacancy[]> {
    console.log("fetching applications");
    const response = await apiClient.getD<any[]>("/api/vacancies");

    // Transform API response to match our Vacancy type
    return response || [];
}

function Home() {
    const {data: applications, isLoading, error} = useQuery({
        queryKey: ['applications'],
        queryFn: fetchApplications,
    })

    const queryClient = useQueryClient()
    const [modalState, setModalState] = useState<{
        isOpen: boolean
        mode: 'create' | 'edit'
        vacancy?: Vacancy
    }>({isOpen: false, mode: 'create'})

    const [detailModalState, setDetailModalState] = useState<{
        isOpen: boolean
        vacancy?: Vacancy
    }>({isOpen: false})

    const archiveMutation = useMutation({
        mutationFn: async (vacancyId: string) => {
            return await apiClient.patch(`/api/vacancies/${vacancyId}/status`, {
                status: VacancyStatus.ARCHIVED
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['applications']})
        }
    })

    const handleAddVacancy = () => {
        setModalState({isOpen: true, mode: 'create'})
    }

    const handleEditVacancy = (vacancy: Vacancy) => {
        setModalState({isOpen: true, mode: 'edit', vacancy})
    }

    const handleArchiveVacancy = (vacancyId: string) => {
        archiveMutation.mutate(vacancyId)
    }

    const handleCloseModal = () => {
        setModalState({isOpen: false, mode: 'create'})
    }

    const handleViewVacancy = (vacancy: Vacancy) => {
        setDetailModalState({isOpen: true, vacancy})
    }

    const handleCloseDetailModal = () => {
        setDetailModalState({isOpen: false})
    }

    const handleAddInterview = () => {
        // This could open a separate interview creation modal
        // For now, we'll just handle it by opening the vacancy modal in create mode
        setModalState({isOpen: true, mode: 'create'})
    }

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div
                            className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading applications...</p>
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-1.732-.833-2.5 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z"/>
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">Error loading applications</h3>
                        <p className="text-muted-foreground">Please try refreshing the page</p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-y-6">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        Track and manage your job search journey
                    </p>
                </div>

                <InterviewDashboard onAddInterview={handleAddInterview}/>

                <VacanciesList
                    onAddVacancy={handleAddVacancy}
                    onEditVacancy={handleEditVacancy}
                    onArchiveVacancy={handleArchiveVacancy}
                    onViewVacancy={handleViewVacancy}
                />

                <VacancyEditModal
                    isOpen={modalState.isOpen}
                    onClose={handleCloseModal}
                    mode={modalState.mode}
                    vacancy={modalState.vacancy}
                />

                <VacancyDetailModal
                    isOpen={detailModalState.isOpen}
                    vacancy={detailModalState.vacancy}
                    onClose={handleCloseDetailModal}
                    onEdit={handleEditVacancy}
                />
            </div>
        </DashboardLayout>
    )
}

export default DynamicHome;