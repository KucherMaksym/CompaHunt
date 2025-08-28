package com.compahunt.repository

import com.compahunt.model.EventType
import com.compahunt.model.PendingEvent
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.Instant
import java.util.UUID

@Repository
interface PendingEventRepository : JpaRepository<PendingEvent, UUID> {
    
    // Find all unresolved events for a user, ordered by priority (1=highest) then creation time
    @Query("SELECT pe FROM PendingEvent pe WHERE pe.user.id = :userId AND pe.isResolved = false ORDER BY pe.priority ASC, pe.createdAt ASC")
    fun findUnresolvedByUserIdOrderByPriorityAndCreatedAt(@Param("userId") userId: UUID): List<PendingEvent>

    // Find events scheduled for a specific time range (for job processing)
    @Query("SELECT pe FROM PendingEvent pe WHERE pe.scheduledFor IS NOT NULL AND pe.scheduledFor <= :endTime AND pe.isResolved = false")
    fun findScheduledEventsBeforeOrAt(@Param("endTime") endTime: Instant): List<PendingEvent>

    // Find unresolved events by type for a user
    fun findByUserIdAndEventTypeAndIsResolvedFalse(userId: UUID, eventType: EventType): List<PendingEvent>

    // Find unresolved events related to specific interview
    fun findByInterviewIdAndIsResolvedFalse(interviewId: UUID): List<PendingEvent>

    // Find unresolved events related to specific vacancy
    fun findByVacancyIdAndIsResolvedFalse(vacancyId: UUID): List<PendingEvent>
    
    // Count unresolved events for a user (for notification badges)
    fun countByUserIdAndIsResolvedFalse(userId: UUID): Long
    
    // Count unresolved events by priority for a user
    @Query("SELECT pe.priority, COUNT(pe) FROM PendingEvent pe WHERE pe.user.id = :userId AND pe.isResolved = false GROUP BY pe.priority")
    fun countUnresolvedByUserIdGroupByPriority(@Param("userId") userId: UUID): List<Array<Any>>
    
    // Mark events as resolved in bulk
    @Modifying
    @Query("UPDATE PendingEvent pe SET pe.isResolved = true, pe.resolvedAt = :resolvedAt WHERE pe.id IN :eventIds")
    fun markEventsAsResolved(@Param("eventIds") eventIds: List<UUID>, @Param("resolvedAt") resolvedAt: Instant): Int
    
    // Find duplicate events to prevent recreation
    @Query("""
        SELECT pe FROM PendingEvent pe 
        WHERE pe.user.id = :userId 
        AND pe.eventType = :eventType 
        AND pe.isResolved = false 
        AND (
            (:interviewId IS NULL AND pe.interview IS NULL) OR pe.interview.id = :interviewId
        ) 
        AND (
            (:vacancyId IS NULL AND pe.vacancy IS NULL) OR pe.vacancy.id = :vacancyId
        )
    """)
    fun findExistingEvent(
        @Param("userId") userId: UUID,
        @Param("eventType") eventType: EventType,
        @Param("interviewId") interviewId: UUID?,
        @Param("vacancyId") vacancyId: UUID?
    ): List<PendingEvent>
    
    // Clean up old resolved events (for maintenance)
    @Modifying
    @Query("DELETE FROM PendingEvent pe WHERE pe.isResolved = true AND pe.resolvedAt < :cutoffDate")
    fun deleteResolvedEventsBefore(@Param("cutoffDate") cutoffDate: Instant): Int
    
    // Find events grouped by related application (vacancy) for batching
    @Query("""
        SELECT pe FROM PendingEvent pe 
        WHERE pe.user.id = :userId 
        AND pe.isResolved = false 
        AND pe.vacancy IS NOT NULL 
        ORDER BY pe.vacancy.id, pe.priority ASC, pe.createdAt ASC
    """)
    fun findUnresolvedByUserIdGroupedByVacancy(@Param("userId") userId: UUID): List<PendingEvent>
}