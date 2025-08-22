"use client"

import {useState} from 'react'
import {DashboardLayout} from "@/components/dashboard-layout"
import {VacanciesWithSummary} from "@/components/vacancies/VacanciesWithSummary"
import {VacancyEditModal} from "@/components/vacancies/VacancyEditModal"
import {VacancyDetailModal} from "@/components/vacancies/VacancyDetailModal"
import {Vacancy} from "@/types/vacancy"

export default function VacanciesPage() {
    const [modalState, setModalState] = useState<{
        isOpen: boolean
        mode: 'create' | 'edit'
        vacancy?: Vacancy
    }>({isOpen: false, mode: 'create'})

    const [detailModalState, setDetailModalState] = useState<{
        isOpen: boolean
        vacancy?: Vacancy
    }>({isOpen: false})

    const handleAddVacancy = () => {
        setModalState({isOpen: true, mode: 'create'})
    }

    const handleEditVacancy = (vacancy: Vacancy) => {
        setModalState({isOpen: true, mode: 'edit', vacancy})
    }

    const handleArchiveVacancy = (vacancyId: string) => {
        // This will be handled by the VacanciesList component internally
        console.log('Archive vacancy:', vacancyId)
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

    return (
        <DashboardLayout>
            <VacanciesWithSummary
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
        </DashboardLayout>
    )
}