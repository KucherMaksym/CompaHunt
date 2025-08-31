package com.compahunt.service

import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.data.redis.core.script.DefaultRedisScript
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.time.ZoneOffset

@Service
class SlidingWindowRateLimitService(
    private val redisTemplate: StringRedisTemplate
) {

    private val slidingWindowScript = """
        local key = KEYS[1]
        local window_size = tonumber(ARGV[1])
        local max_requests = tonumber(ARGV[2])
        local now = tonumber(ARGV[3])
        local increment = tonumber(ARGV[4])

        local cutoff = now - window_size
        redis.call('ZREMRANGEBYSCORE', key, 0, cutoff)

        local current_count = redis.call('ZCARD', key)

        if current_count + increment <= max_requests then
            for i = 1, increment do
                local timestamp = now + (i * 0.001)
                redis.call('ZADD', key, timestamp, timestamp)
            end
            redis.call('EXPIRE', key, window_size + 3600)
            local remaining = max_requests - (current_count + increment)
            return {1, remaining, max_requests}
        else
            redis.call('EXPIRE', key, window_size + 3600)
            local remaining = max_requests - current_count
            return {0, remaining, max_requests}
        end
    """.trimIndent()

    private val redisScript = DefaultRedisScript<List<Long>>().apply {
        setScriptText(slidingWindowScript)
        setResultType(List::class.java as Class<List<Long>?>?)
    }

    fun checkSlidingWindowLimit(
        key: String,
        windowType: WindowType,
        maxRequests: Long,
        increment: Long = 1
    ): SlidingWindowResult {
        val now = System.currentTimeMillis() / 1000
        val windowSeconds = windowType.duration.seconds
        val fullKey = "sliding_window:${windowType.name.lowercase()}:$key"

        val result = redisTemplate.execute(
            redisScript,
            listOf(fullKey),
            windowSeconds.toString(),
            maxRequests.toString(),
            now.toString(),
            increment.toString()
        ) ?: listOf(0L, 0L, maxRequests)

        val allowed = result[0] == 1L
        val remaining = result[1]
        val total = result[2]

        val resetTime = if (!allowed) {
            getOldestEntryTime(fullKey)?.plusSeconds(windowSeconds)
        } else null

        return SlidingWindowResult(
            allowed = allowed,
            remaining = remaining,
            total = total,
            resetTime = resetTime
        )
    }

    private fun getOldestEntryTime(key: String): LocalDateTime? {
        return try {
            val oldestScore = redisTemplate.opsForZSet()
                .range(key, 0, 0)
                ?.firstOrNull()
                ?.let { redisTemplate.opsForZSet().score(key, it) }

            oldestScore?.let {
                LocalDateTime.ofEpochSecond(it.toLong(), 0, ZoneOffset.UTC)
            }
        } catch (e: Exception) {
            null
        }
    }

    // Get current usage (without increment)
    fun getCurrentUsage(key: String, windowType: WindowType): Long? {
        val now = System.currentTimeMillis() / 1000
        val windowSeconds = windowType.duration.seconds
        val fullKey = "sliding_window:${windowType.name.lowercase()}:$key"
        val cutoff = now - windowSeconds

        redisTemplate.opsForZSet().removeRangeByScore(fullKey, 0.0, cutoff.toDouble())
        return redisTemplate.opsForZSet().count(fullKey, cutoff.toDouble(), Double.MAX_VALUE)
    }
}