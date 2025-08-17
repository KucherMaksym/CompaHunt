'use client';

import * as React from "react";
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  MapPin, 
  Video, 
  Phone, 
  FileText, 
  Building,
  Users,
  Mail,
  ExternalLink,
  AlertCircle
} from "lucide-react";
import { Interview, InterviewType, InterviewStatus } from "@/types/vacancy";
import { interviewApi } from "@/lib/api/interviews";
import { getInterviewStatusColor } from "@/utils/interview-utils";
import {formatShortLink} from "@/utils/url-utils";

interface UpcomingInterviewsProps {
  onInterviewClick?: (interview: Interview) => void;
  selectedDate?: Date;
}

const getInterviewTypeIcon = (type: InterviewType) => {
  const iconMap = {
    [InterviewType.PHONE_SCREEN]: Phone,
    [InterviewType.VIDEO_CALL]: Video,
    [InterviewType.ON_SITE]: Building,
    [InterviewType.TECHNICAL]: FileText,
    [InterviewType.BEHAVIORAL]: User,
    [InterviewType.FINAL_ROUND]: Users,
    [InterviewType.HR_INTERVIEW]: User
  };
  return iconMap[type] || CalendarIcon;
};

const formatInterviewType = (type: InterviewType): string => {
  const typeMap = {
    [InterviewType.PHONE_SCREEN]: "Phone Screen",
    [InterviewType.VIDEO_CALL]: "Video Call",
    [InterviewType.ON_SITE]: "On-site",
    [InterviewType.TECHNICAL]: "Technical",
    [InterviewType.BEHAVIORAL]: "Behavioral",
    [InterviewType.FINAL_ROUND]: "Final Round",
    [InterviewType.HR_INTERVIEW]: "HR Interview"
  };
  return typeMap[type] || type;
};

const formatInterviewStatus = (status: InterviewStatus): string => {
  const statusMap = {
    [InterviewStatus.SCHEDULED]: "Scheduled",
    [InterviewStatus.COMPLETED]: "Completed",
    [InterviewStatus.CANCELLED]: "Cancelled",
    [InterviewStatus.RESCHEDULED]: "Rescheduled",
    [InterviewStatus.NO_SHOW]: "No Show"
  };
  return statusMap[status] || status;
};

const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInDays < 0) {
    const pastDays = Math.abs(diffInDays);
    if (pastDays === 0) return "Today";
    if (pastDays === 1) return "Yesterday";
    return `${pastDays} days ago`;
  }
  
  if (diffInDays === 0) {
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((date.getTime() - now.getTime()) / (1000 * 60));
      if (diffInMinutes < 0) return "Just passed";
      if (diffInMinutes < 60) return `In ${diffInMinutes}m`;
    }
    return "Today";
  }
  
  if (diffInDays === 1) return "Tomorrow";
  if (diffInDays <= 7) return `In ${diffInDays} days`;
  
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
};

export function UpcomingInterviews({ onInterviewClick, selectedDate }: UpcomingInterviewsProps) {
  const { data: interviews = [], isLoading } = useQuery({
    queryKey: ['interviews'],
    queryFn: () => interviewApi.getAll(),
  });

  // Filter and sort interviews - show upcoming first, then past
  const sortedInterviews = React.useMemo(() => {
    const now = new Date();
    const upcoming = interviews
      .filter(interview => new Date(interview.scheduledAt) >= now)
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    
    const past = interviews
      .filter(interview => new Date(interview.scheduledAt) < now)
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
      .slice(0, 5); // Show only last 5 past interviews
    
    return [...upcoming, ...past];
  }, [interviews]);

  const upcomingCount = React.useMemo(() => {
    const now = new Date();
    return interviews.filter(interview => 
      new Date(interview.scheduledAt) >= now && 
      interview.status === InterviewStatus.SCHEDULED
    ).length;
  }, [interviews]);

  const handleInterviewClick = (interview: Interview) => {
    onInterviewClick?.(interview);
  };

  if (isLoading) {
    return (
      <Card className="h-fit w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarIcon className="h-5 w-5" />
            Upcoming Interviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-fit w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Upcoming Interviews
          </div>
          {upcomingCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {upcomingCount}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="px-0">
        <ScrollArea className="h-[400px] px-4">
          {sortedInterviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <div className="text-sm font-medium mb-1">No interviews scheduled</div>
              <div className="text-xs">Your interviews will appear here</div>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedInterviews.map((interview) => {
                const IconComponent = getInterviewTypeIcon(interview.type);
                const interviewDate = new Date(interview.scheduledAt);
                const isPast = interviewDate < new Date();
                const isToday = interviewDate.toDateString() === new Date().toDateString();
                const isSelected = selectedDate && 
                  interviewDate.toDateString() === selectedDate.toDateString();
                
                return (
                  <div
                    key={interview.id}
                    onClick={() => handleInterviewClick(interview)}
                    className={`
                      relative rounded-lg border p-3 cursor-pointer transition-all hover:shadow-md
                      ${isSelected ? 'ring-2 ring-primary border-primary bg-primary/5' : 'hover:border-primary/50'}
                      ${isPast ? 'opacity-75' : ''}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`
                        p-2 rounded-lg flex-shrink-0
                        ${isPast ? 'bg-muted' : 'bg-primary/10'}
                      `}>
                        <IconComponent className={`h-4 w-4 ${isPast ? 'text-muted-foreground' : 'text-primary'}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-medium text-sm">
                              {formatInterviewType(interview.type)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatRelativeTime(interviewDate)}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge 
                              variant="static" 
                              className={`${getInterviewStatusColor(interview.status)} text-xs`}
                            >
                              {formatInterviewStatus(interview.status)}
                            </Badge>
                            {isPast && interview.status === InterviewStatus.SCHEDULED && (
                              <Badge variant="outline" className="text-orange-600 border-orange-200 text-xs">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Overdue
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CalendarIcon className="h-3 w-3 flex-shrink-0" />
                            <span>
                              {interviewDate.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: interviewDate.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined
                              })}
                            </span>
                            <Clock className="h-3 w-3 flex-shrink-0 ml-2" />
                            <span>
                              {interviewDate.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                              {interview.duration && ` (${interview.duration}m)`}
                            </span>
                          </div>
                          
                          {interview.interviewerName && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <User className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{interview.interviewerName}</span>
                            </div>
                          )}
                          
                          {interview.location && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{interview.location}</span>
                            </div>
                          )}
                          
                          {interview.meetingLink && (
                            <div className="flex items-center gap-2 text-xs">
                              <Video className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                              <a 
                                href={formatShortLink(interview.meetingLink)}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline truncate flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Join Meeting
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {isToday && !isPast && (
                      <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}