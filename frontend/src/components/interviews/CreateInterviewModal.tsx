'use client';

import React, { useState, useEffect, FormEvent, useMemo } from 'react';
import { Interview, InterviewType, InterviewStatus, VacancySearchItem } from '@/types/vacancy';
import { interviewApi, CreateInterviewRequest } from '@/lib/api/interviews';
import { useSearchVacancies } from '@/hooks/useVacancies';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Clock,
    User,
    Mail,
    MapPin,
    Video,
    FileText,
    MessageSquare,
    Plus,
    ChevronDownIcon,
    CalendarIcon,
    ClockIcon,
    Search,
    Building
} from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface CreateInterviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (newInterview: Interview) => void;
}

interface CreateInterviewFormData {
    vacancyId: string;
    scheduledAt: Date | undefined;
    type: InterviewType | undefined;
    notes: string;
    duration: number | undefined;
    meetingLink: string;
    location: string;
    interviewerName: string;
    interviewerEmail: string;
}

export function CreateInterviewModal({ isOpen, onClose, onSave }: CreateInterviewModalProps) {
    const [formData, setFormData] = useState<CreateInterviewFormData>({
        vacancyId: '',
        scheduledAt: undefined,
        type: undefined,
        notes: '',
        duration: undefined,
        meetingLink: '',
        location: '',
        interviewerName: '',
        interviewerEmail: ''
    });
    const [selectedTime, setSelectedTime] = useState('10:30');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDateTimeOpen, setIsDateTimeOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVacancy, setSelectedVacancy] = useState<VacancySearchItem | null>(null);

    // Debounce search term
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    // Fetch vacancies based on search term
    const { data: vacanciesData, isLoading: isSearching, refetch: searchVacancies } = useSearchVacancies({
        search: debouncedSearchTerm,
        size: 10
    });

    const vacancies = useMemo(() => vacanciesData?.content || [], [vacanciesData]);

    // Trigger search when debounced term changes and is not empty
    useEffect(() => {
        if (debouncedSearchTerm.trim()) {
            searchVacancies();
        }
    }, [debouncedSearchTerm, searchVacancies]);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setFormData({
                vacancyId: '',
                scheduledAt: undefined,
                type: undefined,
                notes: '',
                duration: undefined,
                meetingLink: '',
                location: '',
                interviewerName: '',
                interviewerEmail: ''
            });
            setSelectedTime('10:30');
            setSearchTerm('');
            setSelectedVacancy(null);
        }
    }, [isOpen]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!formData.vacancyId || !formData.scheduledAt || !formData.type) {
            return;
        }

        setIsSubmitting(true);
        try {
            const createData: CreateInterviewRequest = {
                vacancyId: formData.vacancyId,
                scheduledAt: new Date(`${formData.scheduledAt.toDateString()} ${selectedTime}`).toISOString(),
                type: formData.type,
                notes: formData.notes || undefined,
                duration: formData.duration || undefined,
                meetingLink: formData.meetingLink || undefined,
                location: formData.location || undefined,
                interviewerName: formData.interviewerName || undefined,
                interviewerEmail: formData.interviewerEmail || undefined,
            };

            const newInterview = await interviewApi.create(createData);
            onSave(newInterview);
            onClose();
        } catch (error) {
            console.error('Error creating interview:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: keyof CreateInterviewFormData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleVacancySelect = (vacancy: VacancySearchItem) => {
        setSelectedVacancy(vacancy);
        setFormData(prev => ({
            ...prev,
            vacancyId: vacancy.id
        }));
        setSearchTerm(`${vacancy.title} - ${vacancy.companyName}`);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0 flex flex-col gap-0">
                <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5"/>
                        Create New Interview
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea>
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Vacancy Search Section */}
                        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                            <Label className="text-base font-medium flex items-center gap-2">
                                <Building className="h-4 w-4"/>
                                Select Vacancy
                            </Label>
                            
                            <div className="space-y-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by position title or company name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                {searchTerm && !selectedVacancy && (
                                    <div className="border rounded-md bg-background max-h-48 overflow-y-auto">
                                        {isSearching ? (
                                            <div className="p-3 text-center text-muted-foreground">
                                                Searching...
                                            </div>
                                        ) : vacancies.length > 0 ? (
                                            vacancies.map((vacancy) => (
                                                <button
                                                    key={vacancy.id}
                                                    type="button"
                                                    onClick={() => handleVacancySelect(vacancy)}
                                                    className="w-full text-left p-3 hover:bg-muted/50 border-b last:border-b-0 transition-colors"
                                                >
                                                    <div className="font-medium">{vacancy.title}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {vacancy.companyName} • {vacancy.location}
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="p-3 text-center text-muted-foreground">
                                                No vacancies found
                                            </div>
                                        )}
                                    </div>
                                )}

                                {selectedVacancy && (
                                    <div className="p-3 border rounded-md bg-muted/20 border-primary/20">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="font-medium text-primary">{selectedVacancy.title}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {selectedVacancy.companyName} • {selectedVacancy.location}
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedVacancy(null);
                                                    setSearchTerm('');
                                                    setFormData(prev => ({ ...prev, vacancyId: '' }));
                                                }}
                                            >
                                                Change
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Interview Details Form */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="scheduledAt" className="flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4"/>
                                    Date *
                                </Label>
                                <Popover open={isDateTimeOpen} onOpenChange={setIsDateTimeOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            id="scheduledAt"
                                            className="w-full justify-between font-normal"
                                        >
                                            {formData.scheduledAt ? formData.scheduledAt.toLocaleDateString() : "Select date"}
                                            <ChevronDownIcon/>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={formData.scheduledAt}
                                            captionLayout="dropdown"
                                            onSelect={(date) => {
                                                handleInputChange('scheduledAt', date);
                                                setIsDateTimeOpen(false);
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="flex flex-col space-y-2">
                                <Label htmlFor="time-picker" className="flex items-center gap-2">
                                    <ClockIcon className="h-4 w-4"/>
                                    Time
                                </Label>
                                <Input
                                    type="time"
                                    value={selectedTime}
                                    onChange={(e) => setSelectedTime(e.target.value)}
                                    id="time-picker"
                                    step="1"
                                    className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type" className="flex items-center gap-2">
                                <FileText className="h-4 w-4"/>
                                Interview Type *
                            </Label>
                            <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value as InterviewType)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select interview type"/>
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
                                    value={formData.interviewerName}
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
                                value={formData.interviewerEmail}
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
                                value={formData.meetingLink}
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
                                value={formData.location}
                                onChange={(e) => handleInputChange('location', e.target.value)}
                                placeholder="Office / Address"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes" className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4"/>
                                Notes
                            </Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                placeholder="Additional information"
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
                        <Button 
                            type="submit" 
                            disabled={isSubmitting || !formData.vacancyId || !formData.scheduledAt || !formData.type}
                            onClick={handleSubmit}
                        >
                            {isSubmitting ? 'Creating...' : 'Create Interview'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}