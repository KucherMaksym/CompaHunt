package com.compahunt.model

import jakarta.persistence.*
import jakarta.validation.constraints.*
import java.math.BigDecimal
import java.util.*

@Entity
@Table(name = "user_profiles")
data class UserProfile(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @Column(name = "user_id", nullable = false, unique = true)
    val userId: UUID,

    @Size(max = 100, message = "Current position must not exceed 100 characters")
    @Column(name = "current_position", length = 100)
    val currentPosition: String? = null,

    @Column(name = "experience_level")
    val experienceLevel: String? = null,

    @Size(max = 100, message = "Target position must not exceed 100 characters")
    @Column(name = "target_position", length = 100)
    val targetPosition: String? = null,

    @DecimalMin(value = "0.0", message = "Salary must be positive")
    @Column(name = "target_salary_min", precision = 10, scale = 2)
    val targetSalaryMin: BigDecimal? = null,

    @DecimalMin(value = "0.0", message = "Salary must be positive")
    @Column(name = "target_salary_max", precision = 10, scale = 2)
    val targetSalaryMax: BigDecimal? = null,

    @Size(max = 100, message = "Location preference must not exceed 100 characters")
    @Column(name = "location_preference", length = 100)
    val locationPreference: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "remoteness_preference")
    val remotenessPreference: RemotenessPreference? = null,

    @Size(max = 500, message = "Bio must not exceed 500 characters")
    @Column(name = "bio", length = 500)
    val bio: String? = null,

    @Size(max = 100, message = "LinkedIn URL must not exceed 100 characters")
    @Column(name = "linkedin_url", length = 100)
    val linkedinUrl: String? = null,

    @Size(max = 100, message = "GitHub URL must not exceed 100 characters")
    @Column(name = "github_url", length = 100)
    val githubUrl: String? = null,

    @OneToMany(mappedBy = "userProfile", cascade = [CascadeType.ALL], fetch = FetchType.LAZY, orphanRemoval = true)
    val workExperiences: MutableSet<WorkExperience> = mutableSetOf(),


//   TODO: Later
//
//    @OneToMany(mappedBy = "userProfile", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
//    val careerGoals: MutableSet<CareerGoal> = mutableSetOf(),
//
//    @OneToMany(mappedBy = "userProfile", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
//    val skills: MutableSet<UserSkill> = mutableSetOf(),
//
//    @OneToOne(mappedBy = "userProfile", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
//    var preferences: UserPreference? = null
) {
    override fun toString(): String {
        return "UserProfile(id=$id, userId=$userId, currentPosition=$currentPosition, experienceLevel=$experienceLevel, targetPosition=$targetPosition, targetSalaryMin=$targetSalaryMin, targetSalaryMax=$targetSalaryMax, locationPreference=$locationPreference, remotenessPreference=$remotenessPreference, bio=$bio, linkedinUrl=$linkedinUrl, githubUrl=$githubUrl)"
    }

    override fun hashCode(): Int {
        return Objects.hash(id, userId, currentPosition, experienceLevel, targetPosition, targetSalaryMin, targetSalaryMax, locationPreference, remotenessPreference, bio, linkedinUrl, githubUrl)
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is UserProfile) return false

        return id == other.id &&
                userId == other.userId &&
                currentPosition == other.currentPosition &&
                experienceLevel == other.experienceLevel &&
                targetPosition == other.targetPosition &&
                targetSalaryMin == other.targetSalaryMin &&
                targetSalaryMax == other.targetSalaryMax &&
                locationPreference == other.locationPreference &&
                remotenessPreference == other.remotenessPreference &&
                bio == other.bio &&
                linkedinUrl == other.linkedinUrl &&
                githubUrl == other.githubUrl
    }
}

enum class ExperienceLevel {
    INTERN,
    JUNIOR,
    MIDDLE,
    SENIOR,
    LEAD,
    PRINCIPAL,
    DIRECTOR,
    VP,
    C_LEVEL
}

enum class RemotenessPreference {
    OFFICE_ONLY,
    HYBRID,
    REMOTE_PREFERRED,
    REMOTE_ONLY
}