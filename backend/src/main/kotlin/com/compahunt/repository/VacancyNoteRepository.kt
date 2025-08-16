package com.compahunt.repository

import com.compahunt.model.VacancyNote
import com.compahunt.model.NoteType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface VacancyNoteRepository : JpaRepository<VacancyNote, Long> {
    
    fun findByVacancyIdOrderByCreatedAtDesc(vacancyId: Long): List<VacancyNote>
    
    fun findByUserIdOrderByCreatedAtDesc(userId: Long): List<VacancyNote>
    
    fun findByVacancyIdAndTypeOrderByCreatedAtDesc(vacancyId: Long, type: NoteType): List<VacancyNote>
    
    @Query("SELECT n FROM VacancyNote n WHERE n.vacancy.id = :vacancyId AND n.user.id = :userId ORDER BY n.createdAt DESC")
    fun findByVacancyIdAndUserId(
        @Param("vacancyId") vacancyId: Long,
        @Param("userId") userId: Long
    ): List<VacancyNote>
    
    @Query("SELECT n FROM VacancyNote n WHERE n.user.id = :userId AND n.type = :type ORDER BY n.createdAt DESC")
    fun findByUserIdAndType(
        @Param("userId") userId: Long,
        @Param("type") type: NoteType
    ): List<VacancyNote>
}