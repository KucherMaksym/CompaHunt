'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Video,
  Phone,
  Building,
  FileText,
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  Globe,
  Briefcase,
  Link,
  AlertCircle,
  Users,
  Mail,
  ExternalLink, MoreHorizontal, Edit, Archive
} from 'lucide-react'
import { Vacancy, VacancyStatus, Interview, InterviewType, InterviewStatus } from '@/types/vacancy'
import apiClient from '@/lib/api-client'
import {getStatusColor} from "@/utils/vacancy-utils";
import {getInterviewStatusColor} from "@/utils/interview-utils";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import { interviewApi } from '@/lib/api/interviews';
import EditInterviewModal from '@/components/interviews/EditInterviewModal';
import {formatMeetingLink} from "@/utils/url-utils";

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
  requirements: string
  benefits: string
  workType: 'remote' | 'office' | 'hybrid' | ''
  experience: string
  jobUrl: string
}

interface InterviewFormData {
  scheduledAt: string
  type: InterviewType
  duration?: number
  meetingLink?: string
  location?: string
  interviewerName?: string
  interviewerEmail?: string
  notes?: string
}

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

export function VacancyModal({ isOpen, onClose, vacancy, mode }: VacancyModalProps) {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('details')
  const [showInterviewForm, setShowInterviewForm] = useState(false)
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null)
  
  const [formData, setFormData] = useState<VacancyFormData>({
    title: '',
    companyName: '',
    location: '',
    salary: '',
    status: VacancyStatus.APPLIED,
    description: '',
    requirements: '',
    benefits: '',
    workType: '',
    experience: '',
    jobUrl: ''
  })

  const [interviewData, setInterviewData] = useState<InterviewFormData>({
    scheduledAt: '',
    type: InterviewType.PHONE_SCREEN,
    duration: 60,
    meetingLink: '',
    location: '',
    interviewerName: '',
    interviewerEmail: '',
    notes: ''
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

  useEffect(() => {
    if (vacancy && mode === 'edit') {
      setFormData({
        title: vacancy.title,
        companyName: vacancy.company.name,
        location: vacancy.location || '',
        salary: vacancy.salary?.toString() || '',
        status: vacancy.status,
        description: vacancy.description || '',
        requirements: vacancy.requirements || '',
        benefits: vacancy.benefits || '',
        workType: vacancy.workType || '',
        experience: vacancy.experience || '',
        jobUrl: vacancy.jobUrl || ''
      })
    } else {
      setFormData({
        title: '',
        companyName: '',
        location: '',
        salary: '',
        status: VacancyStatus.APPLIED,
        description: '',
        requirements: '',
        benefits: '',
        workType: '',
        experience: '',
        jobUrl: ''
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
        requirements: data.requirements || null,
        benefits: data.benefits || null,
        workType: data.workType || null,
        experience: data.experience || null,
        url: data.jobUrl
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
        requirements: data.requirements || null,
        benefits: data.benefits || null,
        workType: data.workType || null,
        experience: data.experience || null
      }
      
      return await apiClient.put(`/api/vacancies/${vacancy.id}`, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    }
  })

  const createInterviewMutation = useMutation({
    mutationFn: async (data: InterviewFormData) => {
      if (!vacancy) throw new Error('No vacancy selected')
      
      const payload = {
        vacancyId: vacancy.id,
        scheduledAt: new Date(data.scheduledAt).toISOString(),
        type: data.type,
        duration: data.duration,
        meetingLink: data.meetingLink || null,
        location: data.location || null,
        interviewerName: data.interviewerName || null,
        interviewerEmail: data.interviewerEmail || null,
        notes: data.notes || null
      }
      
      return await apiClient.post(`/api/vacancies/${vacancy.id}/interviews`, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews', vacancy?.id] })
      setShowInterviewForm(false)
      setInterviewData({
        scheduledAt: '',
        type: InterviewType.PHONE_SCREEN,
        duration: 60,
        meetingLink: '',
        location: '',
        interviewerName: '',
        interviewerEmail: '',
        notes: ''
      })
    }
  })

  const deleteInterviewMutation = useMutation({
    mutationFn: async (interviewId: string) => {
      return await interviewApi.delete(interviewId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews', vacancy?.id] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (mode === 'create') {
      createMutation.mutate(formData)
    } else {
      updateMutation.mutate(formData)
    }
  }

  const handleInterviewSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createInterviewMutation.mutate(interviewData)
  }

  const handleInputChange = (field: keyof VacancyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleInterviewChange = (field: keyof InterviewFormData, value: string | number) => {
    setInterviewData(prev => ({ ...prev, [field]: value }))
  }

  const onEditInterview = (interview: Interview) => {
    setEditingInterview(interview);
  }

  const onDeleteInterview = async (interviewId: string) => {
    if (confirm('Are you sure you want to delete this interview?')) {
      try {
        await deleteInterviewMutation.mutateAsync(interviewId);
      } catch (error) {
        console.error('An error occurred while deleting:', error);
      }
    }
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
            {vacancy?.jobUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={vacancy.jobUrl} target="_blank" rel="noopener noreferrer">
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
                                <SelectItem value={VacancyStatus.VIEWED}>Viewed</SelectItem>
                                <SelectItem value={VacancyStatus.PHONE_SCREEN}>Phone Screen</SelectItem>
                                <SelectItem value={VacancyStatus.INTERVIEW}>Interview</SelectItem>
                                <SelectItem value={VacancyStatus.OFFER}>Offer</SelectItem>
                                <SelectItem value={VacancyStatus.REJECTED}>Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="workType" className="text-sm font-medium flex items-center gap-1">
                              <Globe className="h-4 w-4" />
                              Work Type
                            </Label>
                            <Select value={formData.workType} onValueChange={(value) => handleInputChange('workType', value)}>
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
                          <Label htmlFor="jobUrl" className="text-sm font-medium flex items-center gap-1">
                            <Link className="h-4 w-4" />
                            Job URL
                          </Label>
                          <Input
                            id="jobUrl"
                            type="url"
                            value={formData.jobUrl}
                            onChange={(e) => handleInputChange('jobUrl', e.target.value)}
                            placeholder="https://..."
                            className="h-10"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="experience" className="text-sm font-medium">Experience Level</Label>
                          <Input
                            id="experience"
                            value={formData.experience}
                            onChange={(e) => handleInputChange('experience', e.target.value)}
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
                            <Textarea
                              id="description"
                              value={formData.description}
                              onChange={(e) => handleInputChange('description', e.target.value)}
                              rows={4}
                              placeholder="Paste the job description here..."
                              className="resize-none"
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
                          <Plus className="h-4 w-4" />
                          Schedule Interview
                        </Button>
                      </div>

                      {/* Interview Form */}
                      {showInterviewForm && (
                        <Card className="border-primary/20 bg-primary/5">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <Calendar className="h-5 w-5" />
                              Schedule New Interview
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <form onSubmit={handleInterviewSubmit} className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="scheduledAt" className="text-sm font-medium">
                                    Date & Time <span className="text-destructive">*</span>
                                  </Label>
                                  <Input
                                    id="scheduledAt"
                                    type="datetime-local"
                                    value={interviewData.scheduledAt}
                                    onChange={(e) => handleInterviewChange('scheduledAt', e.target.value)}
                                    required
                                    className="h-10"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="type" className="text-sm font-medium">
                                    Interview Type <span className="text-destructive">*</span>
                                  </Label>
                                  <Select 
                                    value={interviewData.type} 
                                    onValueChange={(value) => handleInterviewChange('type', value)}
                                  >
                                    <SelectTrigger className="h-10">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value={InterviewType.PHONE_SCREEN}>Phone Screen</SelectItem>
                                      <SelectItem value={InterviewType.VIDEO_CALL}>Video Call</SelectItem>
                                      <SelectItem value={InterviewType.ON_SITE}>On-site</SelectItem>
                                      <SelectItem value={InterviewType.TECHNICAL}>Technical</SelectItem>
                                      <SelectItem value={InterviewType.BEHAVIORAL}>Behavioral</SelectItem>
                                      <SelectItem value={InterviewType.FINAL_ROUND}>Final Round</SelectItem>
                                      <SelectItem value={InterviewType.HR_INTERVIEW}>HR Interview</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="duration" className="text-sm font-medium">Duration (minutes)</Label>
                                  <Input
                                    id="duration"
                                    type="number"
                                    value={interviewData.duration}
                                    onChange={(e) => handleInterviewChange('duration', parseInt(e.target.value))}
                                    placeholder="60"
                                    className="h-10"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="interviewerName" className="text-sm font-medium">Interviewer Name</Label>
                                  <Input
                                    id="interviewerName"
                                    value={interviewData.interviewerName}
                                    onChange={(e) => handleInterviewChange('interviewerName', e.target.value)}
                                    placeholder="John Doe"
                                    className="h-10"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="interviewerEmail" className="text-sm font-medium">Interviewer Email</Label>
                                  <Input
                                    id="interviewerEmail"
                                    type="email"
                                    value={interviewData.interviewerEmail}
                                    onChange={(e) => handleInterviewChange('interviewerEmail', e.target.value)}
                                    placeholder="john@company.com"
                                    className="h-10"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="meetingLink" className="text-sm font-medium">Meeting Link</Label>
                                  <Input
                                    id="meetingLink"
                                    type="url"
                                    value={interviewData.meetingLink}
                                    onChange={(e) => handleInterviewChange('meetingLink', e.target.value)}
                                    placeholder="https://zoom.us/..."
                                    className="h-10"
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                                <Input
                                  id="location"
                                  value={interviewData.location}
                                  onChange={(e) => handleInterviewChange('location', e.target.value)}
                                  placeholder="Office address or 'Remote'"
                                  className="h-10"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
                                <Textarea
                                  id="notes"
                                  value={interviewData.notes}
                                  onChange={(e) => handleInterviewChange('notes', e.target.value)}
                                  rows={2}
                                  placeholder="Additional notes about the interview"
                                  className="resize-none"
                                />
                              </div>

                              <div className="flex justify-end gap-3 pt-4">
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  onClick={() => setShowInterviewForm(false)}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  type="submit" 
                                  disabled={createInterviewMutation.isPending}
                                  className="min-w-24"
                                >
                                  {createInterviewMutation.isPending ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                  ) : (
                                    'Schedule Interview'
                                  )}
                                </Button>
                              </div>
                            </form>
                          </CardContent>
                        </Card>
                      )}

                      {/* Interviews List */}
                      <div className="space-y-3">
                        {interviews.length === 0 ? (
                          <Card className="text-center py-12">
                            <CardContent>
                              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                              <h3 className="text-lg font-medium mb-2">No interviews scheduled</h3>
                              <p className="text-muted-foreground mb-4">
                                Schedule your first interview to get started
                              </p>
                              <Button 
                                onClick={() => setShowInterviewForm(true)}
                                variant="outline"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Schedule Interview
                              </Button>
                            </CardContent>
                          </Card>
                        ) : (
                          interviews.map((interview: Interview) => {
                            const IconComponent = getInterviewTypeIcon(interview.type)
                            const interviewDate = new Date(interview.scheduledAt)
                            const isPast = interviewDate < new Date()
                            
                            return (
                              <Card key={interview.id} className="hover:shadow-md transition-shadow">
                                <CardContent>
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3 w-full">
                                      <div className="w-full">
                                        <div className="flex justify-between items-center gap-2 mb-2">
                                          <div className={"flex items-center gap-2 mb-2"}>
                                            <IconComponent className="h-5 w-5 text-primary" />
                                            <h4 className="font-semibold">
                                              {interview.type.replace('_', ' ')}
                                            </h4>
                                            <Badge variant={"static"} className={getInterviewStatusColor(interview.status)}>
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
                                              <DropdownMenuItem onClick={() => onEditInterview(interview)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                              </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => onDeleteInterview(interview.id)}
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
                                                href={formatMeetingLink(interview.meetingLink)}
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
                          })
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="notes" className="mt-0">
                    <Card className="text-center py-12">
                      <CardContent>
                        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-medium mb-2">Notes feature coming soon</h3>
                        <p className="text-muted-foreground">
                          Keep track of important notes and observations
                        </p>
                      </CardContent>
                    </Card>
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