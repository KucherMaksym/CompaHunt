package com.compahunt.repository

import com.compahunt.model.Vacancy
import com.compahunt.model.VacancyStatus
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface VacancyRepository : JpaRepository<Vacancy, Long> {

    fun findByUrl(url: String): Optional<Vacancy>

    fun findByUserIdAndUrl(userId: Long, url: String): Optional<Vacancy>

    fun findByIdAndUserId(id: Long, userId: Long): Optional<Vacancy>

    fun findByUserIdOrderByCreatedAtDesc(userId: Long): List<Vacancy>

    fun findByUserIdAndStatusOrderByCreatedAtDesc(userId: Long, status: VacancyStatus): List<Vacancy>

    @Query("SELECT v FROM Vacancy v WHERE v.user.id = :userId AND v.status = 'ARCHIVED' ORDER BY v.updatedAt DESC")
    fun findArchivedByUserId(@Param("userId") userId: Long): List<Vacancy>

    @Modifying
    @Query("UPDATE Vacancy v SET v.deleted = true, v.updatedAt = CURRENT_TIMESTAMP WHERE v.id = :id AND v.user.id = :userId")
    fun softDeleteByIdAndUserId(@Param("id") id: Long, @Param("userId") userId: Long): Int

    @Query("SELECT v FROM Vacancy v WHERE v.deleted = true")
    fun findAllArchived(): List<Vacancy>
}