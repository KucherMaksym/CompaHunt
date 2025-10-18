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
import java.util.UUID

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

//        emailEmbeddingRepository.save(emailEmbedding)

        return emailEmbedding;
    }

    fun generateBatchEmbeddings(emails: List<EmailCSV>): List<EmailEmbedding> {
        val formattedTexts = emails.map { email ->
            """
                Subject: ${email.subject}

                ${email.body}
            """.trimIndent()
        }

        val embeddings: List<List<Float>> = embeddingService.generateBatchEmbeddings(formattedTexts)

        return emails.zip(embeddings).map { (email, embedding) ->
            EmailEmbedding(
                embedding = PGvector(embedding.toFloatArray()),
                body = email.body,
                subject = email.subject
            )
        }
    }

    fun generateAndSaveEmbedding(email: EmailCSV): EmailEmbedding {

        val emailEmbedding = generateEmbedding(email)

        emailEmbeddingRepository.save(emailEmbedding)

        return emailEmbedding;
    }

    fun generateAndSaveBatchEmbedding(emails: List<EmailCSV>): List<EmailEmbedding> {

        val emailEmbeddings = generateBatchEmbeddings(emails)

        emailEmbeddingRepository.saveAll(emailEmbeddings)

        return emailEmbeddings;
    }

    @LogExecutionTime
    fun isJobRelated(emailEmbedding: FloatArray): Boolean {

        val datasetEmails = emailEmbeddingRepository.findAll()

        var maxSim = 0.0
        var mostSimilarEmailId: UUID? = null

        datasetEmails.forEach { datasetEmail ->
            val curSim = embeddingService.cosineSimilarity(
                datasetEmail.embedding.toArray(),
                emailEmbedding)

            if (curSim > maxSim) {
                maxSim = curSim
                mostSimilarEmailId = datasetEmail.id
            }
        }

        log.info("Most similar email id: $mostSimilarEmailId with similarity: $maxSim")

        return maxSim > SIMILARITY_THRESHOLD
    }


}