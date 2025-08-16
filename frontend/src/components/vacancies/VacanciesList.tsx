'use client'

import { useState } from 'react'
import { Vacancy, ViewMode } from '@/types/vacancy'
import { ViewToggle } from './ViewToggle'
import { VacanciesTable } from './VacanciesTable'
import { VacanciesCards } from './VacanciesCards'
import { Button } from '@/components/ui/button'
import { Plus, Filter, Search } from 'lucide-react'
import {Title} from "@/components/ui/Title";

interface VacanciesListProps {
  vacancies: Vacancy[]
  onAddVacancy?: () => void
  onEditVacancy?: (vacancy: Vacancy) => void
  onArchiveVacancy?: (vacancyId: string) => void
  onViewVacancy?: (vacancy: Vacancy) => void
}

export function VacanciesList({ vacancies, onAddVacancy, onEditVacancy, onArchiveVacancy, onViewVacancy }: VacanciesListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter vacancies based on search query
  const filteredVacancies = vacancies.filter((vacancy) =>
    vacancy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vacancy.company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vacancy.location?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <Title level={4}>
            Job Applications
          </Title>
          <p className="text-muted-foreground text-sm mt-1">
            {vacancies.length === 0 
              ? 'No applications yet' 
              : `${filteredVacancies.length} of ${vacancies.length} applications`
            }
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {vacancies.length > 0 && (
            <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
          )}
          <Button onClick={onAddVacancy} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Application
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      {vacancies.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search jobs, companies, locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 placeholder:text-muted-foreground"
            />
          </div>
          
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>
      )}

      {/* Empty State */}
      {vacancies.length === 0 && (
        <div className="text-center py-16 bg-background-surface rounded-lg border border-border">
          <div className="text-muted-foreground mb-6">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No job applications yet
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Start tracking your job search journey by adding your first application. 
            Keep all your opportunities organized in one place.
          </p>
          <Button onClick={onAddVacancy} size="lg" className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Your First Application
          </Button>
        </div>
      )}

      {/* Search No Results */}
      {vacancies.length > 0 && filteredVacancies.length === 0 && (
        <div className="text-center py-12 bg-background-surface rounded-lg border border-border">
          <div className="text-muted-foreground mb-4">
            <Search className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            No results found
          </h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search terms or clearing the search to see all applications.
          </p>
          <Button variant="outline" onClick={() => setSearchQuery('')}>
            Clear Search
          </Button>
        </div>
      )}

      {/* Content */}
      {filteredVacancies.length > 0 && (
        <div className="animate-in fade-in-50 duration-200">
          {viewMode === 'table' ? (
            <VacanciesTable 
              vacancies={filteredVacancies} 
              onEditVacancy={onEditVacancy}
              onArchiveVacancy={onArchiveVacancy}
              onViewVacancy={onViewVacancy}
            />
          ) : (
            <VacanciesCards 
              vacancies={filteredVacancies}
              onEditVacancy={onEditVacancy}
              onArchiveVacancy={onArchiveVacancy}
              onViewVacancy={onViewVacancy}
            />
          )}
        </div>
      )}

      {/* Summary Stats */}
      {vacancies.length > 0 && (
        <div className="flex justify-center">
          <div className="text-sm text-muted-foreground">
            Showing {filteredVacancies.length} of {vacancies.length} applications
          </div>
        </div>
      )}
    </div>
  )
}