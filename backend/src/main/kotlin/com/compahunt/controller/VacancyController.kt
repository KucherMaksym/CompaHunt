package com.compahunt.controller

import com.compahunt.dto.*
import com.compahunt.model.Salary
import com.compahunt.model.VacancyStatus
import com.compahunt.model.UserPrincipal
import com.compahunt.model.Interview
import com.compahunt.service.InterviewService
import com.compahunt.service.VacancyNoteService
import com.compahunt.service.VacancyService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import jakarta.servlet.http.HttpServletRequest
import java.math.BigDecimal
import kotlin.math.max
import kotlin.math.min

@RestController
@RequestMapping("/api/vacancies")
@CrossOrigin(origins = ["*"])
class VacancyController(
    private val vacancyService: VacancyService,
    private val interviewService: InterviewService,
    private val vacancyNoteService: VacancyNoteService
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
            workType = jobData["workType"] as? String,
            experience = jobData["experience"] as? String,
            manual = jobData["manual"] as? Boolean ?: true,
        )

        val vacancy = vacancyService.createVacancy(vacancyRequest, userId, request)
        return ResponseEntity.status(HttpStatus.CREATED).body(mapOf(
            "success" to true,
            "message" to "Application saved successfully",
            "id" to vacancy.id,
            "vacancy" to vacancy
        ))
    }

    @GetMapping("/{id}")
    fun getApplication(
        @PathVariable id: Long,
        authentication: Authentication
    ): ResponseEntity<VacancyResponse> {
        val userId = getUserId(authentication)
        val vacancy = vacancyService.getVacancy(id, userId)
        return ResponseEntity.ok(vacancy)
    }

    @PutMapping("/{id}")
    fun updateApplication(
        @PathVariable id: Long,
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
        @PathVariable id: Long,
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
        @PathVariable id: Long,
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
        @PathVariable id: Long,
        authentication: Authentication
    ): ResponseEntity<List<VacancyAuditResponse>> {
        val userId = getUserId(authentication)
        val auditHistory = vacancyService.getAuditHistory(id, userId)
        return ResponseEntity.ok(auditHistory)
    }

    @GetMapping("/{id}/interviews")
    fun getInterviews(
        @PathVariable id: Long,
        authentication: Authentication
    ): ResponseEntity<List<InterviewResponse>> {
        val userId = getUserId(authentication)
        val interviews = interviewService.getInterviewsByVacancy(id, userId)
        return ResponseEntity.ok(interviews)
    }

    @PostMapping("/{id}/interviews")
    fun createInterview(
        @PathVariable id: Long,
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

    @PostMapping("/{id}/notes")
    fun createNote(
        @PathVariable id: Long,
        @RequestBody noteRequest: CreateNoteRequest,
        authentication: Authentication
    ): ResponseEntity<Map<String, Any>> {
        val userId = getUserId(authentication)
        val note = vacancyNoteService.createNote(noteRequest, userId)
        return ResponseEntity.status(HttpStatus.CREATED).body(mapOf(
            "success" to true,
            "note" to note
        ))
    }

    private fun getUserId(authentication: Authentication): Long {
        return when (val principal = authentication.principal) {
            is UserPrincipal -> principal.id
            is Map<*, *> -> {
                // Fallback for JWT token claims
                val claims = principal as Map<String, Any>
                (claims["sub"] as String).toLong()
            }
            else -> throw IllegalArgumentException("Unsupported principal type: ${principal::class.java}")
        }
    }
}