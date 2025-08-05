package com.compahunt.model

import jakarta.persistence.*
import org.hibernate.annotations.SQLRestriction
import java.time.LocalDateTime

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

    @Column(nullable = false)
    val location: String,

    val jobType: String? = null,

    val experienceLevel: String? = null,

    @Column(columnDefinition = "TEXT")
    val description: String,

    @ElementCollection
    @CollectionTable(name = "vacancy_requirements", joinColumns = [JoinColumn(name = "vacancy_id")])
    @Column(name = "requirement", columnDefinition = "TEXT")
    val requirements: List<String> = listOf(),

    @ElementCollection
    @CollectionTable(name = "vacancy_skills", joinColumns = [JoinColumn(name = "vacancy_id")])
    @Column(name = "skill")
    val skills: List<String> = listOf(),

    val postedDate: String? = null,

    val applicantCount: Int? = null,

    @Column(nullable = false, unique = true)
    val url: String,

    @Embedded
    @AttributeOverrides(AttributeOverride(name = "location", column = Column(name = "salary_location")),)
    val salary: Salary? = null,

    val remoteness: String? = null,

    val industry: String? = null,

    @Column(nullable = false)
    val deleted: Boolean = false,

    val createdAt: LocalDateTime = LocalDateTime.now(),

    val updatedAt: LocalDateTime = LocalDateTime.now()
)

@Embeddable
data class Salary(
    val range: String,
    val currency: String,
    val period: String,
    val type: String,
    val location: String
)

enum class JobType {
    ON_SITE,
    REMOTE,
    HYBRID
}