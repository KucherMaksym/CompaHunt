package com.compahunt.controller

import com.compahunt.model.UserPrincipal
import com.compahunt.service.GmailService
import com.compahunt.service.OAuthTokenService
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/gmail")
class GmailController(
    private val oauthTokenService: OAuthTokenService,
    private val gmailService: GmailService
) {

    private val log = LoggerFactory.getLogger(GmailController::class.java)

    @PostMapping("/sync")
    fun syncGmailEmails(principal: Authentication): ResponseEntity<*> {
        val userPrincipal = principal.principal as UserPrincipal

        if (!oauthTokenService.hasGmailAccess(userPrincipal.id)) {
            return ResponseEntity.badRequest().body(
                mapOf(
                    "error" to "NO_GMAIL_ACCESS",
                    "message" to "Gmail integration not available. Please connect your Google account.",
                    "action" to "CONNECT_GOOGLE"
                )
            )
        }

        val gmailToken = oauthTokenService.getValidGmailToken(userPrincipal.id)
            ?: return ResponseEntity.badRequest().body(
                mapOf(
                    "error" to "INVALID_GMAIL_TOKEN",
                    "message" to "Failed to get valid Gmail access token"
                )
            )

        return try {
            val emails = gmailService.searchJobRelatedEmails(gmailToken, userPrincipal.email)

            // TODO val updatedApplications = applicationService.updateFromEmails(emails)

            log.info("Gmail sync completed for user ${userPrincipal.id}: ${emails.size} emails processed")

            ResponseEntity.ok(
                mapOf(
                    "success" to true,
                    "emails" to emails,
                    "message" to "Gmail sync completed successfully"
                )
            )
        } catch (e: Exception) {
            log.error("Gmail sync failed for user ${userPrincipal.id}", e)
            ResponseEntity.internalServerError().body(
                mapOf(
                    "error" to "SYNC_FAILED",
                    "message" to "Failed to sync Gmail emails"
                )
            )
        }
    }

    @GetMapping("/status")
    fun getGmailStatus(principal: Authentication): ResponseEntity<*> {
        val userPrincipal = principal.principal as UserPrincipal
        val hasAccess = oauthTokenService.hasGmailAccess(userPrincipal.id)

        return ResponseEntity.ok(
            mapOf(
                "hasGmailAccess" to hasAccess,
                "provider" to userPrincipal.provider
            )
        )
    }

    @DeleteMapping("/disconnect")
    fun disconnectGmail(principal: Authentication): ResponseEntity<*> {
        val userPrincipal = principal.principal as UserPrincipal

        oauthTokenService.revokeGmailAccess(userPrincipal.id)

        return ResponseEntity.ok(
            mapOf(
                "success" to true,
                "message" to "Gmail access revoked successfully"
            )
        )
    }
}