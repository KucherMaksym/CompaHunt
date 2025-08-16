'use client'

import { Vacancy, VacancyStatus } from '@/types/vacancy'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  ExternalLink, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Building2,
  Clock,
  Briefcase,
  MoreHorizontal,
  Edit,
  Archive
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import {getStatusColor} from "@/utils/vacancy-utils";

interface VacanciesCardsProps {
  vacancies: Vacancy[]
  onEditVacancy?: (vacancy: Vacancy) => void
  onArchiveVacancy?: (vacancyId: string) => void
  onViewVacancy?: (vacancy: Vacancy) => void
}

function getStatusLabel(status: VacancyStatus): string {
  switch (status) {
    case VacancyStatus.APPLIED:
      return 'Applied'
    case VacancyStatus.VIEWED:
      return 'Viewed'
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

interface VacancyCardProps {
  vacancy: Vacancy
  onEditVacancy?: (vacancy: Vacancy) => void
  onArchiveVacancy?: (vacancyId: string) => void
  onViewVacancy?: (vacancy: Vacancy) => void
}

function VacancyCard({ vacancy, onEditVacancy, onArchiveVacancy, onViewVacancy }: VacancyCardProps) {
  return (
    <div 
      className="group bg-background-surface border border-border rounded-lg p-6 hover:shadow-custom-md transition-all duration-200 hover:border-border/80 cursor-pointer"
      onClick={() => onViewVacancy?.(vacancy)}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground leading-tight mb-1 line-clamp-2">
            {vacancy.title}
          </h3>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building2 className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm font-medium truncate">{vacancy.company.name}</span>
          </div>
        </div>
        <Badge 
          variant="outline" 
          className={`ml-3 text-xs font-medium ${getStatusColor(vacancy.status)}`}
        >
          {getStatusLabel(vacancy.status)}
        </Badge>
      </div>

      {/* Details */}
      <div className="space-y-3 mb-4">
        {/* Location & Work Type */}
        <div className="flex items-center gap-4 flex-wrap">
          {vacancy.location && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{vacancy.location}</span>
            </div>
          )}
          {vacancy.workType && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span className="text-sm capitalize">{vacancy.workType}</span>
            </div>
          )}
        </div>

        {/* Salary */}
        {vacancy.salary && (
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              ${vacancy.salary.toLocaleString()}
            </span>
          </div>
        )}

        {/* Experience */}
        {vacancy.experience && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Experience:</span> {vacancy.experience}
          </div>
        )}

        {/* Description Preview */}
        {vacancy.description && (
          <div className="text-sm text-muted-foreground">
            <p className="line-clamp-2">{vacancy.description}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span className="text-xs">
            Applied {formatDistanceToNow(new Date(vacancy.appliedAt), { addSuffix: true })}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {vacancy.lastUpdated && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span className="text-xs">
                Updated {format(new Date(vacancy.lastUpdated), 'MMM d')}
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            {vacancy.jobUrl && (
              <Button 
                variant="ghost" 
                size="sm" 
                asChild
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
              >
                <a href={vacancy.jobUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEditVacancy && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditVacancy(vacancy); }}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onArchiveVacancy && vacancy.status !== VacancyStatus.ARCHIVED && (
                  <DropdownMenuItem 
                    onClick={(e) => { e.stopPropagation(); onArchiveVacancy(vacancy.id); }}
                    className="text-orange-600 focus:text-orange-600"
                  >
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}

export function VacanciesCards({ vacancies, onEditVacancy, onArchiveVacancy, onViewVacancy }: VacanciesCardsProps) {
  if (vacancies.length === 0) {
    return (
      <div className="text-center py-12 bg-background-surface rounded-lg border border-border">
        <div className="text-muted-foreground mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-1">No vacancies yet</h3>
        <p className="text-muted-foreground">Start by adding your first job application!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {vacancies.map((vacancy) => (
        <VacancyCard 
          key={vacancy.id} 
          vacancy={vacancy} 
          onEditVacancy={onEditVacancy}
          onArchiveVacancy={onArchiveVacancy}
          onViewVacancy={onViewVacancy}
        />
      ))}
    </div>
  )
}