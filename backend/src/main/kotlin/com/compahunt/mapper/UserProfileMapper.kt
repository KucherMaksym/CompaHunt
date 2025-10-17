package com.compahunt.mapper

import com.compahunt.dto.*
import com.compahunt.model.*
import org.springframework.stereotype.Component

@Component
class UserProfileMapper {

    fun toUserProfileResponse(userProfile: UserProfile): UserProfileResponse {
        return UserProfileResponse(
            id = userProfile.id,
            userId = userProfile.userId,
            currentPosition = userProfile.currentPosition,
            experienceLevel = userProfile.experienceLevel,
            targetPosition = userProfile.targetPosition,
            targetSalaryMin = userProfile.targetSalaryMin,
            targetSalaryMax = userProfile.targetSalaryMax,
            locationPreference = userProfile.locationPreference,
            remotenessPreference = userProfile.remotenessPreference,
            bio = userProfile.bio,
            linkedinUrl = userProfile.linkedinUrl,
            githubUrl = userProfile.githubUrl,
            workExperiences = userProfile.workExperiences.map { toWorkExperienceResponse(it) }
        )
    }

    fun toWorkExperience(expRequest: WorkExperienceRequest, userProfile: UserProfile): WorkExperience {
        return WorkExperience(
            id = userProfile.userId,
            userProfile = userProfile,
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
    }

    private fun toWorkExperienceResponse(workExperience: WorkExperience): WorkExperienceResponse {
        return WorkExperienceResponse(
            id = workExperience.id,
            companyName = workExperience.companyName,
            position = workExperience.position,
            startDate = workExperience.startDate,
            endDate = workExperience.endDate,
            isCurrent = workExperience.isCurrent,
            description = workExperience.description,
            achievements = workExperience.achievements,
            technologiesUsed = workExperience.technologiesUsed,
            companySize = workExperience.companySize,
            industry = workExperience.industry
        )
    }
}