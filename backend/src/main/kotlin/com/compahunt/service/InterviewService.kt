package com.compahunt.service

import com.compahunt.dto.CreateInterviewRequest
import com.compahunt.dto.InterviewResponse
import com.compahunt.dto.UpdateInterviewRequest
import com.compahunt.mapper.InterviewMapper
import com.compahunt.model.Interview
import com.compahunt.repository.InterviewRepository
import com.compahunt.repository.VacancyRepository
import com.compahunt.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional
class InterviewService(
    private val interviewRepository: InterviewRepository,
    private val vacancyRepository: VacancyRepository,
    private val userRepository: UserRepository,
    private val interviewMapper: InterviewMapper
) {

    fun createInterview(request: CreateInterviewRequest, userId: Long): InterviewResponse {
        val vacancy = vacancyRepository.findById(request.vacancyId)
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
        
        return interviewMapper.toResponse(savedInterview)
    }

    fun updateInterview(interviewId: Long, request: UpdateInterviewRequest, userId: Long): InterviewResponse {
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
            updatedAt = java.time.LocalDateTime.now()
        )
        
        val savedInterview = interviewRepository.save(updatedInterview)
        return interviewMapper.toResponse(savedInterview)
    }

    fun getAllInterviews(userId: Long): List<InterviewResponse> {
        val user = userRepository.findById(userId)
            .orElseThrow { IllegalArgumentException("User not found") }

        return interviewRepository.findByUserIdOrderByScheduledAtAsc(userId)
            .map { interviewMapper.toResponse(it) }
    }

    fun getInterviewsByVacancy(vacancyId: Long, userId: Long): List<InterviewResponse> {
        val vacancy = vacancyRepository.findById(vacancyId)
            .orElseThrow { IllegalArgumentException("Vacancy not found") }

        // Verify that the vacancy belongs to the user
        if (vacancy.user.id != userId) {
            throw IllegalArgumentException("Access denied")
        }

        return interviewRepository.findByVacancyIdOrderByScheduledAtAsc(vacancyId)
            .map { interviewMapper.toResponse(it) }
    }

    fun deleteInterview(interviewId: Long, userId: Long): Boolean {
        val interview = interviewRepository.findById(interviewId)
            .orElseThrow { IllegalArgumentException("Interview not found") }

        // Verify that the interview belongs to the user
        if (interview.user.id != userId) {
            throw IllegalArgumentException("Access denied")
        }

        interviewRepository.delete(interview)
        return true
    }
}