package com.compahunt.service

import com.compahunt.annotation.LocalModelEmbedding
import com.compahunt.model.EmailCSV
import com.compahunt.model.EmailEmbedding
import com.compahunt.repository.EmailEmbeddingRepository
import com.compahunt.service.embedding.EmbeddingService
import com.pgvector.PGvector
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class EmailEmbeddingService(
    val emailEmbeddingRepository: EmailEmbeddingRepository,
    @LocalModelEmbedding val embeddingService: EmbeddingService
) {

    val log = LoggerFactory.getLogger(this::class.java)

    fun generateEmbedding(email: EmailCSV): EmailEmbedding {

        val fullText = """
                Subject: ${email.subject}
                
                ${email.body}
        """.trimIndent()

        val embedding: List<Float>  = embeddingService.generateEmbedding(fullText)
        log.info("Embedding generated: $embedding")

        val emailEmbedding = EmailEmbedding(
            embedding = PGvector(embedding.toFloatArray()),
            body = email.body,
            subject = email.subject,
        )

        emailEmbeddingRepository.save(emailEmbedding)

        return emailEmbedding;
    }

}