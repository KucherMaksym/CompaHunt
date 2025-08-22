"use client"

import { VacanciesList } from "./VacanciesList"
import { VacancySummaryCards } from "./VacancySummaryCards"
import { Vacancy } from "@/types/vacancy"
import { useFilteredVacancies } from "@/hooks/useVacancies"

interface VacanciesWithSummaryProps {
  onAddVacancy?: () => void
  onEditVacancy?: (vacancy: Vacancy) => void
  onArchiveVacancy?: (vacancyId: string) => void
  onViewVacancy?: (vacancy: Vacancy) => void
}

export function VacanciesWithSummary({
  onAddVacancy,
  onEditVacancy,
  onArchiveVacancy,
  onViewVacancy
}: VacanciesWithSummaryProps) {
  // Get basic vacancy data for summary cards
  const { data: vacancyPage } = useFilteredVacancies({
    page: 0,
    size: 1000, // Get all for summary
    sortBy: 'createdAt',
    sortDirection: 'desc',
    search: '',
    status: null,
    minSalary: '',
    maxSalary: '',
    salaryPeriod: 'month',
    location: '',
    experienceLevel: '',
    jobType: '',
    remoteness: ''
  })

  const allVacancies = vacancyPage?.content || []

  return (
    <div className="space-y-6">
      <VacancySummaryCards
        vacancies={allVacancies}
      />
      
      <VacanciesList
        onAddVacancy={onAddVacancy}
        onEditVacancy={onEditVacancy}
        onArchiveVacancy={onArchiveVacancy}
        onViewVacancy={onViewVacancy}
      />
    </div>
  )
}