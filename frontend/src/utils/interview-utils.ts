import {InterviewStatus} from "@/types/vacancy";

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