package com.compahunt.repository

import com.compahunt.model.VacancyNote
import com.compahunt.model.NoteType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface VacancyNoteRepository : JpaRepository<VacancyNote, UUID> {
    
    fun findByVacancyIdOrderByCreatedAtDesc(vacancyId: UUID): List<VacancyNote>
    
    fun findByUserIdOrderByCreatedAtDesc(userId: UUID): List<VacancyNote>
    
    fun findByVacancyIdAndTypeOrderByCreatedAtDesc(vacancyId: UUID, type: NoteType): List<VacancyNote>
    
    @Query("SELECT n FROM VacancyNote n WHERE n.vacancy.id = :vacancyId AND n.user.id = :userId ORDER BY n.createdAt DESC")
    fun findByVacancyIdAndUserId(
        @Param("vacancyId") vacancyId: UUID,
        @Param("userId") userId: UUID
    ): List<VacancyNote>
    
    @Query("SELECT n FROM VacancyNote n WHERE n.user.id = :userId AND n.type = :type ORDER BY n.createdAt DESC")
    fun findByUserIdAndType(
        @Param("userId") userId: UUID,
        @Param("type") type: NoteType
    ): List<VacancyNote>
}