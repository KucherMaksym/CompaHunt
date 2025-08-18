'use client';

import { useFormContext, useFieldArray } from 'react-hook-form';
import { ProfileFormData } from '@/lib/validation/profile';
import { fieldHints } from '@/lib/validation/profile';
import { GoalType, Priority, ProgressStatus } from '@/types/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Trash2, InfoIcon, Target, Calendar } from 'lucide-react';

const goalTypeLabels: Record<GoalType, string> = {
  [GoalType.SHORT_TERM]: 'Short-term (< 1 year)',
  [GoalType.MEDIUM_TERM]: 'Medium-term (1-3 years)',
  [GoalType.LONG_TERM]: 'Long-term (3+ years)'
};

const priorityLabels: Record<Priority, string> = {
  [Priority.LOW]: 'Low',
  [Priority.MEDIUM]: 'Medium',
  [Priority.HIGH]: 'High',
  [Priority.CRITICAL]: 'Critical'
};

const progressStatusLabels: Record<ProgressStatus, string> = {
  [ProgressStatus.NOT_STARTED]: 'Not Started',
  [ProgressStatus.IN_PROGRESS]: 'In Progress',
  [ProgressStatus.ON_HOLD]: 'On Hold',
  [ProgressStatus.COMPLETED]: 'Completed',
  [ProgressStatus.CANCELLED]: 'Cancelled'
};

const getPriorityColor = (priority: Priority) => {
  const colors = {
    [Priority.LOW]: 'bg-gray-100 text-gray-800',
    [Priority.MEDIUM]: 'bg-blue-100 text-blue-800',
    [Priority.HIGH]: 'bg-orange-100 text-orange-800',
    [Priority.CRITICAL]: 'bg-red-100 text-red-800'
  };
  return colors[priority] || 'bg-gray-100 text-gray-800';
};

const getProgressColor = (status: ProgressStatus) => {
  const colors = {
    [ProgressStatus.NOT_STARTED]: 'bg-gray-100 text-gray-800',
    [ProgressStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
    [ProgressStatus.ON_HOLD]: 'bg-yellow-100 text-yellow-800',
    [ProgressStatus.COMPLETED]: 'bg-green-100 text-green-800',
    [ProgressStatus.CANCELLED]: 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export function CareerGoalsStep() {
  const { control, register, watch, setValue, formState: { errors } } = useFormContext<ProfileFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'careerGoals'
  });

  const careerGoals = watch('careerGoals');

  const addGoal = () => {
    append({
      goalType: GoalType.SHORT_TERM,
      title: '',
      description: '',
      targetDate: '',
      progressStatus: ProgressStatus.NOT_STARTED,
      progressPercentage: 0,
      priority: Priority.MEDIUM,
      notes: ''
    });
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Career Goals</h3>
            <p className="text-sm text-secondary mt-1">
              Define your career objectives and track your progress towards achieving them.
            </p>
          </div>
          <Button
            type="button"
            onClick={addGoal}
            className="flex items-center gap-2"
            disabled={fields.length >= 5}
          >
            <Plus className="w-4 h-4" />
            Add Goal
          </Button>
        </div>

        {fields.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="text-primary mb-4">
                <Target className="w-12 h-12" />
              </div>
              <p className="text-secondary text-center mb-4">
                No career goals added yet. Click "Add Goal" to get started.
              </p>
              <Button onClick={addGoal} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Goal
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
                    <Target className="w-4 h-4" />
                    Goal #{index + 1}
                    {careerGoals[index]?.priority && (
                      <Badge className={getPriorityColor(careerGoals[index].priority)}>
                        {priorityLabels[careerGoals[index].priority]}
                      </Badge>
                    )}
                    {careerGoals[index]?.progressStatus && (
                      <Badge className={getProgressColor(careerGoals[index].progressStatus)}>
                        {progressStatusLabels[careerGoals[index].progressStatus]}
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

              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Goal Type *</label>
                      <Tooltip>
                        <TooltipTrigger>
                          <InfoIcon className="w-4 h-4 text-primary" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Choose the timeframe for this goal</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Select
                      value={careerGoals[index]?.goalType || GoalType.SHORT_TERM}
                      onValueChange={(value) => {
                        setValue(`careerGoals.${index}.goalType`, value as GoalType);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(goalTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Priority</label>
                      <Tooltip>
                        <TooltipTrigger>
                          <InfoIcon className="w-4 h-4 text-primary" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">How important is this goal to you?</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Select
                      value={careerGoals[index]?.priority || Priority.MEDIUM}
                      onValueChange={(value) => {
                        setValue(`careerGoals.${index}.priority`, value as Priority);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(priorityLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            <div className="flex items-center gap-2">
                              <Badge className={getPriorityColor(value as Priority)}>
                                {label}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Goal Title *</label>
                    <Tooltip>
                      <TooltipTrigger>
                        <InfoIcon className="w-4 h-4 text-primary" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{fieldHints.goalTitle}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    {...register(`careerGoals.${index}.title`)}
                    placeholder="e.g. Become a Senior Engineer, Learn Machine Learning"
                    maxLength={100}
                  />
                  {errors.careerGoals?.[index]?.title && (
                    <p className="text-sm text-error/70">
                      {errors.careerGoals[index]?.title?.message}
                    </p>
                  )}
                  <p className="text-xs text-secondary">Max 100 characters</p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Description *</label>
                    <Tooltip>
                      <TooltipTrigger>
                        <InfoIcon className="w-4 h-4 text-primary" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{fieldHints.goalDescription}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Textarea
                    {...register(`careerGoals.${index}.description`)}
                    placeholder="Describe what you want to achieve, why it's important to you, and how you plan to get there..."
                    maxLength={500}
                    rows={3}
                  />
                  {errors.careerGoals?.[index]?.description && (
                    <p className="text-sm text-error/70">
                      {errors.careerGoals[index]?.description?.message}
                    </p>
                  )}
                  <p className="text-xs text-secondary">Max 500 characters</p>
                </div>

                {/* Target Date and Progress */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Target Date</label>
                      <Tooltip>
                        <TooltipTrigger>
                          <InfoIcon className="w-4 h-4 text-primary" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{fieldHints.targetDate}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      type="date"
                      {...register(`careerGoals.${index}.targetDate`)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Progress Status</label>
                    <Select
                      value={careerGoals[index]?.progressStatus || ProgressStatus.NOT_STARTED}
                      onValueChange={(value) => {
                        setValue(`careerGoals.${index}.progressStatus`, value as ProgressStatus);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(progressStatusLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            <div className="flex items-center gap-2">
                              <Badge className={getProgressColor(value as ProgressStatus)}>
                                {label}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Progress Percentage */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Progress Percentage</label>
                    <Tooltip>
                      <TooltipTrigger>
                        <InfoIcon className="w-4 h-4 text-primary" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{fieldHints.progressPercentage}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      {...register(`careerGoals.${index}.progressPercentage`, { valueAsNumber: true })}
                      placeholder="0"
                      min={0}
                      max={100}
                      className="w-24"
                    />
                    <span className="text-sm text-secondary">%</span>
                    <div className="flex-1">
                      <Progress value={careerGoals[index]?.progressPercentage || 0} className="h-2" />
                    </div>
                  </div>
                  {errors.careerGoals?.[index]?.progressPercentage && (
                    <p className="text-sm text-error/70">
                      {errors.careerGoals[index]?.progressPercentage?.message}
                    </p>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea
                    {...register(`careerGoals.${index}.notes`)}
                    placeholder="Any additional notes, thoughts, or action items related to this goal..."
                    maxLength={1000}
                    rows={3}
                  />
                  <p className="text-xs text-secondary">Max 1000 characters</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {fields.length > 0 && fields.length < 5 && (
          <Button
            type="button"
            variant="outline"
            onClick={addGoal}
            className="w-full flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Another Goal
          </Button>
        )}

        {fields.length >= 5 && (
          <p className="text-sm text-secondary text-center">
            Maximum 5 career goals allowed. Remove some goals to add new ones.
          </p>
        )}
      </div>
    </TooltipProvider>
  );
}