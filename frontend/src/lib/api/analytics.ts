import { apiClient } from '@/lib/api-client';

export interface AnalyticsData {
  statusDistribution: StatusDistribution[];
  monthlyTrends: MonthlyTrends[];
  salaryDistribution: SalaryDistribution[];
  remoteWorkDistribution: RemoteWorkDistribution[];
  topCompanies: TopCompanies[];
  responseTimeData: ResponseTimeData[];
  interviewTypes: InterviewType[];
}

export interface StatusDistribution {
  status: string;
  label: string;
  count: number;
}

export interface MonthlyTrends {
  month: string;
  applied: number;
  interviews: number;
  offers: number;
}

export interface SalaryDistribution {
  range: string;
  count: number;
  avg: number;
}

export interface RemoteWorkDistribution {
  type: string;
  label: string;
  count: number;
  percentage: number;
}

export interface TopCompanies {
  company: string;
  applications: number;
  interviews: number;
  successRate: number;
}

export interface ResponseTimeData {
  name: string;
  value: number;
}

export interface InterviewType {
  type: string;
  label: string;
  count: number;
  successRate: number;
}

export const analyticsApi = {
  getAnalyticsData: async (): Promise<AnalyticsData> => {
    return apiClient.getD<AnalyticsData>('/api/analytics');
  },
};