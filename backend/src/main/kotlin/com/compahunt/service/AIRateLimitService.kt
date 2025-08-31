package com.compahunt.service

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.time.Duration
import java.time.LocalDateTime

@Service
class AIRateLimitService(
    private val slidingWindowService: SlidingWindowRateLimitService,
) {

    @Value("\${app.limits.ai.weekly}")
    val weeklyLimit: Long = 100

    @Value("\${app.limits.ai.dayly}")
    val dailyLimit: Long = 20

    fun checkAILimit(userId: String, operationType: String = "general"): AILimitResult {
        val keyPrefix = "ai:$operationType:$userId"

        // Weekly limit
        val weeklyResult = slidingWindowService.checkSlidingWindowLimit(
            key = keyPrefix,
            windowType = WindowType.WEEKLY,
            maxRequests = 100
        )

        if (!weeklyResult.allowed) {
            return AILimitResult(
                allowed = false,
                limitType = "weekly",
                remaining = weeklyResult.remaining,
                resetTime = weeklyResult.resetTime,
                message = "Weekly AI limit exceeded (${weeklyResult.total}/week)"
            )
        }

        // Daily limit
        val dailyResult = slidingWindowService.checkSlidingWindowLimit(
            key = keyPrefix,
            windowType = WindowType.DAILY,
            maxRequests = 20
        )

        if (!dailyResult.allowed) {
            return AILimitResult(
                allowed = false,
                limitType = "daily",
                remaining = dailyResult.remaining,
                resetTime = dailyResult.resetTime,
                message = "Daily AI limit exceeded (${dailyResult.total}/day)"
            )
        }

        return AILimitResult(
            allowed = true,
            limitType = "allowed",
            weeklyRemaining = weeklyResult.remaining,
            dailyRemaining = dailyResult.remaining,
            message = "AI request allowed"
        )
    }
}

data class AILimitResult(
    val allowed: Boolean,
    val limitType: String,
    val remaining: Long = 0,
    val weeklyRemaining: Long? = null,
    val dailyRemaining: Long? = null,
    val resetTime: LocalDateTime? = null,
    val retryAfterMs: Long? = null,
    val message: String
)

data class SlidingWindowResult(
    val allowed: Boolean,
    val remaining: Long,
    val total: Long,
    val resetTime: LocalDateTime? = null
)

enum class WindowType(val duration: Duration) {
    HOURLY(Duration.ofHours(1)),
    DAILY(Duration.ofDays(1)),
    WEEKLY(Duration.ofDays(7)),
    MONTHLY(Duration.ofDays(30))
}