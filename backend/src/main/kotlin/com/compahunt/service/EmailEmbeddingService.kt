package com.compahunt.service

import com.compahunt.model.EmailCSV
import com.compahunt.model.EmailEmbedding
import com.compahunt.repository.EmailEmbeddingRepository
import org.slf4j.LoggerFactory
import org.springframework.ai.embedding.EmbeddingModel
import org.springframework.ai.embedding.EmbeddingResponse
import org.springframework.stereotype.Service

@Service
class EmailEmbeddingService(
    val emailEmbeddingRepository: EmailEmbeddingRepository,
    val embeddingModel: EmbeddingModel
) {

    val log = LoggerFactory.getLogger(this::class.java)

    init {
        log.info("EmbeddingModel initialized: ${embeddingModel.javaClass.name}")
    }

    fun generateEmbedding(email: EmailCSV): EmbeddingResponse {

        val fullText = """
                Subject: ${email.subject}
                
                ${email.body}
        """.trimIndent()

        val embeddingResponse = embeddingModel.embedForResponse(listOf(fullText))

        log.info("Embedding created: $embeddingResponse")

        return embeddingResponse;
    }

}