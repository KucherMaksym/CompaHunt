package com.compahunt.model

import com.compahunt.component.EncryptedStringConverter
import jakarta.persistence.*
import java.time.Instant
import java.util.*

@Entity
@Table(name = "user_oauth_tokens")
data class UserOAuthToken(
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,

    @Column(nullable = false)
    val provider: String, // "google

    @Convert(converter = EncryptedStringConverter::class)
    @Column(columnDefinition = "TEXT")
    var accessToken: String,

    @Convert(converter = EncryptedStringConverter::class)
    @Column(columnDefinition = "TEXT")
    var refreshToken: String?,

    @Column(nullable = false)
    var expiresAt: Instant,

    @Column(nullable = false)
    val scopes: String, // "https://www.googleapis.com/auth/gmail.readonly"

    val createdAt: Instant = Instant.now(),
    var updatedAt: Instant = Instant.now()
) {
    fun isExpired(): Boolean = expiresAt.isBefore(Instant.now().plusSeconds(300)) // 5 min buffer
}