package com.compahunt.service

import com.compahunt.enums.GmailMessageFormat
import com.compahunt.model.GmailWatchSubscription
import com.compahunt.repository.GmailWatchSubscriptionRepository
import com.google.api.client.googleapis.batch.BatchCallback
import com.google.api.client.googleapis.batch.json.JsonBatchCallback
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport
import com.google.api.client.googleapis.json.GoogleJsonError
import com.google.api.client.http.HttpHeaders
import com.google.api.client.json.gson.GsonFactory
import com.google.api.services.gmail.Gmail
import com.google.api.services.gmail.model.Message
import com.google.api.services.gmail.model.WatchRequest
import com.google.api.services.gmail.model.WatchResponse
import com.google.auth.http.HttpCredentialsAdapter
import com.google.auth.oauth2.AccessToken
import com.google.auth.oauth2.GoogleCredentials
import jakarta.transaction.Transactional
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.math.BigInteger
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.*

@Service
class GmailPushNotificationService(
    private val gmailWatchRepository: GmailWatchSubscriptionRepository,
    private val oauthTokenService: OAuthTokenService,
    private val gmailService: GmailService
) {

    private val log = LoggerFactory.getLogger(GmailPushNotificationService::class.java)

    @Value("\${app.gmail.pubsub.topic-name}")
    private lateinit var pubSubTopicName: String

    private fun buildGmailService(accessToken: String): Gmail {
        val credential = GoogleCredentials.create(AccessToken(accessToken, null))
        val requestInitializer = HttpCredentialsAdapter(credential)

        return Gmail.Builder(
            GoogleNetHttpTransport.newTrustedTransport(), GsonFactory.getDefaultInstance(), requestInitializer
        ).setApplicationName("CompaHunt").build()
    }

    @Transactional
    fun enablePushNotifications(userId: UUID): Boolean {
        try {
            val accessToken = oauthTokenService.getValidGmailToken(userId)
                ?: throw IllegalStateException("No valid Gmail token for user $userId")

            val service = buildGmailService(accessToken)

            // Check if subscription exists
            val existingSubscription = gmailWatchRepository.findByUserIdAndIsActive(userId, true)
            if (existingSubscription != null && !isSubscriptionExpired(existingSubscription)) {
                log.info("User $userId already has active Gmail watch subscription: ${existingSubscription.historyId}")
                return true
            }

            // Create new subscription
            val watchRequest = WatchRequest().apply {
                topicName = pubSubTopicName
                labelIds = listOf("INBOX")
                labelFilterAction = "include"
            }

            val watchResponse = service.users().watch("me", watchRequest).execute()

            saveWatchSubscription(userId, watchResponse)

            log.info("Successfully enabled Gmail push notifications for user $userId. History ID: ${watchResponse.historyId}")
            return true

        } catch (e: Exception) {
            log.error("Failed to enable Gmail push notifications for user $userId", e)
            return false
        }
    }

    @Transactional
    fun disablePushNotifications(userId: UUID): Boolean {
        try {
            val accessToken = oauthTokenService.getValidGmailToken(userId)
                ?: throw IllegalStateException("No valid Gmail token for user $userId")

            val service = buildGmailService(accessToken)

            // deactivate in Gmail
            service.users().stop("me").execute()

            // deactivate in DB
            gmailWatchRepository.findByUserIdAndIsActive(userId, true)?.let { subscription ->
                subscription.isActive = false
                subscription.updatedAt = Instant.now()
                gmailWatchRepository.save(subscription)
            }

            log.info("Successfully disabled Gmail push notifications for user $userId")
            return true

        } catch (e: Exception) {
            log.error("Failed to disable Gmail push notifications for user $userId", e)
            return false
        }
    }

    private fun saveWatchSubscription(userId: UUID, watchResponse: WatchResponse) {
        // Deactivate old subscription
        gmailWatchRepository.findAllByUserIdAndIsActive(userId, true).forEach { sub ->
            sub.isActive = false
            sub.updatedAt = Instant.now()
        }

        val subscription = GmailWatchSubscription(
            userId = userId,
            historyId = watchResponse.historyId.toLong(),
            expiration = Instant.ofEpochMilli(watchResponse.expiration),
            isActive = true,
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )

        gmailWatchRepository.save(subscription)
        log.info("Saved Gmail watch subscription for user $userId with history ID: ${watchResponse.historyId}")
    }

    fun processGmailNotification(userId: UUID, newHistoryId: Long) {
        try {
            log.info("Processing Gmail notification for user $userId with history ID: $newHistoryId")

            val subscription = gmailWatchRepository.findByUserIdAndIsActive(userId, true) ?: run {
                log.warn("No active Gmail subscription found for user $userId")
                return
            }

            if (newHistoryId <= subscription.historyId) {
                log.debug("History ID $newHistoryId is not newer than stored ${subscription.historyId} for user $userId")
                return
            }

            // Get changes from the last history ID
            val accessToken = oauthTokenService.getValidGmailToken(userId) ?: run {
                log.error("No valid Gmail token for user $userId during notification processing")
                return
            }

            val changes = getGmailHistoryChanges(accessToken, subscription.historyId, newHistoryId)

            if (changes.isNotEmpty()) {
                log.info("Found ${changes.size} new email changes for user $userId")

                // TODO: Analyze by vector model. If similar to job-related -> process by LLM

                changes.forEach { change ->
                    // Remove sensitive data logging in production
                    log.info("New email detected for user '$userId: ${change.subject}' from ${change.sender}")
                    // aiAnalysisService.vectorAnalyzeJobEmail(userId, change)
                }
            }

            // update history ID
            subscription.historyId = newHistoryId
            subscription.updatedAt = Instant.now()
            gmailWatchRepository.save(subscription)

        } catch (e: Exception) {
            log.error("Failed to process Gmail notification for user $userId", e)
        }
    }

    private fun getGmailHistoryChanges(accessToken: String, startHistoryId: Long, endHistoryId: Long): List<EmailChange> {
        return try {
            val service = buildGmailService(accessToken)

            // Changes list
            val historyList = service.users().history().list("me")
                .setStartHistoryId(BigInteger.valueOf(startHistoryId))
                .setHistoryTypes(listOf("messageAdded"))
                .setLabelId("INBOX")
                .execute()

            // Get all message IDs
            val messageIds = mutableListOf<String>()
            historyList.history?.forEach { history ->
                history.messagesAdded?.forEach { messageAdded ->
                    messageIds.add(messageAdded.message.id)
                }
            }

            if (messageIds.isEmpty()) return emptyList()

            // Batch request for all mails
            val changes = mutableListOf<EmailChange>()
            val batchSize = 100 // Gmail API limit

            messageIds.chunked(batchSize).forEach { batch ->
                val batchRequest = service.batch()
                val callbacks = mutableMapOf<String, MessageBatchCallback>()

                batch.forEach { messageId ->
                    val callback = MessageBatchCallback(messageId, changes)
                    callbacks[messageId] = callback

                    service.users().messages().get("me", messageId)
                        .setFormat(GmailMessageFormat.METADATA.value)
                        .setMetadataHeaders(listOf("Subject", "From"))
                        .queue(batchRequest, callback)
                }

                batchRequest.execute()
            }

            changes

        } catch (e: Exception) {
            log.error("Failed to get Gmail history changes batch", e)
            emptyList()
        }
    }

    private fun isSubscriptionExpired(subscription: GmailWatchSubscription): Boolean {
        return subscription.expiration.isBefore(Instant.now())
    }

    @Transactional
    fun renewExpiredSubscriptions() {
        val expiringSubscriptions = gmailWatchRepository.findExpiringSubscriptions(
            Instant.now().plus(1, ChronoUnit.HOURS)
        )

        expiringSubscriptions.forEach { subscription ->
            try {
                log.info("Renewing Gmail subscription for user ${subscription.userId}")
                enablePushNotifications(subscription.userId)
            } catch (e: Exception) {
                log.error("Failed to renew Gmail subscription for user ${subscription.userId}", e)
            }
        }
    }
}

data class EmailChange(
    val messageId: String, val subject: String, val sender: String, val historyId: Long
)

class MessageBatchCallback(
    private val messageId: String,
    private val changes: MutableList<EmailChange>
) : JsonBatchCallback<Message>() {

    private val log = LoggerFactory.getLogger(MessageBatchCallback::class.java)

    override fun onSuccess(message: Message?, headers: HttpHeaders?) {
        try {
            message?.let {
                val headers = it.payload?.headers ?: emptyList()
                val subject = headers.find { h -> h.name.equals("Subject", true) }?.value ?: "No Subject"
                val from = headers.find { h -> h.name.equals("From", true) }?.value ?: "Unknown Sender"

                changes.add(EmailChange(
                    messageId = messageId,
                    subject = subject,
                    sender = from,
                    historyId = it.historyId?.toLong() ?: 0L
                ))
            }
        } catch (e: Exception) {
            log.warn("Failed to process batch message $messageId: ${e.message}")
        }
    }

    override fun onFailure(e: GoogleJsonError?, headers: HttpHeaders?) {
        log.warn("Batch request failed for message $messageId: ${e?.message}")
    }
}