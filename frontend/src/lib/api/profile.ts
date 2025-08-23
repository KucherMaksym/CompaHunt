import { apiClient } from '@/lib/api-client';
import { UserProfile } from '@/types/profile';
import { ProfileFormData } from '@/lib/validation/profile';

// Backend API types (matching backend DTOs)
export interface UserProfileResponse {
  id: string;
  userId: string;
  currentPosition?: string;
  experienceLevel?: string;
  targetPosition?: string;
  targetSalaryMin?: number;
  targetSalaryMax?: number;
  locationPreference?: string;
  remotenessPreference?: string;
  bio?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  skills: UserSkillResponse[];
  workExperiences: WorkExperienceResponse[];
  careerGoals: CareerGoalResponse[];
  preferences?: UserPreferenceResponse;
}

export interface UserSkillResponse {
  id: string;
  skillName: string;
  proficiencyLevel: number;
  yearsExperience?: number;
  isPrimarySkill: boolean;
  wantToImprove: boolean;
  skillCategory?: string;
}

export interface WorkExperienceResponse {
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
  industry?: string;
}

export interface CareerGoalResponse {
  id: string;
  goalType: string;
  title: string;
  description: string;
  targetDate?: string;
  progressStatus: string;
  progressPercentage: number;
  priority?: string;
  notes?: string;
}

export interface UserPreferenceResponse {
  id: string;
  companySizePreference?: string;
  industryPreferences: string[];
  communicationStyle?: string;
  workValues: string[];
  benefitsPreferences: string[];
  workLifeBalanceImportance?: string;
  careerGrowthImportance?: string;
  compensationImportance?: string;
  additionalPreferences?: string;
}

export interface UserProfileRequest {
  currentPosition?: string;
  experienceLevel?: string;
  targetPosition?: string;
  targetSalaryMin?: number;
  targetSalaryMax?: number;
  locationPreference?: string;
  remotenessPreference?: string;
  bio?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

export interface UserSkillRequest {
  skillName: string;
  proficiencyLevel: number;
  yearsExperience?: number;
  isPrimarySkill: boolean;
  wantToImprove: boolean;
  skillCategory?: string;
}

export interface WorkExperienceRequest {
  companyName: string;
  position: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  achievements: string[];
  technologiesUsed: string[];
  companySize?: string;
  industry?: string;
}

export interface CareerGoalRequest {
  goalType: string;
  title: string;
  description: string;
  targetDate?: string;
  progressStatus: string;
  progressPercentage: number;
  priority?: string;
  notes?: string;
}

export interface UserPreferenceRequest {
  companySizePreference?: string;
  industryPreferences: string[];
  communicationStyle?: string;
  workValues: string[];
  benefitsPreferences: string[];
  workLifeBalanceImportance?: string;
  careerGrowthImportance?: string;
  compensationImportance?: string;
  additionalPreferences?: string;
}

// TODO: Uncomment code if want to add skills, careerGoals, preferences properties (in the future)

export interface CompleteUserProfileRequest {
  profile: UserProfileRequest;
  // skills: UserSkillRequest[];
  workExperiences: WorkExperienceRequest[];
  // careerGoals: CareerGoalRequest[];
  // preferences?: UserPreferenceRequest;
}

export interface ProfileExistsResponse {
  exists: boolean;
}

// Transform ProfileFormData to backend request format
export const transformProfileFormDataToRequest = (formData: ProfileFormData): CompleteUserProfileRequest => {
  return {
    profile: {
      currentPosition: formData.profile.currentPosition,
      experienceLevel: formData.profile.experienceLevel,
      targetPosition: formData.profile.targetPosition,
      targetSalaryMin: formData.profile.targetSalaryMin,
      targetSalaryMax: formData.profile.targetSalaryMax,
      locationPreference: formData.profile.locationPreference,
      remotenessPreference: formData.profile.remotenessPreference,
      bio: formData.profile.bio,
      linkedinUrl: formData.profile.linkedinUrl,
      githubUrl: formData.profile.githubUrl,
    },
    // skills: formData.skills.map(skill => ({
    //   skillName: skill.skillName,
    //   proficiencyLevel: skill.proficiencyLevel,
    //   yearsExperience: skill.yearsExperience,
    //   isPrimarySkill: skill.isPrimarySkill,
    //   wantToImprove: skill.wantToImprove,
    //   skillCategory: skill.skillCategory,
    // })),
    workExperiences: formData.workExperiences.map(exp => ({
      companyName: exp.companyName,
      position: exp.position,
      startDate: exp.startDate,
      endDate: exp.endDate,
      isCurrent: exp.isCurrent,
      description: exp.description,
      achievements: exp.achievements,
      technologiesUsed: exp.technologiesUsed,
      companySize: exp.companySize,
      industry: exp.industry,
    })),
    // careerGoals: formData.careerGoals.map(goal => ({
    //   goalType: goal.goalType,
    //   title: goal.title,
    //   description: goal.description,
    //   targetDate: goal.targetDate,
    //   progressStatus: goal.progressStatus,
    //   progressPercentage: goal.progressPercentage,
    //   priority: goal.priority,
    //   notes: goal.notes,
    // })),
    // preferences: formData.preferences ? {
    //   companySizePreference: formData.preferences.companySizePreference,
    //   industryPreferences: formData.preferences.industryPreferences,
    //   communicationStyle: formData.preferences.communicationStyle,
    //   workValues: formData.preferences.workValues,
    //   benefitsPreferences: formData.preferences.benefitsPreferences,
    //   workLifeBalanceImportance: formData.preferences.workLifeBalanceImportance,
    //   careerGrowthImportance: formData.preferences.careerGrowthImportance,
    //   compensationImportance: formData.preferences.compensationImportance,
    //   additionalPreferences: formData.preferences.additionalPreferences,
    // } : undefined,
  };
};

// Transform backend response to frontend format
export const transformProfileResponseToFormData = (response: UserProfileResponse): Partial<ProfileFormData> => {
  return {
    profile: {
      currentPosition: response.currentPosition,
      experienceLevel: response.experienceLevel as any,
      targetPosition: response.targetPosition,
      targetSalaryMin: response.targetSalaryMin,
      targetSalaryMax: response.targetSalaryMax,
      locationPreference: response.locationPreference,
      remotenessPreference: response.remotenessPreference as any,
      bio: response.bio,
      linkedinUrl: response.linkedinUrl,
      githubUrl: response.githubUrl,
    },
    // skills: response.skills.map(skill => ({
    //   skillName: skill.skillName,
    //   proficiencyLevel: skill.proficiencyLevel,
    //   yearsExperience: skill.yearsExperience,
    //   isPrimarySkill: skill.isPrimarySkill,
    //   wantToImprove: skill.wantToImprove,
    //   skillCategory: skill.skillCategory as any,
    // })),
    workExperiences: response.workExperiences.map(exp => ({
      companyName: exp.companyName,
      position: exp.position,
      startDate: exp.startDate,
      endDate: exp.endDate || undefined,
      isCurrent: exp.isCurrent,
      description: exp.description || undefined,
      achievements: exp.achievements || [],
      technologiesUsed: exp.technologiesUsed || [],
      companySize: exp.companySize || undefined,
      industry: exp.industry || undefined,
    }))
    // careerGoals: response.careerGoals.map(goal => ({
    //   goalType: goal.goalType as any,
    //   title: goal.title,
    //   description: goal.description,
    //   targetDate: goal.targetDate,
    //   progressStatus: goal.progressStatus as any,
    //   progressPercentage: goal.progressPercentage,
    //   priority: goal.priority as any,
    //   notes: goal.notes,
    // })),
    // preferences: response.preferences ? {
    //   companySizePreference: response.preferences.companySizePreference as any,
    //   industryPreferences: response.preferences.industryPreferences as any[],
    //   communicationStyle: response.preferences.communicationStyle as any,
    //   workValues: response.preferences.workValues as any[],
    //   benefitsPreferences: response.preferences.benefitsPreferences as any[],
    //   workLifeBalanceImportance: response.preferences.workLifeBalanceImportance as any,
    //   careerGrowthImportance: response.preferences.careerGrowthImportance as any,
    //   compensationImportance: response.preferences.compensationImportance as any,
    //   additionalPreferences: response.preferences.additionalPreferences,
    // } : undefined,
  };
};

export const profileApi = {
  // Get user's complete profile
  getProfile: async (): Promise<UserProfileResponse | null> => {
    try {
      return await apiClient.getD<UserProfileResponse>('/api/profile');
    } catch (error: any) {
      // If profile doesn't exist (404), return null instead of throwing
      if (error?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  createOrUpdateProfile: async (profileData: ProfileFormData): Promise<UserProfileResponse> => {
    const request = transformProfileFormDataToRequest(profileData);
    return apiClient.postD<UserProfileResponse>('/api/profile', request);
  },

  updateBasicProfile: async (profileData: UserProfileRequest): Promise<UserProfileResponse> => {
    return apiClient.putD<UserProfileResponse>('/api/profile/basic', profileData);
  },

  checkProfileExists: async (): Promise<boolean> => {
    const response = await apiClient.getD<ProfileExistsResponse>('/api/profile/exists');
    return response.exists;
  },

  getProfileForForm: async (): Promise<Partial<ProfileFormData> | null> => {
    const profile = await profileApi.getProfile();
    if (!profile) return null;
    return transformProfileResponseToFormData(profile);
  },
};