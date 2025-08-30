package com.compahunt.repository

import com.compahunt.model.GmailWatchSubscription
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.Instant
import java.util.UUID

interface GmailWatchSubscriptionRepository : JpaRepository<GmailWatchSubscription, UUID> {

    fun findByUserIdAndIsActive(userId: UUID, isActive: Boolean): GmailWatchSubscription?

    fun findAllByUserIdAndIsActive(userId: UUID, isActive: Boolean): List<GmailWatchSubscription>

    @Query("SELECT gws FROM GmailWatchSubscription gws WHERE gws.expiration <= :expirationTime AND gws.isActive = true")
    fun findExpiringSubscriptions(@Param("expirationTime") expirationTime: Instant): List<GmailWatchSubscription>

    @Query("SELECT gws FROM GmailWatchSubscription gws WHERE gws.isActive = true")
    fun findAllActiveSubscriptions(): List<GmailWatchSubscription>
}