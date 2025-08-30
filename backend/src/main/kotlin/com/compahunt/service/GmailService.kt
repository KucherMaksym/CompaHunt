package com.compahunt.service

import com.compahunt.enums.GmailMessageFormat
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport
import com.google.api.client.json.gson.GsonFactory
import com.google.api.services.gmail.Gmail
import com.google.api.services.gmail.model.Message
import com.google.api.services.gmail.model.MessagePart
import com.google.auth.http.HttpCredentialsAdapter
import com.google.auth.oauth2.AccessToken
import com.google.auth.oauth2.GoogleCredentials
import org.jsoup.Jsoup
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.time.Instant
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter
import java.util.*

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
                    val fullMessage = service.users().messages().get("me", message.id)
                        .setFormat(GmailMessageFormat.FULL.value)
                        .execute()
                    parseJobEmail(fullMessage)
                } catch (e: Exception) {
                    log.warn("Failed to parse email ${message.id}: ${e.message}")
                    null
                }
            }.also {
                log.info("Successfully parsed ${it.size} job-related emails")
            }
        } catch (e: Exception) {
            log.error("Failed to search Gmail for user $userEmail", e)
            emptyList()
        }
    }

    private fun buildQuery(): String {
        return listOf(
            "from:(noreply OR careers OR hr OR recruiting OR talent OR linkedin)",
            "OR subject:(interview OR application OR position OR job OR offer OR rejection OR update)",
            "OR body:(thank you for your application OR we have reviewed OR interview scheduled OR unfortunately OR not moving forward)",
            "newer_than:30d"
        ).joinToString(" ")
    }

    private fun parseJobEmail(message: Message): EmailData? {
        val headers = message.payload?.headers ?: return null
        val subject = headers.find { it.name.equals("Subject", true) }?.value ?: return null
        val from = headers.find { it.name.equals("From", true) }?.value ?: return null
        val date = headers.find { it.name.equals("Date", true) }?.value

        val body = extractFullEmailBody(message)

        log.debug("Extracted email body for ${message.id}: ${body.take(200)}...")

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

    private fun extractFullEmailBody(message: Message): String {
        val payload = message.payload ?: return ""

        log.debug("Processing message with mimeType: ${payload.mimeType}")

        val allTextParts = mutableListOf<String>()

        extractTextFromPart(payload, allTextParts)

        val combinedText = allTextParts.joinToString("\n\n")

        log.debug("Extracted ${allTextParts.size} text parts, combined length: ${combinedText.length}")

        return if (combinedText.isNotBlank()) {
            combinedText.trim()
        } else {
            log.warn("No text content found in message ${message.id}")
            ""
        }
    }

    private fun extractTextFromPart(part: MessagePart, textParts: MutableList<String>) {
        val mimeType = part.mimeType ?: ""

        log.debug("Processing part with mimeType: $mimeType")

        when {
            mimeType == "text/plain" -> {
                val text = decodeBase64Body(part.body?.data)
                if (text.isNotBlank()) {
                    textParts.add(text)
                    log.debug("Added text/plain part: ${text.take(100)}...")
                }
            }

            mimeType == "text/html" -> {
                val htmlText = decodeBase64Body(part.body?.data)
                if (htmlText.isNotBlank()) {
                    // Convert HTML into plain text
                    val plainText = htmlToPlainText(htmlText)
                    if (plainText.isNotBlank()) {
                        textParts.add(plainText)
                        log.debug("Added text/html part (converted): ${plainText.take(100)}...")
                    }
                }
            }

            mimeType.startsWith("multipart/") -> {
                part.parts?.forEach { childPart ->
                    extractTextFromPart(childPart, textParts)
                }
            }

            part.parts != null -> {
                part.parts.forEach { childPart ->
                    extractTextFromPart(childPart, textParts)
                }
            }
        }
    }

    private fun decodeBase64Body(data: String?): String {
        return try {
            if (data.isNullOrBlank()) return ""

            // Gmail uses URL-safe Base64 encoding
            val decoded = Base64.getUrlDecoder().decode(data)
            String(decoded, Charsets.UTF_8)
        } catch (e: Exception) {
            log.warn("Failed to decode base64 data: ${e.message}")
            ""
        }
    }

    private fun htmlToPlainText(html: String): String {
        return try {
            val document = Jsoup.parse(html)

            // Delete script and style tags
            document.select("script, style").remove()

            val text = document.text()

            text.replace(Regex("\\s+"), " ").trim()
        } catch (e: Exception) {
            log.warn("Failed to parse HTML content: ${e.message}")
            html // Return html if failed to parse
        }
    }

    private fun determineApplicationStatus(subject: String, body: String): ApplicationStatus {
        val text = "$subject $body".lowercase()

        log.debug("Determining status for text: ${text.take(200)}")

        return when {
            // Offers
            text.contains("congratulations") ||
                    text.contains("offer") && !text.contains("job offer") ||
                    text.contains("we're pleased") ||
                    text.contains("happy to extend") ->
                ApplicationStatus.OFFER.also { log.debug("Detected OFFER") }

            // Rejections
            text.contains("rejected") ||
                    text.contains("unfortunately") ||
                    text.contains("not moving forward") ||
                    text.contains("will not be moving forward") ||
                    text.contains("decided not to") ||
                    text.contains("pursue other candidates") ||
                    text.contains("not be considered") ||
                    text.contains("application will not be moving") ->
                ApplicationStatus.REJECTED.also { log.debug("Detected REJECTION") }

            // Interviews
            text.contains("interview") && !text.contains("unfortunately") ->
                ApplicationStatus.INTERVIEW.also { log.debug("Detected INTERVIEW") }

            // Phone screens
            text.contains("phone") ||
                    text.contains("call") ||
                    text.contains("screen") ->
                ApplicationStatus.PHONE_SCREEN.also { log.debug("Detected PHONE_SCREEN") }

            // Application confirmations
            text.contains("received your application") ||
                    text.contains("thank you for applying") ||
                    text.contains("application was sent to") ->
                ApplicationStatus.APPLIED.also { log.debug("Detected APPLIED") }

            else -> ApplicationStatus.VIEWED.also { log.debug("Detected VIEWED (default)") }
        }
    }

    private fun parseEmailDate(dateString: String?): Instant? {
        if (dateString.isNullOrBlank()) return null

        return try {
            // Gmail dates in RFC 2822 format: "Fri, 30 Aug 2025 10:11:52 +0200 (CEST)"

            val cleanDateString = dateString.replace(Regex("\\s*\\([^)]+\\)\\s*$"), "").trim()

            // Parse as RFC 1123
            val formatter = DateTimeFormatter.RFC_1123_DATE_TIME
            val zonedDateTime = ZonedDateTime.parse(cleanDateString, formatter)

            zonedDateTime.toInstant()
        } catch (e: Exception) {
            log.warn("Failed to parse email date '$dateString': ${e.message}")
            try {
                val isoString = dateString.replace(Regex("[A-Za-z]{3},\\s*"), "")
                Instant.parse(isoString)
            } catch (e2: Exception) {
                log.warn("Failed fallback date parsing: ${e2.message}")
                Instant.now()
            }
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
    APPLIED, VIEWED, PHONE_SCREEN, INTERVIEW, FINAL_ROUND, OFFER, REJECTED, UNKNOWN
}