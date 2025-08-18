'use client';

import { memo } from 'react';
import { useFormContext } from 'react-hook-form';
import { ProfileFormData } from '@/lib/validation/profile';
import { fieldHints } from '@/lib/validation/profile';
import { CompanySize, CommunicationStyle } from '@/types/profile';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon, Briefcase } from 'lucide-react';

const companySizeLabels: Record<CompanySize, string> = {
  [CompanySize.STARTUP]: 'Startup (1-10)',
  [CompanySize.SMALL]: 'Small (11-50)',
  [CompanySize.MEDIUM]: 'Medium (51-200)',
  [CompanySize.LARGE]: 'Large (201-1000)',
  [CompanySize.ENTERPRISE]: 'Enterprise (1000+)'
};

const communicationStyleLabels: Record<CommunicationStyle, string> = {
  [CommunicationStyle.DIRECT]: 'Direct',
  [CommunicationStyle.COLLABORATIVE]: 'Collaborative',
  [CommunicationStyle.FORMAL]: 'Formal',
  [CommunicationStyle.CASUAL]: 'Casual',
  [CommunicationStyle.STRUCTURED]: 'Structured',
  [CommunicationStyle.FLEXIBLE]: 'Flexible'
};

export const CompanyPreferences = memo(() => {
  const { control } = useFormContext<ProfileFormData>();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Briefcase className="w-4 h-4" />
          Company & Communication
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Size Preference */}
          <FormField
            control={control}
            name="preferences.companySizePreference"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel>Preferred Company Size</FormLabel>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="w-4 h-4 text-primary" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{fieldHints.companySizePreference}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size preference" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(companySizeLabels).map(([value, label]) => (
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

          {/* Communication Style */}
          <FormField
            control={control}
            name="preferences.communicationStyle"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel>Communication Style</FormLabel>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="w-4 h-4 text-primary" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{fieldHints.communicationStyle}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select communication style" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(communicationStyleLabels).map(([value, label]) => (
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
        </div>
      </CardContent>
    </Card>
  );
});

CompanyPreferences.displayName = 'CompanyPreferences';