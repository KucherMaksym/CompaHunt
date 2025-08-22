package com.compahunt.model

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import java.time.Instant

@Entity
@Table(name = "users")
data class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(unique = true)
    val email: String,

    val password: String? = null,

    val name: String,

    @Enumerated(EnumType.STRING)
    var provider: AuthProvider,

    var providerId: String? = null,

    @Enumerated(EnumType.STRING)
    val role: Role = Role.USER,

    @CreatedDate
    val createdAt: Instant = Instant.now(),

    @LastModifiedDate
    val updatedAt: Instant = Instant.now()
)

enum class AuthProvider {
    CREDENTIALS, GOOGLE
}

enum class Role {
    USER, ADMIN
}