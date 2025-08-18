'use client';

import { useRef, memo, useImperativeHandle, forwardRef, useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { ProfileFormData } from '@/lib/validation/profile';
import { Industry, industryLabels } from '@/types/profile';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface IndustryPreferencesRef {
  saveToForm: () => void;
}

const IndustryPreferences = memo(forwardRef<IndustryPreferencesRef>((_props, ref) => {
  const { getValues, setValue } = useFormContext<ProfileFormData>();

  // Local state to prevent rerenders
  const [selectedIndustries, setSelectedIndustries] = useState<Industry[]>(
      () => getValues('preferences.industryPreferences') || []
  );

  const selectedIndustriesRef = useRef<Industry[]>(selectedIndustries);

  useEffect(() => {
    selectedIndustriesRef.current = selectedIndustries;
  }, [selectedIndustries]);

  useImperativeHandle(ref, () => ({
    saveToForm: () => {
      setValue('preferences.industryPreferences', selectedIndustriesRef.current);
    }
  }));

  const handleIndustryToggle = (industry: Industry) => {
    setSelectedIndustries(prev => {
      const isSelected = prev.includes(industry);
      if (isSelected) {
        return prev.filter(item => item !== industry);
      } else {
        if (prev.length >= 10) {
          return prev;
        }
        return [...prev, industry];
      }
    });
  };

  return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Industry Preferences</CardTitle>
          <p className="text-sm text-secondary">
            Select industries you're interested in working in (max 10)
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(industryLabels).map(([value, label]) => {
              const industry = value as Industry;
              const isSelected = selectedIndustries.includes(industry);
              const isDisabled = !isSelected && selectedIndustries.length >= 10;

              return (
                  <label
                      key={value}
                      htmlFor={`industry-${value}`}
                      className={`
                        relative flex items-center p-3 rounded-lg border cursor-pointer transition-colors
                        ${isSelected
                                ? 'bg-primary/10 border-primary/70 text-accent-foreground'
                                : isDisabled
                                    ? 'bg-muted border-border text-muted-foreground cursor-not-allowed'
                                    : 'bg-background border-border hover:bg-primary/5'
                      }
                `}
                  >
                    <Checkbox
                        id={`industry-${value}`}
                        checked={isSelected}
                        disabled={isDisabled}
                        onCheckedChange={() => !isDisabled && handleIndustryToggle(industry)}
                        className="mr-3"
                    />
                    <span className="text-sm font-medium">{label}</span>
                  </label>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Selected: {selectedIndustries.length}/10
          </p>
        </CardContent>
      </Card>
  );
}));

IndustryPreferences.displayName = 'IndustryPreferences';

export default IndustryPreferences;