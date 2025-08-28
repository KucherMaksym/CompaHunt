package com.compahunt.service

import com.compahunt.dto.*
import com.compahunt.exception.*
import com.compahunt.model.*
import com.compahunt.repository.VacancyRepository
import com.compahunt.repository.CompanyRepository
import com.compahunt.repository.VacancyAuditRepository
import com.compahunt.repository.UserRepository
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.LoggerFactory
import java.math.BigDecimal
import java.time.Instant
import java.util.*

@Service
@Transactional
class VacancyService(
    private val vacancyRepository: VacancyRepository,
    private val companyRepository: CompanyRepository,
    private val vacancyAuditRepository: VacancyAuditRepository,
    private val userRepository: UserRepository,
    private val vacancyMapper: com.compahunt.mapper.VacancyMapper
) {

    private val log = LoggerFactory.getLogger(VacancyService::class.java)

    private val objectMapper = jacksonObjectMapper()

    fun createVacancy(
        request: CreateVacancyRequest, 
        userId: UUID, 
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

        val salaryWithMonthlyConversion = request.salary?.let { 
            convertSalaryToMonthly(it)
        }

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
            salary = salaryWithMonthlyConversion,
            remoteness = request.remoteness,
            industry = request.industry,
            benefits = request.benefits,
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

        return vacancyMapper.toResponse(savedVacancy)
    }

    fun getVacancy(id: UUID, userId: UUID): VacancyResponse {
        val vacancy = vacancyRepository.findByIdAndUserId(id, userId)
            .orElseThrow { VacancyNotFoundException("Vacancy not found or access denied") }
        
        return vacancyMapper.toResponse(vacancy)
    }

    fun getAllVacancies(userId: UUID, status: VacancyStatus? = null, limit: Int? = null): List<VacancyResponse> {
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
        
        return limitedVacancies.map { vacancyMapper.toResponse(it) }
    }

    fun searchVacancies(userId: UUID, filterRequest: VacancyFilterRequest): VacancySearchResponse {
        val sort = if (filterRequest.sortDirection.lowercase() == "asc") {
            Sort.by(Sort.Order.asc(filterRequest.sortBy))
        } else {
            Sort.by(Sort.Order.desc(filterRequest.sortBy))
        }
        
        val pageable = PageRequest.of(filterRequest.page, filterRequest.size, sort)
        
        val vacanciesPage = if (filterRequest.search.isNullOrBlank()) {
            vacancyRepository.findByUserId(userId, pageable)
        } else {
            vacancyRepository.findByUserIdAndTitleContainingIgnoreCaseOrCompanyNameContainingIgnoreCase(
                userId = userId,
                title = filterRequest.search,
                companyName = filterRequest.search,
                pageable = pageable
            )
        }
        
        val searchItems = vacanciesPage.content.map { vacancy ->
            VacancySearchItem(
                id = vacancy.id,
                title = vacancy.title,
                companyName = vacancy.company.name,
                location = vacancy.location,
                status = vacancy.status
            )
        }
        
        return VacancySearchResponse(
            content = searchItems,
            totalElements = vacanciesPage.totalElements,
            totalPages = vacanciesPage.totalPages,
            currentPage = vacanciesPage.number,
            size = vacanciesPage.size,
            hasNext = vacanciesPage.hasNext(),
            hasPrevious = vacanciesPage.hasPrevious(),
            isFirst = vacanciesPage.isFirst,
            isLast = vacanciesPage.isLast
        )
    }

    fun getVacanciesWithFilters(userId: UUID, filterRequest: VacancyFilterRequest): VacancyPageResponse {
        val status = filterRequest.status?.let { VacancyStatus.valueOf(it) }
        
        // Convert salary values to monthly amounts if period is provided
        val minSalary = filterRequest.minSalary?.toBigDecimalOrNull()?.let { amount ->
            if (filterRequest.salaryPeriod != null) {
                convertToMonthly(amount, filterRequest.salaryPeriod)
            } else {
                amount // If no period provided, assume it's already monthly
            }
        }
        val maxSalary = filterRequest.maxSalary?.toBigDecimalOrNull()?.let { amount ->
            if (filterRequest.salaryPeriod != null) {
                convertToMonthly(amount, filterRequest.salaryPeriod)
            } else {
                amount // If no period provided, assume it's already monthly
            }
        }
        
        val sort = if (filterRequest.sortDirection.lowercase() == "asc") {
            Sort.by(Sort.Order.asc(filterRequest.sortBy))
        } else {
            Sort.by(Sort.Order.desc(filterRequest.sortBy))
        }
        
        val pageable: Pageable = PageRequest.of(filterRequest.page, filterRequest.size, sort)
        
        val vacancyPage = vacancyRepository.findVacanciesWithFilters(
            userId = userId,
            status = status,
            search = filterRequest.search?.takeIf { it.isNotBlank() },
            minSalary = minSalary,
            maxSalary = maxSalary,
            location = filterRequest.location?.takeIf { it.isNotBlank() },
            experienceLevel = filterRequest.experienceLevel?.takeIf { it.isNotBlank() },
            jobType = filterRequest.jobType?.takeIf { it.isNotBlank() },
            remoteness = filterRequest.remoteness?.takeIf { it.isNotBlank() },
            pageable = pageable
        )
        
        return VacancyPageResponse(
            content = vacancyPage.content.map { vacancyMapper.toResponse(it) },
            totalElements = vacancyPage.totalElements,
            totalPages = vacancyPage.totalPages,
            currentPage = vacancyPage.number,
            size = vacancyPage.size,
            hasNext = vacancyPage.hasNext(),
            hasPrevious = vacancyPage.hasPrevious(),
            isFirst = vacancyPage.isFirst,
            isLast = vacancyPage.isLast
        )
    }

    fun updateVacancy(
        id: UUID, 
        request: UpdateVacancyRequest, 
        userId: UUID, 
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

        val salaryWithMonthlyConversion = request.salary?.let { 
            convertSalaryToMonthly(it)
        } ?: vacancy.salary

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
            salary = salaryWithMonthlyConversion,
            remoteness = request.remoteness ?: vacancy.remoteness,
            industry = request.industry ?: vacancy.industry,
            benefits = request.benefits ?: vacancy.benefits,
            experience = request.experience ?: vacancy.experience,
            updatedAt = Instant.now()
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

        return vacancyMapper.toResponse(savedVacancy)
    }

    fun updateStatus(
        id: UUID, 
        status: VacancyStatus, 
        userId: UUID, 
        httpRequest: HttpServletRequest
    ): VacancyResponse {
        val vacancy = vacancyRepository.findByIdAndUserId(id, userId)
            .orElseThrow { VacancyNotFoundException("Vacancy not found or access denied") }

        if (vacancy.status == status) {
            return vacancyMapper.toResponse(vacancy)
        }

        val oldStatus = vacancy.status
        val updatedVacancy = vacancy.copy(
            status = status,
            updatedAt = Instant.now()
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

        return vacancyMapper.toResponse(savedVacancy)
    }

    fun archiveVacancy(
        id: UUID, 
        userId: UUID, 
        reason: String?, 
        httpRequest: HttpServletRequest
    ): Boolean {
        val vacancy = vacancyRepository.findByIdAndUserId(id, userId)
            .orElseThrow { VacancyNotFoundException("Vacancy not found or access denied") }

        val updatedVacancy = vacancy.copy(
            status = VacancyStatus.ARCHIVED,
            updatedAt = Instant.now()
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

    fun getAuditHistory(vacancyId: UUID, userId: UUID): List<VacancyAuditResponse> {
        // Verify user has access to this vacancy
        vacancyRepository.findByIdAndUserId(vacancyId, userId)
            .orElseThrow { VacancyNotFoundException("Vacancy not found or access denied") }

        val auditRecords = vacancyAuditRepository.findByVacancyIdOrderByTimestampDesc(vacancyId)
        return auditRecords.map { mapToVacancyAuditResponse(it) }
    }

    fun getArchivedVacancies(userId: UUID): List<VacancyResponse> {
        val archivedVacancies = vacancyRepository.findArchivedByUserId(userId)
        return archivedVacancies.map { vacancyMapper.toResponse(it) }
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
        vacancyId: UUID,
        userId: UUID,
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
            timestamp = audit.timestamp.toString(),
            reason = audit.reason,
            userAgent = audit.userAgent,
            ipAddress = audit.ipAddress
        )
    }

    private fun convertSalaryToMonthly(salary: Salary): Salary {
        val monthMin = salary.min?.let { convertToMonthly(it, salary.period) }
        val monthMax = salary.max?.let { convertToMonthly(it, salary.period) }
        
        return salary.copy(
            monthMin = monthMin,
            monthMax = monthMax
        )
    }

    private fun convertToMonthly(amount: BigDecimal, period: String?): BigDecimal {
        return when (period?.lowercase()) {
            "hr", "hour", "hourly" -> amount.multiply(BigDecimal("160")) // 40 hours/week * 4 weeks
            "day", "daily" -> amount.multiply(BigDecimal("22")) // ~22 working days per month
            "week", "weekly" -> amount.multiply(BigDecimal("4.33")) // 52 weeks / 12 months
            "month", "monthly" -> amount
            "year", "yearly", "annual", "annually" -> amount.divide(BigDecimal("12"), 2, java.math.RoundingMode.HALF_UP)
            else -> amount // Default to assuming it's monthly if unknown
        }
    }
}