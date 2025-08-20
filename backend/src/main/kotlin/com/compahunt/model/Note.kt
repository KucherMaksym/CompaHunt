package com.compahunt.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "notes")
data class Note(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vacancy_id", nullable = true)
    val vacancy: Vacancy? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = true)
    val interview: Interview? = null,

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
) {
    init {
        // Ensure exactly one of vacancy or interview is set
        require((vacancy == null) xor (interview == null)) {
            "Note must be associated with exactly one of: vacancy or interview"
        }
    }
}