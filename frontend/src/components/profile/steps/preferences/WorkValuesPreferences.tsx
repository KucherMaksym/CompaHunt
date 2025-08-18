'use client';

import { useState, useEffect, memo, useImperativeHandle, forwardRef, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { ProfileFormData } from '@/lib/validation/profile';
import { WorkValue } from '@/types/profile';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';

const workValueLabels: Record<WorkValue, string> = {
  [WorkValue.INNOVATION]: 'Innovation',
  [WorkValue.STABILITY]: 'Stability',
  [WorkValue.FLEXIBILITY]: 'Flexibility',
  [WorkValue.TEAMWORK]: 'Teamwork',
  [WorkValue.INDEPENDENCE]: 'Independence',
  [WorkValue.LEARNING]: 'Learning',
  [WorkValue.IMPACT]: 'Impact',
  [WorkValue.RECOGNITION]: 'Recognition',
  [WorkValue.DIVERSITY]: 'Diversity',
  [WorkValue.SUSTAINABILITY]: 'Sustainability',
  [WorkValue.WORK_LIFE_BALANCE]: 'Work-Life Balance',
  [WorkValue.COMPETITIVE_COMPENSATION]: 'Competitive Compensation',
  [WorkValue.CAREER_ADVANCEMENT]: 'Career Advancement',
  [WorkValue.MENTORSHIP]: 'Mentorship',
  [WorkValue.CREATIVE_FREEDOM]: 'Creative Freedom'
};

export interface WorkValuesPreferencesRef {
  saveToForm: () => void;
}

export const WorkValuesPreferences = memo(forwardRef<WorkValuesPreferencesRef>((_props, ref) => {
  const { setValue, getValues } = useFormContext<ProfileFormData>();

  // Локальное состояние для checkbox'ов
  const [selectedWorkValues, setSelectedWorkValues] = useState<WorkValue[]>(
      () => getValues('preferences.workValues') || []
  );

  // Ref для хранения актуального состояния
  const selectedWorkValuesRef = useRef<WorkValue[]>(selectedWorkValues);

  // Обновляем ref при изменении состояния
  useEffect(() => {
    selectedWorkValuesRef.current = selectedWorkValues;
  }, [selectedWorkValues]);

  useImperativeHandle(ref, () => ({
    saveToForm: () => {
      setValue('preferences.workValues', selectedWorkValuesRef.current);
    }
  }));

  const toggleWorkValue = (value: WorkValue) => {
    setSelectedWorkValues(prev => {
      const isSelected = prev.includes(value);
      if (isSelected) {
        return prev.filter(v => v !== value);
      } else {
        // Проверяем лимит
        if (prev.length >= 15) {
          return prev;
        }
        return [...prev, value];
      }
    });
  };

  return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Work Values
          </CardTitle>
          <p className="text-sm text-secondary">
            What's important to you in your work and career? (max 15)
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(workValueLabels).map(([value, label]) => {
              const workValue = value as WorkValue;
              const isSelected = selectedWorkValues.includes(workValue);
              const isDisabled = !isSelected && selectedWorkValues.length >= 15;

              return (
                  <label
                      key={value}
                      htmlFor={`work-value-${value}`}
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
                        id={`work-value-${value}`}
                        checked={isSelected}
                        disabled={isDisabled}
                        onCheckedChange={() => !isDisabled && toggleWorkValue(workValue)}
                        className="mr-3"
                    />
                    <span className="text-sm font-medium">{label}</span>
                  </label>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Selected: {selectedWorkValues.length}/15
          </p>
        </CardContent>
      </Card>
  );
}));

WorkValuesPreferences.displayName = 'WorkValuesPreferences';