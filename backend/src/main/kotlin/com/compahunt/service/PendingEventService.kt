package com.compahunt.service

import com.compahunt.job.InterviewFeedbackJob
import com.compahunt.model.*
import com.compahunt.repository.PendingEventRepository
import com.compahunt.repository.InterviewRepository
import com.compahunt.repository.UserRepository
import com.compahunt.repository.VacancyRepository
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import org.quartz.*
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.time.ZoneId
import java.time.temporal.ChronoUnit
import java.util.*
import kotlin.math.log

@Service
@Transactional
class PendingEventService(
    private var pendingEventRepository: PendingEventRepository,
    private var userRepository: UserRepository,
    private var interviewRepository: InterviewRepository,
    private var vacancyRepository: VacancyRepository,
    private var scheduler: Scheduler,
    private var objectMapper: ObjectMapper
) {

    private val log = LoggerFactory.getLogger(PendingEventService::class.java)

    // Create a new pending event
    fun createEvent(
        userId: Long,
        eventType: EventType,
        title: String,
        description: String? = null,
        priority: Int? = null,
        interviewId: Long? = null,
        vacancyId: Long? = null,
        metadata: JsonNode? = null,
        scheduledFor: Instant? = null,
        eventSubtype: String? = null
    ): PendingEvent {
        val user = userRepository.findByIdOrNull(userId)
            ?: throw IllegalArgumentException("User not found: $userId")

        val interview = interviewId?.let {
            interviewRepository.findByIdOrNull(it)
                ?: throw IllegalArgumentException("Interview not found: $it")
        }

        val vacancy = vacancyId?.let {
            vacancyRepository.findByIdOrNull(it)
                ?: throw IllegalArgumentException("Vacancy not found: $it")
        }

        // Check for existing unresolved event to prevent duplicates
        val existingEvents = pendingEventRepository.findExistingEvent(
            userId = userId,
            eventType = eventType,
            interviewId = interviewId,
            vacancyId = vacancyId
        )

        if (existingEvents.isNotEmpty()) {
            return existingEvents.first() // Return existing event instead of creating duplicate
        }

        val event = PendingEvent(
            user = user,
            eventType = eventType,
            eventSubtype = eventSubtype,
            title = title,
            description = description,
            priority = priority ?: eventType.getDefaultPriority(),
            interview = interview,
            vacancy = vacancy,
            metadata = metadata,
            scheduledFor = scheduledFor
        )

        return pendingEventRepository.save(event)
    }

    // Schedule interview feedback job when interview is created/updated
    fun scheduleInterviewFeedbackJob(interview: Interview) {
        val jobKey = JobKey.jobKey("interview-feedback-${interview.id}", "interview-jobs")
        val triggerKey = TriggerKey.triggerKey("interview-feedback-trigger-${interview.id}", "interview-triggers")

        try {
            // Remove existing job if it exists (for rescheduling)
            if (scheduler.checkExists(jobKey)) {
                scheduler.deleteJob(jobKey)
            }

            // Calculate when to trigger feedback request (interview end time)
            val feedbackTriggerTime = interview.scheduledAt.plus((interview.duration ?: 60).toLong(), ChronoUnit.MINUTES)
            val triggerTime = Date.from(feedbackTriggerTime)

            // Don't schedule if the time is in the past
            if (triggerTime.before(Date())) {
                return
            }

            val jobDetail = JobBuilder.newJob(InterviewFeedbackJob::class.java)
                .withIdentity(jobKey)
                .usingJobData(InterviewFeedbackJob.INTERVIEW_ID_KEY, interview.id)
                .usingJobData(InterviewFeedbackJob.USER_ID_KEY, interview.user.id)
                .storeDurably()
                .build()

            val trigger = TriggerBuilder.newTrigger()
                .withIdentity(triggerKey)
                .startAt(triggerTime)
                .forJob(jobDetail)
                .build()

            scheduler.scheduleJob(jobDetail, trigger)
            log.info("Job scheduled for interview ${interview.id}: $jobDetail")

        } catch (e: SchedulerException) {
            throw RuntimeException("Failed to schedule interview feedback job for interview ${interview.id}", e)
        }
    }

    // Cancel scheduled interview feedback job
    fun cancelInterviewFeedbackJob(interviewId: Long) {
        val jobKey = JobKey.jobKey("interview-feedback-$interviewId", "interview-jobs")
        try {
            scheduler.deleteJob(jobKey)
        } catch (e: SchedulerException) {
            // Log but don't throw - job may not exist
            log.error("Failed to delete interview feedback job for interview $interviewId: ${e.message}")
        }
    }

    // Get all unresolved events for a user, ordered by priority
    fun getUnresolvedEvents(userId: Long): List<PendingEvent> {
        return pendingEventRepository.findUnresolvedByUserIdOrderByPriorityAndCreatedAt(userId)
    }

    // Get events grouped by related vacancy for better UX
    fun getGroupedUnresolvedEvents(userId: Long): Map<Vacancy?, List<PendingEvent>> {
        val allEvents = getUnresolvedEvents(userId)
        return allEvents.groupBy { it.vacancy }
    }

    // Resolve a single event
    fun resolveEvent(eventId: Long, userId: Long): PendingEvent {
        val event = pendingEventRepository.findByIdOrNull(eventId)
            ?: throw IllegalArgumentException("Event not found: $eventId")

        if (event.user.id != userId) {
            throw IllegalArgumentException("Event does not belong to user")
        }

        if (event.isResolved) {
            return event // Already resolved
        }

        val resolvedEvent = event.resolve()
        log.info("Resolved event: $resolvedEvent")
        return pendingEventRepository.save(resolvedEvent)
    }

    // Resolve multiple events in bulk
    fun resolveEvents(eventIds: List<Long>, userId: Long): Int {
        // Verify all events belong to user
        val events = pendingEventRepository.findAllById(eventIds)
        val unauthorizedEvents = events.filter { it.user.id != userId }

        if (unauthorizedEvents.isNotEmpty()) {
            throw IllegalArgumentException("Some events do not belong to user")
        }

        log.info("Resolving events for $eventIds, by user $userId")
        return pendingEventRepository.markEventsAsResolved(eventIds, Instant.now())
    }

    // Get count of unresolved events for notification badges
    fun getUnresolvedEventCount(userId: Long): Long {
        return pendingEventRepository.countByUserIdAndIsResolvedFalse(userId)
    }

    // Get count breakdown by priority
    fun getUnresolvedEventCountByPriority(userId: Long): Map<Int, Long> {
        val results = pendingEventRepository.countUnresolvedByUserIdGroupByPriority(userId)
        return results.associate {
            (it[0] as Int) to (it[1] as Long)
        }
    }

    // Create AI-detected status change event
    fun createAIStatusChangeEvent(
        userId: Long,
        vacancyId: Long,
        newStatus: String,
        confidence: Double,
        emailSubject: String?,
        aiReasoning: String?
    ): PendingEvent {
        val metadata = objectMapper.createObjectNode().apply {
            put("newStatus", newStatus)
            put("confidence", confidence)
            put("emailSubject", emailSubject)
            put("aiReasoning", aiReasoning)
            put("requiresConfirmation", confidence < 0.9) // High confidence changes need less confirmation
        }

        log.info("Creating pending event (AI status change) for user $userId, vacancyId $vacancyId")

        return createEvent(
            userId = userId,
            eventType = EventType.AI_STATUS_CHANGE,
            eventSubtype = "EMAIL_ANALYSIS",
            title = "Application Status Update Detected",
            description = "AI detected a potential status change to '$newStatus' based on email analysis. Please review and confirm.",
            vacancyId = vacancyId,
            metadata = metadata
        )
    }

    // Create AI-scheduled interview event
    fun createAIInterviewScheduledEvent(
        userId: Long,
        vacancyId: Long,
        interviewDateTime: Instant,
        interviewType: String,
        location: String?,
        meetingLink: String?
    ): PendingEvent {
        val metadata = objectMapper.createObjectNode().apply {
            put("interviewDateTime", interviewDateTime.toString())
            put("interviewType", interviewType)
            put("location", location)
            put("meetingLink", meetingLink)
        }

        log.info("Creating pending event (interview assignment by AI) for user $userId, vacancyId $vacancyId")

        return createEvent(
            userId = userId,
            eventType = EventType.AI_INTERVIEW_SCHEDULED,
            eventSubtype = "EMAIL_PARSING",
            title = "Interview Scheduled",
            description = "AI detected a new interview scheduled for ${interviewDateTime}. Please review and confirm the details.",
            vacancyId = vacancyId,
            metadata = metadata
        )
    }

    // Cleanup old resolved events (maintenance task)
    fun cleanupOldResolvedEvents(daysOld: Long = 30): Int {
        val cutoffDate = Instant.now().minusSeconds(daysOld * 24 * 60 * 60)
        return pendingEventRepository.deleteResolvedEventsBefore(cutoffDate)
    }
}