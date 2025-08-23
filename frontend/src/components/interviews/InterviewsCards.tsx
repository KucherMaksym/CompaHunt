'use client'

import { Interview, InterviewStatus, InterviewType } from '@/types/vacancy'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Calendar, 
  Clock, 
  User, 
  Video, 
  MapPin,
  Mail,
  FileText,
  MoreHorizontal,
  Edit,
  Trash2,
  ExternalLink
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import {formatShortLink} from "@/utils/url-utils";

interface InterviewsCardsProps {
  interviews: Interview[]
  onEditInterview?: (interview: Interview) => void
  onDeleteInterview?: (interviewId: string) => void
  onViewInterview?: (interview: Interview) => void
}

function getStatusLabel(status: InterviewStatus): string {
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

function getTypeLabel(type: InterviewType): string {
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

function getStatusColor(status: InterviewStatus): string {
  switch (status) {
    case InterviewStatus.SCHEDULED:
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case InterviewStatus.COMPLETED:
      return 'bg-green-100 text-green-800 border-green-200'
    case InterviewStatus.CANCELLED:
      return 'bg-red-100 text-red-800 border-red-200'
    case InterviewStatus.RESCHEDULED:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case InterviewStatus.NO_SHOW:
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

interface InterviewCardProps {
  interview: Interview
  onEditInterview?: (interview: Interview) => void
  onDeleteInterview?: (interviewId: string) => void
  onViewInterview?: (interview: Interview) => void
}

function InterviewCard({ interview, onEditInterview, onDeleteInterview, onViewInterview }: InterviewCardProps) {
  return (
    <div 
      className="group bg-background-surface border border-border rounded-lg p-6 hover:shadow-custom-md transition-all duration-200 hover:border-border/80 cursor-pointer"
      onClick={() => onViewInterview?.(interview)}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground leading-tight mb-1">
            {interview.vacancy?.title || 'Position not specified'}
          </h3>
          <div className="flex items-center gap-1 text-muted-foreground mb-2">
            <span className="text-sm font-medium">
              {interview.vacancy?.company?.name || 'Company not specified'}
            </span>
          </div>
          <div className="text-sm text-muted-foreground mb-1">
            {getTypeLabel(interview.type)}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">
              {format(new Date(interview.scheduledAt), 'PPP')}
            </span>
          </div>
        </div>
        <Badge 
          variant="outline" 
          className={`ml-3 text-xs font-medium ${getStatusColor(interview.status)}`}
        >
          {getStatusLabel(interview.status)}
        </Badge>
      </div>

      {/* Details */}
      <div className="space-y-3 mb-4">
        {/* Date & Time */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{format(new Date(interview.scheduledAt), 'p')}</span>
          </div>
          {interview.duration && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{interview.duration} min</span>
            </div>
          )}
        </div>

        {/* Interviewer */}
        {interview.interviewerName && (
          <div className="flex items-center gap-1">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {interview.interviewerName}
            </span>
          </div>
        )}

        {/* Contact Info */}
        <div className="flex flex-col gap-2">
          {interview.interviewerEmail && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span className="text-sm truncate">{interview.interviewerEmail}</span>
            </div>
          )}
          
          {interview.location && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{interview.location}</span>
            </div>
          )}
          
          {interview.meetingLink && (
            <div className="flex items-center gap-1">
              <Video className="h-4 w-4 text-muted-foreground" />
              <a
                href={formatShortLink(interview.meetingLink)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                Meeting Link
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>

        {/* Notes Preview */}
        {interview.notes && (
          <div className="text-sm text-muted-foreground">
            <div className="flex items-center gap-1 mb-1">
              <FileText className="h-4 w-4" />
              <span className="font-medium">Notes:</span>
            </div>
            <p className="line-clamp-2 pl-5">{interview.notes}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span className="text-xs">
            Created {formatDistanceToNow(new Date(interview.createdAt), { addSuffix: true })}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {interview.updatedAt && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span className="text-xs">
                Updated {format(new Date(interview.updatedAt), 'MMM d')}
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            {interview.meetingLink && (
              <Button 
                variant="ghost" 
                size="sm" 
                asChild
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
              >
                <a href={formatShortLink(interview.meetingLink)} target="_blank" rel="noopener noreferrer">
                  <Video className="h-4 w-4" />
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
                {onEditInterview && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditInterview(interview); }}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDeleteInterview && (
                  <DropdownMenuItem 
                    onClick={(e) => { e.stopPropagation(); onDeleteInterview(interview.id); }}
                    className="text-error/70 focus:text-error/100"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
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

export function InterviewsCards({ interviews, onEditInterview, onDeleteInterview, onViewInterview }: InterviewsCardsProps) {
  if (interviews.length === 0) {
    return (
      <div className="text-center py-12 bg-background-surface rounded-lg border border-border">
        <div className="text-muted-foreground mb-4">
          <Calendar className="mx-auto h-12 w-12" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-1">No interviews yet</h3>
        <p className="text-muted-foreground">Start by scheduling your first interview!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {interviews.map((interview) => (
        <InterviewCard 
          key={interview.id} 
          interview={interview} 
          onEditInterview={onEditInterview}
          onDeleteInterview={onDeleteInterview}
          onViewInterview={onViewInterview}
        />
      ))}
    </div>
  )
}