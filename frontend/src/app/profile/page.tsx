'use client'

import {useState, useEffect} from 'react'
import {useRouter} from 'next/navigation'
import {useAuth} from "@/hooks/useAuth";
import {signOut} from "next-auth/react";
import Avatar from "@/components/ui/Avatar";
import {Button} from "@/components/ui/button";
import {ProfileFormWizard} from '@/components/profile/ProfileFormWizard';
import {ProfileFormData} from '@/lib/validation/profile';
import {Card, CardContent} from '@/components/ui/card';
import {User} from 'lucide-react';
import {DashboardLayout} from "@/components/dashboard-layout";
import {profileApi} from '@/lib/api/profile';
import {toast} from "sonner";

export default function ProfilePage() {
    const {user, loading, isAuthenticated} = useAuth();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profileData, setProfileData] = useState<Partial<ProfileFormData> | undefined>();
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);

    // Load existing profile data
    useEffect(() => {
        if (isAuthenticated && user) {
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
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-y-2 border-primary mx-auto mb-4"></div>
                    <p className="text-secondary">Loading your profile...</p>
                </div>
            </DashboardLayout>
        )
    }

    if (!isAuthenticated) {
        return router.push("/auth/signin");
    }

    const handleSignOut = async () => {
        await signOut()
        router.push('/')
    }

    const handleProfileSubmit = async (data: ProfileFormData) => {
        setIsSubmitting(true);

        try {
            const result =  toast.promise(profileApi.createOrUpdateProfile(data), {
                success: "Profile saved successfully",
                loading: "Saving profile...",
                error: (e) =>  e.message || "Something went wrong"
            })
        }  finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* User Header */}
                <Card className="mb-8">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                {user && (
                                    <>
                                        <Avatar name={user.name} avatarUrl={user.avatar}/>
                                        <div>
                                            <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                                                <User className="w-6 h-6"/>
                                                {user.name || user.email}
                                            </h1>
                                            <p className="text-secondary">{user.email}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                <Button
                                    onClick={() => router.push("/dashboard")}
                                    variant="outline"
                                >
                                    Go to Dashboard
                                </Button>
                                <Button
                                    onClick={handleSignOut}
                                    variant="destructive"
                                >
                                    Sign Out
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Profile Form */}
                <ProfileFormWizard
                    initialData={profileData}
                    onSubmit={handleProfileSubmit}
                    isLoading={isSubmitting}
                />
            </div>
        </DashboardLayout>
    )
}