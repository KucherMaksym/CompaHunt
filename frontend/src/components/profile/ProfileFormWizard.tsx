'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { completeProfileSchema, ProfileFormData } from '@/lib/validation/profile';
import { BasicProfileStep } from './steps/BasicProfileStep';
import { SkillsStep } from './steps/SkillsStep';
import { WorkExperienceStep } from './steps/WorkExperienceStep';
import { CareerGoalsStep } from './steps/CareerGoalsStep';
import { PreferencesStep, PreferencesStepRef } from './steps/PreferencesStep';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod";

const STEPS = [
  {
    id: 'basic',
    title: 'Basic Information',
    description: 'Tell us about your current situation and goals',
    component: BasicProfileStep
  },
  {
    id: 'skills',
    title: 'Skills & Technologies',
    description: 'Add your technical skills and expertise',
    component: SkillsStep
  },
  {
    id: 'experience',
    title: 'Work Experience',
    description: 'Share your professional background',
    component: WorkExperienceStep
  },
  {
    id: 'goals',
    title: 'Career Goals',
    description: 'Define your career objectives',
    component: CareerGoalsStep
  },
  {
    id: 'preferences',
    title: 'Preferences',
    description: 'Set your work preferences and values',
    component: PreferencesStep
  }
];

interface ProfileFormWizardProps {
  initialData?: Partial<ProfileFormData>;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  isLoading?: boolean;
}

export function ProfileFormWizard({
                                    initialData,
                                    onSubmit,
                                    isLoading = false
                                  }: ProfileFormWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const preferencesStepRef = useRef<PreferencesStepRef>(null);

  const methods = useForm<ProfileFormData>({
    resolver: zodResolver(completeProfileSchema) as any,
    defaultValues: {
      profile: {},
      skills: [],
      workExperiences: [],
      careerGoals: [],
      preferences: {
        industryPreferences: [],
        workValues: [],
        benefitsPreferences: []
      },
      ...initialData
    },
    mode: 'onChange'
  });

  const { handleSubmit, reset, formState: { errors } } = methods;

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        profile: initialData.profile || {},
        skills: initialData.skills || [],
        workExperiences: initialData.workExperiences || [],
        careerGoals: initialData.careerGoals || [],
        preferences: initialData.preferences || {
          industryPreferences: [],
          workValues: [],
          benefitsPreferences: []
        }
      });
    }
  }, [initialData, reset]);

  const currentStepData = STEPS[currentStep];
  const StepComponent = currentStepData.component;

  const saveCurrentStepData = () => {
    if (currentStep === 4) { // Preferences step index
      preferencesStepRef.current?.saveAllPreferences();
    }
  };

  const goToStep = (stepIndex: number) => {
    saveCurrentStepData();
    setCurrentStep(stepIndex);
  };

  const goToNextStep = () => {
    if (currentStep < STEPS.length - 1) {
      saveCurrentStepData();
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      saveCurrentStepData();
      setCurrentStep(currentStep - 1);
    }
  };

  const onFormSubmit = async (data: ProfileFormData) => {
    saveCurrentStepData();
    await onSubmit(data);
  };

  return (
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Complete Your Profile
          </h1>
          <p className="text-secondary">
            Help us understand your career goals and preferences to provide better job recommendations.
          </p>
        </div>

        {/* Step Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-4 overflow-x-auto">
            {STEPS.map((step, index) => {
              const isCurrent = index === currentStep;

              return (
                  <button
                      key={step.id}
                      onClick={() => goToStep(index)}
                      className={`
                  flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isCurrent
                          ? 'bg-accent text-accent-foreground border-2 border-accent'
                          : 'bg-secondary text-secondary-foreground border-2 border-border hover:bg-muted'
                      }
                `}
                  >
                    <span className="block font-semibold">{step.title}</span>
                  </button>
              );
            })}
          </nav>
        </div>

        {/* Form */}
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onFormSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>{currentStepData.title}</CardTitle>
                <CardDescription>{currentStepData.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {currentStep === 4 ? (
                    <PreferencesStep ref={preferencesStepRef} />
                ) : (
                    <StepComponent />
                )}
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                  type="button"
                  variant="outline"
                  onClick={goToPreviousStep}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex gap-4">
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isLoading ? 'Saving...' : 'Save Profile'}
                </Button>

                {currentStep < STEPS.length - 1 && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={goToNextStep}
                        className="flex items-center gap-2"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                )}
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
  );
}