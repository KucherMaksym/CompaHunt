import apiClient from '@/lib/api-client'
import { VacancyNote, NoteType, NotePriority } from '@/types/vacancy'

export interface CreateNoteRequest {
  vacancyId: string
  content: string
  type: NoteType
  priority?: NotePriority
  tags?: string
  isPrivate?: boolean
}

export interface CreateInterviewNoteRequest {
  interviewId: string
  content: string
  type: NoteType
  priority?: NotePriority
  tags?: string
  isPrivate?: boolean
}

export interface UpdateNoteRequest {
  content?: string
  type?: NoteType
  priority?: NotePriority
  tags?: string
  isPrivate?: boolean
}

export interface InterviewNote {
  id: string
  content: string
  type: NoteType
  priority: NotePriority
  tags?: string
  isPrivate: boolean
  createdAt: string
  updatedAt: string
}

export const notesApi = {
  // Vacancy Notes
  async create(request: CreateNoteRequest): Promise<VacancyNote> {
    const response = await apiClient.post(`/api/notes/vacancy`, {
      ...request,
      type: request.type.toString(),
      priority: request.priority?.toString() || 'MEDIUM'
    })
    return response.data.note
  },

  async getByVacancy(vacancyId: string): Promise<VacancyNote[]> {
    const response = await apiClient.get(`/api/notes/vacancy/${vacancyId}`)
    return response.data
  },

  async getAllVacancyNotes(type?: NoteType, priority?: NotePriority): Promise<VacancyNote[]> {
    const params = new URLSearchParams()
    if (type) params.append('type', type.toString())
    if (priority) params.append('priority', priority.toString())
    
    const response = await apiClient.get(`/api/notes/vacancy?${params.toString()}`)
    return response.data
  },

  // Interview Notes
  async createInterviewNote(request: CreateInterviewNoteRequest): Promise<InterviewNote> {
    const response = await apiClient.post(`/api/notes/interview`, {
      ...request,
      type: request.type.toString(),
      priority: request.priority?.toString() || 'MEDIUM'
    })
    return response.data.note
  },

  async getByInterview(interviewId: string): Promise<InterviewNote[]> {
    const response = await apiClient.get(`/api/notes/interview/${interviewId}`)
    return response.data
  },

  async getAllInterviewNotes(type?: NoteType, priority?: NotePriority): Promise<InterviewNote[]> {
    const params = new URLSearchParams()
    if (type) params.append('type', type.toString())
    if (priority) params.append('priority', priority.toString())
    
    const response = await apiClient.get(`/api/notes/interview?${params.toString()}`)
    return response.data
  },

  // Generic Note Operations
  async getById(noteId: string): Promise<{ type: 'vacancy' | 'interview', note: VacancyNote | InterviewNote }> {
    const response = await apiClient.get(`/api/notes/${noteId}`)
    return response.data
  },

  async update(noteId: string, request: UpdateNoteRequest): Promise<VacancyNote | InterviewNote> {
    const response = await apiClient.put(`/api/notes/${noteId}`, {
      ...request,
      type: request.type?.toString(),
      priority: request.priority?.toString()
    })
    return response.data.note
  },

  async delete(noteId: string): Promise<boolean> {
    const response = await apiClient.delete(`/api/notes/${noteId}`)
    return response.data.success
  },

  // Bulk Operations
  async deleteAllVacancyNotes(vacancyId: string): Promise<number> {
    const response = await apiClient.delete(`/api/notes/vacancy/${vacancyId}`)
    return response.data.count
  },

  async deleteAllInterviewNotes(interviewId: string): Promise<number> {
    const response = await apiClient.delete(`/api/notes/interview/${interviewId}`)
    return response.data.count
  }
}