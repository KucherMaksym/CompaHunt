'use client'

import { Vacancy, VacancyStatus } from '@/types/vacancy'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, MapPin, Calendar, DollarSign } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import {getStatusColor} from "@/utils/vacancy-utils";

interface VacanciesTableProps {
  vacancies: Vacancy[]
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

function truncateText(text: string | undefined, maxLength: number): string {
  if (!text) return ''
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
}

export function VacanciesTable({ vacancies }: VacanciesTableProps) {
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
    <div className="bg-background-surface rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-semibold">Position & Company</TableHead>
            <TableHead className="font-semibold">Location</TableHead>
            <TableHead className="font-semibold">Salary</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Applied</TableHead>
            <TableHead className="font-semibold w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vacancies.map((vacancy) => (
            <TableRow key={vacancy.id} className="group">
              <TableCell className="min-w-[280px]">
                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground text-sm leading-tight">
                    {truncateText(vacancy.title, 50)}
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    {truncateText(vacancy.company.name, 40)}
                  </p>
                  {vacancy.workType && (
                    <span className="inline-block px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs font-medium capitalize">
                      {vacancy.workType}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {vacancy.location ? (
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{truncateText(vacancy.location, 25)}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground/50 text-sm">—</span>
                )}
              </TableCell>
              <TableCell>
                {vacancy.salary ? (
                  <div className="flex items-center gap-1 text-foreground text-sm font-medium">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    ${vacancy.salary.toLocaleString()}
                  </div>
                ) : (
                  <span className="text-muted-foreground/50 text-sm">—</span>
                )}
              </TableCell>
              <TableCell>
                <Badge 
                  variant="outline" 
                  className={`text-xs font-medium ${getStatusColor(vacancy.status)}`}
                >
                  {getStatusLabel(vacancy.status)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDistanceToNow(new Date(vacancy.appliedAt), { addSuffix: true })}</span>
                </div>
              </TableCell>
              <TableCell>
                {vacancy.jobUrl && (
                  <a 
                    href={vacancy.jobUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}