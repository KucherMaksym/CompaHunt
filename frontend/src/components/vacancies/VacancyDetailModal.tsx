'use client'

import { useState } from 'react'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { Vacancy, Interview } from '@/types/vacancy'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  MousePointer,
  Plus
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { getStatusColor } from "@/utils/vacancy-utils"
import { Title } from "@/components/ui/Title"
import { Text } from "@/components/ui/Text"
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import apiClient from '@/lib/api-client'
import { notesApi } from '@/lib/api/notes'
import EditInterviewModal from '@/components/interviews/EditInterviewModal'
import { InterviewForm } from '@/components/interviews/InterviewForm'
import { InterviewList } from '@/components/interviews/InterviewList'
import { NoteForm } from '@/components/notes/NoteForm'
import { NoteList } from '@/components/notes/NoteList'

interface VacancyDetailModalProps {
  vacancy: Vacancy | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (vacancy: Vacancy) => void
}

function getStatusLabel(status: string): string {
  return status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
}

export function VacancyDetailModal({ vacancy, isOpen, onClose, onEdit }: VacancyDetailModalProps) {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('details')
  const [showInterviewForm, setShowInterviewForm] = useState(false)
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null)
  const [showNoteForm, setShowNoteForm] = useState(false)

  // Fetch interviews for this vacancy
  const { data: interviews = [] } = useQuery({
    queryKey: ['interviews', vacancy?.id],
    queryFn: async () => {
      if (!vacancy?.id) return []
      const response = await apiClient.get(`/api/vacancies/${vacancy.id}/interviews`)
      return response.data
    },
    enabled: !!vacancy?.id
  })

  // Fetch notes for this vacancy
  const { data: notes = [] } = useQuery({
    queryKey: ['notes', vacancy?.id],
    queryFn: async () => {
      if (!vacancy?.id) return []
      return await notesApi.getByVacancy(vacancy.id)
    },
    enabled: !!vacancy?.id
  })

  if (!vacancy) return null

  const handleEdit = () => {
    if (onEdit) {
      onEdit(vacancy)
    }
  }

  const onEditInterview = (interview: Interview) => {
    setEditingInterview(interview);
  }

  const handleInterviewSave = () => {
    queryClient.invalidateQueries({ queryKey: ['interviews', vacancy?.id] });
    setEditingInterview(null);
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl h-[95vh] overflow-hidden p-0 flex flex-col gap-0">
          <DialogHeader className="px-6 py-4 border-b bg-card flex-shrink-0 gap-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-start font-semibold">
                    {vacancy.title}
                  </DialogTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">{vacancy.company.name}</span>
                    <Badge variant={"static"} className={` ${getStatusColor(vacancy.status)}`}>
                      {getStatusLabel(vacancy.status)}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {vacancy?.url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={vacancy.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Job
                    </a>
                  </Button>
                )}
                {onEdit && (
                  <Button variant="outline" size="sm" onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <div className="px-6 py-2 bg-muted/30 border-b flex-shrink-0">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="details" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Details
                </TabsTrigger>
                <TabsTrigger value="interviews" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Interviews
                  {interviews.length > 0 && (
                    <Badge variant="secondary" className=" w-4 h-4 p-0 text-xs text-white flex items-center justify-center">
                      {interviews.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="notes" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notes
                  {notes.length > 0 && (
                    <Badge variant="secondary" className=" w-4 h-4 p-0 text-xs text-white flex items-center justify-center">
                      {notes.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1 min-h-0">
              <div className="p-6">
                <TabsContent value="details" className="mt-0">
                  <div className="space-y-8">
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
                  </div>
                </TabsContent>

                <TabsContent value="interviews" className="mt-0">
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">Scheduled Interviews</h3>
                        <p className="text-sm text-muted-foreground">
                          Manage all interviews for this position
                        </p>
                      </div>
                      <Button 
                        onClick={() => setShowInterviewForm(true)}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Schedule Interview
                      </Button>
                    </div>

                    <InterviewForm 
                      vacancyId={vacancy?.id || ''}
                      isVisible={showInterviewForm}
                      onCancel={() => setShowInterviewForm(false)}
                      onSuccess={() => setShowInterviewForm(false)}
                    />

                    <InterviewList 
                      interviews={interviews}
                      vacancyId={vacancy?.id || ''}
                      onScheduleNew={() => setShowInterviewForm(true)}
                      onEdit={onEditInterview}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="mt-0">
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">Notes</h3>
                        <p className="text-sm text-muted-foreground">
                          Keep track of important notes and observations
                        </p>
                      </div>

                      {!(notes.length > 0) && (
                          <Button
                              onClick={() => setShowNoteForm(true)}
                              className="flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Add Note
                          </Button>
                      )}
                    </div>

                    <NoteForm 
                      vacancyId={vacancy?.id || ''}
                      isVisible={showNoteForm}
                      onCancel={() => setShowNoteForm(false)}
                      onSuccess={() => setShowNoteForm(false)}
                    />

                    <NoteList 
                      notes={notes}
                      vacancyId={vacancy?.id || ''}
                      onAddNew={() => setShowNoteForm(true)}
                    />
                  </div>
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      {editingInterview && (
        <EditInterviewModal
          interview={editingInterview}
          isOpen={!!editingInterview}
          onClose={() => setEditingInterview(null)}
          onSave={handleInterviewSave}
        />
      )}
    </>
  )
}