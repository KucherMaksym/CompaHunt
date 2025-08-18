export interface UserProfile {
  id: string;
  userId: string;
  currentPosition?: string;
  experienceLevel?: ExperienceLevel;
  targetPosition?: string;
  targetSalaryMin?: number;
  targetSalaryMax?: number;
  locationPreference?: string;
  remotenessPreference?: RemotenessPreference;
  bio?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  skills: UserSkill[];
  workExperiences: WorkExperience[];
  careerGoals: CareerGoal[];
  preferences?: UserPreference;
}

export interface UserSkill {
  id: string;
  skillName: string;
  proficiencyLevel: number;
  yearsExperience?: number;
  isPrimarySkill: boolean;
  wantToImprove: boolean;
  skillCategory?: SkillCategory;
}

export interface WorkExperience {
  id: string;
  companyName: string;
  position: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  achievements: string[];
  technologiesUsed: string[];
  companySize?: string;
  industry?: Industry;
}

export interface CareerGoal {
  id: string;
  goalType: GoalType;
  title: string;
  description: string;
  targetDate?: string;
  progressStatus: ProgressStatus;
  progressPercentage: number;
  priority?: Priority;
  notes?: string;
}

export interface UserPreference {
  id: string;
  companySizePreference?: CompanySize;
  industryPreferences: Industry[];
  communicationStyle?: CommunicationStyle;
  workValues: WorkValue[];
  benefitsPreferences: BenefitType[];
  workLifeBalanceImportance?: Importance;
  careerGrowthImportance?: Importance;
  compensationImportance?: Importance;
  additionalPreferences?: string;
}

// Enums
export enum ExperienceLevel {
  INTERN = 'INTERN',
  JUNIOR = 'JUNIOR',
  MIDDLE = 'MIDDLE',
  SENIOR = 'SENIOR',
  LEAD = 'LEAD',
  PRINCIPAL = 'PRINCIPAL',
  DIRECTOR = 'DIRECTOR',
  VP = 'VP',
  C_LEVEL = 'C_LEVEL'
}

export enum RemotenessPreference {
  OFFICE_ONLY = 'OFFICE_ONLY',
  HYBRID = 'HYBRID',
  REMOTE_PREFERRED = 'REMOTE_PREFERRED',
  REMOTE_ONLY = 'REMOTE_ONLY'
}

export enum SkillCategory {
  PROGRAMMING_LANGUAGE = 'PROGRAMMING_LANGUAGE',
  FRAMEWORK = 'FRAMEWORK',
  DATABASE = 'DATABASE',
  CLOUD_PLATFORM = 'CLOUD_PLATFORM',
  TOOL = 'TOOL',
  METHODOLOGY = 'METHODOLOGY',
  SOFT_SKILL = 'SOFT_SKILL',
  DOMAIN_KNOWLEDGE = 'DOMAIN_KNOWLEDGE'
}

export enum Industry {
  TECHNOLOGY = 'TECHNOLOGY',
  HEALTHCARE = 'HEALTHCARE',
  FINANCE = 'FINANCE',
  EDUCATION = 'EDUCATION',
  RETAIL = 'RETAIL',
  MANUFACTURING = 'MANUFACTURING',
  CONSULTING = 'CONSULTING',
  MARKETING = 'MARKETING',
  LEGAL = 'LEGAL',
  REAL_ESTATE = 'REAL_ESTATE',
  HOSPITALITY = 'HOSPITALITY',
  NON_PROFIT = 'NON_PROFIT',
  MEDIA = 'MEDIA',
  TRANSPORTATION = 'TRANSPORTATION',
  ENERGY = 'ENERGY',
  TELECOMMUNICATIONS = 'TELECOMMUNICATIONS',
  AGRICULTURE = 'AGRICULTURE',
  CONSTRUCTION = 'CONSTRUCTION',
  GOVERNMENT = 'GOVERNMENT',
  ENTERTAINMENT = 'ENTERTAINMENT',
  AUTOMOTIVE = 'AUTOMOTIVE',
  AEROSPACE = 'AEROSPACE',
  BIOTECHNOLOGY = 'BIOTECHNOLOGY',
  PHARMACEUTICAL = 'PHARMACEUTICAL',
  FOOD_BEVERAGE = 'FOOD_BEVERAGE',
  FASHION = 'FASHION',
  SPORTS = 'SPORTS',
  TRAVEL = 'TRAVEL',
  INSURANCE = 'INSURANCE',
  BANKING = 'BANKING',
  OTHER = 'OTHER'
}

export enum GoalType {
  SHORT_TERM = 'SHORT_TERM',
  MEDIUM_TERM = 'MEDIUM_TERM',
  LONG_TERM = 'LONG_TERM'
}

export enum ProgressStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum CompanySize {
  STARTUP = 'STARTUP',
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
  ENTERPRISE = 'ENTERPRISE'
}

export enum CommunicationStyle {
  DIRECT = 'DIRECT',
  COLLABORATIVE = 'COLLABORATIVE',
  FORMAL = 'FORMAL',
  CASUAL = 'CASUAL',
  STRUCTURED = 'STRUCTURED',
  FLEXIBLE = 'FLEXIBLE'
}

export enum WorkValue {
  INNOVATION = 'INNOVATION',
  STABILITY = 'STABILITY',
  FLEXIBILITY = 'FLEXIBILITY',
  TEAMWORK = 'TEAMWORK',
  INDEPENDENCE = 'INDEPENDENCE',
  LEARNING = 'LEARNING',
  IMPACT = 'IMPACT',
  RECOGNITION = 'RECOGNITION',
  DIVERSITY = 'DIVERSITY',
  SUSTAINABILITY = 'SUSTAINABILITY',
  WORK_LIFE_BALANCE = 'WORK_LIFE_BALANCE',
  COMPETITIVE_COMPENSATION = 'COMPETITIVE_COMPENSATION',
  CAREER_ADVANCEMENT = 'CAREER_ADVANCEMENT',
  MENTORSHIP = 'MENTORSHIP',
  CREATIVE_FREEDOM = 'CREATIVE_FREEDOM'
}

export enum BenefitType {
  HEALTH_INSURANCE = 'HEALTH_INSURANCE',
  DENTAL_INSURANCE = 'DENTAL_INSURANCE',
  VISION_INSURANCE = 'VISION_INSURANCE',
  RETIREMENT_PLAN = 'RETIREMENT_PLAN',
  PAID_TIME_OFF = 'PAID_TIME_OFF',
  FLEXIBLE_SCHEDULE = 'FLEXIBLE_SCHEDULE',
  REMOTE_WORK = 'REMOTE_WORK',
  EDUCATION_ASSISTANCE = 'EDUCATION_ASSISTANCE',
  GYM_MEMBERSHIP = 'GYM_MEMBERSHIP',
  MEAL_ALLOWANCE = 'MEAL_ALLOWANCE',
  TRANSPORTATION = 'TRANSPORTATION',
  STOCK_OPTIONS = 'STOCK_OPTIONS',
  BONUS = 'BONUS',
  CONFERENCES = 'CONFERENCES',
  EQUIPMENT_ALLOWANCE = 'EQUIPMENT_ALLOWANCE',
  CHILDCARE_SUPPORT = 'CHILDCARE_SUPPORT',
  MENTAL_HEALTH_SUPPORT = 'MENTAL_HEALTH_SUPPORT',
  SABBATICAL = 'SABBATICAL'
}

export enum Importance {
  NOT_IMPORTANT = 'NOT_IMPORTANT',
  SOMEWHAT_IMPORTANT = 'SOMEWHAT_IMPORTANT',
  IMPORTANT = 'IMPORTANT',
  VERY_IMPORTANT = 'VERY_IMPORTANT',
  CRITICAL = 'CRITICAL'
}

// Form data types
export interface ProfileFormData {
  profile: {
    currentPosition?: string;
    experienceLevel?: ExperienceLevel;
    targetPosition?: string;
    targetSalaryMin?: number;
    targetSalaryMax?: number;
    locationPreference?: string;
    remotenessPreference?: RemotenessPreference;
    bio?: string;
    linkedinUrl?: string;
    githubUrl?: string;
  };
  skills: {
    skillName: string;
    proficiencyLevel: number;
    yearsExperience?: number;
    isPrimarySkill: boolean;
    wantToImprove: boolean;
    skillCategory?: SkillCategory;
  }[];
  workExperiences: {
    companyName: string;
    position: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
    description?: string;
    achievements: string[];
    technologiesUsed: string[];
    companySize?: string;
    industry?: Industry;
  }[];
  careerGoals: {
    goalType: GoalType;
    title: string;
    description: string;
    targetDate?: string;
    progressStatus: ProgressStatus;
    progressPercentage: number;
    priority?: Priority;
    notes?: string;
  }[];
  preferences?: {
    companySizePreference?: CompanySize;
    industryPreferences: Industry[];
    communicationStyle?: CommunicationStyle;
    workValues: WorkValue[];
    benefitsPreferences: BenefitType[];
    workLifeBalanceImportance?: Importance;
    careerGrowthImportance?: Importance;
    compensationImportance?: Importance;
    additionalPreferences?: string;
  };
}

// Label mappings for display
export const experienceLevelLabels: Record<ExperienceLevel, string> = {
  [ExperienceLevel.INTERN]: 'Intern',
  [ExperienceLevel.JUNIOR]: 'Junior',
  [ExperienceLevel.MIDDLE]: 'Middle',
  [ExperienceLevel.SENIOR]: 'Senior',
  [ExperienceLevel.LEAD]: 'Team Lead',
  [ExperienceLevel.PRINCIPAL]: 'Principal',
  [ExperienceLevel.DIRECTOR]: 'Director',
  [ExperienceLevel.VP]: 'Vice President',
  [ExperienceLevel.C_LEVEL]: 'C-Level'
};

export const remotenessLabels: Record<RemotenessPreference, string> = {
  [RemotenessPreference.OFFICE_ONLY]: 'Office Only',
  [RemotenessPreference.HYBRID]: 'Hybrid Work',
  [RemotenessPreference.REMOTE_PREFERRED]: 'Remote Preferred',
  [RemotenessPreference.REMOTE_ONLY]: 'Remote Only'
};

export const industryLabels: Record<Industry, string> = {
  [Industry.TECHNOLOGY]: 'Technology & IT',
  [Industry.HEALTHCARE]: 'Healthcare',
  [Industry.FINANCE]: 'Finance',
  [Industry.EDUCATION]: 'Education',
  [Industry.RETAIL]: 'Retail',
  [Industry.MANUFACTURING]: 'Manufacturing',
  [Industry.CONSULTING]: 'Consulting',
  [Industry.MARKETING]: 'Marketing',
  [Industry.LEGAL]: 'Legal',
  [Industry.REAL_ESTATE]: 'Real Estate',
  [Industry.HOSPITALITY]: 'Hospitality',
  [Industry.NON_PROFIT]: 'Non-Profit',
  [Industry.MEDIA]: 'Media',
  [Industry.TRANSPORTATION]: 'Transportation',
  [Industry.ENERGY]: 'Energy',
  [Industry.TELECOMMUNICATIONS]: 'Telecommunications',
  [Industry.AGRICULTURE]: 'Agriculture',
  [Industry.CONSTRUCTION]: 'Construction',
  [Industry.GOVERNMENT]: 'Government',
  [Industry.ENTERTAINMENT]: 'Entertainment',
  [Industry.AUTOMOTIVE]: 'Automotive',
  [Industry.AEROSPACE]: 'Aerospace',
  [Industry.BIOTECHNOLOGY]: 'Biotechnology',
  [Industry.PHARMACEUTICAL]: 'Pharmaceutical',
  [Industry.FOOD_BEVERAGE]: 'Food & Beverage',
  [Industry.FASHION]: 'Fashion',
  [Industry.SPORTS]: 'Sports',
  [Industry.TRAVEL]: 'Travel & Tourism',
  [Industry.INSURANCE]: 'Insurance',
  [Industry.BANKING]: 'Banking',
  [Industry.OTHER]: 'Other'
};