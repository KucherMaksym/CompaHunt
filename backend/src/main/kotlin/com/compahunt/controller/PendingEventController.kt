package com.compahunt.controller

import com.compahunt.annotation.CurrentUser
import com.compahunt.dto.*
import com.compahunt.mapper.EventMapper
import com.compahunt.model.UserPrincipal
import com.compahunt.service.PendingEventService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/events")
class PendingEventController(
    private val pendingEventService: PendingEventService,
    private val eventMapper: EventMapper
) {
    // Get all unresolved events for current user
    @GetMapping("/pending")
    fun getPendingEvents(@CurrentUser userPrincipal: UserPrincipal): ResponseEntity<List<PendingEventDTO>> {
        val events = pendingEventService.getUnresolvedEvents(userPrincipal.id)
        val eventDTOs = events.map { eventMapper.toPendingEventDTO(it) }
        return ResponseEntity.ok(eventDTOs)
    }

    // Get pending events grouped by vacancy for better UX
    @GetMapping("/pending/grouped")
    fun getPendingEventsGrouped(@CurrentUser userPrincipal: UserPrincipal): ResponseEntity<List<GroupedPendingEventsDTO>> {
        val groupedEvents = pendingEventService.getGroupedUnresolvedEvents(userPrincipal.id)
        val groupedDTOs = groupedEvents.map { (vacancy, events) ->
            eventMapper.toGroupedPendingEventsDTO(vacancy, events)
        }
        return ResponseEntity.ok(groupedDTOs)
    }

    // Get event statistics for dashboard
    @GetMapping("/stats")
    fun getEventStats(@CurrentUser userPrincipal: UserPrincipal): ResponseEntity<EventStatsDTO> {
        val totalCount = pendingEventService.getUnresolvedEventCount(userPrincipal.id)
        val priorityBreakdown = pendingEventService.getUnresolvedEventCountByPriority(userPrincipal.id)
        
        val stats = EventStatsDTO.fromPriorityMap(totalCount, priorityBreakdown)
        return ResponseEntity.ok(stats)
    }

    // Resolve a single event
    @PostMapping("/{eventId}/resolve")
    fun resolveEvent(
        @PathVariable eventId: UUID,
        @CurrentUser userPrincipal: UserPrincipal
    ): ResponseEntity<PendingEventDTO> {
        val resolvedEvent = pendingEventService.resolveEvent(eventId, userPrincipal.id)
        val eventDTO = eventMapper.toPendingEventDTO(resolvedEvent)
        return ResponseEntity.ok(eventDTO)
    }

    // Resolve multiple events in bulk
    @PostMapping("/resolve/bulk")
    fun resolveEvents(
        @RequestBody request: ResolveEventRequest,
        @CurrentUser userPrincipal: UserPrincipal
    ): ResponseEntity<BulkResolveResponse> {
        return try {
            val validEventIds = request.eventIds.filterNotNull()
            val resolvedCount = pendingEventService.resolveEvents(validEventIds, userPrincipal.id)
            ResponseEntity.ok(BulkResolveResponse(resolvedCount = resolvedCount))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().body(
                BulkResolveResponse(
                    resolvedCount = 0,
                    failedEventIds = request.eventIds
                )
            )
        }
    }

    // Create a new pending event (for testing or manual creation)
    @PostMapping
    fun createEvent(
        @RequestBody request: CreateEventRequest,
        @CurrentUser userPrincipal: UserPrincipal
    ): ResponseEntity<PendingEventDTO> {
        val event = pendingEventService.createEvent(
            userId = userPrincipal.id,
            eventType = request.eventType,
            title = request.title,
            description = request.description,
            priority = request.priority,
            interviewId = request.interviewId,
            vacancyId = request.vacancyId,
            metadata = request.metadata,
            scheduledFor = request.scheduledFor,
            eventSubtype = request.eventSubtype
        )
        
        val eventDTO = eventMapper.toPendingEventDTO(event)
        return ResponseEntity.ok(eventDTO)
    }

    // Get events count for notification badge
    @GetMapping("/count")
    fun getEventCount(@CurrentUser userPrincipal: UserPrincipal): ResponseEntity<Map<String, Long>> {
        val count = pendingEventService.getUnresolvedEventCount(userPrincipal.id)
        return ResponseEntity.ok(mapOf("unresolved" to count))
    }


    // TODO: endpoint for testing. remove in production
    @GetMapping("/test/create")
    fun createTestEvent(@CurrentUser userPrincipal: UserPrincipal): ResponseEntity<PendingEventDTO> {
        val event = pendingEventService.createEvent(
            userId = userPrincipal.id,
            eventType = com.compahunt.model.EventType.INTERVIEW_FEEDBACK,
            title = "Test Interview Feedback Required",
            description = "This is a test pending event created for frontend testing purposes.",
            priority = 1,
            interviewId = UUID.randomUUID(),
            vacancyId = UUID.randomUUID(),
            metadata = null,
            scheduledFor = null,
            eventSubtype = "test_event"
        )
        
        val eventDTO = eventMapper.toPendingEventDTO(event)
        return ResponseEntity.ok(eventDTO)
    }
}