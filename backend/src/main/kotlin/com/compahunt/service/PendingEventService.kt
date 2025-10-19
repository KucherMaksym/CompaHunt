package com.compahunt.service

import com.compahunt.job.InterviewFeedbackJob
import com.compahunt.model.*
import com.compahunt.repository.PendingEventRepository
import com.compahunt.repository.InterviewRepository
import com.compahunt.repository.UserRepository
import com.compahunt.repository.VacancyRepository
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.ser.std.UUIDSerializer
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
        userId: UUID,
        eventType: EventType,
        title: String,
        description: String? = null,
        priority: Int? = null,
        interviewId: UUID? = null,
        vacancyId: UUID? = null,
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
                .usingJobData(InterviewFeedbackJob.INTERVIEW_ID_KEY, interview.id.toString())
                .usingJobData(InterviewFeedbackJob.USER_ID_KEY, interview.user.id.toString())
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
    fun cancelInterviewFeedbackJob(interviewId: UUID) {
        val jobKey = JobKey.jobKey("interview-feedback-$interviewId", "interview-jobs")
        try {
            scheduler.deleteJob(jobKey)
        } catch (e: SchedulerException) {
            // Log but don't throw - job may not exist
            log.error("Failed to delete interview feedback job for interview $interviewId: ${e.message}")
        }
    }

    // Get all unresolved events for a user, ordered by priority
    fun getUnresolvedEvents(userId: UUID): List<PendingEvent> {
        return pendingEventRepository.findUnresolvedByUserIdOrderByPriorityAndCreatedAt(userId)
    }

    // Get events grouped by related vacancy for better UX
    fun getGroupedUnresolvedEvents(userId: UUID): Map<Vacancy?, List<PendingEvent>> {
        val allEvents = getUnresolvedEvents(userId)
        return allEvents.groupBy { it.vacancy }
    }

    // Resolve a single event
    fun resolveEvent(eventId: UUID, userId: UUID): PendingEvent {
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
    fun resolveEvents(eventIds: List<UUID>, userId: UUID): Int {
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
    fun getUnresolvedEventCount(userId: UUID): Long {
        return pendingEventRepository.countByUserIdAndIsResolvedFalse(userId)
    }

    // Get count breakdown by priority
    fun getUnresolvedEventCountByPriority(userId: UUID): Map<Int, Long> {
        val results = pendingEventRepository.countUnresolvedByUserIdGroupByPriority(userId)
        return results.associate {
            (it[0] as Int) to (it[1] as Long)
        }
    }

    fun createVacancyUpdateEventConfirmation(vacancyUpdate: VacancyFieldChanges, userId: UUID): PendingEvent {
        // Create vacancy event if vacancyId is blank
        if (vacancyUpdate.vacancyId.isBlank()) {
            log.warn("Vacancy ID is blank for user $userId. Creating vacancy creation event instead.")
            return createVacancyCreationEvent(vacancyUpdate, userId)
        }

        val vacancyId = runCatching {
            UUID.fromString(vacancyUpdate.vacancyId)
        }.onFailure {
            log.warn("Invalid vacancy ID format for user $userId: '${vacancyUpdate.vacancyId}'. Creating vacancy creation event instead.")
        }.getOrNull()

        // If parsing failed or vacancy doesn't exist -> create vacancy creation event
        if (vacancyId == null) {
            log.warn("Failed to parse vacancy ID for user $userId. Creating vacancy creation event instead.")
            return createVacancyCreationEvent(vacancyUpdate, userId)
        }

        // Vacancy exists
        val vacancy = vacancyRepository.findByIdOrNull(vacancyId)
        if (vacancy == null) {
            log.warn("Vacancy not found: $vacancyId for user $userId. Creating vacancy creation event instead.")
            return createVacancyCreationEvent(vacancyUpdate, userId)
        }

        // Vacancy belongs to the user
        if (vacancy.user.id != userId) {
            log.error("Vacancy $vacancyId does not belong to user $userId. Cannot create update event.")
            throw IllegalArgumentException("Vacancy does not belong to user")
        }

        val newEvent = createEvent(
            userId = userId,
            eventType = EventType.AI_STATUS_CHANGE,
            title = "Confirm updates for your vacancy",
            description = "AI detected ${vacancyUpdate.changes.size} changes for your vacancy. Please review and confirm.",
            vacancyId = vacancyId,
            metadata = objectMapper.valueToTree(vacancyUpdate)
        )

        log.info("Created vacancy update confirmation event for vacancy $vacancyId and user $userId")

        if (vacancyUpdate.interviewAssignment != null) {
            log.info("Vacancy update includes interview assignment for vacancy $vacancyId")
            createInterviewAssignmentConfirmation(vacancyUpdate.interviewAssignment)
        }

        return newEvent
    }

    private fun createVacancyCreationEvent(vacancyUpdate: VacancyFieldChanges, userId: UUID): PendingEvent {
        log.info("Creating vacancy creation event for user $userId with ${vacancyUpdate.changes.size} detected changes")

        val newEvent = createEvent(
            userId = userId,
            eventType = EventType.AI_VACANCY_CREATION,
            title = "Create new vacancy from email",
            description = "AI detected a job-related email with ${vacancyUpdate.changes.size} potential vacancy fields. Would you like to create a new vacancy?",
            metadata = objectMapper.valueToTree(vacancyUpdate)
        )

        log.info("Created vacancy creation event ${newEvent.id} for user $userId")

        // Interview assignment will be handled after vacancy is created
        if (vacancyUpdate.interviewAssignment != null) {
            log.info("Vacancy creation includes interview assignment, which will be processed after vacancy creation")
        }

        return newEvent
    }

    private fun createInterviewAssignmentConfirmation(interview: Interview): PendingEvent {
        return createEvent(
            userId = interview.user.id ?: throw IllegalArgumentException("Interview user ID is null"),
            eventType = EventType.AI_INTERVIEW_SCHEDULED,
            title = "Confirm interview assignment",
            description = "AI detected a new interview for ${interview.vacancy.company.name}. Please review and confirm.",
            vacancyId = interview.vacancy.id,
            metadata = objectMapper.valueToTree(mapOf(
                "scheduledAt" to interview.scheduledAt,
                "duration" to interview.duration,
                "location" to interview.location
            ))
        )
    }
}