package com.compahunt.service

import com.compahunt.dto.*
import com.compahunt.exception.*
import com.compahunt.model.*
import com.compahunt.repository.VacancyRepository
import com.compahunt.repository.CompanyRepository
import com.compahunt.repository.VacancyAuditRepository
import com.compahunt.repository.UserRepository
import com.compahunt.util.formatSalaryToString
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.LoggerFactory
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Service
@Transactional
class VacancyService(
    private val vacancyRepository: VacancyRepository,
    private val companyRepository: CompanyRepository,
    private val vacancyAuditRepository: VacancyAuditRepository,
    private val userRepository: UserRepository
) {

    private val log = LoggerFactory.getLogger(VacancyService::class.java)

    private val objectMapper = jacksonObjectMapper()
    private val dateFormatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME

    fun createVacancy(
        request: CreateVacancyRequest, 
        userId: Long, 
        httpRequest: HttpServletRequest
    ): VacancyResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { UnauthorizedException("User not found") }

        // Check for duplicate URL for this user
        if (request.url.trim().isNotEmpty() && vacancyRepository.findByUserIdAndUrl(userId, request.url).isPresent) {
            log.error("")
            throw DuplicateVacancyException("Vacancy with this URL already exists for user")
        }

        val company = findOrCreateCompany(request.company)

        val vacancy = Vacancy(
            title = request.title,
            company = company,
            user = user,
            location = request.location,
            jobType = request.jobType,
            experienceLevel = request.experienceLevel,
            description = request.description,
            htmlDescription = request.htmlDescription,
            requirements = request.requirements,
            skills = request.skills,
            status = request.status,
            postedDate = request.postedDate,
            applicantCount = request.applicantCount,
            url = request.url,
            salary = request.salary,
            remoteness = request.remoteness,
            industry = request.industry,
            benefits = request.benefits,
            workType = request.workType,
            experience = request.experience,
            manual = request.manual,
        )

        val savedVacancy = vacancyRepository.save(vacancy)

        // Create audit record
        createAuditRecord(
            vacancyId = savedVacancy.id,
            userId = userId,
            action = AuditAction.CREATED,
            reason = "Vacancy created",
            userAgent = httpRequest.getHeader("User-Agent"),
            ipAddress = getClientIpAddress(httpRequest)
        )

        return mapToVacancyResponse(savedVacancy)
    }

    fun getVacancy(id: Long, userId: Long): VacancyResponse {
        val vacancy = vacancyRepository.findByIdAndUserId(id, userId)
            .orElseThrow { VacancyNotFoundException("Vacancy not found or access denied") }
        
        return mapToVacancyResponse(vacancy)
    }

    fun getAllVacancies(userId: Long, status: VacancyStatus? = null, limit: Int? = null): List<VacancyResponse> {
        val vacancies = if (status != null) {
            vacancyRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, status)
        } else {
            vacancyRepository.findByUserIdOrderByCreatedAtDesc(userId)
        }
        
        val limitedVacancies = if (limit != null) {
            vacancies.take(limit)
        } else {
            vacancies
        }
        
        return limitedVacancies.map { mapToVacancyResponse(it) }
    }

    fun updateVacancy(
        id: Long, 
        request: UpdateVacancyRequest, 
        userId: Long, 
        httpRequest: HttpServletRequest
    ): VacancyResponse {
        val vacancy = vacancyRepository.findByIdAndUserId(id, userId)
            .orElseThrow { VacancyNotFoundException("Vacancy not found or access denied") }

        val oldVacancy = vacancy.copy()
        val company = request.company?.let { findOrCreateCompany(it) } ?: vacancy.company

        // Handle HTML description and sync plain text when HTML changes
        val newHtmlDescription = request.htmlDescription ?: vacancy.htmlDescription
        val newDescription = if (request.htmlDescription != null && request.htmlDescription != vacancy.htmlDescription) {
            // HTML description changed, convert to plain text
            htmlToPlainText(request.htmlDescription)
        } else {
            request.description ?: vacancy.description
        }

        val updatedVacancy = vacancy.copy(
            title = request.title ?: vacancy.title,
            company = company,
            location = request.location ?: vacancy.location,
            jobType = request.jobType ?: vacancy.jobType,
            experienceLevel = request.experienceLevel ?: vacancy.experienceLevel,
            description = newDescription,
            htmlDescription = newHtmlDescription,
            requirements = request.requirements ?: vacancy.requirements,
            skills = request.skills ?: vacancy.skills,
            status = request.status ?: vacancy.status,
            postedDate = request.postedDate ?: vacancy.postedDate,
            applicantCount = request.applicantCount ?: vacancy.applicantCount,
            salary = request.salary ?: vacancy.salary,
            remoteness = request.remoteness ?: vacancy.remoteness,
            industry = request.industry ?: vacancy.industry,
            benefits = request.benefits ?: vacancy.benefits,
            workType = request.workType ?: vacancy.workType,
            experience = request.experience ?: vacancy.experience,
            updatedAt = LocalDateTime.now()
        )

        val savedVacancy = vacancyRepository.save(updatedVacancy)

        // Create audit record for changes
        val changes = compareVacancies(oldVacancy, savedVacancy)
        if (changes.isNotEmpty()) {
            createAuditRecord(
                vacancyId = savedVacancy.id,
                userId = userId,
                action = AuditAction.UPDATED,
                changes = objectMapper.writeValueAsString(changes),
                reason = request.reason ?: "Vacancy updated",
                userAgent = httpRequest.getHeader("User-Agent"),
                ipAddress = getClientIpAddress(httpRequest)
            )
        }

        return mapToVacancyResponse(savedVacancy)
    }

    fun updateStatus(
        id: Long, 
        status: VacancyStatus, 
        userId: Long, 
        httpRequest: HttpServletRequest
    ): VacancyResponse {
        val vacancy = vacancyRepository.findByIdAndUserId(id, userId)
            .orElseThrow { VacancyNotFoundException("Vacancy not found or access denied") }

        if (vacancy.status == status) {
            return mapToVacancyResponse(vacancy)
        }

        val oldStatus = vacancy.status
        val updatedVacancy = vacancy.copy(
            status = status,
            updatedAt = LocalDateTime.now()
        )

        val savedVacancy = vacancyRepository.save(updatedVacancy)

        // Create audit record for status change
        createAuditRecord(
            vacancyId = savedVacancy.id,
            userId = userId,
            action = AuditAction.FIELD_CHANGED,
            fieldName = "status",
            oldValue = oldStatus.name,
            newValue = status.name,
            reason = "Status updated to ${status.name}",
            userAgent = httpRequest.getHeader("User-Agent"),
            ipAddress = getClientIpAddress(httpRequest)
        )

        return mapToVacancyResponse(savedVacancy)
    }

    fun archiveVacancy(
        id: Long, 
        userId: Long, 
        reason: String?, 
        httpRequest: HttpServletRequest
    ): Boolean {
        val vacancy = vacancyRepository.findByIdAndUserId(id, userId)
            .orElseThrow { VacancyNotFoundException("Vacancy not found or access denied") }

        val updatedVacancy = vacancy.copy(
            status = VacancyStatus.ARCHIVED,
            updatedAt = LocalDateTime.now()
        )

        vacancyRepository.save(updatedVacancy)

        // Create audit record
        createAuditRecord(
            vacancyId = id,
            userId = userId,
            action = AuditAction.ARCHIVED,
            reason = reason ?: "Vacancy archived",
            userAgent = httpRequest.getHeader("User-Agent"),
            ipAddress = getClientIpAddress(httpRequest)
        )

        return true
    }

    fun getAuditHistory(vacancyId: Long, userId: Long): List<VacancyAuditResponse> {
        // Verify user has access to this vacancy
        vacancyRepository.findByIdAndUserId(vacancyId, userId)
            .orElseThrow { VacancyNotFoundException("Vacancy not found or access denied") }

        val auditRecords = vacancyAuditRepository.findByVacancyIdOrderByTimestampDesc(vacancyId)
        return auditRecords.map { mapToVacancyAuditResponse(it) }
    }

    fun getArchivedVacancies(userId: Long): List<VacancyResponse> {
        val archivedVacancies = vacancyRepository.findArchivedByUserId(userId)
        return archivedVacancies.map { mapToVacancyResponse(it) }
    }

    private fun findOrCreateCompany(companyName: String): Company {
        return companyRepository.findByName(companyName)
            ?: companyRepository.save(Company(name = companyName))
    }

    private fun compareVacancies(old: Vacancy, new: Vacancy): Map<String, Map<String, Any?>> {
        val changes = mutableMapOf<String, Map<String, Any?>>()

        if (old.title != new.title) {
            changes["title"] = mapOf("old" to old.title, "new" to new.title)
        }
        if (old.company.name != new.company.name) {
            changes["company"] = mapOf("old" to old.company.name, "new" to new.company.name)
        }
        if (old.location != new.location) {
            changes["location"] = mapOf("old" to old.location, "new" to new.location)
        }
        if (old.status != new.status) {
            changes["status"] = mapOf("old" to old.status.name, "new" to new.status.name)
        }
        if (old.description != new.description) {
            changes["description"] = mapOf("old" to old.description, "new" to new.description)
        }
        if (old.htmlDescription != new.htmlDescription) {
            changes["htmlDescription"] = mapOf("old" to old.htmlDescription, "new" to new.htmlDescription)
        }
        if (old.salary != new.salary) {
            changes["salary"] = mapOf("old" to old.salary, "new" to new.salary)
        }

        return changes
    }

    private fun createAuditRecord(
        vacancyId: Long,
        userId: Long,
        action: AuditAction,
        fieldName: String? = null,
        oldValue: String? = null,
        newValue: String? = null,
        changes: String? = null,
        reason: String? = null,
        userAgent: String? = null,
        ipAddress: String? = null
    ) {
        val auditRecord = VacancyAudit(
            vacancyId = vacancyId,
            userId = userId,
            action = action,
            fieldName = fieldName,
            oldValue = oldValue,
            newValue = newValue,
            changes = changes,
            reason = reason,
            userAgent = userAgent,
            ipAddress = ipAddress
        )
        vacancyAuditRepository.save(auditRecord)
    }

    private fun getClientIpAddress(request: HttpServletRequest): String {
        val xForwardedFor = request.getHeader("X-Forwarded-For")
        return when {
            !xForwardedFor.isNullOrBlank() -> xForwardedFor.split(",")[0].trim()
            !request.getHeader("X-Real-IP").isNullOrBlank() -> request.getHeader("X-Real-IP")
            else -> request.remoteAddr
        }
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
            htmlDescription = vacancy.htmlDescription,
            requirements = vacancy.requirements,
            skills = vacancy.skills,
            status = vacancy.status,
            appliedAt = vacancy.appliedAt.format(dateFormatter),
            postedDate = vacancy.postedDate,
            applicantCount = vacancy.applicantCount,
            url = vacancy.url,
            salary = formatSalaryToString(vacancy.salary),
            remoteness = vacancy.remoteness,
            industry = vacancy.industry,
            benefits = vacancy.benefits,
            workType = vacancy.workType,
            experience = vacancy.experience,
            createdAt = vacancy.createdAt.format(dateFormatter),
            updatedAt = vacancy.updatedAt.format(dateFormatter),
            lastUpdated = vacancy.updatedAt.format(dateFormatter),
            manual = vacancy.manual
        )
    }

    private fun htmlToPlainText(html: String?): String {
        if (html.isNullOrBlank()) return ""
        
        return html
            .replace("<br\\s*/?>".toRegex(RegexOption.IGNORE_CASE), "\n")
            .replace("<li\\b[^>]*>".toRegex(RegexOption.IGNORE_CASE), "• ")
            .replace("<p\\b[^>]*>".toRegex(RegexOption.IGNORE_CASE), "\n")
            .replace("</p>", "\n")
            .replace("<[^>]+>".toRegex(), "")
            .replace("&nbsp;", " ")
            .replace("&amp;", "&")
            .replace("&lt;", "<")
            .replace("&gt;", ">")
            .replace("&quot;", "\"")
            .replace("&#39;", "'")
            .replace("\\s+".toRegex(), " ")
            .replace("\\n\\s*\\n".toRegex(), "\n")
            .trim()
    }

    private fun mapToVacancyAuditResponse(audit: VacancyAudit): VacancyAuditResponse {
        return VacancyAuditResponse(
            id = audit.id,
            vacancyId = audit.vacancyId,
            userId = audit.userId,
            action = audit.action.name,
            fieldName = audit.fieldName,
            oldValue = audit.oldValue,
            newValue = audit.newValue,
            changes = audit.changes,
            timestamp = audit.timestamp.format(dateFormatter),
            reason = audit.reason,
            userAgent = audit.userAgent,
            ipAddress = audit.ipAddress
        )
    }
}