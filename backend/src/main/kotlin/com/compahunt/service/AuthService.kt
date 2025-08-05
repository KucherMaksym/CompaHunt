package com.compahunt.service

import com.compahunt.model.AuthProvider
import com.compahunt.model.User
import com.compahunt.repository.UserRepository
import jakarta.transaction.Transactional
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
@Transactional
class AuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder
) {

    fun validateCredentials(request: ValidateCredentialsRequest): UserResponse? {
        val user = userRepository.findByEmail(request.email) ?: return null

        if (user.provider != AuthProvider.CREDENTIALS || user.password == null) {
            return null
        }


        if (!passwordEncoder.matches(request.password, user.password)) {
            return null
        }

        return UserResponse(
            id = user.id,
            email = user.email,
            name = user.name,
            provider = user.provider.name.lowercase()
        )
    }

    fun syncGoogleUser(request: SyncGoogleUserRequest): SyncGoogleUserResponse {
        val existingUser = userRepository.findByProviderAndProviderId(AuthProvider.GOOGLE, request.googleId)
            ?: userRepository.findByEmail(request.email)

        return if (existingUser != null) {
            if (existingUser.providerId != request.googleId) {
                val updatedUser = existingUser.copy(
                    providerId = request.googleId,
                    provider = AuthProvider.GOOGLE
                )
                userRepository.save(updatedUser)
            }

            SyncGoogleUserResponse(
                userId = existingUser.id,
                message = "User synced successfully"
            )
        } else {
            val newUser = User(
                email = request.email,
                name = request.name,
                providerId = request.googleId,
                provider = AuthProvider.GOOGLE
            )
            val savedUser = userRepository.save(newUser)

            SyncGoogleUserResponse(
                userId = savedUser.id,
                message = "New user created and synced"
            )
        }
    }

    fun registerUser(email: String, password: String, name: String): UserResponse {
        if (userRepository.existsByEmail(email)) {
            throw IllegalArgumentException("User with this email already exists")
        }

        val user = User(
            email = email,
            password = passwordEncoder.encode(password),
            name = name,
            provider = AuthProvider.CREDENTIALS
        )

        val savedUser = userRepository.save(user)

        return UserResponse(
            id = savedUser.id,
            email = savedUser.email,
            name = savedUser.name,
            provider = savedUser.provider.name.lowercase()
        )
    }
}

data class ValidateCredentialsRequest(
    val email: String,
    val password: String
)

data class SyncGoogleUserRequest(
    val googleId: String,
    val email: String,
    val name: String
)

data class UserResponse(
    val id: Long,
    val email: String,
    val name: String,
    val provider: String
)

data class SyncGoogleUserResponse(
    val userId: Long,
    val message: String
)