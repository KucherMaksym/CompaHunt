package com.compahunt.repository

import com.compahunt.model.Interview
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.Instant
import java.util.UUID

@Repository
interface InterviewRepository : JpaRepository<Interview, UUID> {
    
    fun findByVacancyIdOrderByScheduledAtAsc(vacancyId: UUID): List<Interview>
    
    @Query("SELECT i FROM Interview i JOIN FETCH i.vacancy v JOIN FETCH v.company WHERE i.user.id = :userId ORDER BY i.scheduledAt ASC")
    fun findByUserIdOrderByScheduledAtAsc(@Param("userId") userId: UUID): List<Interview>
    
    @Query("SELECT i FROM Interview i WHERE i.user.id = :userId AND i.scheduledAt BETWEEN :start AND :end ORDER BY i.scheduledAt ASC")
    fun findByUserIdAndScheduledAtBetween(
        @Param("userId") userId: UUID,
        @Param("start") start: Instant,
        @Param("end") end: Instant
    ): List<Interview>
    
    @Query("SELECT i FROM Interview i WHERE i.vacancy.id = :vacancyId AND i.user.id = :userId ORDER BY i.scheduledAt ASC")
    fun findByVacancyIdAndUserId(
        @Param("vacancyId") vacancyId: UUID,
        @Param("userId") userId: UUID
    ): List<Interview>
}