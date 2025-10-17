package com.compahunt.mapper

import com.compahunt.dto.InterviewResponse
import com.compahunt.dto.InterviewWithVacancyResponse
import com.compahunt.model.Interview
import org.springframework.stereotype.Component

@Component
class InterviewMapper(
    private val vacancyMapper: VacancyMapper
) {

    fun toResponse(interview: Interview): InterviewResponse {
        return InterviewResponse(
            id = interview.id,
            vacancyId = interview.vacancy.id,
            vacancyTitle = interview.vacancy.title,
            companyName = interview.vacancy.company.name,
            scheduledAt = interview.scheduledAt.toString(),
            type = interview.type,
            status = interview.status,
            notes = interview.notes,
            feedback = interview.feedback,
            duration = interview.duration,
            meetingLink = interview.meetingLink,
            location = interview.location,
            interviewerName = interview.interviewerName,
            interviewerEmail = interview.interviewerEmail,
            createdAt = interview.createdAt.toString(),
            updatedAt = interview.updatedAt.toString()
        )
    }

    fun toResponseWithVacancy(interview: Interview): InterviewWithVacancyResponse {
        return InterviewWithVacancyResponse(
            id = interview.id,
            vacancy = vacancyMapper.toResponse(interview.vacancy),
            companyName = interview.vacancy.company.name,
            scheduledAt = interview.scheduledAt.toString(),
            type = interview.type,
            status = interview.status,
            notes = interview.notes,
            feedback = interview.feedback,
            duration = interview.duration,
            meetingLink = interview.meetingLink,
            location = interview.location,
            interviewerName = interview.interviewerName,
            interviewerEmail = interview.interviewerEmail,
            createdAt = interview.createdAt.toString(),
            updatedAt = interview.updatedAt.toString()
        )
    }
}