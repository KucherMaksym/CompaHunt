package com.compahunt.service

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport
import com.google.api.client.json.gson.GsonFactory
import com.google.api.services.gmail.Gmail
import com.google.api.services.gmail.model.Message
import com.google.auth.http.HttpCredentialsAdapter
import com.google.auth.oauth2.AccessToken
import com.google.auth.oauth2.GoogleCredentials
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.time.Instant

@Service
class GmailService {

    private val log = LoggerFactory.getLogger(GmailService::class.java)

    private fun buildGmailService(accessToken: String): Gmail {
        val credential = GoogleCredentials.create(AccessToken(accessToken, null))
        val requestInitializer = HttpCredentialsAdapter(credential)

        return Gmail.Builder(
            GoogleNetHttpTransport.newTrustedTransport(),
            GsonFactory.getDefaultInstance(),
            requestInitializer
        )
            .setApplicationName("CompaHunt")
            .build()
    }

    fun searchJobRelatedEmails(accessToken: String, userEmail: String): List<EmailData> {
        return try {
            val service = buildGmailService(accessToken)

            // Search job-related emails
            val query = buildQuery()

            val listRequest = service.users().messages().list("me")
                .setQ(query)
                .setMaxResults(10)
                .setLabelIds(listOf("INBOX"))

            val messages = listRequest.execute().messages ?: return emptyList()

            log.info("Found ${messages.size} potential job-related emails")

            messages.mapNotNull { message ->
                try {
                    val fullMessage = service.users().messages().get("me", message.id).execute()
                    parseJobEmail(fullMessage)
                } catch (e: Exception) {
                    log.warn("Failed to parse email ${message.id}: ${e.message}")
                    null
                }
            }
        } catch (e: Exception) {
            log.error("Failed to search Gmail for user $userEmail", e)
            emptyList()
        }
    }

    private fun buildQuery(): String {
        return listOf(
            "from:(noreply OR careers OR hr OR recruiting OR talent)",
            "OR subject:(interview OR application OR position OR job OR offer OR rejection)",
            "OR body:(thank you for your application OR we have reviewed OR interview scheduled)",
            "newer_than:30d"
        ).joinToString(" ")
    }

    private fun parseJobEmail(message: Message): EmailData? {
        val headers = message.payload?.headers ?: return null
        val subject = headers.find { it.name.equals("Subject", true) }?.value ?: return null
        val from = headers.find { it.name.equals("From", true) }?.value ?: return null
        val date = headers.find { it.name.equals("Date", true) }?.value

        val body = extractEmailBody(message)

        val status = determineApplicationStatus(subject, body)

        return EmailData(
            messageId = message.id,
            subject = subject,
            from = from,
            body = body,
            receivedAt = parseEmailDate(date) ?: Instant.now(),
            status = status
        )
    }

    private fun extractEmailBody(message: Message): String {
        val payload = message.payload ?: return ""

        return when {
            payload.mimeType == "text/plain" ->
                String(java.util.Base64.getUrlDecoder().decode(payload.body?.data ?: ""))
            payload.mimeType == "text/html" ->
                String(java.util.Base64.getUrlDecoder().decode(payload.body?.data ?: ""))
            payload.parts != null -> {
                payload.parts.firstOrNull { it.mimeType == "text/plain" }
                    ?.let { String(java.util.Base64.getUrlDecoder().decode(it.body?.data ?: "")) }
                    ?: ""
            }
            else -> ""
        }
    }

    private fun determineApplicationStatus(subject: String, body: String): ApplicationStatus {
        val text = "$subject $body".lowercase()

        return when {
            text.contains("congratulations") || text.contains("offer") || text.contains("we're pleased") ->
                ApplicationStatus.OFFER
            text.contains("rejected") || text.contains("unfortunately") || text.contains("not moving forward") ->
                ApplicationStatus.REJECTED
            text.contains("interview") && !text.contains("unfortunately") ->
                ApplicationStatus.INTERVIEW
            text.contains("phone") || text.contains("call") || text.contains("screen") ->
                ApplicationStatus.PHONE_SCREEN
            text.contains("received your application") || text.contains("thank you for applying") ->
                ApplicationStatus.APPLIED
            else -> ApplicationStatus.VIEWED
        }
    }

    private fun parseEmailDate(dateString: String?): Instant? {
        return try {
            // Implement email date parsing
            Instant.now() // placeholder
        } catch (e: Exception) {
            null
        }
    }
}

data class EmailData(
    val messageId: String,
    val subject: String,
    val from: String,
    val body: String,
    val receivedAt: Instant,
    val status: ApplicationStatus
)

enum class ApplicationStatus {
    APPLIED, VIEWED, PHONE_SCREEN, INTERVIEW, FINAL_ROUND, OFFER, REJECTED
}