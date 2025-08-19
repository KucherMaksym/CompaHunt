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
  Edit,
  MousePointer
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { getStatusColor } from "@/utils/vacancy-utils"
import { Title } from "@/components/ui/Title"
import { Text } from "@/components/ui/Text"
import {formatShortLink} from "@/utils/url-utils";
import { RichTextEditor } from '@/components/ui/rich-text-editor'

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

  const handleEdit = () => {
    if (onEdit) {
      onEdit(vacancy)
    }
  }

  return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[calc(100vw-2rem)] min-w-[calc(100vw-2rem)] md:min-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-4">
            {/* Header Section */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-2xl font-bold text-foreground mb-2 pr-8">
                  {vacancy.title}
                </DialogTitle>
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <Text size="lg" variant="secondary" weight="medium">
                    {vacancy.company.name}
                  </Text>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                      variant="outline"
                      className={`text-sm font-medium ${getStatusColor(vacancy.status)}`}
                  >
                    {getStatusLabel(vacancy.status)}
                  </Badge>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <Text size="sm" variant="muted">
                      Applied {formatDistanceToNow(new Date(vacancy.appliedAt), { addSuffix: true })}
                    </Text>
                  </div>
                </div>
              </div>
              {onEdit && (
                  <button
                      onClick={handleEdit}
                      className="absolute right-10 top-4 text-primary cursor-pointer opacity-70 hover:opacity-100 transition duration-200"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-8 mt-6">
            {/* Job Information Card */}
            <div className="space-y-4">
              <Title level={3} variant="primary">
                Job Information
              </Title>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <Text size="sm" variant="muted" weight="medium" className="mb-1">
                      Location
                    </Text>
                    <Text size="base">
                      {vacancy.location || "N/A"}
                    </Text>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <Text size="sm" variant="muted" weight="medium" className="mb-1">
                      Work Type
                    </Text>
                    <Text size="base" className="capitalize">
                      {vacancy.remoteness || "N/A"}
                    </Text>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <Text size="sm" variant="muted" weight="medium" className="mb-1">
                      Salary
                    </Text>
                    <Text size="base" weight="medium">
                      {vacancy.salary ? `${vacancy.salary.toLocaleString()}` : "N/A"}
                    </Text>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <Text size="sm" variant="muted" weight="medium" className="mb-1">
                      Experience Required
                    </Text>
                    <Text size="base">
                      {vacancy.experience || "N/A"}
                    </Text>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MousePointer className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <Text size="sm" variant="muted" weight="medium" className="mb-1">
                      Added Method
                    </Text>
                    <Text size="base">
                      {vacancy.manual === true ? "Manual Entry" : "Parsed from Website"}
                    </Text>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Card */}
            <div className="space-y-4">
              <Title level={3} variant="primary">
                Timeline
              </Title>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <Text size="sm" variant="muted" weight="medium" className="mb-1">
                      Applied Date
                    </Text>
                    <Text size="base">
                      {format(new Date(vacancy.appliedAt), 'PPP')}
                    </Text>
                    <Text size="sm" variant="muted">
                      {formatDistanceToNow(new Date(vacancy.appliedAt), { addSuffix: true })}
                    </Text>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <Text size="sm" variant="muted" weight="medium" className="mb-1">
                      Last Updated
                    </Text>
                    <Text size="base">
                      {vacancy.lastUpdated ? format(new Date(vacancy.lastUpdated), 'PPP') : "N/A"}
                    </Text>
                    {vacancy.lastUpdated && (
                        <Text size="sm" variant="muted">
                          {formatDistanceToNow(new Date(vacancy.lastUpdated), { addSuffix: true })}
                        </Text>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Job Description */}
            {(vacancy.htmlDescription || vacancy.description) && (
                <div className="space-y-3">
                  <Title level={3} variant="primary" className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Job Description
                  </Title>
                  {vacancy.htmlDescription ? (
                    <RichTextEditor
                      content={vacancy.htmlDescription}
                      readOnly={true}
                      className="bg-background-surface"
                    />
                  ) : (
                    <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed bg-background-surface p-4 rounded-lg border border-border">
                      {vacancy.description}
                    </div>
                  )}
                </div>
            )}

            {/* Requirements */}
            {vacancy.requirements && (
                <div className="space-y-3">
                  <Title level={3} variant="primary" className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Requirements
                  </Title>
                  <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed bg-background-surface p-4 rounded-lg border border-border">
                    {vacancy.requirements}
                  </div>
                </div>
            )}

            {/* Benefits */}
            {vacancy.benefits && (
                <div className="space-y-3">
                  <Title level={3} variant="primary" className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Benefits
                  </Title>
                  <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed bg-background-surface p-4 rounded-lg border border-border">
                    {vacancy.benefits}
                  </div>
                </div>
            )}

            {/* Actions */}
            <div className="pt-6 border-t border-border">
              <div className="flex flex-wrap gap-3">
                <Button
                    variant="default"
                    className="gap-2"
                    disabled={!vacancy.url}
                >
                  <a
                      href={formatShortLink(vacancy.url) || '#'}
                      className="flex gap-2 items-center"
                      target="_blank"
                      rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <Text size="sm" weight="medium">View Original Posting</Text>
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
  )
}