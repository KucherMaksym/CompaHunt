export interface JobData {
    title: string
    company: string
    location: string
    jobType?: string
    experienceLevel?: string
    description: string
    requirements: string[]
    skills: string[]
    postedDate?: string
    applicantCount?: number
    url: string
    salary?: Salary
    remoteness?: string
    industry?: string
}

export interface ParseResult {
    success: boolean
    data?: JobData
    error?: string
}

export enum JobType {
    ON_SITE = 'ON_SITE',
    REMOTE = 'REMOTE',
    HYBRID = 'HYBRID',
}

export interface Salary {
    range: string,
    currency: string,
    period: string,
    type: string,
    location: string
}