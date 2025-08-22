'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Video,
  Phone,
  Building,
  FileText,
  Users,
  Mail,
  AlertCircle,
  Plus,
  MoreHorizontal,
  Edit,
  Archive
} from 'lucide-react'
import { Interview, InterviewType, InterviewStatus } from '@/types/vacancy'
import { getInterviewStatusColor } from '@/utils/interview-utils'
import { formatShortLink } from '@/utils/url-utils'
import { interviewApi } from '@/lib/api/interviews'
import { formatUTCForDisplay, utcToDate } from '@/lib/timezone'

const getInterviewTypeIcon = (type: InterviewType) => {
  const iconMap = {
    [InterviewType.PHONE_SCREEN]: Phone,
    [InterviewType.VIDEO_CALL]: Video,
    [InterviewType.ON_SITE]: Building,
    [InterviewType.TECHNICAL]: FileText,
    [InterviewType.BEHAVIORAL]: User,
    [InterviewType.FINAL_ROUND]: Users,
    [InterviewType.HR_INTERVIEW]: User
  }
  return iconMap[type] || Calendar
}

interface InterviewListProps {
  interviews: Interview[]
  vacancyId: string
  onScheduleNew: () => void
  onEdit: (interview: Interview) => void
}

export function InterviewList({ interviews, vacancyId, onScheduleNew, onEdit }: InterviewListProps) {
  const queryClient = useQueryClient()

  const deleteInterviewMutation = useMutation({
    mutationFn: async (interviewId: string) => {
      return await interviewApi.delete(interviewId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews', vacancyId] })
    }
  })

  const onDelete = async (interviewId: string) => {
    if (confirm('Are you sure you want to delete this interview?')) {
      try {
        await deleteInterviewMutation.mutateAsync(interviewId)
      } catch (error) {
        console.error('An error occurred while deleting:', error)
      }
    }
  }

  if (interviews.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">No interviews scheduled</h3>
          <p className="text-muted-foreground mb-4">
            Schedule your first interview to get started
          </p>
          <Button 
            onClick={onScheduleNew}
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule Interview
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {interviews.map((interview: Interview) => {
        const IconComponent = getInterviewTypeIcon(interview.type)
        const interviewDate = utcToDate(interview.scheduledAt)
        const isPast = interviewDate < new Date()
        
        return (
          <Card key={interview.id} className="hover:shadow-md transition-shadow">
            <CardContent>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 w-full">
                  <div className="w-full">
                    <div className="flex justify-between items-center gap-2 mb-2">
                      <div className="flex items-center gap-2 mb-2">
                        <IconComponent className="h-5 w-5 text-primary" />
                        <h4 className="font-semibold">
                          {interview.type.replace('_', ' ')}
                        </h4>
                        <Badge variant="static" className={getInterviewStatusColor(interview.status)}>
                          {interview.status}
                        </Badge>
                        {isPast && interview.status === InterviewStatus.SCHEDULED && (
                          <Badge variant="outline" className="text-orange-600 border-orange-200">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Overdue
                          </Badge>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(interview)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDelete(interview.id)}
                            className="text-orange-600 focus:text-orange-600"
                          >
                            <Archive className="mr-2 h-4 w-4" />
                            Archive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {interviewDate.toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {interviewDate.toLocaleTimeString()}
                        {interview.duration && ` (${interview.duration} min)`}
                      </div>
                      {interview.interviewerName && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {interview.interviewerName}
                        </div>
                      )}
                      {interview.interviewerEmail && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {interview.interviewerEmail}
                        </div>
                      )}
                      {interview.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {interview.location}
                        </div>
                      )}
                      {interview.meetingLink && (
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          <a 
                            href={formatShortLink(interview.meetingLink)}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Join Meeting
                          </a>
                        </div>
                      )}
                    </div>
                    
                    {interview.notes && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          <strong>Notes:</strong> {interview.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}