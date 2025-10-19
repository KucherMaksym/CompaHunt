package com.compahunt.repository

import com.compahunt.model.LLMEmailClassificationAudit
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface LLMEmailClassificationAuditRepository : JpaRepository<LLMEmailClassificationAudit, UUID> {

    fun findByUserIdOrderByCreatedAtDesc(userId: UUID, pageable: Pageable): List<LLMEmailClassificationAudit>

    fun findByUserIdOrderByCreatedAtDesc(userId: UUID): List<LLMEmailClassificationAudit>

    fun findByUserIdAndIsJobRelatedOrderByCreatedAtDesc(
        userId: UUID,
        isJobRelated: Boolean,
        pageable: Pageable
    ): List<LLMEmailClassificationAudit>
}