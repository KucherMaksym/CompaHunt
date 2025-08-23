"use client"

import {useDroppable} from "@dnd-kit/core"
import {SortableContext, verticalListSortingStrategy} from "@dnd-kit/sortable"
import {Vacancy, VacancyStatus} from "@/types/vacancy"
import {VacancyKanbanCard} from "./VacancyKanbanCard"

interface KanbanColumnProps {
    status: VacancyStatus
    title: string
    vacancies: Vacancy[]
    color: string
    onVacancyClick?: (vacancy: Vacancy) => void
    updatingVacancies?: Set<string>
}

const statusLabels: Record<VacancyStatus, string> = {
    [VacancyStatus.WISHLIST]: "Wishlist",
    [VacancyStatus.APPLIED]: "Applied",
    [VacancyStatus.PHONE_SCREEN]: "Phone Screen",
    [VacancyStatus.INTERVIEW]: "Interview",
    [VacancyStatus.OFFER]: "Offer",
    [VacancyStatus.REJECTED]: "Rejected",
    [VacancyStatus.ARCHIVED]: "Archived"
}

export function KanbanColumn({
                                 status,
                                 title,
                                 vacancies,
                                 color,
                                 onVacancyClick,
                                 updatingVacancies = new Set()
                             }: KanbanColumnProps) {
    const {setNodeRef, isOver} = useDroppable({
        id: status,
    })

    return (
        <div
            ref={setNodeRef}
            className={`p-4 border rounded-lg h-full transition-all duration-200 bg-background shadow-sm ${
                isOver ? "bg-muted/30 border-primary shadow-md scale-[1.02]" : "hover:shadow-md border-border"
            }`}
        >
            <div className="flex items-center justify-between mb-4 pb-3 border-b">
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${color}`}></div>
                    <h3 className="font-semibold text-sm text-foreground">{title}</h3>
                </div>
                <div className="flex items-center gap-1">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        vacancies.length === 0
                            ? 'bg-muted text-muted-foreground'
                            : `${color.replace('bg-', 'bg-')}/10 ${color.replace('bg-', 'text-')}`
                        }`}>
                        {vacancies.length}
                    </span>
                </div>
            </div>

            <SortableContext items={vacancies.map(v => v.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3 min-h-full">
                    {vacancies.map((vacancy) => (
                        <VacancyKanbanCard
                            key={vacancy.id}
                            vacancy={vacancy}
                            onClick={() => onVacancyClick?.(vacancy)}
                            isUpdating={updatingVacancies.has(vacancy.id)}
                        />
                    ))}
                    {vacancies.length === 0 && (
                        <div className="text-center py-12 px-4">
                            <div
                                className={`w-12 h-12 rounded-full ${color}/10 flex items-center justify-center mx-auto mb-3`}/>
                            <p className="text-sm text-muted-foreground font-medium mb-1">
                                No {title.toLowerCase()} yet
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Drag and drop cards here
                            </p>
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    )
}