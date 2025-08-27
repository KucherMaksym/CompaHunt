'use client'

import {useState, useEffect} from 'react'
import {useRouter} from 'next/navigation'
import {useAuth} from "@/hooks/useAuth";
import {ProfileFormWizard} from '@/components/profile/ProfileFormWizard';
import {ProfileFormData} from '@/lib/validation/profile';
import {DashboardLayout} from "@/components/dashboard-layout";
import {profileApi} from '@/lib/api/profile';
import {toast} from "sonner";

export default function CareerPage() {
    const {user, loading, isAuthenticated} = useAuth();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profileData, setProfileData] = useState<Partial<ProfileFormData> | undefined>();
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);

    useEffect(() => {
        if (isAuthenticated && user && !profileData) {
            loadProfileData();
        }
    }, [isAuthenticated, user]);

    const loadProfileData = async () => {
        try {
            setIsLoadingProfile(true);
            const formData = await profileApi.getProfileForForm();
            setProfileData(formData || undefined);
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setIsLoadingProfile(false);
        }
    };

    if (loading || isLoadingProfile) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-y-2 border-primary mb-6"></div>
                    <p className="text-muted-foreground text-lg">Loading your career profile...</p>
                </div>
            </DashboardLayout>
        )
    }

    if (!isAuthenticated) {
        return router.push("/auth/signin");
    }

    const handleProfileSubmit = async (data: ProfileFormData) => {
        setIsSubmitting(true);

        try {
            const result = toast.promise(profileApi.createOrUpdateProfile(data), {
                success: "Career profile saved successfully! 🎉",
                loading: "Saving your career profile...",
                error: (e) => e.message || "Something went wrong"
            })
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl w-full mx-auto">
                 <div className=" w-full rounded-2xl p-1 shadow-custom-xl border-border">
                    <ProfileFormWizard
                        initialData={profileData}
                        onSubmit={handleProfileSubmit}
                        isLoading={isSubmitting}
                    />
                </div>
            </div>
        </DashboardLayout>
    )
}