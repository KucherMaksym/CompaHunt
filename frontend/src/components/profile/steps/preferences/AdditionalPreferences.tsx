'use client';

import { memo } from 'react';
import { useFormContext } from 'react-hook-form';
import { ProfileFormData } from '@/lib/validation/profile';
import { fieldHints } from '@/lib/validation/profile';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon } from 'lucide-react';

export const AdditionalPreferences = memo(() => {
  const { register, formState: { errors } } = useFormContext<ProfileFormData>();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Additional Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label htmlFor="additionalPreferences" className="text-sm font-medium">
              Other Preferences
            </label>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="w-4 h-4 text-primary" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{fieldHints.additionalPreferences}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Textarea
            id="additionalPreferences"
            {...register('preferences.additionalPreferences')}
            placeholder="Any other preferences, requirements, or deal-breakers you'd like to mention..."
            maxLength={500}
            rows={4}
          />
          {errors.preferences?.additionalPreferences && (
            <p className="text-sm text-error/70">{errors.preferences.additionalPreferences.message}</p>
          )}
          <p className="text-xs text-secondary">Max 500 characters</p>
        </div>
      </CardContent>
    </Card>
  );
});

AdditionalPreferences.displayName = 'AdditionalPreferences';