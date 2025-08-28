package com.compahunt.controller

import com.compahunt.model.AuthProvider
import com.compahunt.model.User
import com.compahunt.repository.UserRepository
import jakarta.validation.Valid
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import com.compahunt.util.JwtUtils
import java.util.UUID

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = ["http://localhost:3000"])
class AuthController(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtUtils: JwtUtils
) {

    private val log = LoggerFactory.getLogger(AuthController::class.java);

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
                val userDb = userRepository.save(user)
                log.info("Created new Google user: ${userDb.id}")
            } else {
                if (user.provider != AuthProvider.GOOGLE) {
                    user.provider = AuthProvider.GOOGLE
                    user.providerId = request.googleId
                    val userDb = userRepository.save(user)
                    log.info("Synced existing Google user: ${userDb.id}")
                }
            }

            ResponseEntity.ok(mapOf(
                "userId" to user.id,
                "email" to user.email,
                "name" to user.name
            ))
        } catch (ex: Exception) {
            log.error("Error syncing Google user: ${ex.message}")
            ex.printStackTrace()
            ResponseEntity.badRequest()
                .body(mapOf("message" to "Failed to sync user"))
        }
    }

    @GetMapping("/validate")
    fun validateToken(@RequestHeader("Authorization") authHeader: String): ResponseEntity<*> {
        return try {
            val token = authHeader.removePrefix("Bearer ").trim()
            
            if (jwtUtils.validateToken(token)) {
                val userId = jwtUtils.getUserIdFromToken(token)
                val email = jwtUtils.getEmailFromToken(token)
                val name = jwtUtils.getNameFromToken(token)
                
                ResponseEntity.ok(mapOf(
                    "valid" to true,
                    "userId" to userId,
                    "email" to email,
                    "name" to name
                ))
            } else {
                ResponseEntity.status(401).body(mapOf(
                    "valid" to false,
                    "message" to "Invalid token"
                ))
            }
        } catch (ex: Exception) {
            log.error("Token validation error: ${ex.message}")
            ResponseEntity.status(401).body(mapOf(
                "valid" to false,
                "message" to "Token validation failed"
            ))
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