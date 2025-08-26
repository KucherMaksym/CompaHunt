'use client';

import {useFormContext} from 'react-hook-form';
import {ProfileFormData} from '@/lib/validation/profile';
import {fieldHints} from '@/lib/validation/profile';
import {
    ExperienceLevel,
    RemotenessPreference,
    experienceLevelLabels,
    remotenessLabels
} from '@/types/profile';
import {FormField, FormItem, FormLabel, FormControl, FormMessage} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';
import {InfoIcon} from 'lucide-react';

export function BasicProfileStep() {
    const {control, register, formState: {errors}} = useFormContext<ProfileFormData>();

    return (
        <TooltipProvider>
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Current Position */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <label htmlFor="currentPosition" className="text-sm font-medium text-foreground">
                                Current Position
                            </label>
                            <Tooltip>
                                <TooltipTrigger>
                                    <InfoIcon className="w-4 h-4 text-muted-foreground"/>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="max-w-xs">{fieldHints.currentPosition}</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <Input
                            id="currentPosition"
                            {...register('profile.currentPosition')}
                            placeholder="e.g. Senior Software Engineer"
                            maxLength={100}
                        />
                        {errors.profile?.currentPosition && (
                            <p className="text-sm text-destructive">{errors.profile.currentPosition.message}</p>
                        )}
                        <p className="text-xs text-muted-foreground">Max 100 characters</p>
                    </div>

                    {/* Experience Level */}
                    <FormField
                        control={control}
                        name="profile.experienceLevel"
                        render={({field}) => (
                            <FormItem className={"flex flex-col space-y-2 gap-0"}>
                                <div className="flex items-center gap-2">
                                    <FormLabel className="text-sm font-medium text-foreground">Experience Level</FormLabel>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <InfoIcon className="w-4 h-4 text-primary"/>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">{fieldHints.experienceLevel}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className={"w-full"}>
                                            <SelectValue placeholder="Select your experience level"/>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.entries(experienceLevelLabels).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Target Position */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <label htmlFor="targetPosition" className="text-sm font-medium">
                                Target Position
                            </label>
                            <Tooltip>
                                <TooltipTrigger>
                                    <InfoIcon className="w-4 h-4 text-primary"/>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="max-w-xs">{fieldHints.targetPosition}</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <Input
                            id="targetPosition"
                            {...register('profile.targetPosition')}
                            placeholder="e.g. Tech Lead"
                            maxLength={100}
                        />
                        {errors.profile?.targetPosition && (
                            <p className="text-sm text-error/70">{errors.profile.targetPosition.message}</p>
                        )}
                        <p className="text-xs text-secondary">Max 100 characters</p>
                    </div>

                    {/* Location Preference */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <label htmlFor="locationPreference" className="text-sm font-medium">
                                Location Preference
                            </label>
                            <Tooltip>
                                <TooltipTrigger>
                                    <InfoIcon className="w-4 h-4 text-primary"/>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="max-w-xs">{fieldHints.locationPreference}</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <Input
                            id="locationPreference"
                            {...register('profile.locationPreference')}
                            placeholder="e.g. New York, San Francisco, Remote"
                            maxLength={100}
                        />
                        {errors.profile?.locationPreference && (
                            <p className="text-sm text-error/70">{errors.profile.locationPreference.message}</p>
                        )}
                        <p className="text-xs text-secondary">Max 100 characters</p>
                    </div>
                </div>

                {/* Salary Range */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <h3 className="text-sm font-medium">Target Salary Range</h3>
                        <Tooltip>
                            <TooltipTrigger>
                                <InfoIcon className="w-4 h-4 text-primary"/>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="max-w-xs">{fieldHints.targetSalary}</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="targetSalaryMin" className="text-sm text-secondary">
                                Minimum Salary
                            </label>
                            <Input
                                id="targetSalaryMin"
                                type="number"
                                {...register('profile.targetSalaryMin', {valueAsNumber: true})}
                                placeholder="50000"
                                min={0}
                            />
                            {errors.profile?.targetSalaryMin && (
                                <p className="text-sm text-error/70">{errors.profile.targetSalaryMin.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="targetSalaryMax" className="text-sm text-secondary">
                                Maximum Salary
                            </label>
                            <Input
                                id="targetSalaryMax"
                                type="number"
                                {...register('profile.targetSalaryMax', {valueAsNumber: true})}
                                placeholder="80000"
                                min={0}
                            />
                            {errors.profile?.targetSalaryMax && (
                                <p className="text-sm text-error/70">{errors.profile.targetSalaryMax.message}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Remoteness Preference */}
                <div className={"grid grid-cols-1 md:grid-cols-2 gap-6"}>
                    <FormField
                        control={control}
                        name="profile.remotenessPreference"
                        render={({field}) => (
                            <FormItem>
                                <div className="flex items-center gap-2">
                                    <FormLabel className="text-sm font-medium text-foreground">Work Format Preference</FormLabel>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <InfoIcon className="w-4 h-4 text-primary"/>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">{fieldHints.remotenessPreference}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select your work format preference"/>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.entries(remotenessLabels).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                </div>

                {/* Bio */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <label htmlFor="bio" className="text-sm font-medium">
                            Professional Bio
                        </label>
                        <Tooltip>
                            <TooltipTrigger>
                                <InfoIcon className="w-4 h-4 text-primary"/>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="max-w-xs">{fieldHints.bio}</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <Textarea
                        id="bio"
                        {...register('profile.bio')}
                        placeholder="Tell us about your professional background, interests, and what drives you in your career..."
                        maxLength={500}
                        rows={4}
                    />
                    {errors.profile?.bio && (
                        <p className="text-sm text-error/70">{errors.profile.bio.message}</p>
                    )}
                    <p className="text-xs text-secondary">Max 500 characters</p>
                </div>

                {/* Social Links */}
                <div>
                    <h3 className="text-sm font-medium mb-4">Professional Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <label htmlFor="linkedinUrl" className="text-sm font-medium">
                                    LinkedIn URL
                                </label>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <InfoIcon className="w-4 h-4 text-primary"/>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-xs">{fieldHints.linkedinUrl}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <Input
                                id="linkedinUrl"
                                type="url"
                                {...register('profile.linkedinUrl')}
                                placeholder="https://linkedin.com/in/yourprofile"
                                maxLength={100}
                            />
                            {errors.profile?.linkedinUrl && (
                                <p className="text-sm text-error/70">{errors.profile.linkedinUrl.message}</p>
                            )}
                            <p className="text-xs text-secondary">Max 100 characters</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <label htmlFor="githubUrl" className="text-sm font-medium">
                                    GitHub URL
                                </label>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <InfoIcon className="w-4 h-4 text-primary"/>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-xs">{fieldHints.githubUrl}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <Input
                                id="githubUrl"
                                type="url"
                                {...register('profile.githubUrl')}
                                placeholder="https://github.com/yourusername"
                                maxLength={100}
                            />
                            {errors.profile?.githubUrl && (
                                <p className="text-sm text-error/70">{errors.profile.githubUrl.message}</p>
                            )}
                            <p className="text-xs text-secondary">Max 100 characters</p>
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}