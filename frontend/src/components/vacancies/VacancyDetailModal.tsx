'use client'

import { Vacancy, VacancyStatus } from '@/types/vacancy'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Building2,
  Clock,
  Briefcase,
  ExternalLink,
  User,
  FileText,
  Star,
  Edit
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { getStatusColor } from "@/utils/vacancy-utils"

interface VacancyDetailModalProps {
  vacancy: Vacancy | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (vacancy: Vacancy) => void
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

export function VacancyDetailModal({ vacancy, isOpen, onClose, onEdit }: VacancyDetailModalProps) {
  if (!vacancy) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl min-w-[calc(100vw-2rem)] lg:min-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl font-bold text-foreground mb-2 pr-8">
                {vacancy.title}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2 text-lg text-muted-foreground">
                <Building2 className="h-5 w-5" />
                <span className="font-medium">{vacancy.company.name}</span>
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={`text-sm font-medium ${getStatusColor(vacancy.status)}`}
              >
                {getStatusLabel(vacancy.status)}
              </Badge>
              {onEdit && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onEdit(vacancy)}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Key Details */}
          <div className=" grid grid-cols-2 md:grid-cols-4 gap-6">
            {vacancy.location && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm font-medium">Location</span>
                </div>
                <p className="text-foreground">{vacancy.location}</p>
              </div>
            )}
            
            {vacancy.workType && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  <span className="text-sm font-medium">Work Type</span>
                </div>
                <p className="text-foreground capitalize">{vacancy.workType}</p>
              </div>
            )}
            
            {vacancy.salary && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm font-medium">Salary</span>
                </div>
                <p className="text-foreground font-medium">${vacancy.salary.toLocaleString()}</p>
              </div>
            )}
            
            {vacancy.experience && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">Experience</span>
                </div>
                <p className="text-foreground">{vacancy.experience}</p>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Applied</span>
              </div>
              <p className="text-foreground">
                {format(new Date(vacancy.appliedAt), 'MMM d, yyyy')}
                <span className="text-sm text-muted-foreground ml-2">
                  ({formatDistanceToNow(new Date(vacancy.appliedAt), { addSuffix: true })})
                </span>
              </p>
            </div>
            
            {vacancy.lastUpdated && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Last Updated</span>
                </div>
                <p className="text-foreground">
                  {format(new Date(vacancy.lastUpdated), 'MMM d, yyyy')}
                  <span className="text-sm text-muted-foreground ml-2">
                    ({formatDistanceToNow(new Date(vacancy.lastUpdated), { addSuffix: true })})
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          {vacancy.description && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Job Description
              </h3>
              <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {vacancy.description}
              </div>
            </div>
          )}

          {/* Requirements */}
          {vacancy.requirements && vacancy.requirements.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Requirements
              </h3>
              <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {vacancy.requirements}
              </div>
            </div>
          )}

          {/* Benefits */}
          {vacancy.benefits && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Star className="h-5 w-5" />
                Benefits
              </h3>
              <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {vacancy.benefits}
              </div>
            </div>
          )}

          {/* Actions */}
          {vacancy.jobUrl && (
            <div className="pt-4 border-t border-border">
              <Button 
                variant="outline" 
                className="gap-2"
                asChild
              >
                <a href={vacancy.jobUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  View Original Posting
                </a>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}