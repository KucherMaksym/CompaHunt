package com.compahunt.repository

import com.compahunt.model.EmailEmbedding
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface EmailEmbeddingRepository: JpaRepository<EmailEmbedding, UUID>{
    @Query("select * from email_embedding order by embedding <-> CAST(:)", nativeQuery = true)
    fun findNearestNeighbors(embedding: FloatArray, n: Int): List<EmailEmbedding>
}