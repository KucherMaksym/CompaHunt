package com.compahunt.repository

import com.compahunt.model.AuthProvider
import com.compahunt.model.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface UserRepository : JpaRepository<User, Long> {
    fun save(user: User): User
    fun findByEmail(email: String): User?
    fun findByProviderAndProviderId(provider: AuthProvider, providerId: String): User?
    fun existsByEmail(email: String): Boolean
}