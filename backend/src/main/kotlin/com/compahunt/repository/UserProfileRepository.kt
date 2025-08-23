package com.compahunt.repository

import com.compahunt.model.UserProfile
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface UserProfileRepository : JpaRepository<UserProfile, Long> {

    fun findByUserId(userId: Long): UserProfile?

    fun existsByUserId(userId: Long): Boolean

    @Query("""
        SELECT up FROM UserProfile up 
        LEFT JOIN FETCH up.skills 
        LEFT JOIN FETCH up.workExperiences 
        LEFT JOIN FETCH up.careerGoals 
        LEFT JOIN FETCH up.preferences 
        WHERE up.userId = :userId
    """)
    fun findByUserIdWithDetails(@Param("userId") userId: Long): UserProfile?
}