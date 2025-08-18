'use client';

import { memo } from 'react';
import { useFormContext } from 'react-hook-form';
import { ProfileFormData } from '@/lib/validation/profile';
import { fieldHints } from '@/lib/validation/profile';
import { Importance } from '@/types/profile';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon } from 'lucide-react';

const importanceLabels: Record<Importance, string> = {
  [Importance.NOT_IMPORTANT]: 'Not Important',
  [Importance.SOMEWHAT_IMPORTANT]: 'Somewhat Important',
  [Importance.IMPORTANT]: 'Important',
  [Importance.VERY_IMPORTANT]: 'Very Important',
  [Importance.CRITICAL]: 'Critical'
};

export const PriorityRatings = memo(() => {
  const { control } = useFormContext<ProfileFormData>();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Priority Ratings</CardTitle>
        <p className="text-sm text-secondary">
          Rate the importance of these factors in your career decisions
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Work-Life Balance */}
        <FormField
          control={control}
          name="preferences.workLifeBalanceImportance"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel>Work-Life Balance</FormLabel>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="w-4 h-4 text-primary" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{fieldHints.workLifeBalanceImportance}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select importance level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(importanceLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Career Growth */}
        <FormField
          control={control}
          name="preferences.careerGrowthImportance"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel>Career Growth</FormLabel>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="w-4 h-4 text-primary" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{fieldHints.careerGrowthImportance}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select importance level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(importanceLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Compensation */}
        <FormField
          control={control}
          name="preferences.compensationImportance"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel>Compensation</FormLabel>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="w-4 h-4 text-primary" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{fieldHints.compensationImportance}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select importance level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(importanceLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
});

PriorityRatings.displayName = 'PriorityRatings';