'use client';

import { useFormContext, useFieldArray } from 'react-hook-form';
import { ProfileFormData } from '@/lib/validation/profile';
import { fieldHints } from '@/lib/validation/profile';
import { SkillCategory } from '@/types/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, InfoIcon, Star } from 'lucide-react';

const skillCategoryLabels: Record<SkillCategory, string> = {
  [SkillCategory.PROGRAMMING_LANGUAGE]: 'Programming Language',
  [SkillCategory.FRAMEWORK]: 'Framework',
  [SkillCategory.DATABASE]: 'Database',
  [SkillCategory.CLOUD_PLATFORM]: 'Cloud Platform',
  [SkillCategory.TOOL]: 'Tool',
  [SkillCategory.METHODOLOGY]: 'Methodology',
  [SkillCategory.SOFT_SKILL]: 'Soft Skill',
  [SkillCategory.DOMAIN_KNOWLEDGE]: 'Domain Knowledge'
};

const proficiencyLabels = {
  1: 'Beginner',
  2: 'Basic',
  3: 'Intermediate',
  4: 'Advanced',
  5: 'Expert'
};

export function SkillsStep() {
  const { control, register, watch, formState: { errors } } = useFormContext<ProfileFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'skills'
  });

  const skills = watch('skills');

  const addSkill = () => {
    append({
      skillName: '',
      proficiencyLevel: 3,
      yearsExperience: undefined,
      isPrimarySkill: false,
      wantToImprove: false,
      skillCategory: undefined
    });
  };

  const getProficiencyColor = (level: number) => {
    const colors = {
      1: 'bg-error/20 text-error border border-error',
      2: 'bg-orange-600/20 text-orange-600 border border-orange-600',
      3: 'bg-yellow-600/20 text-yellow-600 border border-yellow-600',
      4: 'bg-primary/20 text-active border border-primary',
      5: 'bg-success/20 text-success border border-success'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-foreground">Technical Skills & Expertise</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Add your technical skills, tools, and areas of expertise. Mark your primary skills and areas you want to improve.
            </p>
          </div>
          <Button
            type="button"
            onClick={addSkill}
            className="flex items-center gap-2"
            disabled={fields.length >= 20}
          >
            <Plus className="w-4 h-4" />
            Add Skill
          </Button>
        </div>

        {fields.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="text-muted-foreground mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <p className="text-secondary text-center mb-4">
                No skills added yet. Click "Add Skill" to get started.
              </p>
              <Button onClick={addSkill} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Skill
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {fields.map((field, index) => (
            <Card key={field.id} className="gap-y-0 relative">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Skill #{index + 1}
                    {skills[index]?.isPrimarySkill && (
                      <Badge variant="secondary" className="ml-2">
                        <Star className="w-3 h-3 mr-1" />
                        Primary
                      </Badge>
                    )}
                    {skills[index]?.wantToImprove && (
                      <Badge variant="outline" className="ml-2">
                        Want to Improve
                      </Badge>
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
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Skill Name */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">
                        Skill Name *
                      </label>
                      <Tooltip>
                        <TooltipTrigger>
                          <InfoIcon className="w-4 h-4 text-primary" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{fieldHints.skillName}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      {...register(`skills.${index}.skillName`)}
                      placeholder="e.g. JavaScript, React, Docker"
                      maxLength={50}
                    />
                    {errors.skills?.[index]?.skillName && (
                      <p className="text-sm text-error/70">
                        {errors.skills[index]?.skillName?.message}
                      </p>
                    )}
                    <p className="text-xs text-secondary">Max 50 characters</p>
                  </div>

                  {/* Skill Category */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select
                      value={skills[index]?.skillCategory || ''}
                      onValueChange={(value) => {
                        const currentSkills = [...skills];
                        currentSkills[index] = {
                          ...currentSkills[index],
                          skillCategory: value as SkillCategory
                        };
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(skillCategoryLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Proficiency Level */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">
                        Proficiency Level *
                      </label>
                      <Tooltip>
                        <TooltipTrigger>
                          <InfoIcon className="w-4 h-4 text-primary" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{fieldHints.proficiencyLevel}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Select
                      value={skills[index]?.proficiencyLevel?.toString() || '3'}
                      onValueChange={(value) => {
                        const currentSkills = [...skills];
                        currentSkills[index] = {
                          ...currentSkills[index],
                          proficiencyLevel: parseInt(value)
                        };
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(proficiencyLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            <div className="flex items-center gap-2">
                              <Badge className={getProficiencyColor(parseInt(value))}>
                                {value}
                              </Badge>
                              {label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.skills?.[index]?.proficiencyLevel && (
                      <p className="text-sm text-error/70">
                        {errors.skills[index]?.proficiencyLevel?.message}
                      </p>
                    )}
                  </div>

                  {/* Years of Experience */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">
                        Years of Experience
                      </label>
                      <Tooltip>
                        <TooltipTrigger>
                          <InfoIcon className="w-4 h-4 text-primary" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{fieldHints.yearsExperience}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      type="number"
                      {...register(`skills.${index}.yearsExperience`, { 
                        valueAsNumber: true 
                      })}
                      placeholder="3"
                      min={0}
                      max={50}
                    />
                    {errors.skills?.[index]?.yearsExperience && (
                      <p className="text-sm text-error/70">
                        {errors.skills[index]?.yearsExperience?.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`primary-${index}`}
                      {...register(`skills.${index}.isPrimarySkill`)}
                    />
                    <label
                      htmlFor={`primary-${index}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      <div className="flex items-center gap-2">
                        Primary Skill
                        <Tooltip>
                          <TooltipTrigger>
                            <InfoIcon className="w-4 h-4 text-primary" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{fieldHints.isPrimarySkill}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`improve-${index}`}
                      {...register(`skills.${index}.wantToImprove`)}
                    />
                    <label
                      htmlFor={`improve-${index}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      <div className="flex items-center gap-2">
                        Want to Improve
                        <Tooltip>
                          <TooltipTrigger>
                            <InfoIcon className="w-4 h-4 text-primary" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{fieldHints.wantToImprove}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {fields.length > 0 && fields.length < 20 && (
          <Button
            type="button"
            variant="outline"
            onClick={addSkill}
            className="w-full flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Another Skill
          </Button>
        )}

        {fields.length >= 20 && (
          <p className="text-sm text-secondary text-center">
            Maximum 20 skills allowed. Remove some skills to add new ones.
          </p>
        )}
      </div>
    </TooltipProvider>
  );
}