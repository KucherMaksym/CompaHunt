package com.compahunt.repository

import com.compahunt.model.Interview
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
interface InterviewRepository : JpaRepository<Interview, Long> {
    
    fun findByVacancyIdOrderByScheduledAtAsc(vacancyId: Long): List<Interview>
    
    fun findByUserIdOrderByScheduledAtAsc(userId: Long): List<Interview>
    
    @Query("SELECT i FROM Interview i WHERE i.user.id = :userId AND i.scheduledAt BETWEEN :start AND :end ORDER BY i.scheduledAt ASC")
    fun findByUserIdAndScheduledAtBetween(
        @Param("userId") userId: Long,
        @Param("start") start: LocalDateTime,
        @Param("end") end: LocalDateTime
    ): List<Interview>
    
    @Query("SELECT i FROM Interview i WHERE i.vacancy.id = :vacancyId AND i.user.id = :userId ORDER BY i.scheduledAt ASC")
    fun findByVacancyIdAndUserId(
        @Param("vacancyId") vacancyId: Long,
        @Param("userId") userId: Long
    ): List<Interview>
}