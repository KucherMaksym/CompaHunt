package com.compahunt.model

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "gmail_watch_subscriptions")
data class GmailWatchSubscription(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @Column(name = "user_id", nullable = false)
    val userId: UUID,

    @Column(name = "history_id", nullable = false)
    var historyId: Long,

    @Column(name = "expiration", nullable = false)
    val expiration: Instant,

    @Column(name = "is_active", nullable = false)
    var isActive: Boolean = true,

    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now()
)