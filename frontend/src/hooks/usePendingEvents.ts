import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi, PendingEventDTO, GroupedPendingEventsDTO, EventStatsDTO, ResolveEventRequest } from '@/lib/api/events';
import { toast } from 'sonner';

export const usePendingEvents = () => {
  return useQuery({
    queryKey: ['pending-events'],
    queryFn: eventsApi.getPendingEvents,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    staleTime: 10000, // Consider data stale after 10 seconds
  });
};

export const usePendingEventsGrouped = () => {
  return useQuery({
    queryKey: ['pending-events-grouped'],
    queryFn: eventsApi.getPendingEventsGrouped,
    refetchInterval: 30000,
    staleTime: 10000,
  });
};

export const useEventStats = () => {
  return useQuery({
    queryKey: ['event-stats'],
    queryFn: eventsApi.getEventStats,
    refetchInterval: 60000, // Stats don't change as frequently
    staleTime: 30000,
  });
};

export const useEventCount = () => {
  return useQuery({
    queryKey: ['event-count'],
    queryFn: eventsApi.getEventCount,
    refetchInterval: 15000, // For notification badge - more frequent updates
    staleTime: 5000,
  });
};

export const useResolveEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eventsApi.resolveEvent,
    onSuccess: (resolvedEvent) => {
      // Update all related queries
      queryClient.invalidateQueries({ queryKey: ['pending-events'] });
      queryClient.invalidateQueries({ queryKey: ['pending-events-grouped'] });
      queryClient.invalidateQueries({ queryKey: ['event-stats'] });
      queryClient.invalidateQueries({ queryKey: ['event-count'] });

      // Don't show toast here - let the calling component handle it
    },
    onError: (error) => {
      // Don't show toast here - let the calling component handle it  
      console.error('Error resolving event:', error);
    },
  });
};

export const useResolveEvents = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eventsApi.resolveEvents,
    onSuccess: (result) => {
      // Update all related queries
      queryClient.invalidateQueries({ queryKey: ['pending-events'] });
      queryClient.invalidateQueries({ queryKey: ['pending-events-grouped'] });
      queryClient.invalidateQueries({ queryKey: ['event-stats'] });
      queryClient.invalidateQueries({ queryKey: ['event-count'] });

      if (result.resolvedCount > 0) {
        toast.success(`${result.resolvedCount} event(s) resolved successfully`);
      }
      
      if (result.failedEventIds && result.failedEventIds.length > 0) {
        toast.error(`${result.failedEventIds.length} event(s) failed to resolve`);
      }
    },
    onError: (error) => {
      toast.error('Failed to resolve events');
      console.error('Error resolving events:', error);
    },
  });
};

// Custom hook for managing event queue with progress tracking
export const useEventQueue = () => {
  const { data: groupedEvents, isLoading } = usePendingEventsGrouped();
  const resolveEvent = useResolveEvent();
  const resolveEvents = useResolveEvents();

  // Flatten grouped events into a priority-ordered queue
  const eventQueue = groupedEvents?.reduce((queue: PendingEventDTO[], group) => {
    return [...queue, ...group.events];
  }, []).sort((a, b) => {
    // Sort by priority (1 = highest), then by creation time
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  }) || [];

  const totalEvents = eventQueue.length;
  const currentEventIndex = 0; // In a real implementation, this would track progress

  return {
    eventQueue,
    totalEvents,
    currentEventIndex,
    hasEvents: totalEvents > 0,
    isLoading,
    resolveEvent: resolveEvent.mutate,
    resolveMultiple: resolveEvents.mutate,
    isResolving: resolveEvent.isPending || resolveEvents.isPending,
  };
};