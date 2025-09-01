"use client"

import {useSortable} from "@dnd-kit/sortable"
import {CSS} from "@dnd-kit/utilities"
import {Card, CardContent} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {Vacancy} from "@/types/vacancy"
import {Building, MapPin, DollarSign, Calendar, Eye} from "lucide-react"

interface VacancyKanbanCardProps {
    vacancy: Vacancy
    onClick?: () => void
    isUpdating?: boolean
}

export function VacancyKanbanCard({vacancy, onClick, isUpdating}: VacancyKanbanCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({id: vacancy.id,})

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    const handleViewClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()

        if (isDragging) {
            return
        }

        onClick?.()
    }

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`py-2 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-primary/30 transition-all group ${
                isUpdating ? "animate-pulse border-primary" : ""
            }`}
        >
            <CardContent className="px-2">
                <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm line-clamp-2 leading-tight">{vacancy.title}</h4>
                            <div className="flex items-center gap-1 mt-1">
                                <Building className="h-3 w-3 text-muted-foreground flex-shrink-0"/>
                                <span className="text-xs text-muted-foreground truncate">{vacancy.company.name}</span>
                            </div>
                        </div>
                        <div className="relative flex items-center gap-1 flex-shrink-0">
                            {isUpdating && (
                                <div
                                    className="animate-spin rounded-full h-3 w-3 border-2 border-primary border-t-transparent"></div>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={handleViewClick}
                                onPointerDown={(e) => {
                                    e.stopPropagation()
                                }}
                            >
                                <Eye className="h-3 w-3"/>
                            </Button>
                        </div>
                    </div>

                    {/*<div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">*/}
                    {/*  <div className="flex items-center gap-1 min-w-0 flex-1">*/}
                    {/*    {vacancy.location && (*/}
                    {/*        <>*/}
                    {/*          <MapPin className="h-3 w-3 flex-shrink-0" />*/}
                    {/*          <span className="truncate">{vacancy.location}</span>*/}
                    {/*        </>*/}
                    {/*    )}*/}
                    {/*  </div>*/}
                    {/*  <div className="flex items-center gap-1 flex-shrink-0">*/}
                    {/*    <Calendar className="h-3 w-3" />*/}
                    {/*    <span>{new Date(vacancy.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>*/}
                    {/*  </div>*/}
                    {/*</div>*/}

                    {/*<div className="flex items-center justify-between gap-2">*/}
                    {/*  <div className="flex items-center gap-1 flex-1">*/}
                    {/*    {vacancy.salary && (*/}
                    {/*        <div className="flex items-center gap-1">*/}
                    {/*          <DollarSign className="h-3 w-3 text-muted-foreground" />*/}
                    {/*          <span className="text-xs text-muted-foreground font-medium">*/}
                    {/*        ${Math.round(vacancy.salary / 1000)}k*/}
                    {/*      </span>*/}
                    {/*        </div>*/}
                    {/*    )}*/}
                    {/*  </div>*/}
                    {/*  {vacancy.remoteness && (*/}
                    {/*      <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-5 capitalize">*/}
                    {/*        {vacancy.remoteness.toLowerCase()}*/}
                    {/*      </Badge>*/}
                    {/*  )}*/}
                    {/*</div>*/}
                </div>
            </CardContent>
        </Card>
    )
}