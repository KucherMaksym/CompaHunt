package com.compahunt.dto

import com.compahunt.model.*
import jakarta.validation.Valid
import jakarta.validation.constraints.*
import java.math.BigDecimal
import java.time.LocalDate
import java.util.*

data class UserProfileResponse(
    val id: UUID,
    val userId: UUID,
    val currentPosition: String?,
    val experienceLevel: ExperienceLevel?,
    val targetPosition: String?,
    val targetSalaryMin: BigDecimal?,
    val targetSalaryMax: BigDecimal?,
    val locationPreference: String?,
    val remotenessPreference: RemotenessPreference?,
    val bio: String?,
    val linkedinUrl: String?,
    val githubUrl: String?,
    val skills: List<UserSkillResponse>,
    val workExperiences: List<WorkExperienceResponse>,
    val careerGoals: List<CareerGoalResponse>,
    val preferences: UserPreferenceResponse?
)

data class UserProfileRequest(
    @field:Size(max = 100, message = "Current position must not exceed 100 characters")
    val currentPosition: String?,

    val experienceLevel: ExperienceLevel?,

    @field:Size(max = 100, message = "Target position must not exceed 100 characters")
    val targetPosition: String?,

    @field:DecimalMin(value = "0.0", message = "Salary must be positive")
    val targetSalaryMin: BigDecimal?,

    @field:DecimalMin(value = "0.0", message = "Salary must be positive")
    val targetSalaryMax: BigDecimal?,

    @field:Size(max = 100, message = "Location preference must not exceed 100 characters")
    val locationPreference: String?,

    val remotenessPreference: RemotenessPreference?,

    @field:Size(max = 500, message = "Bio must not exceed 500 characters")
    val bio: String?,

    @field:Size(max = 100, message = "LinkedIn URL must not exceed 100 characters")
    val linkedinUrl: String?,

    @field:Size(max = 100, message = "GitHub URL must not exceed 100 characters")
    val githubUrl: String?
)

data class UserSkillResponse(
    val id: UUID,
    val skillName: String,
    val proficiencyLevel: Int,
    val yearsExperience: Int?,
    val isPrimarySkill: Boolean,
    val wantToImprove: Boolean,
    val skillCategory: SkillCategory?
)

data class UserSkillRequest(
    @field:NotBlank(message = "Skill name is required")
    @field:Size(max = 50, message = "Skill name must not exceed 50 characters")
    val skillName: String,

    @field:Min(value = 1, message = "Proficiency level must be between 1 and 5")
    @field:Max(value = 5, message = "Proficiency level must be between 1 and 5")
    val proficiencyLevel: Int,

    @field:Min(value = 0, message = "Years of experience must be positive")
    @field:Max(value = 50, message = "Years of experience must not exceed 50")
    val yearsExperience: Int?,

    val isPrimarySkill: Boolean = false,
    val wantToImprove: Boolean = false,
    val skillCategory: SkillCategory?
)

data class WorkExperienceResponse(
    val id: UUID,
    val companyName: String,
    val position: String,
    val startDate: LocalDate,
    val endDate: LocalDate?,
    val isCurrent: Boolean,
    val description: String?,
    val achievements: List<String>,
    val technologiesUsed: List<String>,
    val companySize: String?,
    val industry: Industry?
)

data class WorkExperienceRequest(
    @field:NotBlank(message = "Company name is required")
    @field:Size(max = 100, message = "Company name must not exceed 100 characters")
    val companyName: String,

    @field:NotBlank(message = "Position is required")
    @field:Size(max = 100, message = "Position must not exceed 100 characters")
    val position: String,

    @field:NotNull(message = "Start date is required")
    val startDate: LocalDate,

    val endDate: LocalDate?,

    val isCurrent: Boolean = false,

    @field:Size(max = 1000, message = "Description must not exceed 1000 characters")
    val description: String?,

    @field:Size(max = 10, message = "Maximum 10 achievements allowed")
    val achievements: List<@Size(max = 200, message = "Achievement must not exceed 200 characters") String> = emptyList(),

    @field:Size(max = 20, message = "Maximum 20 technologies allowed")
    val technologiesUsed: List<@Size(max = 50, message = "Technology name must not exceed 50 characters") String> = emptyList(),

    @field:Size(max = 100, message = "Company size must not exceed 100 characters")
    val companySize: String?,

    val industry: Industry?
)

data class CareerGoalResponse(
    val id: UUID,
    val goalType: GoalType,
    val title: String,
    val description: String,
    val targetDate: LocalDate?,
    val progressStatus: ProgressStatus,
    val progressPercentage: Int,
    val priority: Priority?,
    val notes: String?
)

data class CareerGoalRequest(
    val goalType: GoalType,

    @field:NotBlank(message = "Goal title is required")
    @field:Size(max = 100, message = "Goal title must not exceed 100 characters")
    val title: String,

    @field:NotBlank(message = "Goal description is required")
    @field:Size(max = 500, message = "Goal description must not exceed 500 characters")
    val description: String,

    val targetDate: LocalDate?,

    val progressStatus: ProgressStatus = ProgressStatus.NOT_STARTED,

    @field:Min(value = 0, message = "Progress percentage must be between 0 and 100")
    @field:Max(value = 100, message = "Progress percentage must be between 0 and 100")
    val progressPercentage: Int = 0,

    val priority: Priority?,

    @field:Size(max = 1000, message = "Notes must not exceed 1000 characters")
    val notes: String?
)

data class UserPreferenceResponse(
    val id: UUID,
    val companySizePreference: CompanySize?,
    val industryPreferences: List<Industry>,
    val communicationStyle: CommunicationStyle?,
    val workValues: List<WorkValue>,
    val benefitsPreferences: List<BenefitType>,
    val workLifeBalanceImportance: Importance?,
    val careerGrowthImportance: Importance?,
    val compensationImportance: Importance?,
    val additionalPreferences: String?
)

data class UserPreferenceRequest(
    val companySizePreference: CompanySize?,

    @field:Size(max = 10, message = "Maximum 10 industry preferences allowed")
    val industryPreferences: List<Industry> = emptyList(),

    val communicationStyle: CommunicationStyle?,

    @field:Size(max = 15, message = "Maximum 15 work values allowed")
    val workValues: List<WorkValue> = emptyList(),

    @field:Size(max = 18, message = "Maximum 18 benefits preferences allowed")
    val benefitsPreferences: List<BenefitType> = emptyList(),

    val workLifeBalanceImportance: Importance?,
    val careerGrowthImportance: Importance?,
    val compensationImportance: Importance?,

    @field:Size(max = 500, message = "Additional preferences must not exceed 500 characters")
    val additionalPreferences: String?
)

data class CompleteUserProfileRequest(
    @field:Valid
    val profile: UserProfileRequest,

    @field:Valid
    @field:Size(max = 20, message = "Maximum 20 skills allowed")
    val skills: List<UserSkillRequest> = emptyList(),

    @field:Valid
    @field:Size(max = 5, message = "Maximum 5 work experiences allowed")
    val workExperiences: List<WorkExperienceRequest> = emptyList(),

    @field:Valid
    @field:Size(max = 5, message = "Maximum 5 career goals allowed")
    val careerGoals: List<CareerGoalRequest> = emptyList(),

    @field:Valid
    val preferences: UserPreferenceRequest?
)