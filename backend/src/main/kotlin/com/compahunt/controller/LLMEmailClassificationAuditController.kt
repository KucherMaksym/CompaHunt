package com.compahunt.controller

import com.compahunt.model.LLMEmailClassificationAudit
import com.compahunt.model.UserPrincipal
import com.compahunt.repository.LLMEmailClassificationAuditRepository
import org.springframework.data.domain.PageRequest
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/audit/email-classification")
@CrossOrigin(origins = ["*"])
class LLMEmailClassificationAuditController(
    private val auditRepository: LLMEmailClassificationAuditRepository
) {

    @GetMapping
    fun getAuditRecords(
        authentication: Authentication,
        @RequestParam(required = false, defaultValue = "50") limit: Int,
        @RequestParam(required = false) isJobRelated: Boolean?
    ): ResponseEntity<List<LLMEmailClassificationAudit>> {
        val userId = getUserId(authentication)
        val pageRequest = PageRequest.of(0, limit.coerceIn(1, 200))

        val records = if (isJobRelated != null) {
            auditRepository.findByUserIdAndIsJobRelatedOrderByCreatedAtDesc(userId, isJobRelated, pageRequest)
        } else {
            auditRepository.findByUserIdOrderByCreatedAtDesc(userId, pageRequest)
        }

        return ResponseEntity.ok(records)
    }

    @GetMapping("/{id}")
    fun getAuditRecord(
        authentication: Authentication,
        @PathVariable id: UUID
    ): ResponseEntity<LLMEmailClassificationAudit> {
        val userId = getUserId(authentication)

        val record = auditRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()

        // Verify that the record belongs to the user
        if (record.userId != userId) {
            return ResponseEntity.status(403).build()
        }

        return ResponseEntity.ok(record)
    }

    private fun getUserId(authentication: Authentication): UUID {
        val principal = authentication.principal as UserPrincipal
        return principal.id
    }
}