package com.compahunt.repository

import com.compahunt.model.VacancyAudit
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface VacancyAuditRepository : JpaRepository<VacancyAudit, UUID> {

    fun findByVacancyIdOrderByTimestampDesc(vacancyId: UUID): List<VacancyAudit>

    @Query("SELECT va FROM VacancyAudit va WHERE va.vacancyId = :vacancyId ORDER BY va.timestamp DESC")
    fun findAuditHistory(@Param("vacancyId") vacancyId: UUID): List<VacancyAudit>
}