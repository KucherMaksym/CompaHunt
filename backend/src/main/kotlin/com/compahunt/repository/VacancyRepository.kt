package com.compahunt.repository

import com.compahunt.model.Vacancy
import com.compahunt.model.VacancyStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.math.BigDecimal
import java.util.*

@Repository
interface VacancyRepository : JpaRepository<Vacancy, Long> {

    fun findByUrl(url: String): Optional<Vacancy>

    fun findByUserIdAndUrl(userId: Long, url: String): Optional<Vacancy>

    fun findByIdAndUserId(id: Long, userId: Long): Optional<Vacancy>

    fun findByUserIdOrderByCreatedAtDesc(userId: Long): List<Vacancy>

    fun findByUserIdAndStatusOrderByCreatedAtDesc(userId: Long, status: VacancyStatus): List<Vacancy>

    fun findByUserId(userId: Long, pageable: Pageable): Page<Vacancy>

    @Query("""
        SELECT v FROM Vacancy v 
        WHERE v.user.id = :userId 
        AND v.deleted = false
        AND (LOWER(v.title) LIKE LOWER(CONCAT('%', :title, '%')) 
             OR LOWER(v.company.name) LIKE LOWER(CONCAT('%', :companyName, '%')))
    """)
    fun findByUserIdAndTitleContainingIgnoreCaseOrCompanyNameContainingIgnoreCase(
        @Param("userId") userId: Long,
        @Param("title") title: String,
        @Param("companyName") companyName: String,
        pageable: Pageable
    ): Page<Vacancy>

    @Query("SELECT v FROM Vacancy v WHERE v.user.id = :userId AND v.status = 'ARCHIVED' ORDER BY v.updatedAt DESC")
    fun findArchivedByUserId(@Param("userId") userId: Long): List<Vacancy>

    @Modifying
    @Query("UPDATE Vacancy v SET v.deleted = true, v.updatedAt = CURRENT_TIMESTAMP WHERE v.id = :id AND v.user.id = :userId")
    fun softDeleteByIdAndUserId(@Param("id") id: Long, @Param("userId") userId: Long): Int

    @Query("SELECT v FROM Vacancy v WHERE v.deleted = true")
    fun findAllArchived(): List<Vacancy>

    // Enhanced filtering with pagination
    @Query("""
        SELECT v FROM Vacancy v
        WHERE v.user.id = :userId
        AND (:status IS NULL OR v.status = :status)
        AND (:search IS NULL OR :search = '' OR 
             LOWER(v.title) LIKE LOWER(CONCAT('%', :search, '%')) OR
             LOWER(v.company.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
             LOWER(v.location) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:minSalary IS NULL OR v.salary.monthMin >= :minSalary)
        AND (:maxSalary IS NULL OR v.salary.monthMax <= :maxSalary)
        AND (:location IS NULL OR :location = '' OR LOWER(v.location) LIKE LOWER(CONCAT('%', :location, '%')))
        AND (:experienceLevel IS NULL OR :experienceLevel = '' OR v.experienceLevel = :experienceLevel)
        AND (:jobType IS NULL OR :jobType = '' OR v.jobType = :jobType)
        AND (:remoteness IS NULL OR :remoteness = '' OR v.remoteness = :remoteness)
        AND v.deleted = false
    """)
    fun findVacanciesWithFilters(
        @Param("userId") userId: Long,
        @Param("status") status: VacancyStatus?,
        @Param("search") search: String?,
        @Param("minSalary") minSalary: BigDecimal?,
        @Param("maxSalary") maxSalary: BigDecimal?,
        @Param("location") location: String?,
        @Param("experienceLevel") experienceLevel: String?,
        @Param("jobType") jobType: String?,
        @Param("remoteness") remoteness: String?,
        pageable: Pageable
    ): Page<Vacancy>

    // Count query for pagination
    @Query("""
        SELECT COUNT(v) FROM Vacancy v
        WHERE v.user.id = :userId
        AND (:status IS NULL OR v.status = :status)
        AND (:search IS NULL OR :search = '' OR 
             LOWER(v.title) LIKE LOWER(CONCAT('%', :search, '%')) OR
             LOWER(v.company.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
             LOWER(v.location) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:minSalary IS NULL OR v.salary.monthMin >= :minSalary)
        AND (:maxSalary IS NULL OR v.salary.monthMax <= :maxSalary)
        AND (:location IS NULL OR :location = '' OR LOWER(v.location) LIKE LOWER(CONCAT('%', :location, '%')))
        AND (:experienceLevel IS NULL OR :experienceLevel = '' OR v.experienceLevel = :experienceLevel)
        AND (:jobType IS NULL OR :jobType = '' OR v.jobType = :jobType)
        AND (:remoteness IS NULL OR :remoteness = '' OR v.remoteness = :remoteness)
        AND v.deleted = false
    """)
    fun countVacanciesWithFilters(
        @Param("userId") userId: Long,
        @Param("status") status: VacancyStatus?,
        @Param("search") search: String?,
        @Param("minSalary") minSalary: BigDecimal?,
        @Param("maxSalary") maxSalary: BigDecimal?,
        @Param("location") location: String?,
        @Param("experienceLevel") experienceLevel: String?,
        @Param("jobType") jobType: String?,
        @Param("remoteness") remoteness: String?
    ): Long
}