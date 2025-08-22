"use client"

import {Interview, InterviewStatus, InterviewType} from '@/types/vacancy'
import {Card, CardContent, CardHeader} from '@/components/ui/card'
import {Badge} from '@/components/ui/badge'
import {
    Calendar,
    Clock,
    TrendingUp,
    CheckCircle
} from 'lucide-react'
import {formatDistanceToNow, format, isAfter, isToday, isTomorrow} from 'date-fns'
import {getInterviewTypeLabel} from "@/utils/interview-utils";

interface InterviewSummaryCardsProps {
    interviews: Interview[]
}

export function InterviewSummaryCards({interviews}: InterviewSummaryCardsProps) {
    const now = new Date()

    // Calculate statistics using correct field name 'scheduledAt'
    const upcomingInterviews = interviews.filter(interview =>
        interview.status === InterviewStatus.SCHEDULED && isAfter(new Date(interview.scheduledAt), now)
    )

    const todaysInterviews = upcomingInterviews.filter(interview =>
        isToday(new Date(interview.scheduledAt))
    )

    const tomorrowsInterviews = upcomingInterviews.filter(interview =>
        isTomorrow(new Date(interview.scheduledAt))
    )

    const completedInterviews = interviews.filter(interview =>
        interview.status === InterviewStatus.COMPLETED
    )

    // Next upcoming interview
    const nextInterview = upcomingInterviews
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {/* Total Upcoming */}
            <Card
                className="relative overflow-hidden border-l-4 border-l-blue-600 bg-gradient-to-r from-blue-600/10 to-background-surface/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="text-sm font-medium text-primary">Upcoming</div>
                    <div className="p-1.5 rounded-md bg-blue-600/20">
                        <Calendar className="h-3.5 w-3.5 text-blue-600"/>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="text-2xl font-bold text-blue-700">
                        {upcomingInterviews.length}
                    </div>
                    <div className="text-xs text-primary mt-1 space-x-2">
                        {todaysInterviews.length > 0 && (
                            <Badge variant="secondary"
                                   className="text-[10px] px-1.5 py-0.5 bg-orange-100 text-orange-700">
                                {todaysInterviews.length} today
                            </Badge>
                        )}
                        {tomorrowsInterviews.length > 0 && (
                            <Badge variant="secondary"
                                   className="text-[10px] px-1.5 py-0.5 bg-yellow-100 text-yellow-700">
                                {tomorrowsInterviews.length} tomorrow
                            </Badge>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Completed */}
            <Card
                className="relative overflow-hidden border-l-4 border-l-green-500 bg-gradient-to-r from-green-600/10 to-background-surface/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="text-sm font-medium text-primary">Completed</div>
                    <div className="p-1.5 rounded-md bg-green-600/20">
                        <CheckCircle className="h-3.5 w-3.5 text-green-600"/>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="text-2xl font-bold text-green-700">
                        {completedInterviews.length}
                    </div>
                    <div className="text-xs text-primary mt-1">
                        Total completed
                    </div>
                </CardContent>
            </Card>

            {/* Success Rate */}
            <Card
                className="relative overflow-hidden border-l-4 border-l-purple-600 bg-gradient-to-r from-purple-600/10 to-background-surface/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="text-sm font-medium text-primary">Success Rate</div>
                    <div className="p-1.5 rounded-md bg-purple-600/20">
                        <TrendingUp className="h-3.5 w-3.5 text-purple-600"/>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="text-2xl font-bold text-purple-700">
                        {interviews.length > 0
                            ? Math.round((completedInterviews.length / interviews.length) * 100)
                            : 0
                        }%
                    </div>
                    <div className="text-xs text-primary mt-1">
                        Completion rate
                    </div>
                </CardContent>
            </Card>

            {/* Next Interview */}
            <Card
                className="relative overflow-hidden border-l-4 border-l-orange-600 bg-gradient-to-r from-orange-600/10 to-background-surface/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="text-sm font-medium text-primary">Next Interview</div>
                    <div className="p-1.5 rounded-md bg-orange-600/20">
                        <Clock className="h-3.5 w-3.5 text-orange-600"/>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    {nextInterview ? (
                        <div>
                            <div className="text-lg font-bold text-orange-700 truncate mb-1">
                                {getInterviewTypeLabel(nextInterview.type)}
                            </div>
                            <div className="text-xs text-primary mb-1">
                                {format(new Date(nextInterview.scheduledAt), 'MMM dd, HH:mm')}
                            </div>
                            <div className="text-xs text-secondary">
                                {formatDistanceToNow(new Date(nextInterview.scheduledAt), {addSuffix: true})}
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-secondary py-2">
                            No upcoming interviews
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}