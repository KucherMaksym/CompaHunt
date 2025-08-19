'use client'

import {useState, useEffect, useRef} from 'react'
import {Vacancy, ViewMode} from '@/types/vacancy'
import {ViewToggle} from './ViewToggle'
import {VacanciesTable} from './VacanciesTable'
import {VacanciesCards} from './VacanciesCards'
import {VacancyFilters, type VacancyFilters as VacancyFiltersType} from './VacancyFilters'
import {VacancyPagination, type PaginationData} from './VacancyPagination'
import {Button} from '@/components/ui/button'
import {Plus, Loader2} from 'lucide-react'
import {Title} from "@/components/ui/Title"
import {useFilteredVacancies, type VacancyQueryParams} from '@/hooks/useVacancies'

interface VacanciesListProps {
    onAddVacancy?: () => void
    onEditVacancy?: (vacancy: Vacancy) => void
    onArchiveVacancy?: (vacancyId: string) => void
    onViewVacancy?: (vacancy: Vacancy) => void
}

export function VacanciesList({onAddVacancy, onEditVacancy, onArchiveVacancy, onViewVacancy}: VacanciesListProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('table')
    const [filters, setFilters] = useState<VacancyFiltersType>({
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
    const [pagination, setPagination] = useState<{
        page: number
        size: number
        sortBy: string
        sortDirection: 'asc' | 'desc'
    }>({
        page: 0,
        size: 20,
        sortBy: 'createdAt',
        sortDirection: 'desc'
    })

    // Build query parameters
    const queryParams: VacancyQueryParams = {
        ...filters,
        ...pagination
    }

    // Fetch data with filters and pagination
    const {data: vacancyPage, isLoading, isFetching, error, refetch} = useFilteredVacancies(queryParams)
    
    // Keep track of previous vacancies for overlay
    const prevVacanciesRef = useRef<Vacancy[]>([])
    const prevPaginationRef = useRef<PaginationData | null>(null)
    const [hasInitialData, setHasInitialData] = useState(false)
    
    // Update refs when we have new data
    useEffect(() => {
        if (vacancyPage && !isLoading) {
            prevVacanciesRef.current = vacancyPage.content || []
            prevPaginationRef.current = {
                currentPage: vacancyPage.currentPage,
                totalPages: vacancyPage.totalPages,
                totalElements: vacancyPage.totalElements,
                size: vacancyPage.size,
                hasNext: vacancyPage.hasNext,
                hasPrevious: vacancyPage.hasPrevious,
                isFirst: vacancyPage.isFirst,
                isLast: vacancyPage.isLast
            }
            setHasInitialData(true)
        }
    }, [vacancyPage, isLoading])

    // Reset pagination when filters change
    useEffect(() => {
        setPagination(prev => ({...prev, page: 0}))
    }, [filters])

    const handleFiltersChange = (newFilters: VacancyFiltersType) => {
        setFilters(newFilters)
    }

    const handleFiltersReset = () => {
        setFilters({
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
    }

    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({...prev, page: newPage}))
    }

    const handlePageSizeChange = (newSize: number) => {
        setPagination(prev => ({...prev, size: newSize, page: 0}))
    }

    const handleSortChange = (sortBy: string, sortDirection: 'asc' | 'desc') => {
        setPagination(prev => ({...prev, sortBy, sortDirection}))
    }

    // Transform API response to pagination data
    const paginationData: PaginationData | null = vacancyPage ? {
        currentPage: vacancyPage.currentPage,
        totalPages: vacancyPage.totalPages,
        totalElements: vacancyPage.totalElements,
        size: vacancyPage.size,
        hasNext: vacancyPage.hasNext,
        hasPrevious: vacancyPage.hasPrevious,
        isFirst: vacancyPage.isFirst,
        isLast: vacancyPage.isLast
    } : null

    const vacancies = vacancyPage?.content || []
    const totalVacancies = vacancyPage?.totalElements || 0
    
    // Show initial loading only when no data has been loaded before
    const showInitialLoading = isLoading && !hasInitialData
    
    // Use previous data if filtering and we have cached data
    const displayVacancies = isFetching && hasInitialData && prevVacanciesRef.current.length > 0 
        ? prevVacanciesRef.current 
        : vacancies
    const displayPagination = isFetching && hasInitialData && prevPaginationRef.current 
        ? prevPaginationRef.current 
        : paginationData
    
    // Show overlay when filtering (isFetching but we have initial data)
    const showLoadingOverlay = isFetching && hasInitialData && prevVacanciesRef.current.length > 0

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                    <Title level={4}>
                        Job Applications
                    </Title>
                    <p className="text-muted-foreground text-sm mt-1">
                        {isLoading
                            ? `Loading applications...`
                            : showLoadingOverlay
                                ? `${prevPaginationRef.current?.totalElements || 0} applications (updating...)`
                                : totalVacancies === 0
                                    ? 'No applications found'
                                    : `${totalVacancies.toLocaleString()} application${totalVacancies === 1 ? '' : 's'} found`
                        }
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {(totalVacancies > 0 || displayVacancies.length > 0) && (
                        <ViewToggle currentView={viewMode} onViewChange={setViewMode}/>
                    )}
                    <Button onClick={onAddVacancy} className="flex items-center gap-2" disabled={isLoading}>
                        <Plus className="h-4 w-4"/>
                        Add Application
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <VacancyFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onReset={handleFiltersReset}
                isLoading={isLoading}
            />

            {/* Loading State */}
            {showInitialLoading && (
                <div className="text-center py-16 bg-background-surface rounded-lg border border-border">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground mb-4"/>
                    <p className="text-muted-foreground">Loading applications...</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="text-center py-16 bg-background-surface rounded-lg border border-border">
                    <div className="text-destructive mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                        Failed to load applications
                    </h3>
                    <p className="text-muted-foreground mb-4">
                        {error instanceof Error ? error.message : 'An unexpected error occurred'}
                    </p>
                    <Button onClick={() => refetch()} variant="outline">
                        Try Again
                    </Button>
                </div>
            )}

            {/* Empty State */}
            {!showInitialLoading && !showLoadingOverlay && !error && totalVacancies === 0 && displayVacancies.length === 0 && (
                <div className="text-center py-16 bg-background-surface rounded-lg border border-border">
                    <div className="text-muted-foreground mb-6">
                        <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                        {Object.values(filters).some(v => v && v !== '') ? 'No applications match your filters' : 'No job applications yet'}
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        {Object.values(filters).some(v => v && v !== '')
                            ? 'Try adjusting your search criteria or clearing the filters to see more results.'
                            : 'Start tracking your job search journey by adding your first application. Keep all your opportunities organized in one place.'
                        }
                    </p>
                    {Object.values(filters).some(v => v && v !== '') ? (
                        <Button onClick={handleFiltersReset} variant="outline" className="flex items-center gap-2">
                            Clear Filters
                        </Button>
                    ) : (
                        <Button onClick={onAddVacancy} size="lg" className="flex items-center gap-2">
                            <Plus className="h-5 w-5"/>
                            Add Your First Application
                        </Button>
                    )}
                </div>
            )}


            {/* Content */}
            {!showInitialLoading && !error && (displayVacancies.length > 0 || vacancies.length > 0) && (
                <div className="space-y-6">
                    <div className="relative">
                        {/* Loading overlay */}
                        {showLoadingOverlay && (
                            <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px] rounded-lg z-10 flex items-center justify-center">
                                <div className="flex items-center gap-3 bg-background border rounded-lg px-6 py-3 shadow-lg">
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                    <span className="text-sm font-medium">Updating results...</span>
                                </div>
                            </div>
                        )}
                        
                        <div className="animate-in fade-in-50 duration-200">
                            {viewMode === 'table' ? (
                                <VacanciesTable
                                    vacancies={displayVacancies}
                                    onEditVacancy={onEditVacancy}
                                    onArchiveVacancy={onArchiveVacancy}
                                    onViewVacancy={onViewVacancy}
                                />
                            ) : (
                                <VacanciesCards
                                    vacancies={displayVacancies}
                                    onEditVacancy={onEditVacancy}
                                    onArchiveVacancy={onArchiveVacancy}
                                    onViewVacancy={onViewVacancy}
                                />
                            )}
                        </div>
                    </div>

                    {/* Pagination */}
                    {displayPagination && (
                        <VacancyPagination
                            pagination={displayPagination}
                            onPageChange={handlePageChange}
                            onPageSizeChange={handlePageSizeChange}
                            isLoading={showLoadingOverlay}
                        />
                    )}
                </div>
            )}

        </div>
    )
}