'use client';

import React, {useState, useEffect} from 'react';
import {useEventQueue, useResolveEvent} from '@/hooks/usePendingEvents';
import {InterviewFeedbackModal} from './InterviewFeedbackModal';
import {AIStatusChangeModal} from './AIStatusChangeModal';
import {PendingEventDTO} from '@/lib/api/events';
import {toast} from 'sonner';

interface PendingEventsManagerProps {
    autoShow?: boolean;
    onAllEventsProcessed?: () => void;
}

export const PendingEventsManager: React.FC<PendingEventsManagerProps> = ({
                                                                              autoShow = true,
                                                                              onAllEventsProcessed,
                                                                          }) => {
    const {eventQueue, totalEvents, hasEvents, isLoading, resolveEvent} = useEventQueue();
    const resolveEventMutation = useResolveEvent();

    const [currentEventIndex, setCurrentEventIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [processedEventIds, setProcessedEventIds] = useState<Set<number>>(new Set());

    // Get the current unprocessed event
    const currentEvent = eventQueue.find(event => !processedEventIds.has(event.id));
    const currentDisplayIndex = eventQueue.findIndex(event => !processedEventIds.has(event.id));

    // Auto-show modal when new events are available
    useEffect(() => {
        if (autoShow && currentEvent && !isModalOpen && !isLoading) {
            setIsModalOpen(true);
        }
    }, [currentEvent, isModalOpen, autoShow, isLoading]);

    // Handle event resolution
    const handleResolveEvent = async (eventId: number) => {
        try {
            await resolveEventMutation.mutateAsync(eventId);

            setProcessedEventIds(prev => new Set(prev).add(eventId));

            // Check if all events are processed
            const remainingEvents = eventQueue.filter(event => !processedEventIds.has(event.id) && event.id !== eventId);

            if (remainingEvents.length === 0) {
                setIsModalOpen(false);
                onAllEventsProcessed?.();
                toast.success('All events processed!');
                // Reset processed events for next time
                setProcessedEventIds(new Set());
            } else {
                // Move to next event
                setCurrentEventIndex(prev => prev + 1);
            }
        } catch (error) {
            console.error('Error resolving event:', error);
            throw error;
        }
    };

    // Handle AI status change confirmation
    const handleConfirmStatusChange = async (eventId: number, confirmed: boolean, notes?: string) => {
        // In a real implementation, this would call an API to update the vacancy status
        // For now, we'll just resolve the event
        console.log('Status change confirmed:', {eventId, confirmed, notes});

        if (confirmed) {
            toast.success('Status change applied successfully');
        } else {
            toast.info('Status change rejected');
        }

        await handleResolveEvent(eventId);
    };

    // Close modal and skip current event
    const handleCloseModal = () => {
        setIsModalOpen(false);
        if (currentEvent) {
            setProcessedEventIds(prev => new Set(prev).add(currentEvent.id));
        }
    };

    // Don't render anything if no events or still loading
    if (isLoading || !hasEvents || !currentEvent) {
        return null;
    }

    // Calculate remaining events count
    const remainingEvents = totalEvents - processedEventIds.size;

    return (
        <>
            {/* Interview Feedback Modal */}
            {currentEvent.eventType === 'INTERVIEW_FEEDBACK' && (
                <InterviewFeedbackModal
                    event={currentEvent}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onResolve={handleResolveEvent}
                    eventIndex={currentDisplayIndex}
                    totalEvents={remainingEvents}
                />
            )}

            {/* AI Status Change Modal */}
            {currentEvent.eventType === 'AI_STATUS_CHANGE' && (
                <AIStatusChangeModal
                    event={currentEvent}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onResolve={handleResolveEvent}
                    onConfirm={handleConfirmStatusChange}
                    eventIndex={currentDisplayIndex}
                    totalEvents={remainingEvents}
                />
            )}

            {/* AI Interview Scheduled Modal - TODO: Implement similar to above */}
            {currentEvent.eventType === 'AI_INTERVIEW_SCHEDULED' && (
                <div>
                    {/* Placeholder for AI Interview Scheduled Modal */}
                    {/* This would be similar to AIStatusChangeModal but for interview scheduling */}
                </div>
            )}

            {/* System Notification Modal - TODO: Implement for general notifications */}
            {currentEvent.eventType === 'SYSTEM_NOTIFICATION' && (
                <div>
                    {/* Placeholder for System Notification Modal */}
                    {/* This would be a simple notification display */}
                </div>
            )}
        </>
    );
};

// Hook to manually trigger the events manager
export const useEventManager = () => {
    const [isManagerOpen, setIsManagerOpen] = useState(false);
    const {hasEvents} = useEventQueue();

    const showEventManager = () => {
        if (hasEvents) {
            setIsManagerOpen(true);
        } else {
            toast.info('No pending events to process');
        }
    };

    const hideEventManager = () => {
        setIsManagerOpen(false);
    };

    return {
        isManagerOpen,
        showEventManager,
        hideEventManager,
        hasEvents,
    };
};