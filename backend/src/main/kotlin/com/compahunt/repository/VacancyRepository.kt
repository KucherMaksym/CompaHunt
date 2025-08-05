package com.compahunt.repository

import com.compahunt.model.Vacancy
import com.compahunt.model.Company
import com.compahunt.model.VacancyAudit
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface VacancyRepository : JpaRepository<Vacancy, Long> {

    fun findByUrl(url: String): Optional<Vacancy>

    @Modifying
    @Query("UPDATE Vacancy v SET v.deleted = true, v.updatedAt = CURRENT_TIMESTAMP WHERE v.id = :id")
    fun softDelete(@Param("id") id: Long): Int

    @Query("SELECT v FROM Vacancy v WHERE v.deleted = true")
    fun findAllArchived(): List<Vacancy>
}