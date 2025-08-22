package com.compahunt.dto

import com.compahunt.model.EventType
import com.fasterxml.jackson.databind.JsonNode
import java.time.Instant

data class PendingEventDTO(
    val id: Long,
    val eventType: EventType,
    val eventSubtype: String?,
    val title: String,
    val description: String?,
    val priority: Int,
    val interviewId: Long?,
    val vacancyId: Long?,
    val metadata: JsonNode?,
    val scheduledFor: Instant?,
    val createdAt: Instant,
    val updatedAt: Instant,
    
    // Related entity info for UI display
    val interviewInfo: InterviewInfo?,
    val vacancyInfo: VacancyInfo?
) {
    data class InterviewInfo(
        val id: Long,
        val scheduledAt: Instant,
        val type: String,
        val interviewerName: String?,
        val location: String?,
        val meetingLink: String?
    )
    
    data class VacancyInfo(
        val id: Long,
        val title: String,
        val companyName: String?,
        val location: String?,
        val status: String?
    )
}

data class GroupedPendingEventsDTO(
    val vacancy: PendingEventDTO.VacancyInfo?,
    val events: List<PendingEventDTO>,
    val totalCount: Int
)

data class EventStatsDTO(
    val totalUnresolved: Long,
    val byPriority: Map<Int, Long>,
    val highPriorityCount: Long,
    val mediumPriorityCount: Long,
    val lowPriorityCount: Long
) {
    companion object {
        fun fromPriorityMap(totalUnresolved: Long, priorityMap: Map<Int, Long>): EventStatsDTO {
            return EventStatsDTO(
                totalUnresolved = totalUnresolved,
                byPriority = priorityMap,
                highPriorityCount = priorityMap[1] ?: 0L,
                mediumPriorityCount = priorityMap[2] ?: 0L,
                lowPriorityCount = (priorityMap[3] ?: 0L) + (priorityMap[4] ?: 0L)
            )
        }
    }
}

data class ResolveEventRequest(
    val eventIds: List<Long>
)

data class CreateEventRequest(
    val eventType: EventType,
    val eventSubtype: String?,
    val title: String,
    val description: String?,
    val priority: Int?,
    val interviewId: Long?,
    val vacancyId: Long?,
    val metadata: JsonNode?,
    val scheduledFor: Instant?
)

data class BulkResolveResponse(
    val resolvedCount: Int,
    val failedEventIds: List<Long> = emptyList()
)