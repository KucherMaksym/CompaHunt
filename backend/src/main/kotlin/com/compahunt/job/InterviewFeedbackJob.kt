package com.compahunt.job

import com.compahunt.model.EventType
import com.compahunt.model.Interview
import com.compahunt.model.PendingEvent
import com.compahunt.repository.InterviewRepository
import com.compahunt.repository.PendingEventRepository
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ObjectNode
import org.quartz.Job
import org.quartz.JobDataMap
import org.quartz.JobExecutionContext
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.UUID

@Component
class InterviewFeedbackJob(
    private val pendingEventRepository: PendingEventRepository,
    private val interviewRepository: InterviewRepository,
    private val objectMapper: ObjectMapper
) : Job {

    companion object {
        const val INTERVIEW_ID_KEY = "interviewId"
        const val USER_ID_KEY = "userId"
    }

    @Transactional
    override fun execute(context: JobExecutionContext) {
        val dataMap: JobDataMap = context.jobDetail.jobDataMap
        val interviewId = UUID.fromString(dataMap.getString(INTERVIEW_ID_KEY))
        val userId = UUID.fromString(dataMap.getString(USER_ID_KEY))

        try {
            // Verify interview still exists and belongs to user
            val interview = interviewRepository.findById(interviewId).orElse(null)
            if (interview == null || interview.user.id != userId) {
                return // Interview was deleted or doesn't belong to user
            }

            // Check if interview is still scheduled (not completed/cancelled)
            if (interview.status.isCompletedOrCancelled()) {
                return // Already marked as completed or cancelled
            }

            // Check if pending event already exists
            val existingEvents = pendingEventRepository.findExistingEvent(
                userId = userId,
                eventType = EventType.INTERVIEW_FEEDBACK,
                interviewId = interviewId,
                vacancyId = null
            )

            if (existingEvents.isNotEmpty()) {
                return // Event already exists
            }

            // Create the pending event for interview feedback
            createInterviewFeedbackEvent(interview)

        } catch (e: Exception) {
            // Log error and continue - don't fail the job
            println("Error executing InterviewFeedbackJob for interview $interviewId: ${e.message}")
        }
    }

    private fun createInterviewFeedbackEvent(interview: Interview) {
        val metadata = objectMapper.createObjectNode().apply {
            put("scheduledAt", interview.scheduledAt.toString())
            put("interviewType", interview.type.name)
            put("duration", interview.duration ?: 60)
            put("interviewerName", interview.interviewerName ?: "Unknown")
            put("jobTitle", interview.vacancy.title)
            put("companyName", interview.vacancy.company?.name ?: "Unknown Company")
        }

        val event = PendingEvent(
            user = interview.user,
            eventType = EventType.INTERVIEW_FEEDBACK,
            title = "Interview Feedback Required",
            description = "Please provide feedback for your ${interview.type.getDisplayName()} with ${interview.vacancy.company?.name ?: "company"} for the ${interview.vacancy.title} position.",
            priority = EventType.INTERVIEW_FEEDBACK.getDefaultPriority(),
            interview = interview,
            vacancy = interview.vacancy,
            metadata = metadata,
            scheduledFor = interview.scheduledAt.plus((interview.duration ?: 60).toLong(), ChronoUnit.MINUTES),
            createdAt = Instant.now()
        )

        pendingEventRepository.save(event)
    }

    private fun com.compahunt.model.InterviewStatus.isCompletedOrCancelled(): Boolean {
        return this == com.compahunt.model.InterviewStatus.COMPLETED ||
               this == com.compahunt.model.InterviewStatus.CANCELLED ||
               this == com.compahunt.model.InterviewStatus.NO_SHOW
    }

    private fun com.compahunt.model.InterviewType.getDisplayName(): String = when (this) {
        com.compahunt.model.InterviewType.PHONE_SCREEN -> "phone screen"
        com.compahunt.model.InterviewType.VIDEO_CALL -> "video call"
        com.compahunt.model.InterviewType.ON_SITE -> "on-site interview"
        com.compahunt.model.InterviewType.TECHNICAL -> "technical interview"
        com.compahunt.model.InterviewType.BEHAVIORAL -> "behavioral interview"
        com.compahunt.model.InterviewType.FINAL_ROUND -> "final round interview"
        com.compahunt.model.InterviewType.HR_INTERVIEW -> "HR interview"
    }
}