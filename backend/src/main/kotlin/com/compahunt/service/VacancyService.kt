package com.compahunt.service

import com.compahunt.dto.*
import com.compahunt.model.*
import com.compahunt.repository.VacancyRepository
import com.compahunt.repository.CompanyRepository
import com.compahunt.repository.VacancyAuditRepository
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import jakarta.persistence.EntityNotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Service
@Transactional
class VacancyService(
    private val vacancyRepository: VacancyRepository,
    private val companyRepository: CompanyRepository,
    private val vacancyAuditRepository: VacancyAuditRepository
) {

    private val objectMapper = jacksonObjectMapper()
    private val dateFormatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME

    fun createVacancy(request: CreateVacancyRequest): VacancyResponse {
        if (vacancyRepository.findByUrl(request.url).isPresent) {
            throw IllegalArgumentException("Vacancy with this URL already exists")
        }

        val company = findOrCreateCompany(request.company)

        val vacancy = Vacancy(
            title = request.title,
            company = company,
            location = request.location,
            jobType = request.jobType,
            experienceLevel = request.experienceLevel,
            description = request.description,
            requirements = request.requirements,
            skills = request.skills,
            postedDate = request.postedDate,
            applicantCount = request.applicantCount,
            url = request.url,
            salary = request.salary,
            remoteness = request.remoteness,
            industry = request.industry
        )

        val savedVacancy = vacancyRepository.save(vacancy)

        createAuditRecord(
            vacancyId = savedVacancy.id,
            action = AuditAction.CREATED,
            changes = objectMapper.writeValueAsString(savedVacancy)
        )

        return mapToVacancyResponse(savedVacancy)
    }

    @Transactional(readOnly = true)
    fun getVacancy(id: Long): VacancyResponse {
        val vacancy = vacancyRepository.findById(id)
            .orElseThrow { EntityNotFoundException("Vacancy not found with id: $id") }
        return mapToVacancyResponse(vacancy)
    }

    @Transactional(readOnly = true)
    fun getAllVacancies(): List<VacancyResponse> {
        return vacancyRepository.findAll().map { mapToVacancyResponse(it) }
    }

    fun updateVacancy(id: Long, request: UpdateVacancyRequest): VacancyResponse {
        val existingVacancy = vacancyRepository.findById(id)
            .orElseThrow { EntityNotFoundException("Vacancy not found with id: $id") }

        val oldValues = mutableMapOf<String, Any?>()
        val changes = mutableListOf<String>()

        val updatedVacancy = existingVacancy.copy(
            title = request.title?.also {
                if (it != existingVacancy.title) {
                    oldValues["title"] = existingVacancy.title
                    changes.add("title: '${existingVacancy.title}' -> '$it'")
                }
            } ?: existingVacancy.title,

            location = request.location?.also {
                if (it != existingVacancy.location) {
                    oldValues["location"] = existingVacancy.location
                    changes.add("location: '${existingVacancy.location}' -> '$it'")
                }
            } ?: existingVacancy.location,

            jobType = request.jobType?.also {
                if (it != existingVacancy.jobType) {
                    oldValues["jobType"] = existingVacancy.jobType
                    changes.add("jobType: '${existingVacancy.jobType}' -> '$it'")
                }
            } ?: existingVacancy.jobType,

            experienceLevel = request.experienceLevel?.also {
                if (it != existingVacancy.experienceLevel) {
                    oldValues["experienceLevel"] = existingVacancy.experienceLevel
                    changes.add("experienceLevel: '${existingVacancy.experienceLevel}' -> '$it'")
                }
            } ?: existingVacancy.experienceLevel,

            description = request.description?.also {
                if (it != existingVacancy.description) {
                    oldValues["description"] = existingVacancy.description
                    changes.add("description: updated")
                }
            } ?: existingVacancy.description,

            requirements = request.requirements?.also {
                if (it != existingVacancy.requirements) {
                    oldValues["requirements"] = existingVacancy.requirements
                    changes.add("requirements: updated")
                }
            } ?: existingVacancy.requirements,

            skills = request.skills?.also {
                if (it != existingVacancy.skills) {
                    oldValues["skills"] = existingVacancy.skills
                    changes.add("skills: updated")
                }
            } ?: existingVacancy.skills,

            postedDate = request.postedDate ?: existingVacancy.postedDate,
            applicantCount = request.applicantCount ?: existingVacancy.applicantCount,
            salary = request.salary ?: existingVacancy.salary,
            remoteness = request.remoteness ?: existingVacancy.remoteness,
            industry = request.industry ?: existingVacancy.industry,
            updatedAt = LocalDateTime.now()
        )

        val savedVacancy = vacancyRepository.save(updatedVacancy)

        // Create audit for every change
        if (changes.isNotEmpty()) {
            createAuditRecord(
                vacancyId = savedVacancy.id,
                action = AuditAction.UPDATED,
                changes = changes.joinToString("; "),
                reason = request.reason
            )
        }

        return mapToVacancyResponse(savedVacancy)
    }

    fun archiveVacancy(id: Long, reason: String? = null): Boolean {
        val vacancy = vacancyRepository.findById(id)
            .orElseThrow { EntityNotFoundException("Vacancy not found with id: $id") }

        val updatedCount = vacancyRepository.softDelete(id)

        if (updatedCount > 0) {
            // Create audit record
            createAuditRecord(
                vacancyId = id,
                action = AuditAction.ARCHIVED,
                reason = reason ?: "Archived by user"
            )
            return true
        }
        return false
    }

    @Transactional(readOnly = true)
    fun getVacancyAuditHistory(vacancyId: Long): List<VacancyAuditResponse> {
        return vacancyAuditRepository.findAuditHistory(vacancyId)
            .map { mapToVacancyAuditResponse(it) }
    }

    @Transactional(readOnly = true)
    fun getArchivedVacancies(): List<VacancyResponse> {
        return vacancyRepository.findAllArchived()
            .map { mapToVacancyResponse(it) }
    }

    private fun findOrCreateCompany(companyName: String): Company {
        return companyRepository.findByName(companyName)
            .orElseGet {
                val newCompany = Company(name = companyName)
                companyRepository.save(newCompany)
            }
    }

    private fun createAuditRecord(
        vacancyId: Long,
        action: AuditAction,
        fieldName: String? = null,
        oldValue: String? = null,
        newValue: String? = null,
        changes: String? = null,
        reason: String? = null
    ) {
        val audit = VacancyAudit(
            vacancyId = vacancyId,
            action = action,
            fieldName = fieldName,
            oldValue = oldValue,
            newValue = newValue,
            changes = changes,
            reason = reason
        )
        vacancyAuditRepository.save(audit)
    }

    private fun mapToVacancyResponse(vacancy: Vacancy): VacancyResponse {
        return VacancyResponse(
            id = vacancy.id,
            title = vacancy.title,
            company = CompanyResponse(
                id = vacancy.company.id,
                name = vacancy.company.name,
                description = vacancy.company.description,
                websiteUrl = vacancy.company.websiteUrl,
                logoUrl = vacancy.company.logoUrl
            ),
            location = vacancy.location,
            jobType = vacancy.jobType,
            experienceLevel = vacancy.experienceLevel,
            description = vacancy.description,
            requirements = vacancy.requirements,
            skills = vacancy.skills,
            postedDate = vacancy.postedDate,
            applicantCount = vacancy.applicantCount,
            url = vacancy.url,
            salary = vacancy.salary,
            remoteness = vacancy.remoteness,
            industry = vacancy.industry,
            createdAt = vacancy.createdAt.format(dateFormatter),
            updatedAt = vacancy.updatedAt.format(dateFormatter)
        )
    }

    private fun mapToVacancyAuditResponse(audit: VacancyAudit): VacancyAuditResponse {
        return VacancyAuditResponse(
            id = audit.id,
            vacancyId = audit.vacancyId,
            action = audit.action.name,
            fieldName = audit.fieldName,
            oldValue = audit.oldValue,
            newValue = audit.newValue,
            changes = audit.changes,
            timestamp = audit.timestamp.format(dateFormatter),
            reason = audit.reason
        )
    }
}