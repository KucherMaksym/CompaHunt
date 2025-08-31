package com.compahunt.service

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.*
import org.testcontainers.junit.jupiter.Container
import org.testcontainers.junit.jupiter.Testcontainers
import org.testcontainers.containers.GenericContainer
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory
import org.springframework.data.redis.core.StringRedisTemplate
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.util.concurrent.CopyOnWriteArrayList
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import kotlin.random.Random

@Testcontainers
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class AIRateLimitServiceTest {

    companion object {
        @Container
        val redisContainer = GenericContainer<Nothing>("redis:7.0.11").apply {
            withExposedPorts(6379)
        }
    }

    private lateinit var redisTemplate: StringRedisTemplate
    private lateinit var slidingWindowService: SlidingWindowRateLimitService
    private lateinit var aiRateLimitService: AIRateLimitService

    @BeforeAll
    fun setUpAll() {
        redisContainer.start()

        val host = redisContainer.host
        val port = redisContainer.getMappedPort(6379)

        val connectionFactory = LettuceConnectionFactory(host, port)
        connectionFactory.afterPropertiesSet()

        redisTemplate = StringRedisTemplate(connectionFactory)
        redisTemplate.afterPropertiesSet()

        slidingWindowService = SlidingWindowRateLimitService(redisTemplate)
        aiRateLimitService = AIRateLimitService(slidingWindowService)
    }

    @BeforeEach
    fun cleanRedis() {
        val keys = redisTemplate.keys("sliding_window:*:ai:*")
        if (!keys.isNullOrEmpty()) {
            redisTemplate.delete(keys)
        }
    }

    @AfterAll
    fun tearDownAll() {
        try {
            redisContainer.stop()
        } catch (_: Exception) { /* ignore */ }
    }

    // helper for adding entries to ZSET by full key (score = timestamp in seconds)
    private fun populateZSetWithTimestamps(fullKey: String, timestampsSec: List<Long>) {
        timestampsSec.forEach { ts ->
            redisTemplate.opsForZSet().add(fullKey, ts.toString(), ts.toDouble())
        }
        // similar to script: set TTL (window + 3600) — approximately
        redisTemplate.expire(fullKey, 86400 + 3600, TimeUnit.SECONDS)
    }

    @Test
    fun `allowed when under limits`() {
        val userId = "user-allowed-1"
        val result = aiRateLimitService.checkAILimit(userId)

        assertThat(result.allowed).isTrue()
        assertThat(result.limitType).isEqualTo("allowed")
        assertThat(result.weeklyRemaining).isEqualTo(100L - 1L)
        assertThat(result.dailyRemaining).isEqualTo(20L - 1L)
        assertThat(result.message).contains("AI request allowed")
    }

    @Test
    fun `daily limit exceeded when prepopulated 20 entries`() {
        val userId = "user-daily-1"
        val keyPrefix = "ai:general:$userId"
        val fullDailyKey = "sliding_window:daily:$keyPrefix"

        val nowSec = System.currentTimeMillis() / 1000L

        // Add 20 unique timestamps to the daily window (to avoid member collisions)
        val timestamps = (0 until 20).map { nowSec - it - 1 } // different and all within the day
        populateZSetWithTimestamps(fullDailyKey, timestamps)

        val size = redisTemplate.opsForZSet().size(fullDailyKey) ?: 0
        assertThat(size).isGreaterThanOrEqualTo(20)

        val blocked = aiRateLimitService.checkAILimit(userId)
        assertThat(blocked.allowed).isFalse()
        assertThat(blocked.limitType).isEqualTo("daily")
        assertThat(blocked.message).contains("Daily AI limit exceeded")
        assertThat(blocked.resetTime).isNotNull
    }

    @Test
    fun `weekly limit exceeded while daily still allowed (prepopulated old weekly entries)`() {
        val userId = "user-weekly-1"
        val keyPrefix = "ai:general:$userId"
        val fullWeeklyKey = "sliding_window:weekly:$keyPrefix"
        val fullDailyKey = "sliding_window:daily:$keyPrefix"

        val nowSec = System.currentTimeMillis() / 1000L

        // Add 100 entries with time = now - 2 days (included in weekly window, but not in daily)
        val twoDays = 2 * 24 * 3600L
        val base = nowSec - twoDays
        val timestamps = (0 until 100).map { base + it }
        populateZSetWithTimestamps(fullWeeklyKey, timestamps)

        val weeklyCount = redisTemplate.opsForZSet().size(fullWeeklyKey) ?: 0
        assertThat(weeklyCount).isGreaterThanOrEqualTo(100)

        val dailyCountBefore = redisTemplate.opsForZSet().size(fullDailyKey) ?: 0
        assertThat(dailyCountBefore).isLessThanOrEqualTo(0)

        val result = aiRateLimitService.checkAILimit(userId)
        assertThat(result.allowed).isFalse()
        assertThat(result.limitType).isEqualTo("weekly")
        assertThat(result.message).contains("Weekly AI limit exceeded")
        assertThat(result.resetTime).isNotNull
    }

    @Test
    fun `operationType reflected in redis keys and single request increments both windows`() {
        val userId = "user-keytest-1"
        val operationType = "chat"
        val keyPrefix = "ai:$operationType:$userId"
        val fullDailyKey = "sliding_window:daily:$keyPrefix"
        val fullWeeklyKey = "sliding_window:weekly:$keyPrefix"

        assertThat(redisTemplate.hasKey(fullDailyKey)).isFalse()
        assertThat(redisTemplate.hasKey(fullWeeklyKey)).isFalse()

        val result = aiRateLimitService.checkAILimit(userId, operationType)
        assertThat(result.allowed).isTrue()
        assertThat(redisTemplate.hasKey(fullDailyKey)).isTrue()
        assertThat(redisTemplate.hasKey(fullWeeklyKey)).isTrue()

        val dailySize = redisTemplate.opsForZSet().size(fullDailyKey) ?: 0
        val weeklySize = redisTemplate.opsForZSet().size(fullWeeklyKey) ?: 0
        assertThat(dailySize).isGreaterThanOrEqualTo(1)
        assertThat(weeklySize).isGreaterThanOrEqualTo(1)
    }

    @Test
    fun `concurrent small burst does not crash and produces entries (stable assertion)`() {
        val userId = "user-concurrent-1"
        val keyPrefix = "ai:general:$userId"
        val fullDailyKey = "sliding_window:daily:$keyPrefix"

        val threads = 5
        val requestsPerThread = 4
        val executor = Executors.newFixedThreadPool(threads)
        val results = CopyOnWriteArrayList<AILimitResult>()
        val exceptions = CopyOnWriteArrayList<Throwable>()

        repeat(threads) {
            executor.submit {
                repeat(requestsPerThread) {
                    try {
                        // add small random delay between calls to reduce probability of complete member collision
                        Thread.sleep(Random.nextLong(0, 30))
                        val r = aiRateLimitService.checkAILimit(userId)
                        results.add(r)
                    } catch (t: Throwable) {
                        exceptions.add(t)
                    }
                }
            }
        }

        executor.shutdown()
        val finished = executor.awaitTermination(20, TimeUnit.SECONDS)
        assertThat(finished).isTrue()
        assertThat(exceptions).isEmpty()

        // Ensure at least one request was successfully processed
        val allowedCount = results.count { it.allowed }
        assertThat(allowedCount).isGreaterThanOrEqualTo(1)

        // There should be at least one entry in Redis (due to possible member collisions we don't require exact count)
        val dailyCount = redisTemplate.opsForZSet().size(fullDailyKey) ?: 0
        assertThat(dailyCount).isGreaterThanOrEqualTo(1)
        assertThat(dailyCount).isLessThanOrEqualTo(20L)
    }

    @Test
    fun `expire is set on keys after request`() {
        val userId = "user-ttl-1"
        val keyPrefix = "ai:general:$userId"
        val fullDailyKey = "sliding_window:daily:$keyPrefix"

        aiRateLimitService.checkAILimit(userId)

        // getExpire returns TTL in seconds (can be null / -1 when key is absent)
        val ttl = redisTemplate.getExpire(fullDailyKey)
        assertThat(ttl).isNotNull()
        assertThat(ttl!!).isGreaterThan(0L)
        // TTL does not exceed expected (windowSeconds + 3600) for daily window
        val maxAllowed = WindowType.DAILY.duration.seconds + 3600
        assertThat(ttl).isLessThanOrEqualTo(maxAllowed)
    }

    @Test
    fun `resetTime returned corresponds to oldest entry + window when blocked`() {
        val userId = "user-reset-1"
        val keyPrefix = "ai:general:$userId"
        val fullDailyKey = "sliding_window:daily:$keyPrefix"

        val nowSec = System.currentTimeMillis() / 1000L
        val windowSeconds = WindowType.DAILY.duration.seconds

        // Make oldest = now - (windowSeconds - 60) => resetTime ≈ now + 60
        val oldest = nowSec - (windowSeconds - 60)
        val timestamps = (0 until 20).map { oldest + it } // 20 unique elements
        populateZSetWithTimestamps(fullDailyKey, timestamps)

        val blocked = aiRateLimitService.checkAILimit(userId)
        assertThat(blocked.allowed).isFalse()
        assertThat(blocked.limitType).isEqualTo("daily")
        val resetEpoch = blocked.resetTime?.toEpochSecond(ZoneOffset.UTC)
        assertThat(resetEpoch).isNotNull()

        val expectedReset = oldest + windowSeconds
        // allow small error margin up to 2 seconds
        assertThat(resetEpoch!!).isBetween(expectedReset - 2, expectedReset + 2)
    }
}