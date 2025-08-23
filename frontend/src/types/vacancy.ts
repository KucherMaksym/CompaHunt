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
  htmlDescription?: string;
  requirements?: string;
  benefits?: string;
  remoteness?: 'Remote' | 'On-site' | 'Hybrid';
  experience?: string;
  url?: string;
  lastUpdated?: string;
  manual?: boolean;
  sortOrder?: number;
}

export enum VacancyStatus {
  WISHLIST = 'WISHLIST',
  APPLIED = 'APPLIED',
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
  vacancy?: Vacancy;
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

export interface VacancyNote {
  id: string;
  vacancyId: string;
  content: string;
  type: NoteType;
  priority: NotePriority;
  tags?: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum NoteType {
  GENERAL = 'GENERAL',
  OFFER_RECEIVED = 'OFFER_RECEIVED',
  REJECTION_RECEIVED = 'REJECTION_RECEIVED',
  INTERVIEW_FEEDBACK = 'INTERVIEW_FEEDBACK',
  FOLLOW_UP = 'FOLLOW_UP',
  RESEARCH = 'RESEARCH',
  SALARY_NEGOTIATION = 'SALARY_NEGOTIATION',
  CONTACT_INFO = 'CONTACT_INFO',
  COMPANY_CULTURE = 'COMPANY_CULTURE',
  NEXT_STEPS = 'NEXT_STEPS'
}

export enum NotePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}