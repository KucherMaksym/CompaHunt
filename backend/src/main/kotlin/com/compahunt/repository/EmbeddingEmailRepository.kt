package com.compahunt.repository

import com.compahunt.model.EmailEmbedding
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface EmbeddingEmailRepository: JpaRepository<EmailEmbedding, UUID> {
}