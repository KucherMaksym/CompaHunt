'use client';

import { useState, useEffect, memo, useImperativeHandle, forwardRef, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { ProfileFormData } from '@/lib/validation/profile';
import { BenefitType } from '@/types/profile';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift } from 'lucide-react';

const benefitTypeLabels: Record<BenefitType, string> = {
  [BenefitType.HEALTH_INSURANCE]: 'Health Insurance',
  [BenefitType.DENTAL_INSURANCE]: 'Dental Insurance',
  [BenefitType.VISION_INSURANCE]: 'Vision Insurance',
  [BenefitType.RETIREMENT_PLAN]: 'Retirement Plan',
  [BenefitType.PAID_TIME_OFF]: 'Paid Time Off',
  [BenefitType.FLEXIBLE_SCHEDULE]: 'Flexible Schedule',
  [BenefitType.REMOTE_WORK]: 'Remote Work',
  [BenefitType.EDUCATION_ASSISTANCE]: 'Education Assistance',
  [BenefitType.GYM_MEMBERSHIP]: 'Gym Membership',
  [BenefitType.MEAL_ALLOWANCE]: 'Meal Allowance',
  [BenefitType.TRANSPORTATION]: 'Transportation',
  [BenefitType.STOCK_OPTIONS]: 'Stock Options',
  [BenefitType.BONUS]: 'Bonus',
  [BenefitType.CONFERENCES]: 'Conferences',
  [BenefitType.EQUIPMENT_ALLOWANCE]: 'Equipment Allowance',
  [BenefitType.CHILDCARE_SUPPORT]: 'Childcare Support',
  [BenefitType.MENTAL_HEALTH_SUPPORT]: 'Mental Health Support',
  [BenefitType.SABBATICAL]: 'Sabbatical'
};

export interface BenefitsPreferencesRef {
  saveToForm: () => void;
}

export const BenefitsPreferences = memo(forwardRef<BenefitsPreferencesRef>((_props, ref) => {
  const { setValue, getValues } = useFormContext<ProfileFormData>();

  const [selectedBenefits, setSelectedBenefits] = useState<BenefitType[]>(
      () => getValues('preferences.benefitsPreferences') || []
  );

  const selectedBenefitsRef = useRef<BenefitType[]>(selectedBenefits);

  useEffect(() => {
    selectedBenefitsRef.current = selectedBenefits;
  }, [selectedBenefits]);

  useImperativeHandle(ref, () => ({
    saveToForm: () => {
      setValue('preferences.benefitsPreferences', selectedBenefitsRef.current);
    }
  }));

  const toggleBenefit = (benefit: BenefitType) => {
    setSelectedBenefits(prev => {
      const isSelected = prev.includes(benefit);
      if (isSelected) {
        return prev.filter(b => b !== benefit);
      } else {
        if (prev.length >= 18) {
          return prev;
        }
        return [...prev, benefit];
      }
    });
  };

  return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Gift className="w-4 h-4" />
            Benefits Preferences
          </CardTitle>
          <p className="text-sm text-secondary">
            Which benefits and perks are most important to you? (max 18)
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(benefitTypeLabels).map(([value, label]) => {
              const benefit = value as BenefitType;
              const isSelected = selectedBenefits.includes(benefit);
              const isDisabled = !isSelected && selectedBenefits.length >= 18;

              return (
                  <label
                      key={value}
                      htmlFor={`benefit-${value}`}
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
                        id={`benefit-${value}`}
                        checked={isSelected}
                        disabled={isDisabled}
                        onCheckedChange={() => !isDisabled && toggleBenefit(benefit)}
                        className="mr-3"
                    />
                    <span className="text-sm font-medium">{label}</span>
                  </label>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Selected: {selectedBenefits.length}/18
          </p>
        </CardContent>
      </Card>
  );
}));

BenefitsPreferences.displayName = 'BenefitsPreferences';