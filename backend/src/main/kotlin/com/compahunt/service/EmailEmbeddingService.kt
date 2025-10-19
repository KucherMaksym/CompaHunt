package com.compahunt.service

import com.compahunt.annotation.LocalModelEmbedding
import com.compahunt.annotation.LogExecutionTime
import com.compahunt.annotation.OpenAIEmbedding
import com.compahunt.model.EmailCSV
import com.compahunt.model.EmailCategory
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

    // Scoring thresholds
    val SIMILARITY_THRESHOLD = 0.8
    val COMBINED_SCORE_THRESHOLD = 0.70  // Lower threshold since we're adding boost directly

    // Keyword patterns with boost values (directly added to embedding similarity)
    private val jobRelatedKeywords = mapOf(
        // High confidence phrases - strong indicators
        "thank you for your interest in" to 0.10,
        "we received your application" to 0.10,
        "your application for" to 0.10,
        "interview invitation" to 0.12,
        "screening call" to 0.10,
        "technical interview" to 0.12,
        "final round" to 0.12,
        "job offer" to 0.15,
        "offer letter" to 0.15,
        "background check" to 0.10,
        "start date" to 0.08,
        "onboarding" to 0.08,

        // Medium confidence keywords
        "application" to 0.05,
        "position" to 0.04,
        "interview" to 0.06,
        "resume" to 0.05,
        "cv" to 0.05,
        "candidate" to 0.05,
        "recruitment" to 0.05,
        "hiring" to 0.05,
        "hr team" to 0.05,
        "recruiter" to 0.05,
        "talent acquisition" to 0.05,
        "hiring manager" to 0.06,

        // Lower confidence keywords - can appear in non-job emails too
        "job" to 0.03,
        "vacancy" to 0.04,
        "role" to 0.03,
        "career" to 0.03,
        "opportunity" to 0.02,
        "qualified" to 0.02,
        "skills" to 0.02,
        "experience" to 0.02
    )

    // Negative keywords (spam/marketing indicators) - penalties
    private val negativeKeywords = mapOf(
        "unsubscribe" to -0.15,
        "click here" to -0.08,
        "limited time offer" to -0.12,
        "buy now" to -0.12,
        "free trial" to -0.08,
        "discount" to -0.06,
        "promotion" to -0.06,
        "newsletter" to -0.08,
        "marketing" to -0.06,
        "advertisement" to -0.08
    )

    fun generateEmbedding(email: EmailCSV): EmailEmbedding {

        val fullText = """
                ${email.subject}

                ${email.body}
        """.trimIndent()

        val embedding: List<Float>  = embeddingService.generateEmbedding(fullText)
        log.info("Embedding generated: $embedding")

        val emailEmbedding = EmailEmbedding(
            embedding = PGvector(embedding.toFloatArray()),
            body = email.body,
            subject = email.subject,
            category = EmailCategory.fromString(email.status)
        )

//        emailEmbeddingRepository.save(emailEmbedding)

        return emailEmbedding;
    }

    fun generateBatchEmbeddings(emails: List<EmailCSV>): List<EmailEmbedding> {
        val formattedTexts = emails.map { email ->
            """
                ${email.subject}

                ${email.body}
            """.trimIndent()
        }

        val embeddings: List<List<Float>> = embeddingService.generateBatchEmbeddings(formattedTexts)

        return emails.zip(embeddings).map { (email, embedding) ->
            EmailEmbedding(
                embedding = PGvector(embedding.toFloatArray()),
                body = email.body,
                subject = email.subject,
                category = EmailCategory.fromString(email.status)
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

    private fun calculateKeywordBoost(subject: String, body: String): Double {
        val fullText = "$subject $body".lowercase()
        var boost = 0.0
        val foundKeywords = mutableListOf<String>()

        // Add points for job-related keywords
        jobRelatedKeywords.forEach { (keyword, points) ->
            if (fullText.contains(keyword)) {
                boost += points
                foundKeywords.add("+$keyword")
            }
        }

        // Subtract points for spam/marketing keywords
        negativeKeywords.forEach { (keyword, points) ->
            if (fullText.contains(keyword)) {
                boost += points
                foundKeywords.add("-$keyword")
            }
        }

        // Cap the boost to reasonable limits
        val cappedBoost = boost.coerceIn(-0.3, 0.3)

        if (foundKeywords.isNotEmpty()) {
            log.info("Keywords found: ${foundKeywords.joinToString(", ")} | Boost: ${"%+.3f".format(cappedBoost)}")
        }

        return cappedBoost
    }

    private fun calculateCombinedScore(
        embeddingSimilarity: Double,
        keywordBoost: Double
    ): Double {
        return embeddingSimilarity + keywordBoost
    }

    @LogExecutionTime
    fun isJobRelated(emailEmbedding: FloatArray, subject: String, body: String): Boolean {

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

        // Calculate keyword-based boost (can be positive or negative)
        val keywordBoost = calculateKeywordBoost(subject, body)

        // Calculate combined score by adding boost to embedding similarity
        val combinedScore = calculateCombinedScore(maxSim, keywordBoost)

        log.info(
            "Email classification - " +
            "Subject: '$subject' | " +
            "Most similar: $mostSimilarEmailId | " +
            "Embedding: ${"%.3f".format(maxSim)} | " +
            "Keyword boost: ${"%+.3f".format(keywordBoost)} | " +
            "Combined: ${"%.3f".format(combinedScore)} | " +
            "Threshold: ${"%.3f".format(COMBINED_SCORE_THRESHOLD)} | " +
            "Result: ${if (combinedScore > COMBINED_SCORE_THRESHOLD) "JOB-RELATED" else "NOT job-related"}"
        )

        return combinedScore > COMBINED_SCORE_THRESHOLD
    }
}