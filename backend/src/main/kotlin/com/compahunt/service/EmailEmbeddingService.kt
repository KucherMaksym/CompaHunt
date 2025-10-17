package com.compahunt.service

import com.compahunt.annotation.LocalModelEmbedding
import com.compahunt.annotation.LogExecutionTime
import com.compahunt.annotation.OpenAIEmbedding
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
    @OpenAIEmbedding val embeddingService: EmbeddingService
) {

    val log = LoggerFactory.getLogger(this::class.java)
    val SIMILARITY_THRESHOLD = 0.8

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

    @LogExecutionTime
    fun isJobRelated(emailEmbedding: FloatArray): Boolean {

        val datasetEmails = emailEmbeddingRepository.findAll();

        val maxSim = datasetEmails.maxOfOrNull { datasetEmail ->
            val curSim = embeddingService.cosineSimilarity(
                datasetEmail.embedding.toArray(),
                emailEmbedding)

            // TODO: delete logging or change to debug
            log.info("Cosine similarity with email id ${datasetEmail.id} is $curSim")

            curSim;
       } ?: 0.0

        return maxSim > SIMILARITY_THRESHOLD;
    }


}