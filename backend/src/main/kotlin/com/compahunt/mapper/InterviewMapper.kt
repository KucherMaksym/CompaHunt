package com.compahunt.mapper

import com.compahunt.dto.CreateInterviewRequest
import com.compahunt.dto.InterviewResponse
import com.compahunt.dto.UpdateInterviewRequest
import com.compahunt.model.Interview
import com.compahunt.model.User
import com.compahunt.model.Vacancy
import org.mapstruct.Mapper
import org.mapstruct.Mapping
import org.mapstruct.Named
import org.springframework.stereotype.Component
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Mapper(componentModel = "spring")
@Component
interface InterviewMapper {

    @Mapping(target = "vacancyId", source = "vacancy.id")
    @Mapping(target = "vacancyTitle", source = "vacancy.title")
    @Mapping(target = "companyName", source = "vacancy.company.name")
    fun toResponse(interview: Interview): InterviewResponse
}