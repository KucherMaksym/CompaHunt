package com.compahunt.model

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "interviews")
data class Interview(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID = UUID.randomUUID(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vacancy_id", nullable = false)
    val vacancy: Vacancy,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,

    @Column(nullable = false)
    val scheduledAt: Instant,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val type: InterviewType,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val status: InterviewStatus = InterviewStatus.SCHEDULED,

    @Column(columnDefinition = "TEXT")
    val notes: String? = null,

    @Column(columnDefinition = "TEXT")
    val feedback: String? = null,

    val duration: Int? = null, // in minutes

    val meetingLink: String? = null,

    val location: String? = null,

    val interviewerName: String? = null,

    val interviewerEmail: String? = null,

    val createdAt: Instant = Instant.now(),

    val updatedAt: Instant = Instant.now()
)

enum class InterviewType {
    PHONE_SCREEN,
    VIDEO_CALL,
    ON_SITE,
    TECHNICAL,
    BEHAVIORAL,
    FINAL_ROUND,
    HR_INTERVIEW
}

enum class InterviewStatus {
    SCHEDULED,
    COMPLETED,
    CANCELLED,
    RESCHEDULED,
    NO_SHOW
}