package com.compahunt.service

import com.compahunt.dto.CreateInterviewRequest
import com.compahunt.dto.InterviewResponse
import com.compahunt.dto.InterviewWithVacancyResponse
import com.compahunt.dto.UpdateInterviewRequest
import com.compahunt.mapper.InterviewMapper
import com.compahunt.model.Interview
import com.compahunt.model.InterviewStatus
import com.compahunt.repository.InterviewRepository
import com.compahunt.repository.VacancyRepository
import com.compahunt.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.*

@Service
@Transactional
class InterviewService(
    private val interviewRepository: InterviewRepository,
    private val vacancyRepository: VacancyRepository,
    private val userRepository: UserRepository,
    private val interviewMapper: InterviewMapper,
    private val pendingEventService: PendingEventService
) {

    private val logger = LoggerFactory.getLogger(javaClass)

    fun createInterview(request: CreateInterviewRequest, userId: UUID): InterviewResponse {
        val vacancyId = request.vacancyId ?: throw IllegalArgumentException("Vacancy ID is required")
        val vacancy = vacancyRepository.findById(vacancyId)
            .orElseThrow { IllegalArgumentException("Vacancy not found") }
        
        val user = userRepository.findById(userId)
            .orElseThrow { IllegalArgumentException("User not found") }

        // Verify that the vacancy belongs to the user
        if (vacancy.user.id != userId) {
            throw IllegalArgumentException("Access denied")
        }

        val interview = Interview(
            vacancy = vacancy,
            user = user,
            scheduledAt = request.scheduledAt,
            type = request.type,
            notes = request.notes,
            duration = request.duration,
            meetingLink = request.meetingLink,
            location = request.location,
            interviewerName = request.interviewerName,
            interviewerEmail = request.interviewerEmail
        )
        val savedInterview = interviewRepository.save(interview)
        
        // Schedule feedback job for when interview ends
        try {
            pendingEventService.scheduleInterviewFeedbackJob(savedInterview)
        } catch (e: Exception) {
            // Log error but don't fail the interview creation
            println("Failed to schedule interview feedback job for interview ${savedInterview.id}: ${e.message}")
        }
        
        return interviewMapper.toResponse(savedInterview)
    }

    fun updateInterview(interviewId: UUID, request: UpdateInterviewRequest, userId: UUID): InterviewResponse {
        val interview = interviewRepository.findById(interviewId)
            .orElseThrow { IllegalArgumentException("Interview not found") }

        // Verify that the interview belongs to the user
        if (interview.user.id != userId) {
            throw IllegalArgumentException("Access denied")
        }

        val updatedInterview = interview.copy(
            scheduledAt = request.scheduledAt ?: interview.scheduledAt,
            type = request.type ?: interview.type,
            status = request.status ?: interview.status,
            notes = request.notes ?: interview.notes,
            feedback = request.feedback ?: interview.feedback,
            duration = request.duration ?: interview.duration,
            meetingLink = request.meetingLink ?: interview.meetingLink,
            location = request.location ?: interview.location,
            interviewerName = request.interviewerName ?: interview.interviewerName,
            interviewerEmail = request.interviewerEmail ?: interview.interviewerEmail,
            updatedAt = java.time.Instant.now()
        )
        
        val savedInterview = interviewRepository.save(updatedInterview)
        
        // Handle job rescheduling if interview time or duration changed
        val timeChanged = request.scheduledAt != null && request.scheduledAt != interview.scheduledAt
        val durationChanged = request.duration != null && request.duration != interview.duration
        val statusChanged = request.status != null && request.status != interview.status
        
        if (timeChanged || durationChanged || statusChanged) {
            try {
                if (statusChanged && savedInterview.status.isCompletedOrCancelled()) {
                    // Cancel feedback job if interview is completed/cancelled
                    savedInterview.id?.let { pendingEventService.cancelInterviewFeedbackJob(it) }
                } else if (timeChanged || durationChanged) {
                    // Reschedule feedback job with new time
                    pendingEventService.scheduleInterviewFeedbackJob(savedInterview)
                }
            } catch (e: Exception) {
                // Log error but don't fail the update
                println("Failed to update interview feedback job for interview ${savedInterview.id}: ${e.message}")
            }
        }
        
        return interviewMapper.toResponse(savedInterview)
    }

    fun getAllInterviews(userId: UUID): List<InterviewResponse> {
        val user = userRepository.findById(userId)
            .orElseThrow { IllegalArgumentException("User not found") }

        return interviewRepository.findByUserIdOrderByScheduledAtAsc(userId)
            .map { interviewMapper.toResponse(it) }
    }

    fun getAllInterviewsWithVacancies(userId: UUID): List<InterviewWithVacancyResponse> {
        val user = userRepository.findById(userId)
            .orElseThrow { IllegalArgumentException("User not found") }

        return interviewRepository.findByUserIdOrderByScheduledAtAsc(userId)
            .map { interviewMapper.toResponseWithVacancy(it) }
    }

    fun getInterviewsByVacancy(vacancyId: UUID, userId: UUID): List<InterviewResponse> {
        val vacancy = vacancyRepository.findById(vacancyId)
            .orElseThrow { IllegalArgumentException("Vacancy not found") }

        // Verify that the vacancy belongs to the user
        if (vacancy.user.id != userId) {
            throw IllegalArgumentException("Access denied")
        }

        return interviewRepository.findByVacancyIdOrderByScheduledAtAsc(vacancyId)
            .map { interviewMapper.toResponse(it) }
    }

    fun deleteInterview(interviewId: UUID, userId: UUID): Boolean {
        val interview = interviewRepository.findById(interviewId)
            .orElseThrow { IllegalArgumentException("Interview not found") }

        // Verify that the interview belongs to the user
        if (interview.user.id != userId) {
            throw IllegalArgumentException("Access denied")
        }

        // Cancel any scheduled feedback job
        try {
            pendingEventService.cancelInterviewFeedbackJob(interviewId)
        } catch (e: Exception) {
            // Log error but continue with deletion
            println("Failed to cancel interview feedback job for interview $interviewId: ${e.message}")
        }
        
        interviewRepository.delete(interview)
        return true
    }
    
    // Extension function for InterviewStatus
    private fun InterviewStatus.isCompletedOrCancelled(): Boolean {
        return this == InterviewStatus.COMPLETED ||
               this == InterviewStatus.CANCELLED ||
               this == InterviewStatus.NO_SHOW
    }
}