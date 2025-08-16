import {Interview, InterviewStatus, InterviewType} from "@/types/vacancy";
import {useState} from "react";

export const getInterviewStatusColor = (status: InterviewStatus) => {
    const colorMap = {
        [InterviewStatus.SCHEDULED]: 'bg-status-applied/10 text-status-applied border-status-applied/20',
        [InterviewStatus.COMPLETED]: 'bg-status-offer/10 text-status-offer border-status-offer/20',
        [InterviewStatus.CANCELLED]: 'bg-status-rejected/10 text-status-rejected border-status-rejected/20',
        [InterviewStatus.RESCHEDULED]: 'bg-status-phone-screen/10 text-status-phone-screen border-status-phone-screen/20',
        [InterviewStatus.NO_SHOW]: 'bg-muted text-muted-foreground border-muted'
    }
    return colorMap[status] || 'bg-muted text-muted-foreground border-muted'
}

export function getInterviewStatusLabel(status: InterviewStatus): string {
    switch (status) {
        case InterviewStatus.SCHEDULED:
            return 'Scheduled'
        case InterviewStatus.COMPLETED:
            return 'Completed'
        case InterviewStatus.CANCELLED:
            return 'Cancelled'
        case InterviewStatus.RESCHEDULED:
            return 'Rescheduled'
        case InterviewStatus.NO_SHOW:
            return 'No Show'
        default:
            return status
    }
}

export function getInterviewTypeLabel(type: InterviewType): string {
    switch (type) {
        case InterviewType.PHONE_SCREEN:
            return 'Phone Screen'
        case InterviewType.VIDEO_CALL:
            return 'Video Call'
        case InterviewType.ON_SITE:
            return 'On-site Interview'
        case InterviewType.TECHNICAL:
            return 'Technical Interview'
        case InterviewType.BEHAVIORAL:
            return 'Behavioral Interview'
        case InterviewType.HR_INTERVIEW:
            return 'HR Interview'
        case InterviewType.FINAL_ROUND:
            return 'Final Round'
        default:
            return type
    }
}