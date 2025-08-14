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
  REJECTED = 'REJECTED'
}

export type ViewMode = 'table' | 'cards';