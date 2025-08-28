package com.compahunt.model

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "vacancy_audit")
data class VacancyAudit(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID = UUID.randomUUID(),

    @Column(nullable = false)
    val vacancyId: UUID,

    @Column(nullable = false)
    val userId: UUID,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val action: AuditAction,

    @Column(columnDefinition = "TEXT")
    val fieldName: String? = null,

    @Column(columnDefinition = "TEXT")
    val oldValue: String? = null,

    @Column(columnDefinition = "TEXT")
    val newValue: String? = null,

    @Column(columnDefinition = "TEXT")
    val changes: String? = null,

    val timestamp: Instant = Instant.now(),

    val reason: String? = null,

    val userAgent: String? = null,

    val ipAddress: String? = null
)

enum class AuditAction {
    CREATED,
    UPDATED,
    ARCHIVED,
    FIELD_CHANGED
}