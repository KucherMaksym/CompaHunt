package com.compahunt.model

import jakarta.persistence.*
import jakarta.validation.constraints.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.util.*

@Entity
@Table(name = "user_preferences")
data class UserPreference(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID = UUID.randomUUID(),

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_profile_id", nullable = false)
    val userProfile: UserProfile,

    @Enumerated(EnumType.STRING)
    @Column(name = "company_size_preference")
    val companySizePreference: CompanySize? = null,

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "industry_preferences", columnDefinition = "jsonb")
    val industryPreferences: List<Industry> = emptyList(),

    @Enumerated(EnumType.STRING)
    @Column(name = "communication_style")
    val communicationStyle: CommunicationStyle? = null,

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "work_values", columnDefinition = "jsonb")
    val workValues: List<WorkValue> = emptyList(),

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "benefits_preferences", columnDefinition = "jsonb")
    val benefitsPreferences: List<BenefitType> = emptyList(),

    @Enumerated(EnumType.STRING)
    @Column(name = "work_life_balance_importance")
    val workLifeBalanceImportance: Importance? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "career_growth_importance")
    val careerGrowthImportance: Importance? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "compensation_importance")
    val compensationImportance: Importance? = null,

    @Size(max = 500, message = "Additional preferences must not exceed 500 characters")
    @Column(name = "additional_preferences", length = 500)
    val additionalPreferences: String? = null
)

enum class CompanySize {
    STARTUP,        // 1-10
    SMALL,          // 11-50
    MEDIUM,         // 51-200
    LARGE,          // 201-1000
    ENTERPRISE      // 1000+
}

enum class CommunicationStyle {
    DIRECT,
    COLLABORATIVE,
    FORMAL,
    CASUAL,
    STRUCTURED,
    FLEXIBLE
}

enum class WorkValue {
    INNOVATION,
    STABILITY,
    FLEXIBILITY,
    TEAMWORK,
    INDEPENDENCE,
    LEARNING,
    IMPACT,
    RECOGNITION,
    DIVERSITY,
    SUSTAINABILITY,
    WORK_LIFE_BALANCE,
    COMPETITIVE_COMPENSATION,
    CAREER_ADVANCEMENT,
    MENTORSHIP,
    CREATIVE_FREEDOM
}

enum class BenefitType {
    HEALTH_INSURANCE,
    DENTAL_INSURANCE,
    VISION_INSURANCE,
    RETIREMENT_PLAN,
    PAID_TIME_OFF,
    FLEXIBLE_SCHEDULE,
    REMOTE_WORK,
    EDUCATION_ASSISTANCE,
    GYM_MEMBERSHIP,
    MEAL_ALLOWANCE,
    TRANSPORTATION,
    STOCK_OPTIONS,
    BONUS,
    CONFERENCES,
    EQUIPMENT_ALLOWANCE,
    CHILDCARE_SUPPORT,
    MENTAL_HEALTH_SUPPORT,
    SABBATICAL
}

enum class Importance {
    NOT_IMPORTANT,
    SOMEWHAT_IMPORTANT,
    IMPORTANT,
    VERY_IMPORTANT,
    CRITICAL
}