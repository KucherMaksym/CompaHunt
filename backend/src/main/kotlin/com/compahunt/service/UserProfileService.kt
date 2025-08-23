package com.compahunt.service

import com.compahunt.dto.*
import com.compahunt.model.*
import com.compahunt.repository.UserProfileRepository
import com.compahunt.mapper.UserProfileMapper
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.*

@Service
@Transactional
class UserProfileService(
    private val userProfileRepository: UserProfileRepository,
    private val userProfileMapper: UserProfileMapper
) {

    @Transactional(readOnly = true)
    fun getUserProfile(userId: Long): UserProfileResponse? {
        val profile = userProfileRepository.findByUserIdWithDetails(userId)
        return profile?.let { userProfileMapper.toUserProfileResponse(it) }
    }

    fun createOrUpdateUserProfile(userId: Long, request: CompleteUserProfileRequest): UserProfileResponse {
        val existingProfile = userProfileRepository.findByUserIdWithDetails(userId)

        val profile = if (existingProfile != null) {
            updateExistingProfile(existingProfile, request)
        } else {
            createNewProfile(userId, request)
        }

        val savedProfile = userProfileRepository.save(profile)
        return userProfileMapper.toUserProfileResponse(savedProfile)
    }

    fun updateBasicProfile(userId: Long, request: UserProfileRequest): UserProfileResponse {
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
        return userProfileMapper.toUserProfileResponse(savedProfile)
    }

    @Transactional(readOnly = true)
    fun profileExists(userId: Long): Boolean {
        return userProfileRepository.existsByUserId(userId)
    }

    private fun createNewProfile(userId: Long, request: CompleteUserProfileRequest): UserProfile {
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
//        request.skills.forEach { skillRequest ->
//            val skill = userProfileMapper.toUserSkill(skillRequest, profile)
//            profile.skills.add(skill)
//        }

        // Add work experiences
        request.workExperiences.forEach { expRequest ->
            val workExp = userProfileMapper.toWorkExperience(expRequest, profile)
            profile.workExperiences.add(workExp)
        }

        // Add career goals
//        request.careerGoals.forEach { goalRequest ->
//            val goal = userProfileMapper.toCareerGoal(goalRequest, profile)
//            profile.careerGoals.add(goal)
//        }

        // Add preferences if provided
//        request.preferences?.let { prefRequest ->
//            val preferences = userProfileMapper.toUserPreference(prefRequest, profile)
//            preferences.userProfile = profile
//            profile.preferences = preferences
//        }

        return profile
    }

    private fun updateExistingProfile(profile: UserProfile, request: CompleteUserProfileRequest): UserProfile {
        // Clear existing work experiences first (works with managed entity)
        profile.workExperiences.clear()
        
        // Create updated profile with new basic fields
        val updatedProfile = profile.copy(
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

        // Add new work experiences to the updated profile
        request.workExperiences.forEach { expRequest ->
            val workExp = userProfileMapper.toWorkExperience(expRequest, updatedProfile)
            updatedProfile.workExperiences.add(workExp)
        }

        return updatedProfile
    }

}