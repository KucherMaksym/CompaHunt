"use client"

import {Vacancy, VacancyStatus} from '@/types/vacancy'
import {Card, CardContent, CardHeader} from '@/components/ui/card'
import {Badge} from '@/components/ui/badge'
import {
    Briefcase,
    TrendingUp,
    Calendar,
    DollarSign
} from 'lucide-react'

interface VacancySummaryCardsProps {
    vacancies: Vacancy[]
}

export function VacancySummaryCards({vacancies}: VacancySummaryCardsProps) {
    // Calculate statistics
    const appliedVacancies = vacancies.filter(v => v.status === VacancyStatus.APPLIED)
    const interviewVacancies = vacancies.filter(v =>
        v.status === VacancyStatus.PHONE_SCREEN ||
        v.status === VacancyStatus.INTERVIEW
    )
    const offerVacancies = vacancies.filter(v => v.status === VacancyStatus.OFFER)
    const rejectedVacancies = vacancies.filter(v => v.status === VacancyStatus.REJECTED)

    // Response rate calculation - exclude APPLIED and VIEWED
    const respondedVacancies = vacancies.filter(v =>
        v.status !== VacancyStatus.APPLIED && v.status !== VacancyStatus.VIEWED
    )
    const responseRate = vacancies.length > 0
        ? Math.round((respondedVacancies.length / vacancies.length) * 100)
        : 0

    // Average salary calculation using the correct field name 'salary'
    const vacanciesWithSalary = vacancies.filter(v => v.salary && v.salary > 0)
    const averageSalary = vacanciesWithSalary.length > 0
        ? Math.round(vacanciesWithSalary.reduce((acc, v) => acc + (v.salary || 0), 0) / vacanciesWithSalary.length)
        : 0

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {/* Total Applications */}
            <Card
                className="relative overflow-hidden border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-600/10 to-background-surface">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="text-sm font-medium text-primary">Total Applications</div>
                    <div className="p-1.5 rounded-md bg-blue-600/20">
                        <Briefcase className="h-3.5 w-3.5 text-blue-600"/>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="text-2xl font-bold text-blue-600">
                        {vacancies.length}
                    </div>
                    <div className="text-xs text-primary mt-1 space-x-2">
                        <Badge variant="secondary"
                               className="text-[10px] px-1.5 py-0.5 border border-orange-600/50 bg-orange-600/20 text-orange-600">
                            {appliedVacancies.length} pending
                        </Badge>
                        <Badge variant="secondary"
                               className="text-[10px] px-1.5 py-0.5 border border-green-600/50 bg-green-600/20 text-green-600">
                            {interviewVacancies.length} active
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Response Rate */}
            <Card
                className="relative overflow-hidden border-l-4 border-l-green-500 bg-gradient-to-r from-green-600/10 to-background-surface">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="text-sm font-medium text-primary">Response Rate</div>
                    <div className="p-1.5 rounded-md bg-green-600/20">
                        <TrendingUp className="h-3.5 w-3.5 text-green-600"/>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="text-2xl font-bold text-green-600">
                        {responseRate}%
                    </div>
                    <div className="text-xs text-secondary mt-1">
                        {respondedVacancies.length} of {vacancies.length} responded
                    </div>
                </CardContent>
            </Card>

            {/* Active Interviews */}
            <Card
                className="relative overflow-hidden border-l-4 border-l-purple-600 bg-gradient-to-r from-purple-600/10 to-background-surface">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="text-sm font-medium text-primary">Active Interviews</div>
                    <div className="p-1.5 rounded-md bg-purple-600/20">
                        <Calendar className="h-3.5 w-3.5 text-purple-600"/>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="text-2xl font-bold text-purple-600">
                        {interviewVacancies.length}
                    </div>
                    <div className="text-xs text-secondary mt-1">
                        {offerVacancies.length > 0 ? (
                            <Badge variant="secondary"
                                   className="text-[10px] px-1.5 py-0.5 bg-green-600/20 text-green-600">
                                {offerVacancies.length} offers received
                            </Badge>
                        ) : (
                            'Interview stage'
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Average Salary */}
            <Card
                className="relative overflow-hidden border-l-4 border-l-amber-600 bg-gradient-to-r from-amber-600/10 to-background-surface">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="text-sm font-medium text-primary">Avg. Salary</div>
                    <div className="p-1.5 rounded-md bg-amber-600/20">
                        <DollarSign className="h-3.5 w-3.5 text-amber-600"/>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    {averageSalary > 0 ? (
                        <div>
                            <div className="text-2xl font-bold text-amber-600">
                                ${(averageSalary / 1000).toFixed(0)}k
                            </div>
                            <div className="text-xs text-secondary mt-1">
                                Based on {vacanciesWithSalary.length} jobs
                            </div>
                        </div>
                    ) : (
                        <div className="text-lg text-secondary py-1">
                            No salary data
                        </div>
                    )}
                    TODO
                </CardContent>
            </Card>
        </div>
    )
}