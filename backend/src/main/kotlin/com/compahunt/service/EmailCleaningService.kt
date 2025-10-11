package com.compahunt.service

import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import org.jsoup.nodes.Element
import org.jsoup.safety.Safelist
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
        private val EXCESSIVE_NEWLINES = Regex("\\n{3,}")
        private val CARRIAGE_RETURNS = Regex("\\r\\n|\\r")

        // Footer patterns - more precise
        private val LINKEDIN_FOOTER_START = Regex("This email was intended for.*", RegexOption.DOT_MATCHES_ALL)
        private val LINKEDIN_COPYRIGHT = Regex("© 20\\d{2} LinkedIn Corporation.*\\n?")
        private val LINKEDIN_TRADEMARK = Regex("LinkedIn and the LinkedIn logo are registered trademarks.*\\n?")
        private val UNSUBSCRIBE_SECTION = Regex("Unsubscribe\\s*·\\s*Help.*\\n?")
        private val LEARN_WHY_LINK = Regex("Learn why we included this\\..*\\n?")
        private val NOTIFICATION_EMAILS = Regex("You are receiving LinkedIn notification emails\\..*\\n?")

        // Promotional blocks
        private val PROMOTIONAL_SPACERS = Regex("͏\\s*͏\\s*͏[͏\\s]*")
        private val NOW_TAKE_STEPS = Regex("Now, take these next steps for more success.*\\n?")
        private val DESKTOP_APP_PROMO = Regex("Get the new LinkedIn desktop app.*\\n?")
        private val MOBILE_APP_SECTION = Regex("Also available on mobile.*\\n?")
    }

    // Main email cleaning method
    fun cleanEmailBody(rawBody: String): String {
        val originalSize = rawBody.length
        log.debug("Original length: $originalSize")

        // Step 1: Parse HTML with Jsoup and extract clean text
        var content = extractTextFromHtml(rawBody)
        log.debug("After extractTextFromHtml: ${content.length}")

        // Step 2: Normalize line breaks
        content = normalizeLineBreaks(content)
        log.debug("After normalizeLineBreaks: ${content.length}")

        // Step 3: Remove tracking URLs
        content = removeTrackingUrls(content)
        log.debug("After removeTrackingUrls: ${content.length}")

        // Step 4: Remove footers and service information
        content = removeFooters(content)
        log.debug("After removeFooters: ${content.length}")

        // Step 5: Remove promotional blocks
        content = removePromotionalContent(content)
        log.debug("After removePromotionalContent: ${content.length}")

        // Step 6: Find content boundaries
        val emailType = detectEmailType(rawBody)
        val coreContentBounds = findContentBounds(content, emailType)
        content = content.substring(coreContentBounds.first, coreContentBounds.second).trim()
        log.debug("After extractCoreContent: ${content.length}")

        // Step 7: Final formatting cleanup
        val finalContent = removeExcessiveWhitespace(content)
        log.debug("After removeExcessiveWhitespace: ${finalContent.length}")

        // Log compression statistics
        val compressionRatio = finalContent.length.toFloat() / originalSize
        val formattedRatio = String.format("%.2f", compressionRatio)
        log.debug("Email cleaned: originalSize=$originalSize, finalSize=${finalContent.length}, compressionRatio=$formattedRatio")

        return finalContent
    }

    /**
     * Extract clean text from HTML using Jsoup
     * This properly handles all HTML tags and preserves text structure
     */
    private fun extractTextFromHtml(content: String): String {
        // Check if content contains HTML
        if (!content.contains("<") || !content.contains(">")) {
            // Not HTML, return as is
            return content
        }

        return try {
            val doc: Document = Jsoup.parse(content)

            // Remove tracking images and scripts before extraction
            doc.select("img[src*=tracking]").remove()
            doc.select("img[src*=pixel]").remove()
            doc.select("script").remove()
            doc.select("style").remove()

            // Extract text with proper line breaks
            val text = buildString {
                doc.body().traverse { node, depth ->
                    when {
                        node is Element -> {
                            // Add line breaks for block elements
                            when (node.tagName()) {
                                "p", "div", "br", "tr", "h1", "h2", "h3", "h4", "h5", "h6" -> {
                                    if (node.tagName() != "br") {
                                        append("\n")
                                    } else {
                                        append("\n")
                                    }
                                }
                            }
                        }
                        node.nodeName() == "#text" -> {
                            val text = node.outerHtml().trim()
                            if (text.isNotEmpty()) {
                                append(text)
                                append(" ")
                            }
                        }
                    }
                }
            }

            // Clean up HTML entities
            Jsoup.parse(text).text()
                .replace(Regex("\\s+"), " ") // Normalize spaces
                .replace(Regex(" \\n"), "\n") // Remove spaces before newlines
                .replace(Regex("\\n "), "\n") // Remove spaces after newlines
                .trim()
        } catch (e: Exception) {
            log.warn("Failed to parse HTML with Jsoup, falling back to plain text", e)
            // Fallback: just remove HTML tags with regex
            content
                .replace(Regex("<[^>]*>"), " ")
                .replace("&nbsp;", " ")
                .replace("&lt;", "<")
                .replace("&gt;", ">")
                .replace("&amp;", "&")
                .replace("&quot;", "\"")
        }
    }

    // Normalize line breaks
    private fun normalizeLineBreaks(content: String): String {
        return content
            .replace(CARRIAGE_RETURNS, "\n")
            .replace(Regex("\\n{2,}"), "\n\n") // Max 2 consecutive newlines
    }

    // Remove tracking URLs and parameters
    private fun removeTrackingUrls(content: String): String {
        return content.replace(TRACKING_URLS, "")
    }

    // Footer removal - step by step and carefully
    private fun removeFooters(content: String): String {
        var cleaned = content

        // Step 1: Remove promotional spacers (invisible characters)
        cleaned = cleaned.replace(PROMOTIONAL_SPACERS, " ")

        // Step 2: Remove footer elements - find "This email was intended" and cut everything after
        val footerStart = cleaned.indexOf("This email was intended")
        if (footerStart != -1) {
            cleaned = cleaned.substring(0, footerStart)
        }

        // Step 3: Remove other footer elements if they still exist
        cleaned = cleaned.replace(LINKEDIN_COPYRIGHT, "")
        cleaned = cleaned.replace(LINKEDIN_TRADEMARK, "")
        cleaned = cleaned.replace(UNSUBSCRIBE_SECTION, "")
        cleaned = cleaned.replace(LEARN_WHY_LINK, "")
        cleaned = cleaned.replace(NOTIFICATION_EMAILS, "")

        // Step 4: Remove app promotion blocks
        cleaned = cleaned.replace(DESKTOP_APP_PROMO, "")
        cleaned = cleaned.replace(MOBILE_APP_SECTION, "")

        return cleaned
    }

    // Promotional content removal - more conservative
    private fun removePromotionalContent(content: String): String {
        var cleaned = content

        // Remove explicit promo blocks
        cleaned = cleaned.replace(NOW_TAKE_STEPS, "")

        // Remove "Top jobs looking for your skills" block
        val topJobsStart = cleaned.indexOf("Top jobs looking for your skills")
        if (topJobsStart != -1) {
            // Look for end of block
            val possibleEnds = listOf(
                cleaned.indexOf("This email was intended", topJobsStart),
                cleaned.indexOf("Get the new LinkedIn desktop app", topJobsStart),
                cleaned.indexOf("Unsubscribe", topJobsStart),
                cleaned.length
            ).filter { it > topJobsStart }

            if (possibleEnds.isNotEmpty()) {
                val topJobsEnd = possibleEnds.minOrNull() ?: cleaned.length
                cleaned = cleaned.substring(0, topJobsStart) + cleaned.substring(topJobsEnd)
            }
        }

        return cleaned
    }

    // Find content boundaries
    private fun findContentBounds(content: String, emailType: String): Pair<Int, Int> {
        val start = 0

        // Find where footer/promo content starts
        val possibleEnds = listOf(
            content.indexOf("This email was intended"),
            content.indexOf("Top jobs looking for your skills"),
            content.indexOf("Unsubscribe"),
            content.indexOf("© 20"), // Copyright
            content.length
        ).filter { it > 0 }

        val end = possibleEnds.minOrNull() ?: content.length

        return Pair(start, end)
    }

    // Remove excessive whitespace and line breaks
    private fun removeExcessiveWhitespace(content: String): String {
        return content
            .replace(SEPARATOR_LINES, "\n")
            .replace(EXCESSIVE_NEWLINES, "\n\n") // Max 2 newlines
            .replace(Regex(" {2,}"), " ") // Multiple spaces to single
            .replace(Regex("\\n "), "\n") // Spaces at start of line
            .replace(Regex(" \\n"), "\n") // Spaces at end of line
            .lines()
            .filter { it.isNotBlank() } // Remove empty lines
            .joinToString("\n")
            .trim()
    }

    // Detect email type
    private fun detectEmailType(content: String): String {
        return when {
            content.contains("Your application was sent to", ignoreCase = true) -> "linkedin_confirmation"
            content.contains("Thank you", ignoreCase = true) && content.contains("apply", ignoreCase = true) -> "company_response"
            content.contains("unfortunately", ignoreCase = true) ||
                    content.contains("not moving forward", ignoreCase = true) ||
                    content.contains("regret to inform", ignoreCase = true) -> "rejection"
            content.contains("interview", ignoreCase = true) ||
                    content.contains("schedule", ignoreCase = true) -> "interview_invitation"
            else -> "unknown"
        }
    }
}