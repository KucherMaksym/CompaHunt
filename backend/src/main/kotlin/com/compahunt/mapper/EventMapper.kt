package com.compahunt.mapper

import com.compahunt.dto.PendingEventDTO
import com.compahunt.dto.GroupedPendingEventsDTO
import com.compahunt.model.PendingEvent
import com.compahunt.model.Vacancy
import com.compahunt.model.Interview
import com.compahunt.model.InterviewType
import com.compahunt.model.VacancyStatus
import org.mapstruct.*
import java.util.UUID

@Mapper(componentModel = "spring")
interface EventMapper {

    @Mapping(target = "interviewId", source = "interview.id")
    @Mapping(target = "vacancyId", source = "vacancy.id")
    @Mapping(target = "interviewInfo", source = "interview", qualifiedByName = ["toInterviewInfo"])
    @Mapping(target = "vacancyInfo", source = "vacancy", qualifiedByName = ["toVacancyInfo"])
    fun toPendingEventDTO(event: PendingEvent): PendingEventDTO

    @Named("toInterviewInfo")
    @Mapping(target = "type", source = "type", qualifiedByName = ["interviewTypeToString"])
    fun toInterviewInfo(interview: Interview?): PendingEventDTO.InterviewInfo?

    @Named("toVacancyInfo")
    @Mapping(target = "companyName", source = "company.name")
    @Mapping(target = "status", source = "status", qualifiedByName = ["vacancyStatusToString"])
    fun toVacancyInfo(vacancy: Vacancy?): PendingEventDTO.VacancyInfo?

    @Named("interviewTypeToString")
    fun interviewTypeToString(type: InterviewType?): String? = type?.name

    @Named("vacancyStatusToString") 
    fun vacancyStatusToString(status: VacancyStatus?): String? = status?.name

    @Mapping(target = "vacancy", source = "vacancy", qualifiedByName = ["toVacancyInfo"])
    @Mapping(target = "events", source = "events")
    @Mapping(target = "totalCount", expression = "java(events.size())")
    fun toGroupedPendingEventsDTO(
        vacancy: Vacancy?,
        events: List<PendingEvent>
    ): GroupedPendingEventsDTO
}