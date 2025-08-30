package com.compahunt.service

import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class EmailCleaningService {

    private val log = LoggerFactory.getLogger(EmailCleaningService::class.java)

    companion object {
        // Patterns for removing tracking garbage
        private val TRACKING_URLS = Regex(
            "trackingId=[^\\s&]*|refId=[^\\s&]*|lipi=[^\\s&]*|midToken=[^\\s&]*|midSig=[^\\s&]*|trk=[^\\s&]*|trkEmail=[^\\s&]*|eid=[^\\s&]*|otpToken=[^\\s&]*|loid=[^\\s&]*"
        )

        // Separators and formatting
        private val SEPARATOR_LINES = Regex("-{20,}")
        private val EXCESSIVE_NEWLINES = Regex("\\r?\\n\\s*\\r?\\n\\s*\\r?\\n+")
        private val CARRIAGE_RETURNS = Regex("\\r\\n|\\r")

        // HTML tags and their content
        private val HTML_TAGS = Regex("<[^>]*>")
        private val IMG_TRACKING = Regex("<img[^>]*tracking[^>]*>", RegexOption.IGNORE_CASE)

        // FIXED patterns for footers - more precise
        private val LINKEDIN_FOOTER_START = Regex("This email was intended for [^\\n]*\\n")
        private val LINKEDIN_COPYRIGHT = Regex("© 20\\d{2} LinkedIn Corporation[^\\n]*\\n?")
        private val LINKEDIN_TRADEMARK = Regex("LinkedIn and the LinkedIn logo are registered trademarks[^\\n]*\\n?")
        private val UNSUBSCRIBE_SECTION = Regex("Unsubscribe\\s*·\\s*Help[^\\n]*\\n?")
        private val LEARN_WHY_LINK = Regex("Learn why we included this\\.[^\\n]*\\n?")
        private val NOTIFICATION_EMAILS = Regex("You are receiving LinkedIn notification emails\\.[^\\n]*\\n?")

        // Similar jobs blocks - more precise pattern
        private val SIMILAR_JOBS_HEADER = Regex("Top jobs looking for your skills[^\\n]*\\n")
        private val SEE_MORE_JOBS = Regex("See more jobs[^\\n]*\\n?")
        private val DESKTOP_APP_PROMO = Regex("Get the new LinkedIn desktop app[^\\n]*\\n?")
        private val MOBILE_APP_SECTION = Regex("Also available on mobile[^\\n]*\\n?")

        // Repeating promotional blocks - safer
        private val PROMOTIONAL_SPACERS = Regex("͏\\s*͏\\s*͏[͏\\s]*") // Invisible characters
        private val NOW_TAKE_STEPS = Regex("Now, take these next steps for more success[^\\n]*\\n?")

        // Patterns for extracting key information
        private val COMPANY_PATTERN = Regex("Your application was sent to ([^\r\n]*)")
        private val POSITION_PATTERN = Regex("Your application was sent to [^\r\n]*\r?\n\r?\n([^\r\n]*)")

        // Patterns for company response emails
        private val COMPANY_RESPONSE_PATTERNS = listOf(
            Regex("Thank you.*?for.*?apply", RegexOption.IGNORE_CASE),
            Regex("We.*?received.*?application", RegexOption.IGNORE_CASE),
            Regex("Regarding next steps", RegexOption.IGNORE_CASE),
            Regex("We.*?review.*?application", RegexOption.IGNORE_CASE)
        )
    }

    // Main email cleaning method
    fun cleanEmailBody(rawBody: String): String {
        val originalSize = rawBody.length
        var content = rawBody

        // Step 1: Remove HTML tags
        content = removeHtmlTags(content)

        // Step 2: Normalize line breaks
        content = normalizeLineBreaks(content)

        // Step 3: Remove tracking URLs
        content = removeTrackingUrls(content)

        // Step 4: Remove footers and service information
        content = removeFooters(content)

        // Step 5: Remove promotional blocks
        content = removePromotionalContent(content)

        // Step 6: Extract core content
        val coreContent = extractCoreContent(content, rawBody)

        // Step 7: Final formatting cleanup
        val finalContent = removeExcessiveWhitespace(coreContent)

        // Log compression statistics
        val compressionRatio = finalContent.length.toFloat() / originalSize
        val formattedRatio = String.format("%.2f", compressionRatio)
        log.info("Email cleaned: originalSize={}, finalSize={}, compressionRatio={}", originalSize, finalContent.length, formattedRatio)

        return finalContent
    }

    // Remove HTML tags with special attention to tracking images
    private fun removeHtmlTags(content: String): String {
        return content
            .replace(IMG_TRACKING, "") // First remove tracking images
            .replace(HTML_TAGS, " ")   // Then all other HTML tags
            .replace("&nbsp;", " ")
            .replace("&lt;", "<")
            .replace("&gt;", ">")
            .replace("&amp;", "&")
    }

    // Normalize line breaks
    private fun normalizeLineBreaks(content: String): String {
        return content.replace(CARRIAGE_RETURNS, "\n")
    }

    // Remove tracking URLs and parameters
    private fun removeTrackingUrls(content: String): String {
        return content.replace(TRACKING_URLS, "")
    }

    // FIXED footer removal - step by step and carefully
    private fun removeFooters(content: String): String {
        var cleaned = content

        // Step 1: Remove promotional spacers (invisible characters)
        cleaned = cleaned.replace(PROMOTIONAL_SPACERS, " ")

        // Step 2: Remove footer elements separately (safer)
        cleaned = cleaned.replace(LINKEDIN_FOOTER_START, "")
        cleaned = cleaned.replace(LINKEDIN_COPYRIGHT, "")
        cleaned = cleaned.replace(LINKEDIN_TRADEMARK, "")
        cleaned = cleaned.replace(UNSUBSCRIBE_SECTION, "")
        cleaned = cleaned.replace(LEARN_WHY_LINK, "")
        cleaned = cleaned.replace(NOTIFICATION_EMAILS, "")

        // Step 3: Remove app promotion blocks
        cleaned = cleaned.replace(DESKTOP_APP_PROMO, "")
        cleaned = cleaned.replace(MOBILE_APP_SECTION, "")

        return cleaned
    }

    // FIXED promotional content removal - more conservative
    private fun removePromotionalContent(content: String): String {
        var cleaned = content

        // Remove only explicit promo blocks, not touching main content
        cleaned = cleaned.replace(NOW_TAKE_STEPS, "")

        // Determine boundaries of "Top jobs looking for your skills" block
        val topJobsStart = content.indexOf("Top jobs looking for your skills")
        if (topJobsStart != -1) {
            // Look for end of block (until footer or end)
            val possibleEnds = listOf(
                content.indexOf("This email was intended", topJobsStart),
                content.indexOf("Get the new LinkedIn desktop app", topJobsStart),
                content.length
            ).filter { it > topJobsStart }

            if (possibleEnds.isNotEmpty()) {
                val topJobsEnd = possibleEnds.minOrNull() ?: content.length
                val beforeJobs = content.substring(0, topJobsStart)
                val afterJobs = content.substring(topJobsEnd)
                cleaned = beforeJobs + afterJobs
            }
        }

        return cleaned
    }

    // Main method for extracting key content
    private fun extractCoreContent(content: String, originalContent: String): String {
        val emailType = detectEmailType(originalContent)

        return when {
            isLinkedInConfirmation(emailType) -> extractLinkedInConfirmation(content)
            isCompanyResponse(emailType) -> extractCompanyResponse(content)
            isRejection(emailType) -> extractRejectionContent(content)
            isInterviewInvitation(emailType) -> extractInterviewInvitation(content)
            else -> extractGenericContent(content)
        }
    }

    // Extract content from LinkedIn confirmations
    private fun extractLinkedInConfirmation(content: String): String {
        val company = COMPANY_PATTERN.find(content)?.groupValues?.get(1)?.trim()
        val position = POSITION_PATTERN.find(content)?.groupValues?.get(1)?.trim()

        return if (company != null && position != null) {
            buildString {
                append("Application sent to $company")
                if (position.isNotEmpty() && position != company) {
                    append(" for $position position")
                }
            }
        } else {
            // Fallback: take first meaningful lines
            content.lines()
                .filter { it.trim().isNotEmpty() && it.length > 10 }
                .take(3)
                .joinToString(" ")
                .trim()
        }
    }

    // Extract content from company responses
    private fun extractCompanyResponse(content: String): String {
        val lines = content.lines().filter { it.trim().isNotEmpty() }

        // Look for key company phrases
        val importantLines = lines.filter { line ->
            COMPANY_RESPONSE_PATTERNS.any { pattern ->
                pattern.containsMatchIn(line)
            } || line.contains("position", ignoreCase = true)
                    || line.contains("role", ignoreCase = true)
        }

        return if (importantLines.isNotEmpty()) {
            importantLines.joinToString(" ").take(200) + if (importantLines.joinToString(" ").length > 200) "..." else ""
        } else {
            // Take first few lines, excluding headers
            lines.drop(1).take(3).joinToString(" ").trim()
        }
    }

    // Extract content from rejection emails
    private fun extractRejectionContent(content: String): String {
        val keyLines = content.lines()
            .filter { line ->
                line.contains("unfortunately", ignoreCase = true) ||
                        line.contains("not moving forward", ignoreCase = true) ||
                        line.contains("decided not to", ignoreCase = true)
            }
            .take(2)

        return if (keyLines.isNotEmpty()) {
            keyLines.joinToString(" ")
        } else {
            content.lines().filter { it.trim().isNotEmpty() }.take(2).joinToString(" ")
        }
    }

    // Extract content from interview invitations
    private fun extractInterviewInvitation(content: String): String {
        val keyLines = content.lines()
            .filter { line ->
                line.contains("interview", ignoreCase = true) ||
                        line.contains("meeting", ignoreCase = true) ||
                        line.contains("call", ignoreCase = true) ||
                        line.contains("schedule", ignoreCase = true)
            }
            .take(3)

        return keyLines.joinToString(" ").ifEmpty {
            content.lines().filter { it.trim().isNotEmpty() }.take(3).joinToString(" ")
        }
    }

    // General content extraction for unknown types
    private fun extractGenericContent(content: String): String {
        val meaningfulLines = content.lines()
            .filter { line ->
                val trimmed = line.trim()
                trimmed.isNotEmpty() &&
                        trimmed.length > 5 &&
                        !trimmed.startsWith("http") &&
                        !trimmed.contains("@")
            }
            .take(4)

        return meaningfulLines.joinToString(" ")
    }

    // Remove excessive whitespace and line breaks
    private fun removeExcessiveWhitespace(content: String): String {
        return content
            .replace(SEPARATOR_LINES, "\n")
            .replace(EXCESSIVE_NEWLINES, "\n\n")
            .replace(Regex("\\s+"), " ")
            .trim()
    }

    // Detect email type
    private fun detectEmailType(content: String): String {
        return when {
            content.contains("Your application was sent to", ignoreCase = true) -> "linkedin_confirmation"
            content.contains("Thank you.*for.*apply", ignoreCase = true) -> "company_response"
            content.contains("unfortunately", ignoreCase = true) ||
                    content.contains("not moving forward", ignoreCase = true) -> "rejection"
            content.contains("interview", ignoreCase = true) ||
                    content.contains("schedule", ignoreCase = true) -> "interview_invitation"
            else -> "unknown"
        }
    }

    // Helper methods for type checking
    private fun isLinkedInConfirmation(emailType: String) = emailType == "linkedin_confirmation"
    private fun isCompanyResponse(emailType: String) = emailType == "company_response"
    private fun isRejection(emailType: String) = emailType == "rejection"
    private fun isInterviewInvitation(emailType: String) = emailType == "interview_invitation"
}