'use client';

import {useState, useEffect, useRef} from 'react';
import {useForm, FormProvider} from 'react-hook-form';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {completeProfileSchema, ProfileFormData} from '@/lib/validation/profile';
import {BasicProfileStep} from './steps/BasicProfileStep';
import {SkillsStep} from './steps/SkillsStep';
import {WorkExperienceStep} from './steps/WorkExperienceStep';
import {CareerGoalsStep} from './steps/CareerGoalsStep';
import {PreferencesStep, PreferencesStepRef} from './steps/PreferencesStep';
import {ChevronLeft, ChevronRight, Save} from 'lucide-react';
import {zodResolver} from "@hookform/resolvers/zod";

// TODO: add other user profile section after release
const STEPS = [
    {
        id: 'basic',
        title: 'Basic Information',
        description: 'Tell us about your current situation and goals',
        component: BasicProfileStep
    },
    // {
    //   id: 'skills',
    //   title: 'Skills & Technologies',
    //   description: 'Add your technical skills and expertise',
    //   component: SkillsStep
    // },
    {
        id: 'experience',
        title: 'Work Experience',
        description: 'Share your professional background',
        component: WorkExperienceStep
    },
    // {
    //   id: 'goals',
    //   title: 'Career Goals',
    //   description: 'Define your career objectives',
    //   component: CareerGoalsStep
    // },
    // {
    //   id: 'preferences',
    //   title: 'Preferences',
    //   description: 'Set your work preferences and values',
    //   component: PreferencesStep
    // }
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
            // skills: [],
            workExperiences: [],
            // careerGoals: [],
            // preferences: {
            //     industryPreferences: [],
            //     workValues: [],
            //     benefitsPreferences: []
            // },
            ...initialData
        },
        mode: 'onChange'
    });

    const {handleSubmit, reset, formState: {errors}} = methods;

    // Map error paths to step indices
    const getStepFromErrorPath = (errorPath: string): number => {
        if (errorPath.startsWith('profile')) return 0;
        if (errorPath.startsWith('workExperiences')) return 1;
        // if (errorPath.startsWith('skills')) return 2;
        // if (errorPath.startsWith('careerGoals')) return 3;
        // if (errorPath.startsWith('preferences')) return 4;
        return 0; // Default to first step
    };

    // Find first step with validation errors
    const getFirstErrorStep = () => {
        const errorPaths = Object.keys(errors);
        if (errorPaths.length === 0) return null;

        const errorSteps = errorPaths.map(getStepFromErrorPath);
        return Math.min(...errorSteps);
    };

    // Update form data when initialData changes
    useEffect(() => {
        if (initialData) {
            reset({
                profile: initialData.profile || {},
                // skills: initialData.skills || [],
                workExperiences: initialData.workExperiences || [],
                // careerGoals: initialData.careerGoals || [],
                // preferences: initialData.preferences || {
                //     industryPreferences: [],
                //     workValues: [],
                //     benefitsPreferences: []
                // }
            });
        }
    }, [initialData, reset]);


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

        try {
            await onSubmit(data);
        } catch (error) {
            // If validation fails, switch to the first step with errors
            const firstErrorStep = getFirstErrorStep();
            if (firstErrorStep !== null && firstErrorStep !== currentStep) {
                setCurrentStep(firstErrorStep);
            }
            throw error; // Re-throw to maintain error handling
        }
    };

    // Also handle client-side validation errors
    const handleFormSubmit = handleSubmit(onFormSubmit, () => {
        // This callback is triggered when client-side validation fails
        const firstErrorStep = getFirstErrorStep();
        if (firstErrorStep !== null && firstErrorStep !== currentStep) {
            setCurrentStep(firstErrorStep);
        }
    });

    return (
        <div className="w-full mx-auto">
            {/* Form */}
            <FormProvider {...methods}>
                <form onSubmit={handleFormSubmit}>
                    <Tabs value={currentStep.toString()} onValueChange={(value) => goToStep(parseInt(value))}>
                        <TabsList className="grid w-full grid-cols-2">
                            {STEPS.map((step, index) => {
                                // Check if this step has validation errors
                                const stepHasErrors = Object.keys(errors).some(errorPath => {
                                    return getStepFromErrorPath(errorPath) === index;
                                });

                                return (
                                    <TabsTrigger 
                                        key={step.id}
                                        value={index.toString()}
                                        className={`
                                            relative
                                            ${stepHasErrors ? 'text-red-600 border-red-200' : ''}
                                        `}
                                    >
                                        {step.title}
                                        {stepHasErrors && (
                                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                                        )}
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>

                        {STEPS.map((step, index) => {
                            const StepComponent = step.component;
                            return (
                                <TabsContent key={step.id} value={index.toString()}>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>{step.title}</CardTitle>
                                            <CardDescription>{step.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <StepComponent/>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            );
                        })}
                    </Tabs>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={goToPreviousStep}
                            disabled={currentStep === 0}
                            className="flex items-center gap-2"
                        >
                            <ChevronLeft className="w-4 h-4"/>
                            Previous
                        </Button>

                        <div className="flex gap-4">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center gap-2"
                            >
                                <Save className="w-4 h-4"/>
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
                                    <ChevronRight className="w-4 h-4"/>
                                </Button>
                            )}
                        </div>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}