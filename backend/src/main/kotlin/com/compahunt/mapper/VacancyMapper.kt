package com.compahunt.mapper

import com.compahunt.dto.CompanyResponse
import com.compahunt.dto.VacancyResponse
import com.compahunt.model.Vacancy
import com.compahunt.util.formatSalaryToString
import org.mapstruct.Mapper
import org.mapstruct.Mapping
import org.springframework.stereotype.Component
import java.util.UUID

@Mapper(componentModel = "spring")
@Component
interface VacancyMapper {

    @Mapping(target = "company", expression = "java(mapCompany(vacancy.getCompany()))")
    @Mapping(target = "appliedAt", expression = "java(vacancy.getAppliedAt().toString())")
    @Mapping(target = "salary", expression = "java(formatSalaryToString(vacancy.getSalary()))")
    @Mapping(target = "createdAt", expression = "java(vacancy.getCreatedAt().toString())")
    @Mapping(target = "updatedAt", expression = "java(vacancy.getUpdatedAt().toString())")
    @Mapping(target = "lastUpdated", expression = "java(vacancy.getUpdatedAt().toString())")
    fun toResponse(vacancy: Vacancy): VacancyResponse

    fun mapCompany(company: com.compahunt.model.Company): CompanyResponse {
        return CompanyResponse(
            id = company.id,
            name = company.name,
            description = company.description,
            websiteUrl = company.websiteUrl,
            logoUrl = company.logoUrl
        )
    }

    fun formatSalaryToString(salary: com.compahunt.model.Salary?): String? {
        return com.compahunt.util.formatSalaryToString(salary)
    }
}