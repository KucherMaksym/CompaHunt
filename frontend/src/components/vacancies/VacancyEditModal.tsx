'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Calendar,
  DollarSign,
  Globe,
  Briefcase,
  Link,
  MapPin,
  FileText,
  ExternalLink,
  Building
} from 'lucide-react'
import { Vacancy, VacancyStatus, Interview, VacancyNote } from '@/types/vacancy'
import apiClient from '@/lib/api-client'
import {getStatusColor} from "@/utils/vacancy-utils";
import {EditInterviewModal} from '@/components/interviews/EditInterviewModal';
import { InterviewForm } from '@/components/interviews/InterviewForm';
import { InterviewList } from '@/components/interviews/InterviewList';
import { NoteForm } from '@/components/notes/NoteForm';
import { NoteList } from '@/components/notes/NoteList';
import { notesApi } from '@/lib/api/notes';

interface VacancyModalProps {
  isOpen: boolean
  onClose: () => void
  vacancy?: Vacancy
  mode: 'create' | 'edit'
}

interface VacancyFormData {
  title: string
  companyName: string
  location: string
  salary: string
  status: VacancyStatus
  description: string
  htmlDescription: string
  requirements: string
  benefits: string
  remoteness: 'Remote' | 'On-site' | 'Hybrid' | ''
  experienceLevel: string
  url: string
}

export function VacancyEditModal({ isOpen, onClose, vacancy, mode }: VacancyModalProps) {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('details')
  const [showInterviewForm, setShowInterviewForm] = useState(false)
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null)
  const [showNoteForm, setShowNoteForm] = useState(false)
  
  const [formData, setFormData] = useState<VacancyFormData>({
    title: '',
    companyName: '',
    location: '',
    salary: '',
    status: VacancyStatus.APPLIED,
    description: '',
    htmlDescription: '',
    requirements: '',
    benefits: '',
    remoteness: '',
    experienceLevel: '',
    url: ''
  })

  // Fetch interviews for this vacancy
  const { data: interviews = [] } = useQuery({
    queryKey: ['interviews', vacancy?.id],
    queryFn: async () => {
      if (!vacancy?.id) return []
      const response = await apiClient.get(`/api/vacancies/${vacancy.id}/interviews`)
      return response.data
    },
    enabled: !!vacancy?.id && mode === 'edit'
  })

  // Fetch notes for this vacancy
  const { data: notes = [] } = useQuery({
    queryKey: ['notes', vacancy?.id],
    queryFn: async () => {
      if (!vacancy?.id) return []
      return await notesApi.getByVacancy(vacancy.id)
    },
    enabled: !!vacancy?.id && mode === 'edit'
  })

  useEffect(() => {
    if (vacancy && mode === 'edit') {
      setFormData({
        title: vacancy.title,
        companyName: vacancy.company.name,
        location: vacancy.location || '',
        salary: vacancy.salary?.toString() || '',
        status: vacancy.status,
        description: vacancy.description || '',
        htmlDescription: vacancy.htmlDescription || '',
        requirements: vacancy.requirements || '',
        benefits: vacancy.benefits || '',
        remoteness: vacancy.remoteness || '',
        experienceLevel: vacancy.experienceLevel || '',
        url: vacancy.url || ''
      })
    } else {
      setFormData({
        title: '',
        companyName: '',
        location: '',
        salary: '',
        status: VacancyStatus.APPLIED,
        description: '',
        htmlDescription: '',
        requirements: '',
        benefits: '',
        remoteness: '',
        experienceLevel: '',
        url: ''
      })
    }
    setActiveTab('details')
    setShowInterviewForm(false)
  }, [vacancy, mode, isOpen])

  const createMutation = useMutation({
    mutationFn: async (data: VacancyFormData) => {
      const payload = {
        title: data.title,
        company: data.companyName,
        location: data.location || null,
        salary: data.salary ? parseInt(data.salary) : null,
        status: data.status,
        description: data.description || null,
        htmlDescription: data.htmlDescription || null,
        requirements: data.requirements || null,
        benefits: data.benefits || null,
        remoteness: data.remoteness || null,
        experienceLevel: data.experienceLevel || null,
        url: data.url,
        manual: true, // manually added
      }
      return await apiClient.post('/api/vacancies', payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      onClose()
    }
  })

  const updateMutation = useMutation({
    mutationFn: async (data: VacancyFormData) => {
      if (!vacancy) throw new Error('No vacancy to update')
      
      const payload = {
        title: data.title,
        company: data.companyName,
        location: data.location || null,
        salary: data.salary ? parseInt(data.salary) : null,
        status: data.status,
        description: data.description || null,
        htmlDescription: data.htmlDescription || null,
        requirements: data.requirements || null,
        benefits: data.benefits || null,
        remoteness: data.remoteness || null,
        experienceLevel: data.experienceLevel || null
      }
      
      return await apiClient.put(`/api/vacancies/${vacancy.id}`, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      onClose();
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (mode === 'create') {
      createMutation.mutate(formData);
    } else {
      updateMutation.mutate(formData);
    }
  }

  const handleInputChange = (field: keyof VacancyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const onEditInterview = (interview: Interview) => {
    setEditingInterview(interview);
  }

  const handleInterviewSave = (updatedInterview: Interview) => {
    queryClient.invalidateQueries({ queryKey: ['interviews', vacancy?.id] });
    setEditingInterview(null);
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[95vh] overflow-hidden p-0 flex flex-col gap-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-card flex-shrink-0 gap-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-start font-semibold">
                  {mode === 'create' ? 'Add New Vacancy' : 'Edit Vacancy'}
                </DialogTitle>
                {vacancy && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">{vacancy.company.name}</span>
                    <Badge variant={"static"} className={` ${getStatusColor(vacancy.status)}`}>
                      {vacancy.status.replace('_', ' ')}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            {vacancy?.url && (
              <Button variant="outline" size="sm" asChild>
                <a href={vacancy.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Job
                </a>
              </Button>
            )}
          </div>
        </DialogHeader>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <div className="px-6 py-2 bg-muted/30 border-b flex-shrink-0">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="details" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Details
              </TabsTrigger>
              <TabsTrigger value="interviews" disabled={mode === 'create'} className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Interviews
                {interviews.length > 0 && (
                  <Badge variant="secondary" className=" w-4 h-4 p-0 text-xs text-white flex items-center justify-center">
                    {interviews.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="notes" disabled={mode === 'create'} className="flex items-center gap-2">
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
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Position Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Position Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-medium">
                          Job Title <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          required
                          placeholder="e.g. Senior Frontend Developer"
                          className="h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="companyName" className="text-sm font-medium">
                          Company <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="companyName"
                          value={formData.companyName}
                          onChange={(e) => handleInputChange('companyName', e.target.value)}
                          required
                          placeholder="e.g. Google"
                          className="h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-sm font-medium flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          Location
                        </Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          placeholder="e.g. San Francisco, CA"
                          className="h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="salary" className="text-sm font-medium flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          Salary (USD)
                        </Label>
                        <Input
                          id="salary"
                          type="number"
                          value={formData.salary}
                          onChange={(e) => handleInputChange('salary', e.target.value)}
                          placeholder="e.g. 120000"
                          className="h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                        <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                          <SelectTrigger className="h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={VacancyStatus.APPLIED}>Applied</SelectItem>
                            <SelectItem value={VacancyStatus.WISHLIST}>Viewed</SelectItem>
                            <SelectItem value={VacancyStatus.PHONE_SCREEN}>Phone Screen</SelectItem>
                            <SelectItem value={VacancyStatus.INTERVIEW}>Interview</SelectItem>
                            <SelectItem value={VacancyStatus.OFFER}>Offer</SelectItem>
                            <SelectItem value={VacancyStatus.REJECTED}>Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="remoteness" className="text-sm font-medium flex items-center gap-1">
                          <Globe className="h-4 w-4" />
                          Work Type
                        </Label>
                        <Select value={formData.remoteness} onValueChange={(value) => handleInputChange('remoteness', value)}>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select work type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="remote">Remote</SelectItem>
                            <SelectItem value="office">Office</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="url" className="text-sm font-medium flex items-center gap-1">
                        <Link className="h-4 w-4" />
                        Job URL
                      </Label>
                      <Input
                        id="url"
                        type="url"
                        value={formData.url}
                        onChange={(e) => handleInputChange('url', e.target.value)}
                        placeholder="https://..."
                        className="h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experienceLevel" className="text-sm font-medium">Experience Level</Label>
                      <Input
                        id="experienceLevel"
                        value={formData.experienceLevel}
                        onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                        placeholder="e.g. 3-5 years, Senior, Mid-level"
                        className="h-10"
                      />
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Job Details
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium">Job Description</Label>
                        <RichTextEditor
                          content={formData.htmlDescription || formData.description}
                          onChange={(html) => {
                            handleInputChange('htmlDescription', html)
                            // Also update plain text for fallback
                            const tempDiv = document.createElement('div')
                            tempDiv.innerHTML = html
                            handleInputChange('description', tempDiv.textContent?.trim() || '')
                          }}
                          placeholder="Paste the job description here..."
                          className="min-h-[120px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="requirements" className="text-sm font-medium">Requirements</Label>
                        <Textarea
                          id="requirements"
                          value={formData.requirements}
                          onChange={(e) => handleInputChange('requirements', e.target.value)}
                          rows={3}
                          placeholder="Key requirements and qualifications..."
                          className="resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="benefits" className="text-sm font-medium">Benefits</Label>
                        <Textarea
                          id="benefits"
                          value={formData.benefits}
                          onChange={(e) => handleInputChange('benefits', e.target.value)}
                          rows={3}
                          placeholder="Benefits and perks offered..."
                          className="resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading} className="min-w-24">
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      ) : (
                        mode === 'create' ? 'Create' : 'Update'
                      )}
                    </Button>
                  </div>
                </form>
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
                      <Calendar className="h-4 w-4" />
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
                    <Button 
                      onClick={() => setShowNoteForm(true)}
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Add Note
                    </Button>
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
      
      {editingInterview && (
        <EditInterviewModal
          interview={editingInterview}
          isOpen={!!editingInterview}
          onClose={() => setEditingInterview(null)}
          onSave={handleInterviewSave}
        />
      )}
    </Dialog>
  )
}