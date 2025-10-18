package com.compahunt.model

import com.compahunt.service.ApplicationStatus
import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(
    name = "gmail_notification_events",
    indexes = [
        Index(
            name = "uk_gmail_notification_user_message",
            columnList = "user_id, message_id",
            unique = true
        )
    ]
)
data class GmailNotificationEvent(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @Column(name = "user_id", nullable = false)
    val userId: UUID,

    @Column(name = "history_id", nullable = false)
    val historyId: Long,

    @Column(name = "message_id")
    val messageId: String? = null,

    @Column(name = "email_subject")
    val emailSubject: String? = null,

    @Column(name = "email_sender")
    val emailSender: String? = null,

    @Column(name = "detected_status")
    @Enumerated(EnumType.STRING)
    val detectedStatus: ApplicationStatus? = null,

    @Column(name = "processed_by_ai", nullable = false)
    var processedByAi: Boolean = false,

    @Column(name = "processing_error")
    val processingError: String? = null,

    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now()
)
