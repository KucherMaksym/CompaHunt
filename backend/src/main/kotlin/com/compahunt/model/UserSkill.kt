package com.compahunt.model

import jakarta.persistence.*
import jakarta.persistence.GenerationType
import jakarta.validation.constraints.*
import java.util.*

@Entity
@Table(name = "user_skills")
data class UserSkill(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_profile_id", nullable = false)
    val userProfile: UserProfile,

    @NotBlank(message = "Skill name is required")
    @Size(max = 50, message = "Skill name must not exceed 50 characters")
    @Column(name = "skill_name", nullable = false, length = 50)
    val skillName: String,

    @Min(value = 1, message = "Proficiency level must be between 1 and 5")
    @Max(value = 5, message = "Proficiency level must be between 1 and 5")
    @Column(name = "proficiency_level", nullable = false)
    val proficiencyLevel: Int,

    @Min(value = 0, message = "Years of experience must be positive")
    @Max(value = 50, message = "Years of experience must not exceed 50")
    @Column(name = "years_experience")
    val yearsExperience: Int? = null,

    @Column(name = "is_primary_skill", nullable = false)
    val isPrimarySkill: Boolean = false,

    @Column(name = "want_to_improve", nullable = false)
    val wantToImprove: Boolean = false,

    @Enumerated(EnumType.STRING)
    @Column(name = "skill_category")
    val skillCategory: SkillCategory? = null
)

enum class SkillCategory {
    PROGRAMMING_LANGUAGE,
    FRAMEWORK,
    DATABASE,
    CLOUD_PLATFORM,
    TOOL,
    METHODOLOGY,
    SOFT_SKILL,
    DOMAIN_KNOWLEDGE
}