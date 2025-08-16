export interface Company {
  id: string;
  name: string;
  website?: string;
  logoUrl?: string;
}

export interface Vacancy {
  id: string;
  title: string;
  company: Company;
  location?: string;
  salary?: number;
  status: VacancyStatus;
  appliedAt: string;
  description?: string;
  requirements?: string;
  benefits?: string;
  workType?: 'remote' | 'office' | 'hybrid';
  experience?: string;
  jobUrl?: string;
  lastUpdated?: string;
}

export enum VacancyStatus {
  APPLIED = 'APPLIED',
  VIEWED = 'VIEWED', 
  PHONE_SCREEN = 'PHONE_SCREEN',
  INTERVIEW = 'INTERVIEW',
  OFFER = 'OFFER',
  REJECTED = 'REJECTED',
  ARCHIVED = 'ARCHIVED'
}

export type ViewMode = 'table' | 'cards';

export interface Interview {
  id: string;
  vacancyId: string;
  scheduledAt: string;
  type: InterviewType;
  status: InterviewStatus;
  notes?: string;
  feedback?: string;
  duration?: number;
  meetingLink?: string;
  location?: string;
  interviewerName?: string;
  interviewerEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export enum InterviewType {
  PHONE_SCREEN = 'PHONE_SCREEN',
  VIDEO_CALL = 'VIDEO_CALL',
  ON_SITE = 'ON_SITE',
  TECHNICAL = 'TECHNICAL',
  BEHAVIORAL = 'BEHAVIORAL',
  FINAL_ROUND = 'FINAL_ROUND',
  HR_INTERVIEW = 'HR_INTERVIEW'
}

export enum InterviewStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED',
  NO_SHOW = 'NO_SHOW'
}