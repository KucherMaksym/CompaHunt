package com.compahunt.controller

import com.compahunt.dto.CreateInterviewRequest
import com.compahunt.dto.InterviewResponse
import com.compahunt.dto.InterviewWithVacancyResponse
import com.compahunt.dto.UpdateInterviewRequest
import com.compahunt.model.UserPrincipal
import com.compahunt.service.InterviewService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/interviews")
class InterviewController(
    private val interviewService: InterviewService
) {

    @GetMapping
    fun getAllInterviews(
        authentication: Authentication
    ): ResponseEntity<List<InterviewWithVacancyResponse>> {
        val userId = getUserId(authentication)
        val interviews = interviewService.getAllInterviewsWithVacancies(userId)
        return ResponseEntity.ok(interviews)
    }

    @PostMapping
    fun createInterview(
        @Valid @RequestBody request: CreateInterviewRequest,
        authentication: Authentication
    ): ResponseEntity<InterviewResponse> {
        val userId = getUserId(authentication)
        val interview = interviewService.createInterview(request, userId)
        return ResponseEntity.status(HttpStatus.CREATED).body(interview)
    }

    @PutMapping("/{id}")
    fun updateInterview(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateInterviewRequest,
        authentication: Authentication
    ): ResponseEntity<InterviewResponse> {
        val userId = getUserId(authentication)
        val interview = interviewService.updateInterview(id, request, userId)
        return ResponseEntity.ok(interview)
    }

    @GetMapping("/vacancy/{vacancyId}")
    fun getInterviewsByVacancy(
        @PathVariable vacancyId: Long,
        authentication: Authentication
    ): ResponseEntity<List<InterviewResponse>> {
        val userId = getUserId(authentication)
        val interviews = interviewService.getInterviewsByVacancy(vacancyId, userId)
        return ResponseEntity.ok(interviews)
    }

    @DeleteMapping("/{id}")
    fun deleteInterview(
        @PathVariable id: Long,
        authentication: Authentication
    ): ResponseEntity<Map<String, Any>> {
        val userId = getUserId(authentication)
        val deleted = interviewService.deleteInterview(id, userId)
        return ResponseEntity.ok(mapOf("deleted" to deleted))
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