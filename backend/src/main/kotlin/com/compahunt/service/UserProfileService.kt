package com.compahunt.service

import com.compahunt.dto.*
import com.compahunt.model.*
import com.compahunt.repository.UserProfileRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.*

@Service
@Transactional
class UserProfileService(
    private val userProfileRepository: UserProfileRepository
) {

    @Transactional(readOnly = true)
    fun getUserProfile(userId: UUID): UserProfileResponse? {
        val profile = userProfileRepository.findByUserIdWithDetails(userId)
        return profile?.let { toUserProfileResponse(it) }
    }

    fun createOrUpdateUserProfile(userId: UUID, request: CompleteUserProfileRequest): UserProfileResponse {
        val existingProfile = userProfileRepository.findByUserIdWithDetails(userId)
        
        val profile = if (existingProfile != null) {
            updateExistingProfile(existingProfile, request)
        } else {
            createNewProfile(userId, request)
        }

        val savedProfile = userProfileRepository.save(profile)
        return toUserProfileResponse(savedProfile)
    }

    fun updateBasicProfile(userId: UUID, request: UserProfileRequest): UserProfileResponse {
        val profile = userProfileRepository.findByUserId(userId)
            ?: throw IllegalArgumentException("User profile not found")

        val updatedProfile = profile.copy(
            currentPosition = request.currentPosition,
            experienceLevel = request.experienceLevel,
            targetPosition = request.targetPosition,
            targetSalaryMin = request.targetSalaryMin,
            targetSalaryMax = request.targetSalaryMax,
            locationPreference = request.locationPreference,
            remotenessPreference = request.remotenessPreference,
            bio = request.bio,
            linkedinUrl = request.linkedinUrl,
            githubUrl = request.githubUrl
        )

        val savedProfile = userProfileRepository.save(updatedProfile)
        return toUserProfileResponse(savedProfile)
    }

    @Transactional(readOnly = true)
    fun profileExists(userId: UUID): Boolean {
        return userProfileRepository.existsByUserId(userId)
    }

    private fun createNewProfile(userId: UUID, request: CompleteUserProfileRequest): UserProfile {
        val profile = UserProfile(
            userId = userId,
            currentPosition = request.profile.currentPosition,
            experienceLevel = request.profile.experienceLevel,
            targetPosition = request.profile.targetPosition,
            targetSalaryMin = request.profile.targetSalaryMin,
            targetSalaryMax = request.profile.targetSalaryMax,
            locationPreference = request.profile.locationPreference,
            remotenessPreference = request.profile.remotenessPreference,
            bio = request.profile.bio,
            linkedinUrl = request.profile.linkedinUrl,
            githubUrl = request.profile.githubUrl
        )

        // Add skills
        request.skills.forEach { skillRequest ->
            profile.skills.add(
                UserSkill(
                    userProfile = profile,
                    skillName = skillRequest.skillName,
                    proficiencyLevel = skillRequest.proficiencyLevel,
                    yearsExperience = skillRequest.yearsExperience,
                    isPrimarySkill = skillRequest.isPrimarySkill,
                    wantToImprove = skillRequest.wantToImprove,
                    skillCategory = skillRequest.skillCategory
                )
            )
        }

        // Add work experiences
        request.workExperiences.forEach { expRequest ->
            profile.workExperiences.add(
                WorkExperience(
                    userProfile = profile,
                    companyName = expRequest.companyName,
                    position = expRequest.position,
                    startDate = expRequest.startDate,
                    endDate = expRequest.endDate,
                    isCurrent = expRequest.isCurrent,
                    description = expRequest.description,
                    achievements = expRequest.achievements,
                    technologiesUsed = expRequest.technologiesUsed,
                    companySize = expRequest.companySize,
                    industry = expRequest.industry
                )
            )
        }

        // Add career goals
        request.careerGoals.forEach { goalRequest ->
            profile.careerGoals.add(
                CareerGoal(
                    userProfile = profile,
                    goalType = goalRequest.goalType,
                    title = goalRequest.title,
                    description = goalRequest.description,
                    targetDate = goalRequest.targetDate,
                    progressStatus = goalRequest.progressStatus,
                    progressPercentage = goalRequest.progressPercentage,
                    priority = goalRequest.priority,
                    notes = goalRequest.notes
                )
            )
        }

        return profile
    }

    private fun updateExistingProfile(profile: UserProfile, request: CompleteUserProfileRequest): UserProfile {
        return profile.copy(
            currentPosition = request.profile.currentPosition,
            experienceLevel = request.profile.experienceLevel,
            targetPosition = request.profile.targetPosition,
            targetSalaryMin = request.profile.targetSalaryMin,
            targetSalaryMax = request.profile.targetSalaryMax,
            locationPreference = request.profile.locationPreference,
            remotenessPreference = request.profile.remotenessPreference,
            bio = request.profile.bio,
            linkedinUrl = request.profile.linkedinUrl,
            githubUrl = request.profile.githubUrl
        ).also { updatedProfile ->
            // Clear existing relationships and add new ones
            updatedProfile.skills.clear()
            updatedProfile.workExperiences.clear()
            updatedProfile.careerGoals.clear()

            // Add updated data
            request.skills.forEach { skillRequest ->
                updatedProfile.skills.add(
                    UserSkill(
                        userProfile = updatedProfile,
                        skillName = skillRequest.skillName,
                        proficiencyLevel = skillRequest.proficiencyLevel,
                        yearsExperience = skillRequest.yearsExperience,
                        isPrimarySkill = skillRequest.isPrimarySkill,
                        wantToImprove = skillRequest.wantToImprove,
                        skillCategory = skillRequest.skillCategory
                    )
                )
            }

            request.workExperiences.forEach { expRequest ->
                updatedProfile.workExperiences.add(
                    WorkExperience(
                        userProfile = updatedProfile,
                        companyName = expRequest.companyName,
                        position = expRequest.position,
                        startDate = expRequest.startDate,
                        endDate = expRequest.endDate,
                        isCurrent = expRequest.isCurrent,
                        description = expRequest.description,
                        achievements = expRequest.achievements,
                        technologiesUsed = expRequest.technologiesUsed,
                        companySize = expRequest.companySize,
                        industry = expRequest.industry
                    )
                )
            }

            request.careerGoals.forEach { goalRequest ->
                updatedProfile.careerGoals.add(
                    CareerGoal(
                        userProfile = updatedProfile,
                        goalType = goalRequest.goalType,
                        title = goalRequest.title,
                        description = goalRequest.description,
                        targetDate = goalRequest.targetDate,
                        progressStatus = goalRequest.progressStatus,
                        progressPercentage = goalRequest.progressPercentage,
                        priority = goalRequest.priority,
                        notes = goalRequest.notes
                    )
                )
            }
        }
    }

    private fun toUserProfileResponse(profile: UserProfile): UserProfileResponse {
        return UserProfileResponse(
            id = profile.id,
            userId = profile.userId,
            currentPosition = profile.currentPosition,
            experienceLevel = profile.experienceLevel,
            targetPosition = profile.targetPosition,
            targetSalaryMin = profile.targetSalaryMin,
            targetSalaryMax = profile.targetSalaryMax,
            locationPreference = profile.locationPreference,
            remotenessPreference = profile.remotenessPreference,
            bio = profile.bio,
            linkedinUrl = profile.linkedinUrl,
            githubUrl = profile.githubUrl,
            skills = profile.skills.map { skill ->
                UserSkillResponse(
                    id = skill.id,
                    skillName = skill.skillName,
                    proficiencyLevel = skill.proficiencyLevel,
                    yearsExperience = skill.yearsExperience,
                    isPrimarySkill = skill.isPrimarySkill,
                    wantToImprove = skill.wantToImprove,
                    skillCategory = skill.skillCategory
                )
            },
            workExperiences = profile.workExperiences.map { exp ->
                WorkExperienceResponse(
                    id = exp.id,
                    companyName = exp.companyName,
                    position = exp.position,
                    startDate = exp.startDate,
                    endDate = exp.endDate,
                    isCurrent = exp.isCurrent,
                    description = exp.description,
                    achievements = exp.achievements,
                    technologiesUsed = exp.technologiesUsed,
                    companySize = exp.companySize,
                    industry = exp.industry
                )
            },
            careerGoals = profile.careerGoals.map { goal ->
                CareerGoalResponse(
                    id = goal.id,
                    goalType = goal.goalType,
                    title = goal.title,
                    description = goal.description,
                    targetDate = goal.targetDate,
                    progressStatus = goal.progressStatus,
                    progressPercentage = goal.progressPercentage,
                    priority = goal.priority,
                    notes = goal.notes
                )
            },
            preferences = profile.preferences?.let { pref ->
                UserPreferenceResponse(
                    id = pref.id,
                    companySizePreference = pref.companySizePreference,
                    industryPreferences = pref.industryPreferences,
                    communicationStyle = pref.communicationStyle,
                    workValues = pref.workValues,
                    benefitsPreferences = pref.benefitsPreferences,
                    workLifeBalanceImportance = pref.workLifeBalanceImportance,
                    careerGrowthImportance = pref.careerGrowthImportance,
                    compensationImportance = pref.compensationImportance,
                    additionalPreferences = pref.additionalPreferences
                )
            }
        )
    }
}