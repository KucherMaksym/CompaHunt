package com.compahunt.model

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.databind.JsonNode
import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import java.time.Instant

@Entity
@Table(name = "user_pending_events")
class PendingEvent(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    val eventType: EventType,

    @Column(name = "event_subtype")
    val eventSubtype: String? = null,

    @Column(nullable = false)
    val title: String,

    @Column(columnDefinition = "TEXT")
    val description: String? = null,

    @Column(nullable = false)
    val priority: Int = 2, // 1=highest, 4=lowest

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id")
    val interview: Interview? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vacancy_id")
    val vacancy: Vacancy? = null,

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    val metadata: JsonNode? = null,

    @Column(name = "is_resolved", nullable = false)
    val isResolved: Boolean = false,

    @Column(name = "scheduled_for")
    val scheduledFor: Instant? = null,

    @Column(name = "resolved_at")
    val resolvedAt: Instant? = null,

    @CreatedDate
    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    val updatedAt: Instant = Instant.now()
) {

    fun resolve(): PendingEvent = PendingEvent(
        id = this.id,
        user = this.user,
        eventType = this.eventType,
        eventSubtype = this.eventSubtype,
        title = this.title,
        description = this.description,
        priority = this.priority,
        interview = this.interview,
        vacancy = this.vacancy,
        metadata = this.metadata,
        isResolved = true,
        scheduledFor = this.scheduledFor,
        resolvedAt = Instant.now(),
        createdAt = this.createdAt,
        updatedAt = Instant.now()
    )

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is PendingEvent) return false
        return id == other.id
    }

    override fun hashCode(): Int {
        return id.hashCode()
    }

    override fun toString(): String {
        return "PendingEvent(id=$id, eventType=$eventType, title='$title', isResolved=$isResolved)"
    }
}

enum class EventType {
    INTERVIEW_FEEDBACK,
    AI_STATUS_CHANGE,
    AI_INTERVIEW_SCHEDULED,
    SYSTEM_NOTIFICATION;

    fun getDisplayName(): String = when (this) {
        INTERVIEW_FEEDBACK -> "Interview Feedback Required"
        AI_STATUS_CHANGE -> "Application Status Update"
        AI_INTERVIEW_SCHEDULED -> "Interview Scheduled"
        SYSTEM_NOTIFICATION -> "System Notification"
    }

    fun getDefaultPriority(): Int = when (this) {
        INTERVIEW_FEEDBACK -> 1 // Highest priority
        AI_STATUS_CHANGE -> 2
        AI_INTERVIEW_SCHEDULED -> 2
        SYSTEM_NOTIFICATION -> 3
    }
}