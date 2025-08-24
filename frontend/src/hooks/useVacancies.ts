import {useQuery, useMutation, useQueryClient, UseQueryResult} from '@tanstack/react-query'
import {apiClient} from '@/lib/api-client'
import {Vacancy, VacancySearchResponse, VacancySearchItem} from '@/types/vacancy'

export interface VacancyFilters {
    search?: string
    status?: string | null
    minSalary?: string
    maxSalary?: string
    salaryPeriod?: string
    location?: string
    experienceLevel?: string
    jobType?: string
    remoteness?: string
}

export interface VacancyPageResponse {
    content: Vacancy[]
    totalElements: number
    totalPages: number
    currentPage: number
    size: number
    hasNext: boolean
    hasPrevious: boolean
    isFirst: boolean
    isLast: boolean
}

export interface VacancyQueryParams extends VacancyFilters {
    page?: number
    size?: number
    sortBy?: string
    sortDirection?: string
}

// Hook for getting filtered and paginated vacancies
export function useFilteredVacancies(params: VacancyQueryParams = {}) {
    return useQuery({
        queryKey: ['vacancies', 'filtered', params],
        queryFn: async (): Promise<VacancyPageResponse> => {
            const searchParams = new URLSearchParams()

            // Add all parameters to search params
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    searchParams.append(key, value.toString())
                }
            })

            const response = await apiClient.get(`/api/vacancies/filtered?${searchParams.toString()}`)
            return response.data
        },
        staleTime: 30 * 1000, // 30 seconds
    })
}

// Hook for getting all vacancies (legacy endpoint)
export function useVacancies(status?: string, limit?: number): UseQueryResult<Vacancy[], Error> {
    return useQuery({
        queryKey: ['vacancies', status, limit],
        queryFn: async (): Promise<Vacancy[]> => {
            const params = new URLSearchParams();
            if (status) params.append('status', status);
            if (limit) params.append('limit', limit.toString());

            const response = await apiClient.get(`/api/vacancies?${params.toString()}`);
            return response.data || [];
        },
        staleTime: 30 * 1000,
    })
}

// Hook for getting recent vacancies
export function useRecentVacancies() {
    return useQuery({
        queryKey: ['vacancies', 'recent'],
        queryFn: async (): Promise<Vacancy[]> => {
            const response = await apiClient.get('/api/vacancies/recent')
            return response.data
        },
        staleTime: 60 * 1000, // 1 minute
    })
}

// Hook for getting single vacancy
export function useVacancy(id: string) {
    return useQuery({
        queryKey: ['vacancy', id],
        queryFn: async (): Promise<Vacancy> => {
            const response = await apiClient.get(`/api/vacancies/${id}`)
            return response.data
        },
        enabled: !!id,
    })
}

// Hook for creating vacancy
export function useCreateVacancy() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (vacancyData: any) => {
            const response = await apiClient.post('/api/vacancies', vacancyData)
            return response.data
        },
        onSuccess: () => {
            // Invalidate and refetch all vacancy queries
            queryClient.invalidateQueries({queryKey: ['vacancies']})
            queryClient.invalidateQueries({queryKey: ['vacancy']})
        },
    })
}

// Hook for updating vacancy
export function useUpdateVacancy() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({id, data}: { id: string, data: any }) => {
            const response = await apiClient.put(`/api/vacancies/${id}`, data)
            return response.data
        },
        onSuccess: (data, variables) => {
            // Update specific vacancy in cache
            queryClient.setQueryData(['vacancy', variables.id], data.vacancy)
            // Invalidate vacancy lists
            queryClient.invalidateQueries({queryKey: ['vacancies']})
        },
    })
}

// Hook for updating vacancy status
export function useUpdateVacancyStatus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({id, status}: { id: string, status: string }) => {
            const response = await apiClient.patch(`/api/vacancies/${id}/status`, {status})
            return response.data
        },
        onSuccess: (data, variables) => {
            // Update specific vacancy in cache
            queryClient.setQueryData(['vacancy', variables.id], data)
            // Invalidate vacancy lists
            queryClient.invalidateQueries({queryKey: ['vacancies']})
        },
    })
}

// Hook for search vacancies for interview creation
export function useSearchVacancies(params: { search?: string, page?: number, size?: number } = {}) {
    return useQuery({
        queryKey: ['vacancies', 'search', params],
        queryFn: async (): Promise<VacancySearchResponse> => {
            const searchParams = new URLSearchParams()

            // Add search parameters
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    searchParams.append(key, value.toString())
                }
            })

            const response = await apiClient.get(`/api/vacancies/search?${searchParams.toString()}`)
            return response.data
        },
        staleTime: 30 * 1000, // 30 seconds
        enabled: false, // Only run when manually triggered
    })
}

// Hook for archiving vacancy
export function useArchiveVacancy() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({id, reason}: { id: string, reason?: string }) => {
            const params = new URLSearchParams()
            if (reason) params.append('reason', reason)

            const response = await apiClient.delete(`/api/vacancies/${id}?${params.toString()}`)
            return response.data
        },
        onSuccess: () => {
            // Invalidate all vacancy queries
            queryClient.invalidateQueries({queryKey: ['vacancies']})
            queryClient.invalidateQueries({queryKey: ['vacancy']})
        },
    })
}