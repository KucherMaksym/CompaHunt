package com.compahunt.model

import com.compahunt.config.VectorType
import com.pgvector.PGvector
import jakarta.persistence.Entity
import jakarta.persistence.Column
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.Type
import java.time.Instant
import java.util.UUID

@Entity
data class EmailEmbedding(
    @GeneratedValue(strategy = GenerationType.UUID)
    @Id
    val id: UUID? = null,
//    val emailId: String,
    @Column(columnDefinition = "vector(1536)")
    @Type(VectorType::class)
    val embedding: PGvector,
    @Column(columnDefinition = "TEXT")
    val subject: String,
    @Column(columnDefinition = "TEXT")
    val body: String,
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val category: EmailCategory = EmailCategory.JOB_RELATED_OTHER,
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    val createdAt: Instant = Instant.now(),
)