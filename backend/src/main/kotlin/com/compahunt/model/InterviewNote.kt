package com.compahunt.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "interview_notes")
data class InterviewNote(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = false)
    val interview: Interview,

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

    val createdAt: LocalDateTime = LocalDateTime.now(),

    val updatedAt: LocalDateTime = LocalDateTime.now()
)