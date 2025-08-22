'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, User, Video, Building } from 'lucide-react';
import { PendingEventDTO } from '@/lib/api/events';
import { InterviewStatus } from '@/types/vacancy';
import { interviewApi, UpdateInterviewRequest } from '@/lib/api/interviews';
import { toast } from 'sonner';

interface InterviewFeedbackModalProps {
  event: PendingEventDTO;
  isOpen: boolean;
  onClose: () => void;
  onResolve: (eventId: number) => Promise<void>;
  eventIndex: number;
  totalEvents: number;
}

export const InterviewFeedbackModal: React.FC<InterviewFeedbackModalProps> = ({
  event,
  isOpen,
  onClose,
  onResolve,
  eventIndex,
  totalEvents,
}) => {
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState<InterviewStatus>('COMPLETED');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!event.interviewId) {
      toast.error('Interview ID not found');
      return;
    }

    setIsSubmitting(true);
    try {
      // Update interview with feedback and status
      const updateData: UpdateInterviewRequest = {
        feedback,
        status,
      };

      await interviewApi.update(event.interviewId.toString(), updateData);
      
      // Resolve the event only after successful update
      await onResolve(event.id);
      
      // Reset form
      setFeedback('');
      setStatus('COMPLETED');

      toast.success('Interview feedback submitted successfully');
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    try {
      // Resolve the event without updating interview
      await onResolve(event.id);
      onClose();
    } catch (error) {
      console.error('Error resolving event:', error);
      toast.error('Failed to resolve event');
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'COMPLETED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800',
      'NO_SHOW': 'bg-gray-100 text-gray-800',
      'RESCHEDULED': 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-blue-100 text-blue-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Interview Feedback Required</span>
            <Badge variant="outline" className="text-xs">
              {eventIndex + 1} of {totalEvents}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Interview Details Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-5 w-5" />
                {event.vacancyInfo?.title} at {event.vacancyInfo?.companyName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {event.interviewInfo && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDateTime(event.interviewInfo.scheduledAt)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {event.interviewInfo.type.replace('_', ' ')}
                    </Badge>
                  </div>

                  {event.interviewInfo.interviewerName && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{event.interviewInfo.interviewerName}</span>
                    </div>
                  )}

                  {event.interviewInfo.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{event.interviewInfo.location}</span>
                    </div>
                  )}

                  {event.interviewInfo.meetingLink && (
                    <div className="flex items-center gap-2 col-span-2">
                      <Video className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={event.interviewInfo.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate"
                      >
                        {event.interviewInfo.meetingLink}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interview Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Interview Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as InterviewStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Select interview status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COMPLETED">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Completed
                  </div>
                </SelectItem>
                <SelectItem value="CANCELLED">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Cancelled
                  </div>
                </SelectItem>
                <SelectItem value="NO_SHOW">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                    No Show
                  </div>
                </SelectItem>
                <SelectItem value="RESCHEDULED">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    Rescheduled
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Feedback */}
          <div className="space-y-2">
            <Label htmlFor="feedback">Interview Feedback</Label>
            <Textarea
              id="feedback"
              placeholder="How did the interview go? Share your thoughts, key questions asked, next steps, etc..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              This feedback will be saved to your interview records and can help track your progress.
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleSkip}
            disabled={isSubmitting}
          >
            Skip for Now
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="min-w-[100px]"
          >
            {isSubmitting ? 'Saving...' : 'Save Feedback'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};