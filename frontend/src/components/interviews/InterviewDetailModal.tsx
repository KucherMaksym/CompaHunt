'use client'

import { Interview, InterviewStatus, InterviewType } from '@/types/vacancy'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import {
  Calendar,
  Clock,
  User,
  Mail,
  MapPin,
  Video,
  FileText,
  MessageSquare,
  Edit,
  ExternalLink,
  Building2,
  DollarSign
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { useState } from 'react'
import {EditInterviewModal} from './EditInterviewModal'
import {formatShortLink} from "@/utils/url-utils";
import {Title} from "@/components/ui/Title";
import {Text} from "@/components/ui/Text";
import {getInterviewStatusColor, getInterviewStatusLabel, getInterviewTypeLabel} from "@/utils/interview-utils";
import {VacancyDetailModal} from '@/components/vacancies/VacancyDetailModal';

interface InterviewDetailModalProps {
  interview: Interview | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (interview: Interview) => void
  onSave?: (updatedInterview: Interview) => void
}

export function InterviewDetailModal({ interview, isOpen, onClose, onEdit, onSave }: InterviewDetailModalProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isVacancyModalOpen, setIsVacancyModalOpen] = useState(false)

  if (!interview) return null

  const handleEdit = () => {
    setIsEditModalOpen(true)
  }

  const handleSaveInterview = (updatedInterview: Interview) => {
    if (onSave) {
      onSave(updatedInterview)
    }
    setIsEditModalOpen(false)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-4">
            {/* Header Section */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-2xl font-bold text-foreground mb-2 pr-8">
                  {getInterviewTypeLabel(interview.type)}
                </DialogTitle>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <Text size="lg" variant="secondary" weight="medium">
                    {format(new Date(interview.scheduledAt), 'PPP')} at {format(new Date(interview.scheduledAt), 'p')}
                  </Text>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                      variant="outline"
                      className={`text-sm font-medium ${getInterviewStatusColor(interview.status)}`}
                  >
                    {getInterviewStatusLabel(interview.status)}
                  </Badge>
                  {interview.duration && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <Text size="sm" variant="muted">
                          {interview.duration} min
                        </Text>
                      </div>
                  )}
                </div>
              </div>
              <button onClick={handleEdit} className="absolute right-10 top-4 text-primary cursor-pointer opacity-70 hover:opacity-100 transition duration-200">
                <Edit className="h-4 w-4" />
              </button>
            </div>
          </DialogHeader>

          <div className="space-y-8 mt-6">
            {/* Vacancy Information Card */}
            {interview.vacancy && (
              <div className="space-y-4">
                <Title level={3} variant="primary">
                  Position Details
                </Title>

                <div className="bg-background-surface p-4 rounded-lg border border-border space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-semibold text-foreground mb-2 leading-tight">
                        {interview.vacancy.title}
                      </h4>
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <Text size="base" weight="medium">
                          {interview.vacancy.company?.name}
                        </Text>
                      </div>
                      {interview.vacancy.location && (
                        <div className={`flex items-center gap-2 ${interview.vacancy.salary && "mb-2"} `}>
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <Text size="sm" variant="muted">
                            {interview.vacancy.location}
                          </Text>
                        </div>
                      )}
                      {interview.vacancy.salary && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <Text size="sm" variant="muted">
                            ${interview.vacancy.salary.toLocaleString()}
                          </Text>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsVacancyModalOpen(true)}
                      className="flex-shrink-0"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Information Card */}
            <div className="space-y-4">
              <Title level={3} variant="primary">
                Contact Information
              </Title>

              <div className="space-y-4">
                {/*{interview.interviewerName && (*/}
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <Text size="sm" variant="muted" weight="medium" className="mb-1">
                          Interviewer
                        </Text>
                        <Text size="base" weight="medium">
                          {interview.interviewerName ? interview.interviewerName : "N/A" }
                        </Text>
                      </div>
                    </div>
                {/*)}*/}

                {/*{interview.interviewerEmail && (*/}
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <Text size="sm" variant="muted" weight="medium" className="mb-1">
                          Email
                        </Text>
                        <Text
                            as="a"
                            href={`mailto:${interview.interviewerEmail}`}
                            size="base"
                            className="text-primary hover:text-primary/80 transition-colors break-all"
                        >
                          {interview.interviewerEmail ? interview.interviewerEmail : "N/A"}
                        </Text>
                      </div>
                    </div>
                {/*)}*/}
              </div>
            </div>

            {/* Meeting Details Card */}
            <div className="space-y-4">
              <Title level={3} variant="primary">
                Meeting Details
              </Title>

              <div className="space-y-4">
                {/*{interview.location && (*/}
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <Text size="sm" variant="muted" weight="medium" className="mb-1">
                          Location
                        </Text>
                        <Text size="base">
                          {interview.location ? interview.location : "N/A"}
                        </Text>
                      </div>
                    </div>
                {/*)}*/}

                {/*{interview.meetingLink && (*/}
                    <div className="flex items-start gap-3">
                      <Video className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <Text size="sm" variant="muted" weight="medium" className="mb-1">
                          Meeting Link
                        </Text>
                        {interview.meetingLink ?
                            <Text
                                as="a"
                                href={formatShortLink(interview.meetingLink)}
                                target="_blank"
                                rel="noopener noreferrer"
                                size="base"
                                className="text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1 break-all"
                            >
                              Join Meeting
                              <ExternalLink className="h-3 w-3 flex-shrink-0" />
                            </Text>
                            : <Text>N/A</Text>
                        }

                      </div>
                    </div>
                {/*)}*/}
              </div>
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Text size="sm" variant="muted" weight="medium">
                  Created
                </Text>
                <Text size="base">
                  {format(new Date(interview.createdAt), 'MMM d, yyyy')}
                </Text>
                <Text size="sm" variant="muted">
                  {formatDistanceToNow(new Date(interview.createdAt), { addSuffix: true })}
                </Text>
              </div>

              <div className="space-y-2">
                <Text size="sm" variant="muted" weight="medium">
                  Last Updated
                </Text>
                <Text size="base">
                  {format(new Date(interview.updatedAt), 'MMM d, yyyy')}
                </Text>
                <Text size="sm" variant="muted">
                  {formatDistanceToNow(new Date(interview.updatedAt), { addSuffix: true })}
                </Text>
              </div>
            </div>

            {/* Notes */}
            {interview.notes && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notes
                </h3>
                <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed bg-background-surface p-4 rounded-lg border border-border">
                  {interview.notes}
                </div>
              </div>
            )}

            {/* Feedback */}
            {interview.feedback && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Feedback
                </h3>
                <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed bg-background-surface p-4 rounded-lg border border-border">
                  {interview.feedback}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-6 border-t border-border">
              <div className="flex flex-wrap gap-3">
                <Button
                    variant="default"
                    className="gap-2"
                    disabled={!interview.meetingLink}
                >
                  <a href={formatShortLink(interview?.meetingLink)} className={"flex gap-2 items-center"} target="_blank" rel="noopener noreferrer">
                    <Video className="h-4 w-4" />
                    <Text size="sm" weight="medium">Join Meeting</Text>
                  </a>
                </Button>
                <Button
                    variant="outline"
                    className="gap-2"
                    disabled={!interview.interviewerEmail}
                >
                  <a href={`mailto:${interview.interviewerEmail}`} className={"flex gap-2 items-center"}>
                    <Mail className="h-4 w-4" />
                    <Text size="sm" weight="medium">Email Interviewer</Text>
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <EditInterviewModal
        interview={interview}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveInterview}
      />

      {/* Vacancy Detail Modal */}
      {interview.vacancy && (
        <VacancyDetailModal
          vacancy={interview.vacancy}
          isOpen={isVacancyModalOpen}
          onClose={() => setIsVacancyModalOpen(false)}
        />
      )}
    </>
  )
}