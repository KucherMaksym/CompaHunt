package com.compahunt.service

import com.compahunt.dto.CreateInterviewRequest
import com.compahunt.model.*
import com.compahunt.repository.VacancyRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.*

@Service
@Transactional
class VacancyUpdateService(
    private val vacancyRepository: VacancyRepository,
    private val interviewService: InterviewService
) {

    private val log = LoggerFactory.getLogger(VacancyUpdateService::class.java)

    fun applyChangesToVacancy(vacancyId: UUID, userId: UUID, changes: VacancyFieldChanges) {
        val vacancy = vacancyRepository.findByIdAndUserId(vacancyId, userId)
            .orElseThrow { IllegalArgumentException("Vacancy not found or access denied") }

        val updatedVacancy = applyFieldChanges(vacancy, changes.changes)

        if (updatedVacancy != vacancy) {
            vacancyRepository.save(updatedVacancy)
            log.info("Updated vacancy $vacancyId with ${changes.changes.size} field changes")
        }

        changes.interviewAssignment?.let { interview ->
            createInterviewFromAI(vacancy, userId, interview)
        }
    }

    private fun applyFieldChanges(vacancy: Vacancy, fieldChanges: List<FieldChange>): Vacancy {
        var updated = vacancy

        fieldChanges.forEach { change ->
            log.info("Processing field: ${change.fieldName}, newValue: ${change.newValue}")
            updated = when (change.fieldName.lowercase()) {
                "status" -> updateStatus(updated, change.newValue)
                "location" -> updated.copy(location = change.newValue ?: updated.location)
                "jobtitle", "title" -> updated.copy(title = change.newValue ?: updated.title)
                "description" -> updated.copy(description = change.newValue ?: updated.description)
                "remoteness" -> updated.copy(remoteness = change.newValue)
                "experienceLevel", "experience_level" -> updated.copy(experienceLevel = change.newValue)
                "jobType", "job_type" -> updated.copy(jobType = change.newValue)
                else -> {
                    log.warn("Unknown field: ${change.fieldName}, skipping")
                    updated
                }
            }
        }

        return if (updated != vacancy) {
            updated.copy(updatedAt = Instant.now())
        } else {
            updated
        }
    }

    private fun updateStatus(vacancy: Vacancy, newValue: String?): Vacancy {
        if (newValue == null) return vacancy

        return try {
            val status = VacancyStatus.valueOf(newValue.uppercase())
            vacancy.copy(status = status)
        } catch (e: IllegalArgumentException) {
            log.warn("Invalid status value: $newValue, skipping")
            vacancy
        }
    }

    private fun createInterviewFromAI(vacancy: Vacancy, userId: UUID, interview: Interview) {
        try {
            log.info("Creating interview for vacancy ${vacancy.id} scheduled at ${interview.scheduledAt}")

            val createRequest = CreateInterviewRequest(
                vacancyId = vacancy.id,
                scheduledAt = interview.scheduledAt,
                type = interview.type,
                notes = interview.notes,
                duration = interview.duration,
                meetingLink = interview.meetingLink,
                location = interview.location,
                interviewerName = interview.interviewerName,
                interviewerEmail = interview.interviewerEmail
            )

            interviewService.createInterview(createRequest, userId)
            log.info("Successfully created interview for vacancy ${vacancy.id}")

        } catch (e: Exception) {
            log.error("Failed to create interview for vacancy ${vacancy.id}: ${e.message}", e)
        }
    }
}