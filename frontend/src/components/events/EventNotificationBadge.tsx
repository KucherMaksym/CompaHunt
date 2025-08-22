'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, BellRing } from 'lucide-react';
import { useEventCount, useEventStats } from '@/hooks/usePendingEvents';
import { useEventManager } from './PendingEventsManager';
import { cn } from '@/lib/utils';

interface EventNotificationBadgeProps {
  variant?: 'icon' | 'badge';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const EventNotificationBadge: React.FC<EventNotificationBadgeProps> = ({
  variant = 'icon',
  size = 'md',
  className,
}) => {
  const { data: countData } = useEventCount();
  const { data: statsData } = useEventStats();
  const { showEventManager, hasEvents } = useEventManager();

  const unresolvedCount = countData?.unresolved || 0;
  const highPriorityCount = statsData?.highPriorityCount || 0;
  
  // Don't render if no events
  if (unresolvedCount === 0) {
    return variant === 'icon' ? (
      <Button variant="ghost" size="icon" disabled className={className}>
        <Bell className="h-5 w-5" />
      </Button>
    ) : null;
  }

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  if (variant === 'badge') {
    return (
      <Badge 
        variant={highPriorityCount > 0 ? 'destructive' : 'default'} 
        className={cn('animate-pulse', className)}
      >
        {unresolvedCount} pending
      </Badge>
    );
  }

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={showEventManager}
        className={cn(
          'relative transition-colors hover:bg-accent',
          highPriorityCount > 0 && 'text-red-600 hover:text-red-700',
          className
        )}
        title={`${unresolvedCount} pending events${highPriorityCount > 0 ? ` (${highPriorityCount} high priority)` : ''}`}
      >
        {highPriorityCount > 0 ? (
          <BellRing className={cn(sizeClasses[size], 'animate-bounce')} />
        ) : (
          <Bell className={sizeClasses[size]} />
        )}
        
        {/* Event count badge */}
        <Badge 
          variant={highPriorityCount > 0 ? 'destructive' : 'default'}
          className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs font-bold animate-pulse"
        >
          {unresolvedCount > 99 ? '99+' : unresolvedCount}
        </Badge>
      </Button>
    </div>
  );
};

// Event stats display component
export const EventStatsCard: React.FC<{ className?: string }> = ({ className }) => {
  const { data: statsData, isLoading } = useEventStats();
  const { showEventManager } = useEventManager();

  if (isLoading || !statsData || statsData.totalUnresolved === 0) {
    return null;
  }

  return (
    <div className={cn('p-4 border rounded-lg bg-card', className)}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm">Pending Events</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={showEventManager}
          className="text-xs"
        >
          Process Events
        </Button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total:</span>
          <Badge variant="outline">{statsData.totalUnresolved}</Badge>
        </div>
        
        {statsData.highPriorityCount > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">High Priority:</span>
            <Badge variant="destructive" className="animate-pulse">
              {statsData.highPriorityCount}
            </Badge>
          </div>
        )}
        
        {statsData.mediumPriorityCount > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Medium Priority:</span>
            <Badge variant="secondary">{statsData.mediumPriorityCount}</Badge>
          </div>
        )}
        
        {statsData.lowPriorityCount > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Low Priority:</span>
            <Badge variant="outline">{statsData.lowPriorityCount}</Badge>
          </div>
        )}
      </div>
    </div>
  );
};