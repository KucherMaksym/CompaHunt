package com.compahunt.service

import com.compahunt.annotation.OpenAIEmbedding
import com.compahunt.dto.VacancyShort
import com.compahunt.mapper.VacancyMapper
import com.compahunt.model.VacancyFieldChanges
import com.compahunt.model.VacancyStatus
import com.compahunt.repository.VacancyRepository
import com.compahunt.service.embedding.EmbeddingService
import org.springframework.ai.chat.client.ChatClient
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class AIService(
    @OpenAIEmbedding private val embeddingService: EmbeddingService,
    private val vacancyRepository: VacancyRepository,
    private val chatClient: ChatClient,
    private val vacancyMapper: VacancyMapper
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

    fun extractEmailData(emailText: String, userId: UUID): VacancyFieldChanges {

        // Fetch user's active vacancies to determine what vacancy to update
        val activeVacancyStatuses = listOf(
            VacancyStatus.PHONE_SCREEN,
            VacancyStatus.INTERVIEW,
            VacancyStatus.APPLIED
        )
        val userActiveVacancies = vacancyRepository.findByUserIdAndStatusIn(userId, activeVacancyStatuses);
        val activeVacanciesShort: List<VacancyShort> = userActiveVacancies.map { vacancy -> vacancyMapper.toShort(vacancy) }

        return chatClient.prompt()
            .user(buildPrompt(emailText, activeVacanciesShort))
            .call()
            .entity(VacancyFieldChanges::class.java)
            ?: VacancyFieldChanges(
                vacancyId = "",
                isJobRelated = false,
            );
    }


}