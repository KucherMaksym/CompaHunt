'use client';

import * as React from "react";
import { Interview } from "@/types/vacancy";
import { InterviewCalendar } from "./InterviewCalendar";
import { UpcomingInterviews } from "./UpcomingInterviews";

interface InterviewDashboardProps {
  onAddInterview?: () => void;
}

export function InterviewDashboard({ onAddInterview }: InterviewDashboardProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleInterviewClick = (interview: Interview) => {
    // When an interview is clicked, select its date in the calendar
    const interviewDate = new Date(interview.scheduledAt);
    setSelectedDate(interviewDate);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Calendar Component */}
      <div className="flex-shrink-0 ">
        <InterviewCalendar
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          onAddInterview={onAddInterview}
        />
      </div>

      {/* Upcoming Interviews List */}
      {/*  <UpcomingInterviews*/}
      {/*    selectedDate={selectedDate}*/}
      {/*    onInterviewClick={handleInterviewClick}*/}
      {/*  />*/}
    </div>
  );
}