package com.compahunt.dto

import com.compahunt.model.Salary
import com.compahunt.model.VacancyStatus
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import java.time.LocalDateTime

data class CreateVacancyRequest(
    @field:NotBlank(message = "Title is required")
    val title: String,

    @field:NotBlank(message = "Company name is required")
    val company: String,

    @field:NotBlank(message = "Location is required")
    val location: String,

    val jobType: String? = null,

    val experienceLevel: String? = null,

    @field:NotBlank(message = "Description is required")
    val description: String,

    val requirements: List<String> = listOf(),

    val skills: List<String> = listOf(),

    val status: VacancyStatus = VacancyStatus.APPLIED,

    val postedDate: String? = null,

    val applicantCount: Int? = null,

    val url: String,

    val salary: Salary? = null,

    val remoteness: String? = null,

    val industry: String? = null,

    val benefits: String? = null,

    val workType: String? = null,

    val experience: String? = null,

    val manual: Boolean = false
)

data class UpdateVacancyRequest(
    val title: String? = null,
    val company: String? = null,
    val location: String? = null,
    val jobType: String? = null,
    val experienceLevel: String? = null,
    val description: String? = null,
    val requirements: List<String>? = null,
    val skills: List<String>? = null,
    val status: VacancyStatus? = null,
    val postedDate: String? = null,
    val applicantCount: Int? = null,
    val salary: Salary? = null,
    val remoteness: String? = null,
    val industry: String? = null,
    val benefits: String? = null,
    val workType: String? = null,
    val experience: String? = null,
    val reason: String? = null
)

data class VacancyResponse(
    val id: Long,
    val title: String,
    val company: CompanyResponse,
    val location: String,
    val jobType: String?,
    val experienceLevel: String?,
    val description: String,
    val requirements: List<String>,
    val skills: List<String>,
    val status: VacancyStatus,
    val appliedAt: String,
    val postedDate: String?,
    val applicantCount: Int?,
    val url: String,
    val salary: String?,
    val remoteness: String?,
    val industry: String?,
    val benefits: String?,
    val workType: String?,
    val experience: String?,
    val manual: Boolean,
    val createdAt: String,
    val updatedAt: String,
    val lastUpdated: String?
)

data class CompanyResponse(
    val id: Long,
    val name: String,
    val description: String?,
    val websiteUrl: String?,
    val logoUrl: String?
)

data class VacancyAuditResponse(
    val id: Long,
    val vacancyId: Long,
    val userId: Long,
    val action: String,
    val fieldName: String?,
    val oldValue: String?,
    val newValue: String?,
    val changes: String?,
    val timestamp: String,
    val reason: String?,
    val userAgent: String?,
    val ipAddress: String?
)


data class CreateNoteRequest(
    val vacancyId: Long,
    val content: String,
    val type: String,
    val priority: String = "MEDIUM",
    val tags: String? = null,
    val isPrivate: Boolean = false
)

data class UpdateNoteRequest(
    val content: String? = null,
    val type: String? = null,
    val priority: String? = null,
    val tags: String? = null,
    val isPrivate: Boolean? = null
)

data class UpdateStatusRequest(
    val status: VacancyStatus
)