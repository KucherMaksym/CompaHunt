package com.compahunt.model

import jakarta.persistence.Entity
import com.pgvector.PGvector;
import jakarta.persistence.Column
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import java.util.UUID

@Entity
data class EmailEmbedding(
    @GeneratedValue(strategy = GenerationType.UUID)
    @Id
    val id: UUID? = null,
    val emailId: String,
    @Column(columnDefinition = "vector(1536)")
    val embedding: PGvector,
    val originalText: String,
)