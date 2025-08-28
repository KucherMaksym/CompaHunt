import { z } from 'zod';
import {
  ExperienceLevel,
  RemotenessPreference,
  SkillCategory,
  Industry,
  GoalType,
  ProgressStatus,
  Priority,
  CompanySize,
  CommunicationStyle,
  WorkValue,
  BenefitType,
  Importance
} from '@/types/profile';

// Basic profile schema
export const profileSchema = z.object({
  currentPosition: z.string()
    .max(100, 'Current position must not exceed 100 characters')
    .optional(),
  
  experienceLevel: z.string('Experience level must not exceed 100 characters').max(100).optional(),
  
  targetPosition: z.string()
    .max(100, 'Target position must not exceed 100 characters')
    .optional(),
  
  targetSalaryMin: z.number()
    .min(0, 'Salary must be positive')
    .optional(),
  
  targetSalaryMax: z.number()
    .min(0, 'Salary must be positive')
    .optional(),
  
  locationPreference: z.string()
    .max(100, 'Location preference must not exceed 100 characters')
    .optional(),
  
  remotenessPreference: z.nativeEnum(RemotenessPreference).optional(),
  
  bio: z.string()
    .max(500, 'Bio must not exceed 500 characters')
    .optional(),
  
  linkedinUrl: z.string()
    .url('Please enter a valid LinkedIn URL')
    .max(100, 'LinkedIn URL must not exceed 100 characters')
    .optional()
    .or(z.literal('')),
  
  githubUrl: z.string()
    .url('Please enter a valid GitHub URL')
    .max(100, 'GitHub URL must not exceed 100 characters')
    .optional()
    .or(z.literal(''))
}).refine((data) => {
  if (data.targetSalaryMin && data.targetSalaryMax) {
    return data.targetSalaryMin <= data.targetSalaryMax;
  }
  return true;
}, {
  message: 'Minimum salary cannot be greater than maximum salary',
  path: ['targetSalaryMax']
});

// Skills schema
export const skillSchema = z.object({
  skillName: z.string()
    .min(1, 'Skill name is required')
    .max(50, 'Skill name must not exceed 50 characters'),
  
  proficiencyLevel: z.number()
    .int('Proficiency level must be an integer')
    .min(1, 'Proficiency level must be between 1 and 5')
    .max(5, 'Proficiency level must be between 1 and 5'),
  
  yearsExperience: z.number()
    .int('Years of experience must be an integer')
    .min(0, 'Years of experience must be positive')
    .max(50, 'Years of experience must not exceed 50')
    .optional(),
  
  isPrimarySkill: z.boolean().default(false),
  wantToImprove: z.boolean().default(false),
  skillCategory: z.nativeEnum(SkillCategory).optional()
});

export const skillsSchema = z.array(skillSchema)
  .max(20, 'Maximum 20 skills allowed');

// Work experience schema
export const workExperienceSchema = z.object({
  companyName: z.string()
    .min(1, 'Company name is required')
    .max(100, 'Company name must not exceed 100 characters'),
  
  position: z.string()
    .min(1, 'Position is required')
    .max(100, 'Position must not exceed 100 characters'),
  
  startDate: z.string()
    .min(1, 'Start date is required'),
  
  endDate: z.string().optional(),
  
  isCurrent: z.boolean().default(false),
  
  description: z.string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional(),
  
  achievements: z.array(
    z.string().max(200, 'Achievement must not exceed 200 characters')
  ).max(10, 'Maximum 10 achievements allowed')
   .default([]),
  
  technologiesUsed: z.array(
    z.string().max(50, 'Technology name must not exceed 50 characters')
  ).max(20, 'Maximum 20 technologies allowed')
   .default([]),
  
  companySize: z.string()
    .max(100, 'Company size must not exceed 100 characters')
    .optional(),
  
  industry: z.nativeEnum(Industry).optional()
}).refine((data) => {
  // If current position, validation passes
  if (data.isCurrent) {
    return true;
  }
  // If not current position, end date is required
  return data.endDate && data.endDate.trim() !== '';
}, {
  message: 'End date is required for past positions',
  path: ['endDate']
});

export const workExperiencesSchema = z.array(workExperienceSchema)
  .max(5, 'Maximum 5 work experiences allowed');

// Career goals schema
export const careerGoalSchema = z.object({
  goalType: z.nativeEnum(GoalType),
  
  title: z.string()
    .min(1, 'Goal title is required')
    .max(100, 'Goal title must not exceed 100 characters'),
  
  description: z.string()
    .min(1, 'Goal description is required')
    .max(500, 'Goal description must not exceed 500 characters'),
  
  targetDate: z.string().optional(),
  
  progressStatus: z.nativeEnum(ProgressStatus).default(ProgressStatus.NOT_STARTED),
  
  progressPercentage: z.number()
    .int('Progress percentage must be an integer')
    .min(0, 'Progress percentage must be between 0 and 100')
    .max(100, 'Progress percentage must be between 0 and 100')
    .default(0),
  
  priority: z.nativeEnum(Priority).optional(),
  
  notes: z.string()
    .max(1000, 'Notes must not exceed 1000 characters')
    .optional()
});

export const careerGoalsSchema = z.array(careerGoalSchema)
  .max(5, 'Maximum 5 career goals allowed');

// Preferences schema
export const preferencesSchema = z.object({
  companySizePreference: z.nativeEnum(CompanySize).optional(),
  
  industryPreferences: z.array(z.nativeEnum(Industry))
    .max(10, 'Maximum 10 industry preferences allowed')
    .default([]),
  
  communicationStyle: z.nativeEnum(CommunicationStyle).optional(),
  
  workValues: z.array(z.nativeEnum(WorkValue))
    .max(15, 'Maximum 15 work values allowed')
    .default([]),
  
  benefitsPreferences: z.array(z.nativeEnum(BenefitType))
    .max(18, 'Maximum 18 benefits allowed')
    .default([]),
  
  workLifeBalanceImportance: z.nativeEnum(Importance).optional(),
  careerGrowthImportance: z.nativeEnum(Importance).optional(),
  compensationImportance: z.nativeEnum(Importance).optional(),
  
  additionalPreferences: z.string()
    .max(500, 'Additional preferences must not exceed 500 characters')
    .optional()
});

// Complete profile form schema
export const completeProfileSchema = z.object({
  profile: profileSchema,
  // skills: skillsSchema,
  workExperiences: workExperiencesSchema,
  // careerGoals: careerGoalsSchema,
  // preferences: preferencesSchema.optional()
});

export type ProfileFormData = z.infer<typeof completeProfileSchema>;
export type ProfileData = z.infer<typeof profileSchema>;
export type SkillData = z.infer<typeof skillSchema>;
export type WorkExperienceData = z.infer<typeof workExperienceSchema>;
export type CareerGoalData = z.infer<typeof careerGoalSchema>;
export type PreferencesData = z.infer<typeof preferencesSchema>;

// Field hints for tooltips
export const fieldHints = {
  currentPosition: 'Your current position or most recent job title',
  experienceLevel: 'Select the level that best describes your experience',
  targetPosition: 'The position you would like to obtain',
  targetSalary: 'Your desired salary range',
  locationPreference: 'City or region where you would like to work',
  remotenessPreference: 'Your preferred work format',
  bio: 'Brief description about yourself and your professional interests',
  linkedinUrl: 'Link to your LinkedIn profile',
  githubUrl: 'Link to your GitHub profile',
  skillName: 'Name of technology, programming language, or skill',
  proficiencyLevel: '1 - basic knowledge, 5 - expert level',
  yearsExperience: 'Number of years using this skill',
  isPrimarySkill: 'Check if this is one of your primary skills',
  wantToImprove: 'Check if you want to develop this skill',
  companyName: 'Name of the company where you worked',
  position: 'Your position at the company',
  startDate: 'Date when you started working at the company',
  endDate: 'Date when you finished working (leave empty if current)',
  isCurrent: 'Check if this is your current workplace',
  description: 'Brief description of your responsibilities',
  achievements: 'Key achievements in this position',
  technologiesUsed: 'Technologies and tools you used',
  companySize: 'Approximate number of employees in the company',
  goalTitle: 'Brief title of your career goal',
  goalDescription: 'Detailed description of what you want to achieve',
  targetDate: 'Planned date to achieve the goal',
  progressPercentage: 'How close you are to achieving the goal (in percentage)',
  companySizePreference: 'Preferred company size to work for',
  industryPreferences: 'Industries you would like to work in',
  communicationStyle: 'Your preferred communication style in a team',
  workValues: 'What is important to you in work and career',
  benefitsPreferences: 'Which benefits and perks are priority for you',
  workLifeBalanceImportance: 'How important is work-life balance to you',
  careerGrowthImportance: 'How important is career growth to you',
  compensationImportance: 'How important is compensation to you',
  additionalPreferences: 'Any other preferences or wishes'
};