package com.compahunt.service

import com.compahunt.annotation.OpenAIEmbedding
import com.compahunt.dto.VacancyShort
import com.compahunt.mapper.VacancyMapper
import com.compahunt.model.LLMEmailClassificationAudit
import com.compahunt.model.VacancyFieldChanges
import com.compahunt.model.VacancyStatus
import com.compahunt.repository.LLMEmailClassificationAuditRepository
import com.compahunt.repository.VacancyRepository
import com.compahunt.service.embedding.EmbeddingService
import com.fasterxml.jackson.databind.ObjectMapper
import org.slf4j.LoggerFactory
import org.springframework.ai.chat.client.ChatClient
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class AIService(
    @OpenAIEmbedding private val embeddingService: EmbeddingService,
    private val vacancyRepository: VacancyRepository,
    private val chatClient: ChatClient,
    private val vacancyMapper: VacancyMapper,
    private val auditRepository: LLMEmailClassificationAuditRepository,
    private val objectMapper: ObjectMapper
) {

    private val log = LoggerFactory.getLogger(AIService::class.java)

    companion object {
        val EMAIL_DATA_EXTRACTION_PROMPT = """
        Analyze this email to determine if it's related to a job application and extract relevant information.

        Instructions:
        1. First, determine if this email is job-related (from a recruiter or company about a job application).
           - If NOT job-related (newsletters, spam, social notifications, personal emails) → set jobRelated = false
           - If job-related → set jobRelated = true and extract available information

        2. For job-related emails, extract:
           - Any status changes mentioned (e.g., application received, moving to interview, rejection, offer)
           - Interview scheduling details if an interview is being scheduled or proposed
        
        3. Based on the vacancy title and company name from email, determine:
           - which job (from the list below) this email refers to. Return the vacancyId of the relevant job.
           - if there is no relevant vacancy in the list, return empty string for vacancyId.

        Guidelines:
        - Extract only information explicitly stated in the email
        - Don't infer or hallucinate missing information
        - Support multiple languages (English, Russian, etc.)

        Analyze the following email:
    """.trimIndent()

        fun buildPrompt(emailText: String, userVacancies: List<VacancyShort>): String {
            return """
            $EMAIL_DATA_EXTRACTION_PROMPT
            
            ---
            $emailText
            ---
            
            relevant vacancies:
            ---
            ${userVacancies.joinToString(separator = "\n") { vacancy ->
                "- vacancyId: ${vacancy.id}, title: ${vacancy.title}, company: ${vacancy.companyName}"
            }}
            ---
        """.trimIndent()
        }
    }

    fun extractEmailData(emailText: String, userId: UUID, emailSubject: String = ""): VacancyFieldChanges {

        // Fetch user's active vacancies to determine what vacancy to update
        val activeVacancyStatuses = listOf(
            VacancyStatus.PHONE_SCREEN,
            VacancyStatus.INTERVIEW,
            VacancyStatus.APPLIED
        )
        val userActiveVacancies = vacancyRepository.findByUserIdAndStatusIn(userId, activeVacancyStatuses);
        val activeVacanciesShort: List<VacancyShort> = userActiveVacancies.map { vacancy -> vacancyMapper.toShort(vacancy) }

        val prompt = buildPrompt(emailText, activeVacanciesShort)

        var errorMessage: String? = null

        val result: VacancyFieldChanges = try {
            log.info("Calling LLM for email classification. Subject: '$emailSubject'")

            // Call LLM with entity mapping in the chain
            // Spring AI will automatically add JSON schema to the prompt
            val parsedResult = chatClient.prompt()
                .user(prompt)
                .call()
                .entity(VacancyFieldChanges::class.java)

            if (parsedResult == null) {
                log.warn("LLM returned null entity for email: $emailSubject")
                VacancyFieldChanges(
                    vacancyId = "",
                    jobRelated = false,
                )
            } else {
                log.info("LLM classification result: jobRelated=${parsedResult.jobRelated}, vacancyId=${parsedResult.vacancyId}")
                parsedResult
            }
        } catch (e: Exception) {
            log.error("Error calling LLM for email classification: ${e.message}", e)
            errorMessage = "${e::class.simpleName}: ${e.message}"
            VacancyFieldChanges(
                vacancyId = "",
                jobRelated = false,
            )
        }

        // Save audit record
        try {
            val audit = LLMEmailClassificationAudit(
                userId = userId,
                emailSubject = emailSubject,
                emailBody = emailText,
                promptSent = prompt,
                extractedVacancyId = result.vacancyId.ifEmpty { null },
                isJobRelated = result.jobRelated,
                fieldChanges = if (result.changes.isNotEmpty()) {
                    objectMapper.writeValueAsString(result.changes)
                } else null,
                interviewAssignment = result.interviewAssignment?.let {
                    objectMapper.writeValueAsString(it)
                },
                availableVacancies = objectMapper.writeValueAsString(activeVacanciesShort),
                llmRawResponse = errorMessage
            )
            auditRepository.save(audit)
            log.info("Saved LLM classification audit for email: $emailSubject")
        } catch (e: Exception) {
            // Don't fail the main flow if audit save fails
            log.error("Failed to save LLM email classification audit: ${e.message}", e)
        }

        return result
    }


}