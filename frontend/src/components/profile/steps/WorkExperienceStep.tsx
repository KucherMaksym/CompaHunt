'use client';

import {useFormContext, useFieldArray, useForm} from 'react-hook-form';
import {useState, useEffect} from 'react';
import {ProfileFormData} from '@/lib/validation/profile';
import {fieldHints} from '@/lib/validation/profile';
import {Industry, industryLabels} from '@/types/profile';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Checkbox} from '@/components/ui/checkbox';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import {Plus, Trash2, InfoIcon, Building, Calendar, Edit, MapPin, Users} from 'lucide-react';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';

// Schema for single work experience
const workExperienceSchema = z.object({
    companyName: z.string().min(1, 'Company name is required'),
    position: z.string().min(1, 'Position is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional(),
    isCurrent: z.boolean(),
    description: z.string().optional(),
    achievements: z.array(z.string()).default([]),
    technologiesUsed: z.array(z.string()).default([]),
    companySize: z.string().optional(),
    industry: z.enum(Industry).optional()
});

type WorkExperienceData = z.infer<typeof workExperienceSchema>;

interface WorkExperienceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: WorkExperienceData) => void;
    initialData?: WorkExperienceData | null;
    mode: 'add' | 'edit';
}

function WorkExperienceModal({isOpen, onClose, onSubmit, initialData, mode}: WorkExperienceModalProps) {
    const form = useForm<WorkExperienceData>({
        resolver: zodResolver(workExperienceSchema),
        defaultValues: {
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
    });

    const {register, handleSubmit, watch, setValue, formState: {errors}, reset} = form;
    const [achievements, setAchievements] = useState<string[]>([]);
    const [technologies, setTechnologies] = useState<string[]>([]);

    const isCurrent = watch('isCurrent');

    // Update form when initialData changes
    useEffect(() => {
        if (initialData && isOpen) {
            // Update form values
            Object.entries(initialData).forEach(([key, value]) => {
                if (key === 'achievements' || key === 'technologiesUsed') {
                    // These will be handled separately in state
                    return;
                }
                setValue(key as keyof WorkExperienceData, value);
            });
            
            // Update local states for achievements and technologies
            setAchievements(initialData.achievements || []);
            setTechnologies(initialData.technologiesUsed || []);
        } else if (!isOpen) {
            // Reset form when modal closes
            reset();
            setAchievements([]);
            setTechnologies([]);
        }
    }, [initialData, isOpen, setValue, reset]);

    const handleClose = () => {
        reset();
        setAchievements([]);
        setTechnologies([]);
        onClose();
    };

    const handleFormSubmit = (data: WorkExperienceData) => {
        onSubmit({
            ...data,
            achievements: achievements.filter(a => a.trim() !== ''),
            technologiesUsed: technologies.filter(t => t.trim() !== '')
        });
        handleClose();
    };

    const addAchievement = () => {
        if (achievements.length < 10) {
            setAchievements([...achievements, '']);
        }
    };

    const removeAchievement = (index: number) => {
        setAchievements(achievements.filter((_, i) => i !== index));
    };

    const updateAchievement = (index: number, value: string) => {
        const newAchievements = [...achievements];
        newAchievements[index] = value;
        setAchievements(newAchievements);
    };

    const addTechnology = () => {
        if (technologies.length < 20) {
            setTechnologies([...technologies, '']);
        }
    };

    const removeTechnology = (index: number) => {
        setTechnologies(technologies.filter((_, i) => i !== index));
    };

    const updateTechnology = (index: number, value: string) => {
        const newTechnologies = [...technologies];
        newTechnologies[index] = value;
        setTechnologies(newTechnologies);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Building className="w-5 h-5"/>
                        {mode === 'add' ? 'Add Work Experience' : 'Edit Work Experience'}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === 'add'
                            ? 'Add your professional work experience with detailed information.'
                            : 'Update your work experience details.'
                        }
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium">Company Name *</label>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <InfoIcon className="w-4 h-4 text-muted-foreground"/>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-xs">{fieldHints.companyName}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <Input
                                {...register('companyName')}
                                placeholder="e.g. Google, Microsoft"
                                maxLength={100}
                            />
                            {errors.companyName && (
                                <p className="text-sm text-red-600">{errors.companyName.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium">Position *</label>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <InfoIcon className="w-4 h-4 text-muted-foreground"/>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-xs">{fieldHints.position}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <Input
                                {...register('position')}
                                placeholder="e.g. Senior Software Engineer"
                                maxLength={100}
                            />
                            {errors.position && (
                                <p className="text-sm text-red-600">{errors.position.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium">Start Date *</label>
                                <Calendar className="w-4 h-4 text-muted-foreground"/>
                            </div>
                            <Input
                                type="date"
                                {...register('startDate')}
                            />
                            {errors.startDate && (
                                <p className="text-sm text-red-600">{errors.startDate.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium">End Date</label>
                                <Calendar className="w-4 h-4 text-muted-foreground"/>
                            </div>
                            <Input
                                type="date"
                                {...register('endDate')}
                                disabled={isCurrent}
                            />
                            {errors.endDate && (
                                <p className="text-sm text-red-600">{errors.endDate.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Current Position</label>
                            <div className="flex items-center space-x-2 pt-2">
                                <Checkbox
                                    {...register('isCurrent')}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            setValue('endDate', '');
                                        }
                                    }}
                                />
                                <label className="text-sm">I currently work here</label>
                            </div>
                        </div>
                    </div>

                    {/* Company Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium">Company Size</label>
                                <Users className="w-4 h-4 text-muted-foreground"/>
                            </div>
                            <Input
                                {...register('companySize')}
                                placeholder="e.g. 1000+ employees"
                                maxLength={100}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium">Industry</label>
                                <Building className="w-4 h-4 text-muted-foreground"/>
                            </div>
                            <Select
                                value={watch('industry') || ''}
                                onValueChange={(value) => setValue('industry', value as Industry)}
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
                                    <InfoIcon className="w-4 h-4 text-muted-foreground"/>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="max-w-xs">{fieldHints.description}</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <Textarea
                            {...register('description')}
                            placeholder="Describe your role, responsibilities, and key projects..."
                            maxLength={1000}
                            rows={3}
                        />
                        <p className="text-xs text-muted-foreground">Max 1000 characters</p>
                    </div>

                    {/* Achievements */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium">Key Achievements</label>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <InfoIcon className="w-4 h-4 text-muted-foreground"/>
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
                                disabled={achievements.length >= 10}
                            >
                                <Plus className="w-4 h-4 mr-1"/>
                                Add Achievement
                            </Button>
                        </div>

                        <div className="space-y-2">
                            {achievements.map((achievement, index) => (
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
                                        className="text-red-600 hover:text-red-800"
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
                                        <InfoIcon className="w-4 h-4 text-muted-foreground"/>
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
                                disabled={technologies.length >= 20}
                            >
                                <Plus className="w-4 h-4 mr-1"/>
                                Add Technology
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {technologies.map((tech, index) => (
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
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <Trash2 className="w-4 h-4"/>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleSubmit(handleFormSubmit as any)}>
                            {mode === 'add' ? 'Add Experience' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface ExperienceCardProps {
    experience: WorkExperienceData;
    onEdit: () => void;
    onDelete: () => void;
}

function ExperienceCard({experience, onEdit, onDelete}: ExperienceCardProps) {
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {year: 'numeric', month: 'short'});
    };

    const getDuration = () => {
        const start = new Date(experience.startDate);
        const end = experience.isCurrent ? new Date() : new Date(experience.endDate || '');

        const months = (end.getFullYear() - start.getFullYear()) * 12 +
            (end.getMonth() - start.getMonth()) + 1;

        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;

        if (years > 0 && remainingMonths > 0) {
            return `${years}y ${remainingMonths}m`;
        } else if (years > 0) {
            return `${years}y`;
        } else {
            return `${remainingMonths}m`;
        }
    };

    return (
        <Card className="relative hover:shadow-md transition-shadow gap-y-0">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Building className="w-5 h-5"/>
                            {experience.position}
                            {experience.isCurrent && (
                                <Badge variant="secondary">Current</Badge>
                            )}
                        </CardTitle>
                        <div className="text-muted-foreground mt-1">
                            <p className="font-medium">{experience.companyName}</p>
                            <div className="flex items-center gap-4 text-sm mt-1">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4"/>
                                    {formatDate(experience.startDate)} - {experience.isCurrent ? 'Present' : formatDate(experience.endDate || '')} ({getDuration()})
                                </span>
                                {experience.industry && (
                                    <span className="flex items-center gap-1">
                                        <Building className="w-4 h-4"/>{industryLabels[experience.industry]}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            type={"button"}
                            variant="ghost"
                            size="sm"
                            onClick={onEdit}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            <Edit className="w-4 h-4"/>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onDelete}
                            className="text-red-600 hover:text-red-800"
                        >
                            <Trash2 className="w-4 h-4"/>
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {experience.description && (
                    <p className="text-sm text-muted-foreground">{experience.description}</p>
                )}

                {experience.achievements && experience.achievements.length > 0 && (
                    <div>
                        <h4 className="text-sm font-medium mb-2">Key Achievements:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            {experience.achievements.map((achievement, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                                    {achievement}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {experience.technologiesUsed && experience.technologiesUsed.length > 0 && (
                    <div>
                        <h4 className="text-sm font-medium mb-2">Technologies:</h4>
                        <div className="flex flex-wrap gap-2">
                            {experience.technologiesUsed.map((tech, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                    {tech}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export function WorkExperienceStep() {
    const {control, watch} = useFormContext<ProfileFormData>();
    const {fields, append, update, remove} = useFieldArray({
        control,
        name: 'workExperiences'
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

    const workExperiences = watch('workExperiences');

    const openAddModal = () => {
        setModalMode('add');
        setEditingIndex(null);
        setIsModalOpen(true);
    };

    const openEditModal = (index: number) => {
        setModalMode('edit');
        setEditingIndex(index);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingIndex(null);
    };

    const handleSubmit = (data: WorkExperienceData) => {
        if (modalMode === 'add') {
            append(data);
        } else if (editingIndex !== null) {
            update(editingIndex, data);
        }
        closeModal();
    };

    const handleDelete = (index: number) => {
        if (confirm('Are you sure you want to delete this work experience?')) {
            remove(index);
        }
    };

    return (
        <TooltipProvider>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium">Work Experience</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Add your professional work experience with detailed information.
                        </p>
                    </div>
                    <Button
                        type="button"
                        onClick={openAddModal}
                        className="flex items-center gap-2"
                        disabled={fields.length >= 5}
                    >
                        <Plus className="w-4 h-4"/>
                        Add Experience
                    </Button>
                </div>

                {fields.length === 0 && (
                    <Card className="border-dashed border-2">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <div className="text-muted-foreground mb-4">
                                <Building className="w-16 h-16 mx-auto"/>
                            </div>
                            <h3 className="text-lg font-medium mb-2">No work experience added yet</h3>
                            <p className="text-muted-foreground text-center mb-6 max-w-md">
                                Start building your professional profile by adding your work experience.
                                Include your achievements and technologies to make your profile stand out.
                            </p>
                            <Button onClick={openAddModal} className="flex items-center gap-2">
                                <Plus className="w-4 h-4"/>
                                Add Your First Experience
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {fields.length > 0 && (
                    <div className="space-y-4">
                        {fields.map((field, index) => (
                            <ExperienceCard
                                key={field.id}
                                experience={workExperiences[index]}
                                onEdit={() => openEditModal(index)}
                                onDelete={() => handleDelete(index)}
                            />
                        ))}
                    </div>
                )}

                {fields.length > 0 && fields.length < 5 && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={openAddModal}
                        className="w-full flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4"/>
                        Add Another Experience
                    </Button>
                )}

                {fields.length >= 5 && (
                    <p className="text-sm text-muted-foreground text-center p-4 bg-muted/30 rounded-lg">
                        Maximum 5 work experiences allowed. Remove some experiences to add new ones.
                    </p>
                )}

                <WorkExperienceModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    onSubmit={handleSubmit}
                    initialData={editingIndex !== null ? workExperiences[editingIndex] : null}
                    mode={modalMode}
                />
            </div>
        </TooltipProvider>
    );
}