package com.compahunt.controller

import com.compahunt.model.GmailNotificationEvent
import com.compahunt.repository.GmailNotificationEventRepository
import com.compahunt.repository.GmailWatchSubscriptionRepository
import com.compahunt.service.GmailPushNotificationService
import com.compahunt.service.UserLookupService
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.ObjectMapper
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.scheduling.annotation.Async
import org.springframework.web.bind.annotation.*
import java.time.Instant
import java.util.*

@RestController
@RequestMapping("/api/gmail/webhook")
class GmailWebhookController(
    private val pushNotificationService: GmailPushNotificationService,
    private val gmailWatchRepository: GmailWatchSubscriptionRepository,
    private val notificationEventRepository: GmailNotificationEventRepository,
    private val userLookupService: UserLookupService,
    private val objectMapper: ObjectMapper
) {

    private val log = LoggerFactory.getLogger(GmailWebhookController::class.java)

    @PostMapping("/push")
    fun handlePushNotification(@RequestBody payload: PubSubMessage): ResponseEntity<String> {
        return try {
            log.info("Received Gmail push notification: ${payload.message.messageId}")

            // Decode data from Base64
            val data = String(Base64.getDecoder().decode(payload.message.data))
            log.debug("Decoded notification data: $data")

            val notificationData = objectMapper.readValue(data, GmailNotificationData::class.java)

            // Find user by email
            val userId = findUserByEmail(notificationData.emailAddress)
            if (userId == null) {
                log.warn("No user found for email: ${notificationData.emailAddress}")
                return ResponseEntity.ok("No user found")
            }

            // Check active subscription
            val subscription = gmailWatchRepository.findByUserIdAndIsActive(userId, true)
            if (subscription == null) {
                log.warn("No active Gmail subscription for user $userId")
                return ResponseEntity.ok("No active subscription")
            }

            val event = GmailNotificationEvent(
                userId = userId,
                historyId = notificationData.historyId
            )
            notificationEventRepository.save(event)

            processNotificationAsync(userId, notificationData.historyId)

            log.info("Successfully processed Gmail push notification for user $userId")
            ResponseEntity.ok("Success")

        } catch (e: Exception) {
            log.error("Failed to process Gmail push notification", e)
            ResponseEntity.ok("Error") // 200 to prevent resending
        }
    }

    @Async
    fun processNotificationAsync(userId: UUID, historyId: Long) {
        try {
            pushNotificationService.processGmailNotification(userId, historyId)
        } catch (e: Exception) {
            log.error("Async processing failed for user $userId, historyId $historyId", e)
        }
    }

    private fun findUserByEmail(email: String): UUID? {
        return userLookupService.findUserIdByEmail(email)
    }


    //TODO: delete test endpoint
    @PostMapping("/test/{userId}")
    fun sendTestNotification(@PathVariable userId: UUID): ResponseEntity<Map<String, Any>> {
        return try {
            log.info("Sending test Gmail notification for user $userId")

            val subscription = gmailWatchRepository.findByUserIdAndIsActive(userId, true)
                ?: return ResponseEntity.badRequest().body(
                    mapOf("error" to "No active subscription for user")
                )

            pushNotificationService.processGmailNotification(userId, subscription.historyId + 1)

            ResponseEntity.ok(mapOf(
                "success" to true,
                "message" to "Test notification sent",
                "userId" to userId
            ))
        } catch (e: Exception) {
            log.error("Failed to send test notification for user $userId", e)
            ResponseEntity.internalServerError().body(
                mapOf("error" to "Failed to send test notification")
            )
        }
    }
}

// Data classes for Pub/Sub webhook
data class PubSubMessage(
    val message: PubSubMessageData,
    val subscription: String
)

data class PubSubMessageData(
    val data: String, // Base64 encoded
    val messageId: String,
    val publishTime: String,
    val attributes: Map<String, String> = emptyMap()
)

data class GmailNotificationData(
    @JsonProperty("emailAddress")
    val emailAddress: String,
    @JsonProperty("historyId")
    val historyId: Long
)