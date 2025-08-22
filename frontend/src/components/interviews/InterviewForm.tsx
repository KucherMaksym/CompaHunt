'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from 'lucide-react'
import { InterviewType } from '@/types/vacancy'
import apiClient from '@/lib/api-client'
import { inputValueToUTC } from '@/lib/timezone'

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

interface InterviewFormProps {
  vacancyId: string
  isVisible: boolean
  onCancel: () => void
  onSuccess: () => void
}

export function InterviewForm({ vacancyId, isVisible, onCancel, onSuccess }: InterviewFormProps) {
  const queryClient = useQueryClient()
  
  const [formData, setFormData] = useState<InterviewFormData>({
    scheduledAt: '',
    type: InterviewType.PHONE_SCREEN,
    duration: 60,
    meetingLink: '',
    location: '',
    interviewerName: '',
    interviewerEmail: '',
    notes: ''
  })

  // const createInterviewMutation = (data: InterviewFormData) => {
  //   console.log(data)
  //   console.log(inputValueToUTC(data.scheduledAt))
  // }

  const createInterviewMutation = useMutation({
    mutationFn: async (data: InterviewFormData) => {
      const payload = {
        vacancyId,
        scheduledAt: inputValueToUTC(data.scheduledAt),
        type: data.type,
        duration: data.duration,
        meetingLink: data.meetingLink || null,
        location: data.location || null,
        interviewerName: data.interviewerName || null,
        interviewerEmail: data.interviewerEmail || null,
        notes: data.notes || null
      }

      return await apiClient.post(`/api/vacancies/${vacancyId}/interviews`, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews', vacancyId] })
      setFormData({
        scheduledAt: '',
        type: InterviewType.PHONE_SCREEN,
        duration: 60,
        meetingLink: '',
        location: '',
        interviewerName: '',
        interviewerEmail: '',
        notes: ''
      })
      onSuccess()
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createInterviewMutation.mutate(formData)
  }

  const handleChange = (field: keyof InterviewFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!isVisible) return null

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5" />
          Schedule New Interview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledAt" className="text-sm font-medium">
                Date & Time <span className="text-destructive">*</span>
              </Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => handleChange('scheduledAt', e.target.value)}
                required
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">
                Interview Type <span className="text-destructive">*</span>
              </Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => handleChange('type', value)}
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
                value={formData.duration}
                onChange={(e) => handleChange('duration', parseInt(e.target.value))}
                placeholder="60"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interviewerName" className="text-sm font-medium">Interviewer Name</Label>
              <Input
                id="interviewerName"
                value={formData.interviewerName}
                onChange={(e) => handleChange('interviewerName', e.target.value)}
                placeholder="John Doe"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interviewerEmail" className="text-sm font-medium">Interviewer Email</Label>
              <Input
                id="interviewerEmail"
                type="email"
                value={formData.interviewerEmail}
                onChange={(e) => handleChange('interviewerEmail', e.target.value)}
                placeholder="john@company.com"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meetingLink" className="text-sm font-medium">Meeting Link</Label>
              <Input
                id="meetingLink"
                type="url"
                value={formData.meetingLink}
                onChange={(e) => handleChange('meetingLink', e.target.value)}
                placeholder="https://zoom.us/..."
                className="h-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="Office address or 'Remote'"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={2}
              placeholder="Additional notes about the interview"
              className="resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
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
  )
}