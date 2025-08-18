'use client';

import { useFormContext, useFieldArray } from 'react-hook-form';
import { ProfileFormData } from '@/lib/validation/profile';
import { fieldHints } from '@/lib/validation/profile';
import { Industry, industryLabels } from '@/types/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Trash2, InfoIcon, Building, Calendar } from 'lucide-react';

export function WorkExperienceStep() {
  const { control, register, watch, setValue, formState: { errors } } = useFormContext<ProfileFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'workExperiences'
  });

  const workExperiences = watch('workExperiences');

  const addWorkExperience = () => {
    append({
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
  };

  const addAchievement = (index: number) => {
    const currentExperience = workExperiences[index];
    const newAchievements = [...(currentExperience.achievements || []), ''];
    setValue(`workExperiences.${index}.achievements`, newAchievements);
  };

  const removeAchievement = (expIndex: number, achievementIndex: number) => {
    const currentExperience = workExperiences[expIndex];
    const newAchievements = currentExperience.achievements.filter((_, i) => i !== achievementIndex);
    setValue(`workExperiences.${expIndex}.achievements`, newAchievements);
  };

  const addTechnology = (index: number) => {
    const currentExperience = workExperiences[index];
    const newTechnologies = [...(currentExperience.technologiesUsed || []), ''];
    setValue(`workExperiences.${index}.technologiesUsed`, newTechnologies);
  };

  const removeTechnology = (expIndex: number, techIndex: number) => {
    const currentExperience = workExperiences[expIndex];
    const newTechnologies = currentExperience.technologiesUsed.filter((_, i) => i !== techIndex);
    setValue(`workExperiences.${expIndex}.technologiesUsed`, newTechnologies);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Work Experience</h3>
            <p className="text-sm text-secondary mt-1">
              Add your professional work experience. Include achievements and technologies used.
            </p>
          </div>
          <Button
            type="button"
            onClick={addWorkExperience}
            className="flex items-center gap-2"
            disabled={fields.length >= 5}
          >
            <Plus className="w-4 h-4" />
            Add Experience
          </Button>
        </div>

        {fields.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="text-primary mb-4">
                <Building className="w-12 h-12" />
              </div>
              <p className="text-primary text-center mb-4">
                No work experience added yet. Click "Add Experience" to get started.
              </p>
              <Button onClick={addWorkExperience} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Experience
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {fields.map((field, index) => (
            <Card key={field.id} className="relative">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Experience #{index + 1}
                    {workExperiences[index]?.isCurrent && (
                      <Badge variant="secondary">Current</Badge>
                    )}
                  </CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="text-error/70 hover:text-error/100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Company Name *</label>
                      <Tooltip>
                        <TooltipTrigger>
                          <InfoIcon className="w-4 h-4 text-primary" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{fieldHints.companyName}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      {...register(`workExperiences.${index}.companyName`)}
                      placeholder="e.g. Google, Microsoft"
                      maxLength={100}
                    />
                    {errors.workExperiences?.[index]?.companyName && (
                      <p className="text-sm text-error/70">
                        {errors.workExperiences[index]?.companyName?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Position *</label>
                      <Tooltip>
                        <TooltipTrigger>
                          <InfoIcon className="w-4 h-4 text-primary" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{fieldHints.position}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      {...register(`workExperiences.${index}.position`)}
                      placeholder="e.g. Senior Software Engineer"
                      maxLength={100}
                    />
                    {errors.workExperiences?.[index]?.position && (
                      <p className="text-sm text-error/70">
                        {errors.workExperiences[index]?.position?.message}
                      </p>
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
                          <InfoIcon className="w-4 h-4 text-primary" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{fieldHints.startDate}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      type="date"
                      {...register(`workExperiences.${index}.startDate`)}
                    />
                    {errors.workExperiences?.[index]?.startDate && (
                      <p className="text-sm text-error/70">
                        {errors.workExperiences[index]?.startDate?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">End Date</label>
                      <Tooltip>
                        <TooltipTrigger>
                          <InfoIcon className="w-4 h-4 text-primary" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{fieldHints.endDate}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      type="date"
                      {...register(`workExperiences.${index}.endDate`)}
                      disabled={workExperiences[index]?.isCurrent}
                    />
                    {errors.workExperiences?.[index]?.endDate && (
                      <p className="text-sm text-error/70">
                        {errors.workExperiences[index]?.endDate?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Current Position</label>
                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox
                        id={`current-${index}`}
                        {...register(`workExperiences.${index}.isCurrent`)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setValue(`workExperiences.${index}.endDate`, '');
                          }
                        }}
                      />
                      <label htmlFor={`current-${index}`} className="text-sm">
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
                      {...register(`workExperiences.${index}.companySize`)}
                      placeholder="e.g. 1000+ employees"
                      maxLength={100}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Industry</label>
                    <Select
                      value={workExperiences[index]?.industry || ''}
                      onValueChange={(value) => {
                        setValue(`workExperiences.${index}.industry`, value as Industry);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
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
                        <InfoIcon className="w-4 h-4 text-primary" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{fieldHints.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Textarea
                    {...register(`workExperiences.${index}.description`)}
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
                          <InfoIcon className="w-4 h-4 text-primary" />
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
                      onClick={() => addAchievement(index)}
                      disabled={(workExperiences[index]?.achievements?.length || 0) >= 10}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Achievement
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {(workExperiences[index]?.achievements || []).map((_, achievementIndex) => (
                      <div key={achievementIndex} className="flex gap-2">
                        <Input
                          {...register(`workExperiences.${index}.achievements.${achievementIndex}`)}
                          placeholder="e.g. Increased system performance by 40%"
                          maxLength={200}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAchievement(index, achievementIndex)}
                          className="text-error/70"
                        >
                          <Trash2 className="w-4 h-4" />
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
                          <InfoIcon className="w-4 h-4 text-primary" />
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
                      onClick={() => addTechnology(index)}
                      disabled={(workExperiences[index]?.technologiesUsed?.length || 0) >= 20}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Technology
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {(workExperiences[index]?.technologiesUsed || []).map((_, techIndex) => (
                      <div key={techIndex} className="flex gap-2">
                        <Input
                          {...register(`workExperiences.${index}.technologiesUsed.${techIndex}`)}
                          placeholder="e.g. React, Node.js, AWS"
                          maxLength={50}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTechnology(index, techIndex)}
                          className="text-error/70"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {fields.length > 0 && fields.length < 5 && (
          <Button
            type="button"
            variant="outline"
            onClick={addWorkExperience}
            className="w-full flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Another Experience
          </Button>
        )}

        {fields.length >= 5 && (
          <p className="text-sm text-secondary text-center">
            Maximum 5 work experiences allowed. Remove some experiences to add new ones.
          </p>
        )}
      </div>
    </TooltipProvider>
  );
}