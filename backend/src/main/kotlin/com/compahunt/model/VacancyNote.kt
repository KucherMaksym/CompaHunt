package com.compahunt.model

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "vacancy_notes")
data class VacancyNote(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID = UUID.randomUUID(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vacancy_id", nullable = false)
    val vacancy: Vacancy,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,

    @Column(nullable = false, columnDefinition = "TEXT")
    val content: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val type: NoteType,

    @Enumerated(EnumType.STRING)
    val priority: NotePriority = NotePriority.MEDIUM,

    @Column(columnDefinition = "TEXT")
    val tags: String? = null, // JSON array of tags

    val isPrivate: Boolean = false,

    val createdAt: Instant = Instant.now(),

    val updatedAt: Instant = Instant.now()
)

enum class NoteType {
    GENERAL,
    OFFER_RECEIVED,
    REJECTION_RECEIVED,
    INTERVIEW_FEEDBACK,
    FOLLOW_UP,
    RESEARCH,
    SALARY_NEGOTIATION,
    CONTACT_INFO,
    COMPANY_CULTURE,
    NEXT_STEPS
}

enum class NotePriority {
    LOW,
    MEDIUM,
    HIGH,
    URGENT
}