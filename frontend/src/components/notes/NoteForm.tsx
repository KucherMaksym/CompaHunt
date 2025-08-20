'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText } from 'lucide-react'
import { NoteType, NotePriority } from '@/types/vacancy'
import { notesApi } from '@/lib/api/notes'
import {toast} from "sonner";

interface NoteFormData {
  content: string
  type: NoteType
  priority: NotePriority
}

interface NoteFormProps {
  vacancyId: string
  isVisible: boolean
  onCancel: () => void
  onSuccess: () => void
}

export function NoteForm({ vacancyId, isVisible, onCancel, onSuccess }: NoteFormProps) {
  const queryClient = useQueryClient()
  
  const [formData, setFormData] = useState<NoteFormData>({
    content: '',
    type: NoteType.GENERAL,
    priority: NotePriority.MEDIUM
  })

  const createNoteMutation = useMutation({
    mutationFn: async (data: NoteFormData) => {
      return toast.promise(notesApi.create({
            vacancyId,
            content: data.content,
            type: data.type,
            priority: data.priority
          }), {
            loading: 'Creating note...',
            success: 'Note added successfully!',
            error: 'An error occurred while creating note.',
          }
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', vacancyId] })
      setFormData({
        content: '',
        type: NoteType.GENERAL,
        priority: NotePriority.MEDIUM
      })
      onSuccess()
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createNoteMutation.mutate(formData)
  }

  const handleChange = (field: keyof NoteFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!isVisible) return null

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5" />
          Add New Note
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="noteContent" className="text-sm font-medium">
              Note Content <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="noteContent"
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              required
              maxLength={300}
              rows={4}
              placeholder="Add your note here..."
              className="resize-none"
            />
            <div className="text-right text-xs text-muted-foreground">
              {formData.content.length}/300 characters
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="noteType" className="text-sm font-medium">
                Note Type <span className="text-destructive">*</span>
              </Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => handleChange('type', value)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NoteType.GENERAL}>General</SelectItem>
                  <SelectItem value={NoteType.OFFER_RECEIVED}>Offer Received</SelectItem>
                  <SelectItem value={NoteType.REJECTION_RECEIVED}>Rejection Received</SelectItem>
                  <SelectItem value={NoteType.INTERVIEW_FEEDBACK}>Interview Feedback</SelectItem>
                  <SelectItem value={NoteType.FOLLOW_UP}>Follow Up</SelectItem>
                  <SelectItem value={NoteType.RESEARCH}>Research</SelectItem>
                  <SelectItem value={NoteType.SALARY_NEGOTIATION}>Salary Negotiation</SelectItem>
                  <SelectItem value={NoteType.CONTACT_INFO}>Contact Info</SelectItem>
                  <SelectItem value={NoteType.COMPANY_CULTURE}>Company Culture</SelectItem>
                  <SelectItem value={NoteType.NEXT_STEPS}>Next Steps</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notePriority" className="text-sm font-medium">Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => handleChange('priority', value)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NotePriority.LOW}>Low</SelectItem>
                  <SelectItem value={NotePriority.MEDIUM}>Medium</SelectItem>
                  <SelectItem value={NotePriority.HIGH}>High</SelectItem>
                  <SelectItem value={NotePriority.URGENT}>Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              disabled={createNoteMutation.isPending || !formData.content.trim()}
              className="min-w-24"
            >
              {createNoteMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                'Add Note'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}