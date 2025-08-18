package com.compahunt.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import jakarta.persistence.*
import jakarta.validation.constraints.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.LocalDate
import java.util.*

@Entity
@Table(name = "work_experiences")
data class WorkExperience(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID = UUID.randomUUID(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_profile_id", nullable = false)
    val userProfile: UserProfile,

    @NotBlank(message = "Company name is required")
    @Size(max = 100, message = "Company name must not exceed 100 characters")
    @Column(name = "company_name", nullable = false, length = 100)
    val companyName: String,

    @NotBlank(message = "Position is required")
    @Size(max = 100, message = "Position must not exceed 100 characters")
    @Column(name = "position", nullable = false, length = 100)
    val position: String,

    @NotNull(message = "Start date is required")
    @Column(name = "start_date", nullable = false)
    val startDate: LocalDate,

    @Column(name = "end_date")
    val endDate: LocalDate? = null,

    @Column(name = "is_current", nullable = false)
    val isCurrent: Boolean = false,

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    @Column(name = "description", length = 1000)
    val description: String? = null,

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "achievements", columnDefinition = "jsonb")
    val achievements: List<String> = emptyList(),

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "technologies_used", columnDefinition = "jsonb")
    val technologiesUsed: List<String> = emptyList(),

    @Size(max = 100, message = "Company size must not exceed 100 characters")
    @Column(name = "company_size", length = 100)
    val companySize: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "industry")
    val industry: Industry? = null
)

enum class Industry {
    TECHNOLOGY,
    HEALTHCARE,
    FINANCE,
    EDUCATION,
    RETAIL,
    MANUFACTURING,
    CONSULTING,
    MARKETING,
    LEGAL,
    REAL_ESTATE,
    HOSPITALITY,
    NON_PROFIT,
    MEDIA,
    TRANSPORTATION,
    ENERGY,
    TELECOMMUNICATIONS,
    AGRICULTURE,
    CONSTRUCTION,
    GOVERNMENT,
    ENTERTAINMENT,
    AUTOMOTIVE,
    AEROSPACE,
    BIOTECHNOLOGY,
    PHARMACEUTICAL,
    FOOD_BEVERAGE,
    FASHION,
    SPORTS,
    TRAVEL,
    INSURANCE,
    BANKING,
    OTHER
}