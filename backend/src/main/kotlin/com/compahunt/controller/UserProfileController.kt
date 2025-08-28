package com.compahunt.controller

import com.compahunt.dto.*
import com.compahunt.model.UserPrincipal
import com.compahunt.service.UserProfileService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = ["http://localhost:3000"])
class UserProfileController(
    private val userProfileService: UserProfileService
) {

    @GetMapping
    fun getUserProfile(@AuthenticationPrincipal userPrincipal: UserPrincipal): ResponseEntity<UserProfileResponse> {
        val userId = userPrincipal.id;
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
        @AuthenticationPrincipal userPrincipal: UserPrincipal
    ): ResponseEntity<UserProfileResponse> {
        val userId = userPrincipal.id
        val profile = userProfileService.createOrUpdateUserProfile(userId, request)
        
        return ResponseEntity.ok(profile)
    }

    @PutMapping("/basic")
    fun updateBasicProfile(
        @Valid @RequestBody request: UserProfileRequest,
        @AuthenticationPrincipal userPrincipal: UserPrincipal
    ): ResponseEntity<UserProfileResponse> {
        val userId = userPrincipal.id
        
        return try {
            val profile = userProfileService.updateBasicProfile(userId, request)
            ResponseEntity.ok(profile)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.notFound().build()
        }
    }

    @GetMapping("/exists")
    fun checkProfileExists(@AuthenticationPrincipal userPrincipal: UserPrincipal): ResponseEntity<Map<String, Boolean>> {
        val userId = userPrincipal.id
        val exists = userProfileService.profileExists(userId)
        
        return ResponseEntity.ok(mapOf("exists" to exists))
    }
}