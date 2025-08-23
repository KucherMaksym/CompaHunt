import {VacancyStatus} from "@/types/vacancy";

export function getStatusColor(status: VacancyStatus): string {
    switch (status) {
        case VacancyStatus.WISHLIST:
            return 'bg-status-viewed/10 text-status-viewed border-status-viewed/20'
        case VacancyStatus.APPLIED:
            return 'bg-status-applied/10 text-status-applied border-status-applied/20'
        case VacancyStatus.PHONE_SCREEN:
            return 'bg-status-phone-screen/10 text-status-phone-screen border-status-phone-screen/20'
        case VacancyStatus.INTERVIEW:
            return 'bg-[#9333ea]/10 text-[#9333ea] border-[#9333ea]/20'
        case VacancyStatus.OFFER:
            return 'bg-status-offer/10 text-status-offer border-status-offer/20'
        case VacancyStatus.REJECTED:
            return 'bg-status-rejected/10 text-status-rejected border-status-rejected/20'
        default:
            return 'bg-muted text-muted-foreground border-muted'
    }
}

export function getVacancyStatusLabel(status: VacancyStatus): string {
    switch (status) {
        case VacancyStatus.APPLIED:
            return 'Applied'
        case VacancyStatus.WISHLIST:
            return 'Wishlist'
        case VacancyStatus.PHONE_SCREEN:
            return 'Phone Screen'
        case VacancyStatus.INTERVIEW:
            return 'Interview'
        case VacancyStatus.OFFER:
            return 'Offer'
        case VacancyStatus.REJECTED:
            return 'Rejected'
        default:
            return status
    }
}
