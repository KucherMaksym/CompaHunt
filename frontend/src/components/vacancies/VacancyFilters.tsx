'use client'

import {useState, useEffect, useRef} from 'react'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {Search, Filter, X, ChevronDown, ChevronUp} from 'lucide-react'
import {VacancyStatus} from '@/types/vacancy'

export interface VacancyFilters {
    search: string
    status: string | null
    minSalary: string
    maxSalary: string
    salaryPeriod: string
    location: string
    experienceLevel: string
    jobType: string
    remoteness: string
}

interface VacancyFiltersProps {
    filters: VacancyFilters
    onFiltersChange: (filters: VacancyFilters) => void
    onReset: () => void
    isLoading?: boolean
}

const EXPERIENCE_LEVELS = [
    'Entry Level',
    'Mid Level',
    'Senior Level',
    'Lead',
    'Principal',
    'Manager',
    'Director'
]

const JOB_TYPES = [
    'Full-time',
    'Part-time',
    'Contract',
    'Freelance',
    'Internship',
    'Temporary'
]

const REMOTENESS_OPTIONS = [
    'Remote',
    'Hybrid',
    'On-site'
]

const STATUS_OPTIONS = [
    {value: VacancyStatus.APPLIED, label: 'Applied'},
    {value: VacancyStatus.VIEWED, label: 'Viewed'},
    {value: VacancyStatus.PHONE_SCREEN, label: 'Phone Screen'},
    {value: VacancyStatus.INTERVIEW, label: 'Interview'},
    {value: VacancyStatus.OFFER, label: 'Offer'},
    {value: VacancyStatus.REJECTED, label: 'Rejected'},
    {value: VacancyStatus.ARCHIVED, label: 'Archived'}
]

const SALARY_PERIODS = [
    {value: 'hr', label: 'per hour'},
    {value: 'day', label: 'per day'},
    {value: 'week', label: 'per week'},
    {value: 'month', label: 'per month'},
    {value: 'year', label: 'per year'}
]


export function VacancyFilters({
                                   filters,
                                   onFiltersChange,
                                   onReset,
                                   isLoading = false
                               }: VacancyFiltersProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [localFilters, setLocalFilters] = useState(filters)
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        setLocalFilters(filters)
    }, [filters])

    const handleFilterChange = (key: keyof VacancyFilters, value: string) => {
        const newFilters = {...localFilters, [key]: value}
        setLocalFilters(newFilters)

        // Apply debounced search for search input
        if (key === 'search' || key === "location") {
            // Clear existing timeout
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current)
            }

            // Set new timeout
            searchTimeoutRef.current = setTimeout(() => {
                onFiltersChange(newFilters)
            }, 500) // 500ms debounce for search
        } else if (key === 'minSalary' || key === 'maxSalary' || key === 'salaryPeriod') {
            // For salary filters, apply with debounce but don't convert values in UI
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current)
            }

            searchTimeoutRef.current = setTimeout(() => {
                // Send original filters values - conversion will happen on API level
                onFiltersChange(newFilters)
            }, 300)
        } else {
            // For other filters, apply immediately
            onFiltersChange(newFilters)
        }
    }

    const handleReset = () => {
        const resetFilters = {
            search: '',
            status: null,
            minSalary: '',
            maxSalary: '',
            salaryPeriod: 'month',
            location: '',
            experienceLevel: '',
            jobType: '',
            remoteness: ''
        }
        setLocalFilters(resetFilters)
        onReset()
    }

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current)
            }
        }
    }, [])

    const hasActiveFilters = Object.entries(localFilters).some(([key, value]) => {
        if (key === 'search') return value.trim() !== ''
        return value !== null && value !== ''
    })

    return (
        <div className="space-y-4 p-4 bg-background-surface rounded-lg border border-border">
            {/* Search Bar - Always visible */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <div className="relative flex-1 max-w-sm">
                    <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                    <Input
                        type="text"
                        placeholder="Search jobs, companies, locations..."
                        value={localFilters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="pl-10"
                        // disabled={isLoading}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-2"
                        disabled={isLoading}
                    >
                        <Filter className="h-4 w-4"/>
                        Filters
                        {hasActiveFilters && (
                            <span
                                className="bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 min-w-4 h-4 flex items-center justify-center">
                {Object.values(localFilters).filter(v => v && v !== '').length}
              </span>
                        )}
                        {isExpanded ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4"/>}
                    </Button>

                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleReset}
                            disabled={isLoading}
                            className="flex items-center gap-2"
                        >
                            <X className="h-4 w-4"/>
                            Clear
                        </Button>
                    )}
                </div>
            </div>

            {/* Advanced Filters - Collapsible */}
            {isExpanded && (
                <div className="space-y-6 pt-4 border-t border-border">
                    {/* First Row - Basic Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {/* Status Filter */}
                        <div className="space-y-2">
                            <Label htmlFor="status-filter" className="text-sm font-medium">
                                Status
                            </Label>
                            <Select
                                value={localFilters.status || 'all'}
                                onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger id="status-filter">
                                    <SelectValue placeholder="All statuses"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All statuses</SelectItem>
                                    {STATUS_OPTIONS.map((status) => (
                                        <SelectItem key={status.value} value={status.value}>
                                            {status.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Location Filter */}
                        <div className="space-y-2">
                            <Label htmlFor="location-filter" className="text-sm font-medium">
                                Location
                            </Label>
                            <Input
                                id="location-filter"
                                type="text"
                                placeholder="e.g. New York, Remote"
                                value={localFilters.location}
                                onChange={(e) => handleFilterChange('location', e.target.value)}
                                // disabled={isLoading}
                            />
                        </div>

                        {/* Work Arrangement */}
                        <div className="space-y-2">
                            <Label htmlFor="remoteness-filter" className="text-sm font-medium">
                                Work Arrangement
                            </Label>
                            <Select
                                value={localFilters.remoteness || 'all'}
                                onValueChange={(value) => handleFilterChange('remoteness', value === 'all' ? '' : value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger id="remoteness-filter">
                                    <SelectValue placeholder="All arrangements"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All arrangements</SelectItem>
                                    {REMOTENESS_OPTIONS.map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Second Row - Salary & Job Type */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Salary Range (spans 2 columns on larger screens) */}
                        <div className="space-y-2 lg:col-span-2">
                            <Label className="text-sm font-medium">Salary Range</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    placeholder="Min"
                                    value={localFilters.minSalary}
                                    onChange={(e) => handleFilterChange('minSalary', e.target.value)}
                                    disabled={isLoading}
                                    className="flex-1"
                                />
                                <Input
                                    type="number"
                                    placeholder="Max"
                                    value={localFilters.maxSalary}
                                    onChange={(e) => handleFilterChange('maxSalary', e.target.value)}
                                    disabled={isLoading}
                                    className="flex-1"
                                />
                                <Select
                                    value={localFilters.salaryPeriod || 'month'}
                                    onValueChange={(value) => handleFilterChange('salaryPeriod', value)}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className="w-24 flex-shrink-0">
                                        <SelectValue placeholder="/month"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SALARY_PERIODS.map((period) => (
                                            <SelectItem key={period.value} value={period.value}>
                                                {period.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Job Type */}
                        <div className="space-y-2">
                            <Label htmlFor="jobtype-filter" className="text-sm font-medium">
                                Job Type
                            </Label>
                            <Select
                                value={localFilters.jobType || 'all'}
                                onValueChange={(value) => handleFilterChange('jobType', value === 'all' ? '' : value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger id="jobtype-filter">
                                    <SelectValue placeholder="All types"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All types</SelectItem>
                                    {JOB_TYPES.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}