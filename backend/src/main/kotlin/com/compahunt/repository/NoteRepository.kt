package com.compahunt.repository

import com.compahunt.model.Note
import com.compahunt.model.NoteType
import com.compahunt.model.NotePriority
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
interface NoteRepository : JpaRepository<Note, Long> {
    
    // Vacancy notes queries
    fun findByVacancyIdOrderByCreatedAtDesc(vacancyId: Long): List<Note>
    
    @Query("SELECT n FROM Note n WHERE n.vacancy.id = :vacancyId AND n.user.id = :userId ORDER BY n.createdAt DESC")
    fun findByVacancyIdAndUserId(
        @Param("vacancyId") vacancyId: Long,
        @Param("userId") userId: Long
    ): List<Note>
    
    @Query("SELECT n FROM Note n WHERE n.vacancy.id = :vacancyId AND n.type = :type AND n.user.id = :userId ORDER BY n.createdAt DESC")
    fun findByVacancyIdAndTypeAndUserId(
        @Param("vacancyId") vacancyId: Long,
        @Param("type") type: NoteType,
        @Param("userId") userId: Long
    ): List<Note>
    
    // Interview notes queries
    fun findByInterviewIdOrderByCreatedAtDesc(interviewId: Long): List<Note>
    
    @Query("SELECT n FROM Note n WHERE n.interview.id = :interviewId AND n.user.id = :userId ORDER BY n.createdAt DESC")
    fun findByInterviewIdAndUserId(
        @Param("interviewId") interviewId: Long,
        @Param("userId") userId: Long
    ): List<Note>
    
    @Query("SELECT n FROM Note n WHERE n.interview.id = :interviewId AND n.type = :type AND n.user.id = :userId ORDER BY n.createdAt DESC")
    fun findByInterviewIdAndTypeAndUserId(
        @Param("interviewId") interviewId: Long,
        @Param("type") type: NoteType,
        @Param("userId") userId: Long
    ): List<Note>
    
    // User notes queries
    fun findByUserIdOrderByCreatedAtDesc(userId: Long): List<Note>
    
    @Query("SELECT n FROM Note n WHERE n.user.id = :userId AND n.vacancy IS NOT NULL ORDER BY n.createdAt DESC")
    fun findVacancyNotesByUserId(@Param("userId") userId: Long): List<Note>
    
    @Query("SELECT n FROM Note n WHERE n.user.id = :userId AND n.interview IS NOT NULL ORDER BY n.createdAt DESC")
    fun findInterviewNotesByUserId(@Param("userId") userId: Long): List<Note>
    
    @Query("SELECT n FROM Note n WHERE n.user.id = :userId AND n.vacancy IS NOT NULL AND n.type = :type ORDER BY n.createdAt DESC")
    fun findVacancyNotesByUserIdAndType(
        @Param("userId") userId: Long,
        @Param("type") type: NoteType
    ): List<Note>
    
    @Query("SELECT n FROM Note n WHERE n.user.id = :userId AND n.interview IS NOT NULL AND n.type = :type ORDER BY n.createdAt DESC")
    fun findInterviewNotesByUserIdAndType(
        @Param("userId") userId: Long,
        @Param("type") type: NoteType
    ): List<Note>
    
    @Query("SELECT n FROM Note n WHERE n.user.id = :userId AND n.vacancy IS NOT NULL AND n.priority = :priority ORDER BY n.createdAt DESC")
    fun findVacancyNotesByUserIdAndPriority(
        @Param("userId") userId: Long,
        @Param("priority") priority: NotePriority
    ): List<Note>
    
    @Query("SELECT n FROM Note n WHERE n.user.id = :userId AND n.interview IS NOT NULL AND n.priority = :priority ORDER BY n.createdAt DESC")
    fun findInterviewNotesByUserIdAndPriority(
        @Param("userId") userId: Long,
        @Param("priority") priority: NotePriority
    ): List<Note>
    
    @Query("SELECT n FROM Note n WHERE n.user.id = :userId AND n.vacancy IS NOT NULL AND n.type = :type AND n.priority = :priority ORDER BY n.createdAt DESC")
    fun findVacancyNotesByUserIdAndTypeAndPriority(
        @Param("userId") userId: Long,
        @Param("type") type: NoteType,
        @Param("priority") priority: NotePriority
    ): List<Note>
    
    @Query("SELECT n FROM Note n WHERE n.user.id = :userId AND n.interview IS NOT NULL AND n.type = :type AND n.priority = :priority ORDER BY n.createdAt DESC")
    fun findInterviewNotesByUserIdAndTypeAndPriority(
        @Param("userId") userId: Long,
        @Param("type") type: NoteType,
        @Param("priority") priority: NotePriority
    ): List<Note>
    
    // Security check queries
    @Query("SELECT n FROM Note n WHERE n.id = :noteId AND n.user.id = :userId")
    fun findByIdAndUserId(
        @Param("noteId") noteId: Long,
        @Param("userId") userId: Long
    ): Note?
    
    // Bulk delete operations
    @Modifying
    @Transactional
    @Query("DELETE FROM Note n WHERE n.vacancy.id = :vacancyId AND n.user.id = :userId")
    fun deleteByVacancyIdAndUserId(
        @Param("vacancyId") vacancyId: Long,
        @Param("userId") userId: Long
    ): Int
    
    @Modifying
    @Transactional
    @Query("DELETE FROM Note n WHERE n.interview.id = :interviewId AND n.user.id = :userId")
    fun deleteByInterviewIdAndUserId(
        @Param("interviewId") interviewId: Long,
        @Param("userId") userId: Long
    ): Int
}