package com.compahunt.controller

import com.compahunt.model.AuthProvider
import com.compahunt.model.User
import com.compahunt.repository.UserRepository
import jakarta.validation.Valid
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import org.springframework.http.ResponseEntity
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = ["http://localhost:3000"])
class AuthController(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder
) {

    @PostMapping("/validate-credentials")
    fun validateCredentials(@RequestBody request: LoginRequest): ResponseEntity<*> {
        val user = userRepository.findByEmail(request.email)
            ?: return ResponseEntity.badRequest()
                .body(mapOf("message" to "Invalid credentials"))

        if (user.provider != AuthProvider.CREDENTIALS) {
            return ResponseEntity.badRequest()
                .body(mapOf("message" to "Please use ${user.provider} to login"))
        }

        if (!passwordEncoder.matches(request.password, user.password)) {
            return ResponseEntity.badRequest()
                .body(mapOf("message" to "Invalid credentials"))
        }

        return ResponseEntity.ok(mapOf(
            "id" to user.id,
            "email" to user.email,
            "name" to user.name
        ))
    }

    @PostMapping("/register")
    fun register(@Valid @RequestBody request: SignUpRequest): ResponseEntity<*> {
        if (userRepository.existsByEmail(request.email)) {
            return ResponseEntity.badRequest().body(mapOf("message" to "Email already exists"))
        }

        val user = User(
            email = request.email,
            password = passwordEncoder.encode(request.password),
            name = request.name,
            provider = AuthProvider.CREDENTIALS
        )

        val savedUser = userRepository.save(user)

        return ResponseEntity.ok(mapOf(
            "id" to savedUser.id,
            "email" to savedUser.email,
            "name" to savedUser.name,
            "message" to "User registered successfully"
        ))
    }

    @PostMapping("/sync-google-user")
    fun syncGoogleUser(@RequestBody request: GoogleSyncRequest): ResponseEntity<*> {
        return try {
            var user = userRepository.findByEmail(request.email)

            if (user == null) {
                user = User(
                    email = request.email,
                    name = request.name,
                    provider = AuthProvider.GOOGLE,
                    providerId = request.googleId
                )
                userRepository.save(user)
                println("Created new Google user: ${request.email}")
            } else {
                if (user.provider != AuthProvider.GOOGLE) {
                    user.provider = AuthProvider.GOOGLE
                    user.providerId = request.googleId
                    userRepository.save(user)
                }
                println("Synced existing Google user: ${request.email}")
            }

            ResponseEntity.ok(mapOf(
                "userId" to user.id,
                "email" to user.email,
                "name" to user.name
            ))
        } catch (ex: Exception) {
            println("Error syncing Google user: ${ex.message}")
            ex.printStackTrace()
            ResponseEntity.badRequest()
                .body(mapOf("message" to "Failed to sync user"))
        }
    }

}

data class SignUpRequest(
    @NotBlank(message = "Name cannot be blank")
    val name: String,

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email is not valid")
    val email: String,

    @NotBlank(message = "Password cannot be blank")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    val password: String
)

data class LoginRequest(
    val email: String,
    val password: String
)

data class GoogleSyncRequest(
    val email: String,
    val name: String,
    val googleId: String
)