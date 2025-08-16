'use client';

import * as React from "react";
import { useQuery } from '@tanstack/react-query';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Plus,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Interview, InterviewType, InterviewStatus } from "@/types/vacancy";
import { interviewApi } from "@/lib/api/interviews";
import { getInterviewStatusColor } from "@/utils/interview-utils";
import { Button } from "@/components/ui/button";
import { InterviewDetailModal } from "@/components/interviews/InterviewDetailModal";
import {formatMeetingLink} from "@/utils/url-utils";

interface InterviewCalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  onAddInterview?: () => void;
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

const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
};

export function InterviewCalendar({ selectedDate, onDateSelect, onAddInterview }: InterviewCalendarProps) {
  const [internalDate, setInternalDate] = React.useState<Date>(selectedDate || new Date());
  const [selectedInterview, setSelectedInterview] = React.useState<Interview | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);

  const currentDate = selectedDate || internalDate;

  const { data: interviews = [] } = useQuery({
    queryKey: ['interviews'],
    queryFn: () => interviewApi.getAll(),
  });

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setInternalDate(date);
      onDateSelect?.(date);
    }
  };

  // Filter interviews for the selected date
  const dailyInterviews = React.useMemo(() => {
    return interviews
        .filter(interview => {
          const interviewDate = new Date(interview.scheduledAt);
          return isSameDay(interviewDate, currentDate);
        })
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  }, [interviews, currentDate]);

  // Get dates that have interviews for calendar highlighting
  const interviewDates = React.useMemo(() => {
    return interviews.map(interview => new Date(interview.scheduledAt));
  }, [interviews]);

  const modifiers = {
    hasInterview: interviewDates
  };

  const modifiersStyles = {
    hasInterview: {
      backgroundColor: 'hsl(var(--active))',
      fontWeight: 'bold',
    }
  };

  const modifiersClassNames = {
    hasInterview: 'relative after:content-[""] after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full after:pointer-events-none'
  };

  return (
      <>
        <Card className="w-fit">
          <CardContent className="px-4 flex gap-x-3">
            <Calendar
                mode="single"
                selected={currentDate}
                onSelect={handleDateSelect}
                className="bg-transparent p-0"
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
                modifiersClassNames={modifiersClassNames}
                required
            />

            <div className="flex flex-col gap-4">
              <div className="flex w-full items-center justify-between px-1">
                <div className="text-sm font-medium">
                  {currentDate?.toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
                {onAddInterview && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-6"
                        onClick={onAddInterview}
                        title="Add Interview"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">Add Interview</span>
                    </Button>
                )}
              </div>

              <div className="flex w-full flex-col gap-2 max-h-64 overflow-y-auto">
                {dailyInterviews.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      No interviews scheduled for this day
                    </div>
                ) : (
                    dailyInterviews.map((interview) => {
                      const IconComponent = getInterviewTypeIcon(interview.type);
                      const interviewTime = new Date(interview.scheduledAt);

                      return (
                          <div
                              key={interview.id}
                              className="bg-muted after:bg-primary/70 relative rounded-md p-3 pl-6 text-sm after:absolute after:inset-y-2 after:left-2 after:w-1 after:rounded-full hover:bg-muted/70 transition-colors cursor-pointer"
                              onClick={() => {
                                setSelectedInterview(interview);
                                setIsDetailModalOpen(true);
                              }}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4 text-primary flex-shrink-0" />
                                <div className="font-medium truncate">
                                  {formatInterviewType(interview.type)}
                                </div>
                              </div>
                              <Badge
                                  variant="static"
                                  className={`${getInterviewStatusColor(interview.status)} text-xs flex-shrink-0`}
                              >
                                {formatInterviewStatus(interview.status)}
                              </Badge>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 flex-shrink-0" />
                                <span>
                                  {interviewTime.toLocaleTimeString([], {
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
                                        href={formatMeetingLink(interview.meetingLink)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline truncate"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                      Join Meeting
                                    </a>
                                  </div>
                              )}
                            </div>
                          </div>
                      );
                    })
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <InterviewDetailModal
          interview={selectedInterview}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
        />
      </>
  );
}