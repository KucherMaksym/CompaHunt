'use client';

import React, {useState, useEffect, FormEvent} from 'react';
import {Interview, InterviewType, InterviewStatus} from '@/types/vacancy';
import {interviewApi, UpdateInterviewRequest} from '@/lib/api/interviews';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter} from '@/components/ui/dialog';
import {ScrollArea} from '@/components/ui/scroll-area';
import {
    Calendar,
    Clock,
    User,
    Mail,
    MapPin,
    Video,
    FileText,
    MessageSquare,
    Edit
} from 'lucide-react';

interface EditInterviewModalProps {
    interview: Interview;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedInterview: Interview) => void;
}

export function EditInterviewModal({interview, isOpen, onClose, onSave}: EditInterviewModalProps) {
    const [formData, setFormData] = useState<UpdateInterviewRequest>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (interview) {
            setFormData({
                scheduledAt: new Date(interview.scheduledAt).toISOString().slice(0, 16),
                type: interview.type,
                status: interview.status,
                notes: interview.notes || '',
                feedback: interview.feedback || '',
                duration: interview.duration || undefined,
                meetingLink: interview.meetingLink || '',
                location: interview.location || '',
                interviewerName: interview.interviewerName || '',
                interviewerEmail: interview.interviewerEmail || '',
            });
        }
    }, [interview]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!interview) return;

        setIsSubmitting(true);
        try {
            const updateData: UpdateInterviewRequest = {
                ...formData,
                scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : undefined,
            };

            const updatedInterview = await interviewApi.update(interview.id, updateData);
            onSave(updatedInterview);
            onClose();
        } catch (error) {
            console.error('Error updating interview:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: keyof UpdateInterviewRequest, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0 flex flex-col gap-0">
                <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <Edit className="h-5 w-5"/>
                        Edit Interview
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea>
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="scheduledAt" className="flex items-center gap-2">
                                <Calendar className="h-4 w-4"/>
                                Date & Time
                            </Label>
                            <Input
                                id="scheduledAt"
                                type="datetime-local"
                                value={formData.scheduledAt || ''}
                                onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type" className="flex items-center gap-2">
                                <FileText className="h-4 w-4"/>
                                Interview Type
                            </Label>
                            <Select value={formData.type}
                                    onValueChange={(value) => handleInputChange('type', value as InterviewType)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={InterviewType.PHONE_SCREEN}>Phone Screen</SelectItem>
                                    <SelectItem value={InterviewType.VIDEO_CALL}>Video Call</SelectItem>
                                    <SelectItem value={InterviewType.ON_SITE}>On-site Interview</SelectItem>
                                    <SelectItem value={InterviewType.TECHNICAL}>Technical Interview</SelectItem>
                                    <SelectItem value={InterviewType.BEHAVIORAL}>Behavioral Interview</SelectItem>
                                    <SelectItem value={InterviewType.HR_INTERVIEW}>HR Interview</SelectItem>
                                    <SelectItem value={InterviewType.FINAL_ROUND}>Final Round</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={formData.status}
                                    onValueChange={(value) => handleInputChange('status', value as InterviewStatus)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={InterviewStatus.SCHEDULED}>Scheduled</SelectItem>
                                    <SelectItem value={InterviewStatus.COMPLETED}>Completed</SelectItem>
                                    <SelectItem value={InterviewStatus.CANCELLED}>Cancelled</SelectItem>
                                    <SelectItem value={InterviewStatus.RESCHEDULED}>Rescheduled</SelectItem>
                                    <SelectItem value={InterviewStatus.NO_SHOW}>No Show</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="duration" className="flex items-center gap-2">
                                    <Clock className="h-4 w-4"/>
                                    Duration (minutes)
                                </Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    min="0"
                                    value={formData.duration || ''}
                                    onChange={(e) => handleInputChange('duration', e.target.value ? parseInt(e.target.value) : undefined)}
                                    placeholder="60"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="interviewerName" className="flex items-center gap-2">
                                    <User className="h-4 w-4"/>
                                    Interviewer Name
                                </Label>
                                <Input
                                    id="interviewerName"
                                    value={formData.interviewerName || ''}
                                    onChange={(e) => handleInputChange('interviewerName', e.target.value)}
                                    placeholder="Interviewer name"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="interviewerEmail" className="flex items-center gap-2">
                                <Mail className="h-4 w-4"/>
                                Interviewer Email
                            </Label>
                            <Input
                                id="interviewerEmail"
                                type="email"
                                value={formData.interviewerEmail || ''}
                                onChange={(e) => handleInputChange('interviewerEmail', e.target.value)}
                                placeholder="email@company.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="meetingLink" className="flex items-center gap-2">
                                <Video className="h-4 w-4"/>
                                Meeting Link
                            </Label>
                            <Input
                                id="meetingLink"
                                type="url"
                                value={formData.meetingLink || ''}
                                onChange={(e) => handleInputChange('meetingLink', e.target.value)}
                                placeholder="https://zoom.us/..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location" className="flex items-center gap-2">
                                <MapPin className="h-4 w-4"/>
                                Location
                            </Label>
                            <Input
                                id="location"
                                value={formData.location || ''}
                                onChange={(e) => handleInputChange('location', e.target.value)}
                                placeholder="Office / Address"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes" className="flex items-center gap-2">
                                <FileText className="h-4 w-4"/>
                                Notes
                            </Label>
                            <Textarea
                                id="notes"
                                value={formData.notes || ''}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                placeholder="Additional information"
                                rows={3}
                                className="resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="feedback" className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4"/>
                                Feedback
                            </Label>
                            <Textarea
                                id="feedback"
                                value={formData.feedback || ''}
                                onChange={(e) => handleInputChange('feedback', e.target.value)}
                                placeholder="Interview results, impressions"
                                rows={3}
                                className="resize-none"
                            />
                        </div>
                    </form>
                </ScrollArea>

                <DialogFooter className="px-6 py-4 border-t flex-shrink-0">
                    <div className="flex gap-2 w-full justify-end">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting} onClick={handleSubmit}>
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}