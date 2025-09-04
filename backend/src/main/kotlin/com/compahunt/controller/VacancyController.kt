package com.compahunt.controller

import com.compahunt.dto.*
import com.compahunt.model.Salary
import com.compahunt.model.VacancyStatus
import com.compahunt.model.UserPrincipal
import com.compahunt.model.Interview
import com.compahunt.service.InterviewService
import com.compahunt.service.VacancyService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import jakarta.servlet.http.HttpServletRequest
import java.math.BigDecimal
import java.util.UUID
import kotlin.math.max
import kotlin.math.min

@RestController
@RequestMapping("/api/vacancies")
@CrossOrigin(origins = ["*"])
class VacancyController(
    private val vacancyService: VacancyService,
    private val interviewService: InterviewService
) {

    @GetMapping
    fun getApplications(
        authentication: Authentication,
        @RequestParam(required = false) status: String?,
        @RequestParam(required = false) limit: Int?
    ): ResponseEntity<List<VacancyResponse>> {
        val userId = getUserId(authentication)
        val vacancyStatus = status?.let { VacancyStatus.valueOf(it) }
        val vacancies = vacancyService.getAllVacancies(userId, vacancyStatus, limit)
        return ResponseEntity.ok(vacancies)
    }

    @GetMapping("/recent")
    fun getRecentApplications(
        authentication: Authentication
    ): ResponseEntity<List<VacancyResponse>> {
        val userId = getUserId(authentication)
        val vacancies = vacancyService.getAllVacancies(userId, null, 5)
        return ResponseEntity.ok(vacancies)
    }

    @GetMapping("/filtered")
    fun getFilteredApplications(
        authentication: Authentication,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(defaultValue = "createdAt") sortBy: String,
        @RequestParam(defaultValue = "desc") sortDirection: String,
        @RequestParam(required = false) status: String?,
        @RequestParam(required = false) search: String?,
        @RequestParam(required = false) minSalary: String?,
        @RequestParam(required = false) maxSalary: String?,
        @RequestParam(required = false) salaryPeriod: String?,
        @RequestParam(required = false) location: String?,
        @RequestParam(required = false) experienceLevel: String?,
        @RequestParam(required = false) jobType: String?,
        @RequestParam(required = false) remoteness: String?
    ): ResponseEntity<VacancyPageResponse> {
        val userId = getUserId(authentication)
        val filterRequest = VacancyFilterRequest(
            page = page,
            size = minOf(size, 100), // Limit max page size to 100
            sortBy = sortBy,
            sortDirection = sortDirection,
            status = status,
            search = search,
            minSalary = minSalary,
            maxSalary = maxSalary,
            salaryPeriod = salaryPeriod,
            location = location,
            experienceLevel = experienceLevel,
            jobType = jobType,
            remoteness = remoteness
        )
        
        val result = vacancyService.getVacanciesWithFilters(userId, filterRequest)
        return ResponseEntity.ok(result)
    }

    @GetMapping("/search")
    fun searchVacancies(
        authentication: Authentication,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int,
        @RequestParam(defaultValue = "createdAt") sortBy: String,
        @RequestParam(defaultValue = "desc") sortDirection: String,
        @RequestParam(required = false) search: String?
    ): ResponseEntity<VacancySearchResponse> {
        val userId = getUserId(authentication)
        val filterRequest = VacancyFilterRequest(
            page = page,
            size = minOf(size, 50), // Limit max page size to 50 for search
            sortBy = sortBy,
            sortDirection = sortDirection,
            search = search
        )
        
        val result = vacancyService.searchVacancies(userId, filterRequest)
        return ResponseEntity.ok(result)
    }

    @PostMapping
    fun createApplication(
        @RequestBody jobData: Map<String, Any?>,
        authentication: Authentication,
        request: HttpServletRequest
    ): ResponseEntity<Map<String, Any>> {
        val userId = getUserId(authentication)
        val vacancyRequest = CreateVacancyRequest(
            title = (jobData["title"] as? Map<String, Any?>)?.get("name") as? String ?: jobData["title"] as String,
            company = (jobData["company"] as? Map<String, Any?>)?.get("name") as? String ?: jobData["company"] as String,
            location = jobData["location"] as? String ?: "",
            jobType = jobData["jobType"] as? String,
            experienceLevel = jobData["experienceLevel"] as? String,
            description = jobData["description"] as? String ?: "",
            htmlDescription = jobData["htmlDescription"] as? String ?: "",
            requirements = (jobData["requirements"] as? List<*>)?.filterIsInstance<String>() ?: listOf(),
            skills = (jobData["skills"] as? List<*>)?.filterIsInstance<String>() ?: listOf(),
            status = VacancyStatus.valueOf((jobData["status"] as? String) ?: "APPLIED"),
            postedDate = jobData["postedDate"] as? String,
            applicantCount = (jobData["applicantCount"] as? Number)?.toInt(),
            url = jobData["jobUrl"] as? String ?: jobData["url"] as String,
            salary = (jobData["salary"] as? Map<String, Any?>)?.let { salaryData ->
                Salary(
                    range = salaryData["range"] as? String ?: "",
                    min = (salaryData["min"] as? Number)?.let { BigDecimal(it.toString()) },
                    max = (salaryData["max"] as? Number)?.let { BigDecimal(it.toString()) },
                    currency = salaryData["currency"] as? String ?: "$",
                    period = salaryData["period"] as? String ?: "year",
                    location = salaryData["location"] as? String ?: (jobData["location"] as? String ?: "")
                )
            },
            remoteness = jobData["remoteness"] as? String,
            industry = jobData["industry"] as? String,
            benefits = jobData["benefits"] as? String,
            experience = jobData["experience"] as? String,
            manual = jobData["manual"] as? Boolean ?: true,
        )

        val vacancy = vacancyService.createVacancy(vacancyRequest, userId, request)
        return ResponseEntity.status(HttpStatus.CREATED).body(mapOf(
            "success" to true,
            "message" to "Application saved successfully",
            "id" to (vacancy.id ?: ""),
            "vacancy" to vacancy
        ))
    }

    @GetMapping("/{id}")
    fun getApplication(
        @PathVariable id: UUID,
        authentication: Authentication
    ): ResponseEntity<VacancyResponse> {
        val userId = getUserId(authentication)
        val vacancy = vacancyService.getVacancy(id, userId)
        return ResponseEntity.ok(vacancy)
    }

    @PutMapping("/{id}")
    fun updateApplication(
        @PathVariable id: UUID,
        @RequestBody updateRequest: UpdateVacancyRequest,
        authentication: Authentication,
        request: HttpServletRequest
    ): ResponseEntity<VacancyResponse> {
        val userId = getUserId(authentication)
        val vacancy = vacancyService.updateVacancy(id, updateRequest, userId, request)
        return ResponseEntity.ok(vacancy)
    }

    @PatchMapping("/{id}/status")
    fun updateStatus(
        @PathVariable id: UUID,
        @RequestBody statusRequest: UpdateStatusRequest,
        authentication: Authentication,
        request: HttpServletRequest
    ): ResponseEntity<VacancyResponse> {
        val userId = getUserId(authentication)
        val vacancy = vacancyService.updateStatus(id, statusRequest.status, userId, request)
        return ResponseEntity.ok(vacancy)
    }

    @DeleteMapping("/{id}")
    fun archiveApplication(
        @PathVariable id: UUID,
        @RequestParam(required = false) reason: String?,
        authentication: Authentication,
        request: HttpServletRequest
    ): ResponseEntity<Map<String, Any>> {
        val userId = getUserId(authentication)
        val success = vacancyService.archiveVacancy(id, userId, reason ?: "Archived from dashboard", request)
        return if (success) {
            ResponseEntity.ok(mapOf(
                "success" to true,
                "message" to "Application archived successfully"
            ))
        } else {
            ResponseEntity.badRequest().body(mapOf(
                "success" to false,
                "message" to "Failed to archive application"
            ))
        }
    }

    @GetMapping("/{id}/audit")
    fun getAuditHistory(
        @PathVariable id: UUID,
        authentication: Authentication
    ): ResponseEntity<List<VacancyAuditResponse>> {
        val userId = getUserId(authentication)
        val auditHistory = vacancyService.getAuditHistory(id, userId)
        return ResponseEntity.ok(auditHistory)
    }

    @GetMapping("/{id}/interviews")
    fun getInterviews(
        @PathVariable id: UUID,
        authentication: Authentication
    ): ResponseEntity<List<InterviewResponse>> {
        val userId = getUserId(authentication)
        val interviews = interviewService.getInterviewsByVacancy(id, userId)
        return ResponseEntity.ok(interviews)
    }

    @PostMapping("/{id}/interviews")
    fun createInterview(
        @PathVariable id: UUID,
        @RequestBody interviewRequest: CreateInterviewRequest,
        authentication: Authentication
    ): ResponseEntity<Map<String, Any>> {
        val userId = getUserId(authentication)
        val interview = interviewService.createInterview(interviewRequest, userId)
        return ResponseEntity.status(HttpStatus.CREATED).body(mapOf(
            "success" to true,
            "interview" to interview
        ))
    }


    private fun getUserId(authentication: Authentication): UUID {
        return when (val principal = authentication.principal) {
            is UserPrincipal -> principal.id
            is Map<*, *> -> {
                // Fallback for JWT token claims
                val claims = principal as Map<String, Any>
                UUID.fromString(claims["sub"] as String)
            }
            else -> throw IllegalArgumentException("Unsupported principal type: ${principal::class.java}")
        }
    }
}