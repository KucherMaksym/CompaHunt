package com.compahunt.model

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*
import org.hibernate.annotations.SQLRestriction
import java.math.BigDecimal
import java.time.Instant

@Entity
@Table(name = "vacancies")
@SQLRestriction("deleted = false")
data class Vacancy(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    val title: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    val company: Company,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,

    @Column(nullable = false)
    val location: String,

    val jobType: String? = null,

    val experienceLevel: String? = null,

    @Column(columnDefinition = "TEXT")
    val description: String,

    @Column(name = "html_description", columnDefinition = "TEXT")
    val htmlDescription: String? = null,

    @ElementCollection
    @CollectionTable(name = "vacancy_requirements", joinColumns = [JoinColumn(name = "vacancy_id")])
    @Column(name = "requirement", columnDefinition = "TEXT")
    val requirements: List<String> = listOf(),

    @ElementCollection
    @CollectionTable(name = "vacancy_skills", joinColumns = [JoinColumn(name = "vacancy_id")])
    @Column(name = "skill")
    val skills: List<String> = listOf(),

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val status: VacancyStatus = VacancyStatus.APPLIED,

    val appliedAt: Instant = Instant.now(),

    val postedDate: String? = null,

    val applicantCount: Int? = null,

    @Column(nullable = false, length = 1024)
    val url: String,

    @Embedded
    @AttributeOverrides(AttributeOverride(name = "location", column = Column(name = "salary_location")),)
    val salary: Salary? = null,

    val remoteness: String? = null,

    val industry: String? = null,

    val benefits: String? = null,

    val experience: String? = null,

    @OneToMany(mappedBy = "vacancy", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    @JsonIgnore
    val interviews: List<Interview> = listOf(),

    @OneToMany(mappedBy = "vacancy", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    @JsonIgnore
    val notes: List<VacancyNote> = listOf(),

    @Column(name = "manual", nullable = false, columnDefinition = "boolean default true")
    val manual: Boolean = false,

    @Column(nullable = false)
    val deleted: Boolean = false,

    val createdAt: Instant = Instant.now(),

    val updatedAt: Instant = Instant.now()
)

@Embeddable
data class Salary(
    val range: String,
    val min: BigDecimal?,
    val max: BigDecimal?,
    val currency: String?,
    val period: String?,
    val location: String,
    val monthMin: BigDecimal? = null,
    val monthMax: BigDecimal? = null
)

enum class Remoteness {
    ON_SITE,
    REMOTE,
    HYBRID
}

enum class VacancyStatus {
    APPLIED,
    VIEWED,
    PHONE_SCREEN,
    INTERVIEW,
    OFFER,
    REJECTED,
    ARCHIVED
}