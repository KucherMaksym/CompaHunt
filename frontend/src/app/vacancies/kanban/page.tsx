"use client"

import {useState} from "react"
import {DndContext, DragEndEvent, DragOverlay, DragStartEvent, DragOverEvent} from "@dnd-kit/core"
import {arrayMove} from "@dnd-kit/sortable"
import {DashboardLayout} from "@/components/dashboard-layout"
import {KanbanColumn} from "@/components/vacancies/KanbanColumn"
import {VacancyKanbanCard} from "@/components/vacancies/VacancyKanbanCard"
import {Vacancy, VacancyStatus} from "@/types/vacancy"
import {Button} from "@/components/ui/button"
import {Plus} from "lucide-react"
import {useUpdateVacancyStatus, useVacancies} from "@/hooks/useVacancies"
import {useQueryClient} from "@tanstack/react-query"
import {VacancyDetailModal} from "@/components/vacancies/VacancyDetailModal"
import {VacancyEditModal} from "@/components/vacancies/VacancyEditModal";

const kanbanColumns = [
    {
        status: "WISHLIST" as VacancyStatus,
        title: "Wishlist",
        color: "bg-purple-600"
    },
    {
        status: "APPLIED" as VacancyStatus,
        title: "Applied",
        color: "bg-blue-600"
    },
    {
        status: "PHONE_SCREEN" as VacancyStatus,
        title: "Phone Screen",
        color: "bg-orange-600"
    },
    {
        status: "INTERVIEW" as VacancyStatus,
        title: "Interview",
        color: "bg-yellow-600"
    },
    {
        status: "OFFER" as VacancyStatus,
        title: "Offer",
        color: "bg-green-600"
    },
    {
        status: "REJECTED" as VacancyStatus,
        title: "Rejected",
        color: "bg-red-600"
    },
]

export default function VacanciesKanbanPage() {
    const [activeVacancy, setActiveVacancy] = useState<Vacancy | null>(null);
    const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
    const [updatingVacancies, setUpdatingVacancies] = useState<Set<string>>(new Set());
    const [vacancyOrder, setVacancyOrder] = useState<Record<string, string[]>>({});
    const queryClient = useQueryClient()

    const [modalState, setModalState] = useState<{
        isOpen: boolean
        mode: 'create' | 'edit'
        vacancy?: Vacancy
    }>({isOpen: false, mode: 'create'});

    const {data: vacancies = [], isLoading, error} = useVacancies();
    const updateVacancyStatusMutation = useUpdateVacancyStatus();

    const handleDragStart = (event: DragStartEvent) => {
        const vacancy = vacancies.find(v => v.id === event.active.id);
        setActiveVacancy(vacancy || null);
    }

    const handleEditVacancy = (vacancy: Vacancy) => {
        setModalState({isOpen: true, mode: 'edit', vacancy})
    }

    const handleCloseEditModal = () => {
        setModalState(prevState => {
            return {...prevState, isOpen: false}
        })
    }

    const handleCloseDetailModal = () => {
        setSelectedVacancy(null)
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const {active, over} = event;
        setActiveVacancy(null);

        if (!over) return;

        const vacancyId = active.id as string;
        const vacancy = vacancies.find(v => v.id === vacancyId);
        if (!vacancy) return;

        let newStatus: VacancyStatus;

        if (Object.values(VacancyStatus).includes(over.id as VacancyStatus)) {
            // Dropped directly on a column
            newStatus = over.id as VacancyStatus;
        } else {
            // Dropped on another card
            const targetVacancy = vacancies.find(v => v.id === over.id);
            if (!targetVacancy) return;
            newStatus = targetVacancy.status;
        }

        // If same status, no need to update API
        if (vacancy.status === newStatus) {
            // Update local order state
            const currentOrder = vacancyOrder[newStatus] || getVacanciesByStatus(newStatus).map(v => v.id);
            const oldIndex = currentOrder.indexOf(vacancyId);
            let newIndex = currentOrder.length - 1;

            if (!Object.values(VacancyStatus).includes(over.id as VacancyStatus)) {
                // Dropped on another card, find new position
                newIndex = currentOrder.indexOf(over.id as string);
            }

            if (oldIndex !== -1 && oldIndex !== newIndex) {
                const newOrder = [...currentOrder];
                newOrder.splice(oldIndex, 1);
                newOrder.splice(newIndex, 0, vacancyId);

                setVacancyOrder(prev => ({
                    ...prev,
                    [newStatus]: newOrder
                }))
            }
            return;
        }

        // Status changed - update both local order and API
        const oldStatus = vacancy.status

        // Update local order for old status
        const oldOrder = vacancyOrder[oldStatus] || getVacanciesByStatus(oldStatus).map(v => v.id)
        const oldOrderFiltered = oldOrder.filter(id => id !== vacancyId)

        // Update local order for new status
        const newOrder = vacancyOrder[newStatus] || getVacanciesByStatus(newStatus).map(v => v.id)
        let targetIndex = newOrder.length

        if (!Object.values(VacancyStatus).includes(over.id as VacancyStatus)) {
            // Dropped on another card
            targetIndex = newOrder.indexOf(over.id as string) + 1
        }

        const newOrderUpdated = [...newOrder]
        newOrderUpdated.splice(targetIndex, 0, vacancyId)

        // Update local state
        setVacancyOrder(prev => ({
            ...prev,
            [oldStatus]: oldOrderFiltered,
            [newStatus]: newOrderUpdated
        }))

        // Mark vacancy as updating
        setUpdatingVacancies(prev => new Set([...prev, vacancyId]))

        // Optimistically update cache
        const queryKeys = [
            ['vacancies'],
            ['vacancies', undefined, undefined],
            ['vacancies', oldStatus],
            ['vacancies', newStatus],
            ['vacancies', 'filtered']
        ]

        const previousData = queryKeys.map(key => ({
            key,
            data: queryClient.getQueryData(key)
        }))

        queryKeys.forEach(queryKey => {
            queryClient.setQueryData(queryKey, (oldData: Vacancy[] | undefined) => {
                if (!oldData) return oldData
                return oldData.map(v =>
                    v.id === vacancyId
                        ? {
                            ...v,
                            status: newStatus,
                            lastUpdated: new Date().toISOString()
                        }
                        : v
                )
            })
        })

        try {
            await updateVacancyStatusMutation.mutateAsync({
                id: vacancyId,
                status: newStatus
            })
        } catch (error) {
            console.error("Failed to update vacancy status:", error)

            // Rollback both cache and local order
            previousData.forEach(({key, data}) => {
                if (data) {
                    queryClient.setQueryData(key, data)
                }
            })

            setVacancyOrder(prev => ({
                ...prev,
                [oldStatus]: oldOrder,
                [newStatus]: newOrder
            }))
        } finally {
            setUpdatingVacancies(prev => {
                const next = new Set(prev)
                next.delete(vacancyId)
                return next
            })
        }
    }

    const getVacanciesByStatus = (status: VacancyStatus) => {
        const statusVacancies = vacancies.filter(vacancy => vacancy.status === status)
        const customOrder = vacancyOrder[status]

        if (!customOrder || customOrder.length === 0) {
            return statusVacancies
        }

        // Sort according to custom order, then append any new items
        const orderedVacancies: Vacancy[] = []
        const remainingVacancies = [...statusVacancies]

        customOrder.forEach(id => {
            const vacancy = remainingVacancies.find(v => v.id === id)
            if (vacancy) {
                orderedVacancies.push(vacancy)
                remainingVacancies.splice(remainingVacancies.indexOf(vacancy), 1)
            }
        })

        // Append any remaining vacancies that weren't in the custom order
        return [...orderedVacancies, ...remainingVacancies]
    }

    const handleVacancyClick = (vacancy: Vacancy) => {
        setSelectedVacancy(vacancy)
    }

    const handleCloseModal = () => {
        setSelectedVacancy(null)
    }

    const handleAddVacancy = () => {
        // TODO: Open add vacancy modal
        console.log("Add new vacancy")
    }

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading vacancies...</p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <p className="text-destructive mb-2">Failed to load vacancies</p>
                        <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout className={"p-0"}>
            <div className="flex flex-col gap-y-6 min-h-full">
                <div className="flex items-center justify-between">
                    <Button onClick={handleAddVacancy} className="shadow-sm">
                        <Plus className="h-4 w-4 mr-2"/>
                        Add Vacancy
                    </Button>
                </div>

                <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    <div className="flex gap-6 h-full overflow-x-auto p-0 ">
                        <div className={"p-6 flex gap-6 overflow-y-hidden"}>
                            {kanbanColumns.map(column => {
                                // Give more space to columns with more items
                                const columnVacancies = getVacanciesByStatus(column.status)
                                const columnWidth = columnVacancies.length > 5 || ['APPLIED', 'REJECTED'].includes(column.status)
                                    ? 'w-80 flex-shrink-0'
                                    : 'w-72 flex-shrink-0'

                                return (
                                    <div key={column.status} className={columnWidth}>
                                        <KanbanColumn
                                            status={column.status}
                                            title={column.title}
                                            color={column.color}
                                            vacancies={getVacanciesByStatus(column.status)}
                                            onVacancyClick={handleVacancyClick}
                                            updatingVacancies={updatingVacancies}
                                        />
                                    </div>
                                )
                            })}

                        </div>
                    </div>

                    <DragOverlay>
                        {activeVacancy && (
                            <VacancyKanbanCard vacancy={activeVacancy}/>
                        )}
                    </DragOverlay>
                </DndContext>
            </div>

            <VacancyDetailModal
                vacancy={selectedVacancy || undefined}
                isOpen={selectedVacancy !== null}
                onClose={handleCloseDetailModal}
                onEdit={handleEditVacancy}
            />

            <VacancyEditModal
                isOpen={modalState.isOpen}
                onClose={handleCloseEditModal}
                mode={modalState.mode}
                vacancy={modalState.vacancy}
            />
        </DashboardLayout>
    )
}