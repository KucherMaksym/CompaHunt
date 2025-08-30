package com.compahunt.repository

import com.compahunt.model.UserOAuthToken
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface UserOAuthTokenRepository : JpaRepository<UserOAuthToken, UUID> {
    fun findByUserIdAndProvider(userId: UUID, provider: String): UserOAuthToken?
    fun deleteByUserIdAndProvider(userId: UUID, provider: String)
    fun findAllByProvider(provider: String): List<UserOAuthToken>
}