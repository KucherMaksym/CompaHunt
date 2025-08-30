package com.compahunt.component

import com.compahunt.service.GmailPushNotificationService
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component

@Component
class GmailSubscriptionScheduler(
    private val pushNotificationService: GmailPushNotificationService
) {

    private val log = LoggerFactory.getLogger(GmailSubscriptionScheduler::class.java)

    @Scheduled(fixedRate = 6 * 60 * 60 * 1000) // 6 hours
    fun renewExpiredSubscriptions() {
        log.info("Starting scheduled renewal of expired Gmail subscriptions")

        try {
            pushNotificationService.renewExpiredSubscriptions()
            log.info("Completed scheduled renewal of expired Gmail subscriptions")
        } catch (e: Exception) {
            log.error("Failed to renew expired Gmail subscriptions", e)
        }
    }
}