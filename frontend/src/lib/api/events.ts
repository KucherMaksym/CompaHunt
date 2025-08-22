import {apiClient} from '@/lib/api-client';

export interface PendingEventDTO {
    id: number;
    eventType: 'INTERVIEW_FEEDBACK' | 'AI_STATUS_CHANGE' | 'AI_INTERVIEW_SCHEDULED' | 'SYSTEM_NOTIFICATION';
    eventSubtype?: string;
    title: string;
    description?: string;
    priority: number;
    interviewId?: number;
    vacancyId?: number;
    metadata?: any;
    scheduledFor?: string;
    createdAt: string;
    updatedAt: string;
    interviewInfo?: {
        id: number;
        scheduledAt: string;
        type: string;
        interviewerName?: string;
        location?: string;
        meetingLink?: string;
    };
    vacancyInfo?: {
        id: number;
        title: string;
        companyName?: string;
        location?: string;
        status?: string;
    };
}

export interface GroupedPendingEventsDTO {
    vacancy?: {
        id: number;
        title: string;
        companyName?: string;
        location?: string;
        status?: string;
    };
    events: PendingEventDTO[];
    totalCount: number;
}

export interface EventStatsDTO {
    totalUnresolved: number;
    byPriority: Record<number, number>;
    highPriorityCount: number;
    mediumPriorityCount: number;
    lowPriorityCount: number;
}

export interface ResolveEventRequest {
    eventIds: number[];
}

export interface BulkResolveResponse {
    resolvedCount: number;
    failedEventIds?: number[];
}

export interface CreateEventRequest {
    eventType: 'INTERVIEW_FEEDBACK' | 'AI_STATUS_CHANGE' | 'AI_INTERVIEW_SCHEDULED' | 'SYSTEM_NOTIFICATION';
    eventSubtype?: string;
    title: string;
    description?: string;
    priority?: number;
    interviewId?: number;
    vacancyId?: number;
    metadata?: any;
    scheduledFor?: string;
}

export const eventsApi = {
    // Get all pending events
    getPendingEvents: async (): Promise<PendingEventDTO[]> => {
        return apiClient.getD<PendingEventDTO[]>('/api/events/pending');
    },

    // Get pending events grouped by vacancy
    getPendingEventsGrouped: async (): Promise<GroupedPendingEventsDTO[]> => {
        return apiClient.getD<GroupedPendingEventsDTO[]>('/api/events/pending/grouped');
    },

    // Get event statistics
    getEventStats: async (): Promise<EventStatsDTO> => {
        return apiClient.getD<EventStatsDTO>('/api/events/stats');
    },

    // Get count for notification badge
    getEventCount: async (): Promise<{ unresolved: number }> => {
        return apiClient.getD<{ unresolved: number }>('/api/events/count');
    },

    // Resolve a single event
    resolveEvent: async (eventId: number): Promise<PendingEventDTO> => {
        return apiClient.postD<PendingEventDTO>(`/api/events/${eventId}/resolve`);
    },

    // Resolve multiple events
    resolveEvents: async (request: ResolveEventRequest): Promise<BulkResolveResponse> => {
        return apiClient.postD<BulkResolveResponse>('/api/events/resolve/bulk', request);
    },

    // Create a new event (for testing)
    createEvent: async (request: CreateEventRequest): Promise<PendingEventDTO> => {
        return apiClient.postD<PendingEventDTO>('/api/events', request);
    },
};