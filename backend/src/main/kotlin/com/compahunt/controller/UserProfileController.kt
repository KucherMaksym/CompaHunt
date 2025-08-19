package com.compahunt.controller

import com.compahunt.dto.*
import com.compahunt.service.UserProfileService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import java.util.*

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = ["http://localhost:3000"])
class UserProfileController(
    private val userProfileService: UserProfileService
) {

    @GetMapping
    fun getUserProfile(authentication: Authentication): ResponseEntity<UserProfileResponse> {
        val userId = getUserIdFromAuth(authentication)
        val profile = userProfileService.getUserProfile(userId)
        
        return if (profile != null) {
            ResponseEntity.ok(profile)
        } else {
            ResponseEntity.notFound().build()
        }
    }

    @PostMapping
    fun createOrUpdateProfile(
        @Valid @RequestBody request: CompleteUserProfileRequest,
        authentication: Authentication
    ): ResponseEntity<UserProfileResponse> {
        val userId = getUserIdFromAuth(authentication)
        val profile = userProfileService.createOrUpdateUserProfile(userId, request)
        
        return ResponseEntity.ok(profile)
    }

    @PutMapping("/basic")
    fun updateBasicProfile(
        @Valid @RequestBody request: UserProfileRequest,
        authentication: Authentication
    ): ResponseEntity<UserProfileResponse> {
        val userId = getUserIdFromAuth(authentication)
        
        return try {
            val profile = userProfileService.updateBasicProfile(userId, request)
            ResponseEntity.ok(profile)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.notFound().build()
        }
    }

    @GetMapping("/exists")
    fun checkProfileExists(authentication: Authentication): ResponseEntity<Map<String, Boolean>> {
        val userId = getUserIdFromAuth(authentication)
        val exists = userProfileService.profileExists(userId)
        
        return ResponseEntity.ok(mapOf("exists" to exists))
    }

    private fun getUserIdFromAuth(authentication: Authentication): UUID {
        return try {
            UUID.fromString(authentication.name)
        } catch (e: IllegalArgumentException) {
            throw IllegalStateException("Cannot extract user ID from authentication", e)
        }
    }
}