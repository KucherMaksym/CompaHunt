package com.compahunt.mapper

import com.compahunt.dto.CompanyResponse
import com.compahunt.dto.VacancyResponse
import com.compahunt.dto.VacancyShort
import com.compahunt.model.Vacancy
import com.compahunt.util.formatSalaryToString
import org.springframework.stereotype.Component

@Component
class VacancyMapper {

    fun toResponse(vacancy: Vacancy): VacancyResponse {
        return VacancyResponse(
            id = vacancy.id,
            title = vacancy.title,
            company = mapCompany(vacancy.company),
            location = vacancy.location,
            jobType = vacancy.jobType,
            experienceLevel = vacancy.experienceLevel,
            description = vacancy.description,
            htmlDescription = vacancy.htmlDescription,
            requirements = vacancy.requirements,
            skills = vacancy.skills,
            status = vacancy.status,
            appliedAt = vacancy.appliedAt.toString(),
            postedDate = vacancy.postedDate,
            applicantCount = vacancy.applicantCount,
            url = vacancy.url,
            salary = formatSalaryToString(vacancy.salary),
            remoteness = vacancy.remoteness,
            industry = vacancy.industry,
            benefits = vacancy.benefits,
            experience = vacancy.experience,
            manual = vacancy.manual,
            createdAt = vacancy.createdAt.toString(),
            updatedAt = vacancy.updatedAt.toString(),
            lastUpdated = vacancy.updatedAt.toString()
        )
    }

    fun toShort(vacancy: Vacancy): VacancyShort {
        return VacancyShort(
            id = vacancy.id,
            title = vacancy.title,
            companyName = vacancy.company.name,
        )
    }

    private fun mapCompany(company: com.compahunt.model.Company): CompanyResponse {
        return CompanyResponse(
            id = company.id,
            name = company.name,
            description = company.description,
            websiteUrl = company.websiteUrl,
            logoUrl = company.logoUrl
        )
    }
}