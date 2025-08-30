package com.compahunt.controller

import com.compahunt.model.UserPrincipal
import com.compahunt.service.EmailCleaningService
import com.compahunt.service.GmailService
import com.compahunt.service.GmailPushNotificationService
import com.compahunt.service.OAuthTokenService
import com.compahunt.repository.GmailWatchSubscriptionRepository
import com.compahunt.repository.GmailNotificationEventRepository
import org.slf4j.LoggerFactory
import org.springframework.data.domain.PageRequest
import org.springframework.http.ResponseEntity
import org.springframework.security.access.annotation.Secured
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/gmail")
class GmailController(
    private val oauthTokenService: OAuthTokenService,
    private val gmailService: GmailService,
    private val emailCleaningService: EmailCleaningService,
    private val pushNotificationService: GmailPushNotificationService,
    private val gmailWatchRepository: GmailWatchSubscriptionRepository,
    private val notificationEventRepository: GmailNotificationEventRepository
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

            val processedEmails = emails.map { email ->
                val cleanedBody = emailCleaningService.cleanEmailBody(email.body)
                mapOf(
                    "id" to email.messageId,
                    "subject" to email.subject,
                    "sender" to email.from,
                    "date" to email.receivedAt,
                    "originalBody" to email.body,
                    "cleanedBody" to cleanedBody,
                    "detectedStatus" to email.status
                )
            }

            log.info("Gmail sync completed for user ${userPrincipal.id}: ${emails.size} emails processed")

            ResponseEntity.ok(
                mapOf(
                    "success" to true,
                    "emails" to processedEmails,
                    "count" to emails.size,
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

    @PostMapping("/notifications/enable")
    fun enablePushNotifications(principal: Authentication): ResponseEntity<*> {
        val userPrincipal = principal.principal as UserPrincipal

        if (!oauthTokenService.hasGmailAccess(userPrincipal.id)) {
            return ResponseEntity.badRequest().body(
                mapOf(
                    "error" to "NO_GMAIL_ACCESS",
                    "message" to "Gmail integration not available. Please connect your Google account first."
                )
            )
        }

        return try {
            val success = pushNotificationService.enablePushNotifications(userPrincipal.id)

            if (success) {
                val subscription = gmailWatchRepository.findByUserIdAndIsActive(userPrincipal.id, true)
                ResponseEntity.ok(
                    mapOf(
                        "success" to true,
                        "message" to "Gmail push notifications enabled successfully",
                        "subscription" to mapOf(
                            "historyId" to subscription?.historyId,
                            "expiration" to subscription?.expiration,
                            "isActive" to subscription?.isActive
                        )
                    )
                )
            } else {
                ResponseEntity.internalServerError().body(
                    mapOf(
                        "error" to "ENABLE_FAILED",
                        "message" to "Failed to enable Gmail push notifications"
                    )
                )
            }
        } catch (e: Exception) {
            log.error("Failed to enable push notifications for user ${userPrincipal.id}", e)
            ResponseEntity.internalServerError().body(
                mapOf(
                    "error" to "ENABLE_FAILED",
                    "message" to "Failed to enable Gmail push notifications: ${e.message}"
                )
            )
        }
    }

    @PostMapping("/notifications/disable")
    fun disablePushNotifications(principal: Authentication): ResponseEntity<*> {
        val userPrincipal = principal.principal as UserPrincipal

        return try {
            val success = pushNotificationService.disablePushNotifications(userPrincipal.id)

            ResponseEntity.ok(
                mapOf(
                    "success" to success,
                    "message" to if (success) "Gmail push notifications disabled successfully"
                    else "Failed to disable Gmail push notifications"
                )
            )
        } catch (e: Exception) {
            log.error("Failed to disable push notifications for user ${userPrincipal.id}", e)
            ResponseEntity.internalServerError().body(
                mapOf(
                    "error" to "DISABLE_FAILED",
                    "message" to "Failed to disable Gmail push notifications: ${e.message}"
                )
            )
        }
    }

    @GetMapping("/notifications/status")
    fun getNotificationStatus(principal: Authentication): ResponseEntity<*> {
        val userPrincipal = principal.principal as UserPrincipal

        val hasGmailAccess = oauthTokenService.hasGmailAccess(userPrincipal.id)
        val subscription = gmailWatchRepository.findByUserIdAndIsActive(userPrincipal.id, true)

        val recentEvents = notificationEventRepository.findByUserIdOrderByCreatedAtDesc(
            userPrincipal.id,
            PageRequest.of(0, 10)
        )

        return ResponseEntity.ok(
            mapOf(
                "hasGmailAccess" to hasGmailAccess,
                "pushNotificationsEnabled" to (subscription != null && subscription.isActive),
                "subscription" to if (subscription != null) mapOf(
                    "historyId" to subscription.historyId,
                    "expiration" to subscription.expiration,
                    "isActive" to subscription.isActive,
                    "createdAt" to subscription.createdAt
                ) else null,
                "recentNotifications" to recentEvents.content.map { event ->
                    mapOf(
                        "historyId" to event.historyId,
                        "messageId" to event.messageId,
                        "subject" to event.emailSubject,
                        "sender" to event.emailSender,
                        "detectedStatus" to event.detectedStatus,
                        "processedByAi" to event.processedByAi,
                        "createdAt" to event.createdAt
                    )
                },
                "totalNotifications" to recentEvents.totalElements
            )
        )
    }

    @GetMapping("/status")
    fun getGmailStatus(principal: Authentication): ResponseEntity<*> {
        val userPrincipal = principal.principal as UserPrincipal
        val hasAccess = oauthTokenService.hasGmailAccess(userPrincipal.id)
        val subscription = gmailWatchRepository.findByUserIdAndIsActive(userPrincipal.id, true)

        return ResponseEntity.ok(
            mapOf(
                "hasGmailAccess" to hasAccess,
                "provider" to userPrincipal.provider,
                "pushNotificationsEnabled" to (subscription?.isActive == true)
            )
        )
    }

    @DeleteMapping("/disconnect")
    fun disconnectGmail(principal: Authentication): ResponseEntity<*> {
        val userPrincipal = principal.principal as UserPrincipal

        return try {
            pushNotificationService.disablePushNotifications(userPrincipal.id)

            oauthTokenService.revokeGmailAccess(userPrincipal.id)

            ResponseEntity.ok(
                mapOf(
                    "success" to true,
                    "message" to "Gmail access revoked and push notifications disabled successfully"
                )
            )
        } catch (e: Exception) {
            log.error("Failed to disconnect Gmail for user ${userPrincipal.id}", e)
            ResponseEntity.internalServerError().body(
                mapOf(
                    "error" to "DISCONNECT_FAILED",
                    "message" to "Failed to disconnect Gmail: ${e.message}"
                )
            )
        }
    }

    @GetMapping("/notifications/events")
    fun getNotificationEvents(
        principal: Authentication,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): ResponseEntity<*> {
        val userPrincipal = principal.principal as UserPrincipal

        val events = notificationEventRepository.findByUserIdOrderByCreatedAtDesc(
            userPrincipal.id,
            PageRequest.of(page, size)
        )

        return ResponseEntity.ok(
            mapOf(
                "events" to events.content.map { event ->
                    mapOf(
                        "id" to event.id,
                        "historyId" to event.historyId,
                        "messageId" to event.messageId,
                        "subject" to event.emailSubject,
                        "sender" to event.emailSender,
                        "detectedStatus" to event.detectedStatus,
                        "processedByAi" to event.processedByAi,
                        "processingError" to event.processingError,
                        "createdAt" to event.createdAt
                    )
                },
                "totalElements" to events.totalElements,
                "totalPages" to events.totalPages,
                "currentPage" to page,
                "size" to size
            )
        )
    }
}