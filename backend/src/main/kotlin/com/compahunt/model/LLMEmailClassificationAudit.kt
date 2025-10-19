package com.compahunt.model

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "llm_email_classification_audit")
data class LLMEmailClassificationAudit(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @Column(nullable = false)
    val userId: UUID,

    @Column(columnDefinition = "TEXT", nullable = false)
    val emailSubject: String,

    @Column(columnDefinition = "TEXT", nullable = false)
    val emailBody: String,

    @Column(columnDefinition = "TEXT", nullable = false)
    val promptSent: String,

    @Column(nullable = true)
    val extractedVacancyId: String?,

    @Column(nullable = false)
    val isJobRelated: Boolean,

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSONB", nullable = true)
    val fieldChanges: String? = null,

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSONB", nullable = true)
    val interviewAssignment: String? = null,

    @Column(columnDefinition = "TEXT", nullable = true)
    val availableVacancies: String? = null,

    @Column(columnDefinition = "TEXT", nullable = true)
    val llmRawResponse: String? = null,

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    val createdAt: Instant = Instant.now()
)