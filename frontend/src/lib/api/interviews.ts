import { apiClient } from '@/lib/api-client';
import { Interview, InterviewType, InterviewStatus } from '@/types/vacancy';

export interface CreateInterviewRequest {
  vacancyId: string;
  scheduledAt: string;
  type: InterviewType;
  notes?: string;
  duration?: number;
  meetingLink?: string;
  location?: string;
  interviewerName?: string;
  interviewerEmail?: string;
}

export interface UpdateInterviewRequest {
  scheduledAt?: string;
  type?: InterviewType;
  status?: InterviewStatus;
  notes?: string;
  feedback?: string;
  duration?: number;
  meetingLink?: string;
  location?: string;
  interviewerName?: string;
  interviewerEmail?: string;
}

export const interviewApi = {
  create: async (data: CreateInterviewRequest): Promise<Interview> => {
    return apiClient.postD<Interview>('/api/interviews', data);
  },

  update: async (id: string, data: UpdateInterviewRequest): Promise<Interview> => {
    return apiClient.putD<Interview>(`/api/interviews/${id}`, data);
  },

  delete: async (id: string): Promise<{ deleted: boolean }> => {
    return apiClient.deleteD<{ deleted: boolean }>(`/api/interviews/${id}`);
  },

  getByVacancy: async (vacancyId: string): Promise<Interview[]> => {
    return apiClient.getD<Interview[]>(`/api/interviews/vacancy/${vacancyId}`);
  },

  getAll: async (): Promise<Interview[]> => {
    return apiClient.getD<Interview[]>('/api/interviews');
  },
};