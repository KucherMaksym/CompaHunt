package com.compahunt.mapper

import com.compahunt.dto.PendingEventDTO
import com.compahunt.dto.GroupedPendingEventsDTO
import com.compahunt.model.PendingEvent
import com.compahunt.model.Vacancy
import com.compahunt.model.Interview
import org.springframework.stereotype.Component

@Component
class EventMapper {

    fun toPendingEventDTO(event: PendingEvent): PendingEventDTO {
        return PendingEventDTO(
            id = event.id,
            eventType = event.eventType,
            eventSubtype = event.eventSubtype,
            title = event.title,
            description = event.description,
            priority = event.priority,
            interviewId = event.interview?.id,
            vacancyId = event.vacancy?.id,
            metadata = event.metadata,
            scheduledFor = event.scheduledFor,
            createdAt = event.createdAt,
            updatedAt = event.updatedAt,
            interviewInfo = toInterviewInfo(event.interview),
            vacancyInfo = toVacancyInfo(event.vacancy)
        )
    }

    fun toInterviewInfo(interview: Interview?): PendingEventDTO.InterviewInfo? {
        return interview?.let {
            PendingEventDTO.InterviewInfo(
                id = it.id,
                scheduledAt = it.scheduledAt,
                type = it.type.name,
                interviewerName = it.interviewerName,
                location = it.location,
                meetingLink = it.meetingLink
            )
        }
    }

    fun toVacancyInfo(vacancy: Vacancy?): PendingEventDTO.VacancyInfo? {
        return vacancy?.let {
            PendingEventDTO.VacancyInfo(
                id = it.id,
                title = it.title,
                companyName = it.company.name,
                location = it.location,
                status = it.status.name
            )
        }
    }

    fun toGroupedPendingEventsDTO(
        vacancy: Vacancy?,
        events: List<PendingEvent>
    ): GroupedPendingEventsDTO {
        return GroupedPendingEventsDTO(
            vacancy = toVacancyInfo(vacancy),
            events = events.map { toPendingEventDTO(it) },
            totalCount = events.size
        )
    }
}