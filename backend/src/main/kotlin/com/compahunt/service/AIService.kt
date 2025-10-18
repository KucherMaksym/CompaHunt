package com.compahunt.service

import com.compahunt.annotation.OpenAIEmbedding
import com.compahunt.model.VacancyFieldChanges
import com.compahunt.service.embedding.EmbeddingService
import org.springframework.ai.chat.client.ChatClient
import org.springframework.stereotype.Service

@Service
class AIService(
    @OpenAIEmbedding val embeddingService: EmbeddingService,
    val chatClient: ChatClient
) {

    companion object {
        val EMAIL_DATA_EXTRACTION_PROMPT = """
        Analyze this email to determine if it's related to a job application and extract relevant information.

        Instructions:
        1. First, determine if this email is job-related (from a recruiter or company about a job application).
           - If NOT job-related (newsletters, spam, social notifications, personal emails) → set isJobRelated = false
           - If job-related → set isJobRelated = true and extract available information

        2. For job-related emails, extract:
           - Any status changes mentioned (e.g., application received, moving to interview, rejection, offer)
           - Interview scheduling details if an interview is being scheduled or proposed

        Guidelines:
        - Extract only information explicitly stated in the email
        - Don't infer or hallucinate missing information
        - Support multiple languages (English, Russian, etc.)

        Analyze the following email:
    """.trimIndent()

        fun buildPrompt(emailText: String): String {
            return """
            $EMAIL_DATA_EXTRACTION_PROMPT
            
            ---
            $emailText
            ---
        """.trimIndent()
        }
    }

    fun extractEmailData(emailText: String): VacancyFieldChanges {
        return chatClient.prompt()
            .user(buildPrompt(emailText))
            .call()
            .entity(VacancyFieldChanges::class.java)
            ?: VacancyFieldChanges(
                isJobRelated = false,
            );
    }


}