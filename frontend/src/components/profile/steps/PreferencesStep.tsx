'use client';

import { useRef, useImperativeHandle, forwardRef } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Settings } from 'lucide-react';
import { CompanyPreferences } from './preferences/CompanyPreferences';
import IndustryPreferences, { IndustryPreferencesRef } from './preferences/IndustryPreferences';
import { WorkValuesPreferences, WorkValuesPreferencesRef } from './preferences/WorkValuesPreferences';
import { BenefitsPreferences, BenefitsPreferencesRef } from './preferences/BenefitsPreferences';
import { PriorityRatings } from './preferences/PriorityRatings';
import { AdditionalPreferences } from './preferences/AdditionalPreferences';

export interface PreferencesStepRef {
  saveAllPreferences: () => void;
}

export const PreferencesStep = forwardRef<PreferencesStepRef>((_props, ref) => {
  const industryRef = useRef<IndustryPreferencesRef>(null);
  const workValuesRef = useRef<WorkValuesPreferencesRef>(null);
  const benefitsRef = useRef<BenefitsPreferencesRef>(null);

  useImperativeHandle(ref, () => ({
    saveAllPreferences: () => {
      industryRef.current?.saveToForm();
      workValuesRef.current?.saveToForm();
      benefitsRef.current?.saveToForm();
    }
  }));

  return (
      <TooltipProvider>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Work Preferences
            </h3>
            <p className="text-sm text-secondary mt-1">
              Help us understand your ideal work environment and what matters most to you in your career.
            </p>
          </div>

          <CompanyPreferences />
          <IndustryPreferences ref={industryRef} />
          <WorkValuesPreferences ref={workValuesRef} />
          <BenefitsPreferences ref={benefitsRef} />
          <PriorityRatings />
          <AdditionalPreferences />
        </div>
      </TooltipProvider>
  );
});

PreferencesStep.displayName = 'PreferencesStep';