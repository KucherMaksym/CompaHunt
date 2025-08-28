'use client';

import {useState, useCallback} from 'react';
import {useFormContext} from 'react-hook-form';
import {ProfileFormData} from '@/lib/validation/profile';
import {fieldHints} from '@/lib/validation/profile';
import {Industry, industryLabels} from '@/types/profile';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Checkbox} from '@/components/ui/checkbox';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter} from '@/components/ui/dialog';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';
import {Plus, Trash2, InfoIcon} from 'lucide-react';

interface WorkExperience {
    companyName: string;
    position: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    description: string;
    achievements: string[];
    technologiesUsed: string[];
    companySize: string;
    industry?: Industry;
}

interface WorkExperienceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (experience: WorkExperience) => void;
    initialData?: WorkExperience;
    isEditing?: boolean;
}

export function WorkExperienceModal({
    isOpen,
    onClose,
    onSave,
    initialData,
    isEditing = false
}: WorkExperienceModalProps) {
    const [formData, setFormData] = useState<WorkExperience>(
        initialData || {
            companyName: '',
            position: '',
            startDate: '',
            endDate: '',
            isCurrent: false,
            description: '',
            achievements: [],
            technologiesUsed: [],
            companySize: '',
            industry: undefined
        }
    );

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = useCallback((field: keyof WorkExperience, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    }, [errors]);

    const handleCurrentWorkChange = useCallback((checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            isCurrent: checked,
            endDate: checked ? '' : prev.endDate
        }));
    }, []);

    const addAchievement = useCallback(() => {
        setFormData(prev => ({
            ...prev,
            achievements: [...prev.achievements, '']
        }));
    }, []);

    const removeAchievement = useCallback((index: number) => {
        setFormData(prev => ({
            ...prev,
            achievements: prev.achievements.filter((_, i) => i !== index)
        }));
    }, []);

    const updateAchievement = useCallback((index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            achievements: prev.achievements.map((achievement, i) => 
                i === index ? value : achievement
            )
        }));
    }, []);

    const addTechnology = useCallback(() => {
        setFormData(prev => ({
            ...prev,
            technologiesUsed: [...prev.technologiesUsed, '']
        }));
    }, []);

    const removeTechnology = useCallback((index: number) => {
        setFormData(prev => ({
            ...prev,
            technologiesUsed: prev.technologiesUsed.filter((_, i) => i !== index)
        }));
    }, []);

    const updateTechnology = useCallback((index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            technologiesUsed: prev.technologiesUsed.map((tech, i) => 
                i === index ? value : tech
            )
        }));
    }, []);

    const validateForm = useCallback(() => {
        const newErrors: Record<string, string> = {};

        if (!formData.companyName.trim()) {
            newErrors.companyName = 'Company name is required';
        }
        if (!formData.position.trim()) {
            newErrors.position = 'Position is required';
        }
        if (!formData.startDate) {
            newErrors.startDate = 'Start date is required';
        }
        if (!formData.isCurrent && !formData.endDate) {
            newErrors.endDate = 'End date is required if not current position';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const handleSave = useCallback(() => {
        if (validateForm()) {
            // Filter out empty achievements and technologies
            const cleanedData = {
                ...formData,
                achievements: formData.achievements.filter(a => a.trim()),
                technologiesUsed: formData.technologiesUsed.filter(t => t.trim())
            };
            onSave(cleanedData);
            onClose();
        }
    }, [formData, validateForm, onSave, onClose]);

    const handleClose = useCallback(() => {
        setFormData(initialData || {
            companyName: '',
            position: '',
            startDate: '',
            endDate: '',
            isCurrent: false,
            description: '',
            achievements: [],
            technologiesUsed: [],
            companySize: '',
            industry: undefined
        });
        setErrors({});
        onClose();
    }, [initialData, onClose]);

    return (
        <TooltipProvider>
            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {isEditing ? 'Edit Work Experience' : 'Add Work Experience'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium">Company Name *</label>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <InfoIcon className="w-4 h-4 text-primary"/>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">{fieldHints.companyName}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <Input
                                    value={formData.companyName}
                                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                                    placeholder="e.g. Google, Microsoft"
                                    maxLength={100}
                                />
                                {errors.companyName && (
                                    <p className="text-sm text-error/70">{errors.companyName}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium">Position *</label>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <InfoIcon className="w-4 h-4 text-primary"/>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">{fieldHints.position}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <Input
                                    value={formData.position}
                                    onChange={(e) => handleInputChange('position', e.target.value)}
                                    placeholder="e.g. Senior Software Engineer"
                                    maxLength={100}
                                />
                                {errors.position && (
                                    <p className="text-sm text-error/70">{errors.position}</p>
                                )}
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium">Start Date *</label>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <InfoIcon className="w-4 h-4 text-primary"/>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">{fieldHints.startDate}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <Input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                                />
                                {errors.startDate && (
                                    <p className="text-sm text-error/70">{errors.startDate}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium">End Date</label>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <InfoIcon className="w-4 h-4 text-primary"/>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">{fieldHints.endDate}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <Input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                                    disabled={formData.isCurrent}
                                />
                                {errors.endDate && (
                                    <p className="text-sm text-error/70">{errors.endDate}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Current Position</label>
                                <div className="flex items-center space-x-2 pt-2">
                                    <Checkbox
                                        id="current-position"
                                        checked={formData.isCurrent}
                                        onCheckedChange={handleCurrentWorkChange}
                                    />
                                    <label htmlFor="current-position" className="text-sm">
                                        I currently work here
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Company Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Company Size</label>
                                <Input
                                    value={formData.companySize}
                                    onChange={(e) => handleInputChange('companySize', e.target.value)}
                                    placeholder="e.g. 1000+ employees"
                                    maxLength={100}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Industry</label>
                                <Select
                                    value={formData.industry || ''}
                                    onValueChange={(value) => handleInputChange('industry', value as Industry)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select industry"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(industryLabels).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium">Job Description</label>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <InfoIcon className="w-4 h-4 text-primary"/>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-xs">{fieldHints.description}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Describe your role, responsibilities, and key projects..."
                                maxLength={1000}
                                rows={3}
                            />
                            <p className="text-xs text-secondary">Max 1000 characters</p>
                        </div>

                        {/* Achievements */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium">Key Achievements</label>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <InfoIcon className="w-4 h-4 text-primary"/>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">{fieldHints.achievements}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addAchievement}
                                    disabled={formData.achievements.length >= 10}
                                >
                                    <Plus className="w-4 h-4 mr-1"/>
                                    Add Achievement
                                </Button>
                            </div>

                            <div className="space-y-2">
                                {formData.achievements.map((achievement, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            value={achievement}
                                            onChange={(e) => updateAchievement(index, e.target.value)}
                                            placeholder="e.g. Increased system performance by 40%"
                                            maxLength={200}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeAchievement(index)}
                                            className="text-error/70"
                                        >
                                            <Trash2 className="w-4 h-4"/>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Technologies */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium">Technologies Used</label>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <InfoIcon className="w-4 h-4 text-primary"/>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">{fieldHints.technologiesUsed}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addTechnology}
                                    disabled={formData.technologiesUsed.length >= 20}
                                >
                                    <Plus className="w-4 h-4 mr-1"/>
                                    Add Technology
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {formData.technologiesUsed.map((tech, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            value={tech}
                                            onChange={(e) => updateTechnology(index, e.target.value)}
                                            placeholder="e.g. React, Node.js, AWS"
                                            maxLength={50}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeTechnology(index)}
                                            className="text-error/70"
                                        >
                                            <Trash2 className="w-4 h-4"/>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>
                            {isEditing ? 'Update Experience' : 'Add Experience'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </TooltipProvider>
    );
}