package com.compahunt.repository

import com.compahunt.model.GmailNotificationEvent
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.Instant
import java.util.UUID

interface GmailNotificationEventRepository : JpaRepository<GmailNotificationEvent, UUID> {

    fun findByUserIdOrderByCreatedAtDesc(userId: UUID, pageable: Pageable): Page<GmailNotificationEvent>

    @Query("SELECT COUNT(gne) FROM GmailNotificationEvent gne WHERE gne.userId = :userId AND gne.createdAt >= :since")
    fun countByUserIdAndCreatedAtAfter(@Param("userId") userId: UUID, @Param("since") since: Instant): Long

    @Query("SELECT gne FROM GmailNotificationEvent gne WHERE gne.processedByAi = false ORDER BY gne.createdAt ASC")
    fun findUnprocessedEvents(): List<GmailNotificationEvent>
    
    fun findByUserIdAndMessageId(userId: UUID, messageId: String): List<GmailNotificationEvent>
}