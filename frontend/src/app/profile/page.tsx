'use client'

import React from 'react'
import {useRouter} from 'next/navigation'
import {useAuth} from "@/hooks/useAuth";
import {signOut} from "next-auth/react";
import Avatar from "@/components/ui/Avatar";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {User, Settings, Target, Mail, Calendar} from 'lucide-react';
import {DashboardLayout} from "@/components/dashboard-layout";

export default function ProfilePage() {
    const {user, loading, isAuthenticated} = useAuth();
    const router = useRouter();

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-y-2 border-primary mb-4"></div>
                    <p className="text-muted-foreground">Loading your profile...</p>
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

    return (
        <DashboardLayout>
            <div className="max-w-4xl w-full mx-auto space-y-6">
                {/* User Profile Card */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <User className="w-7 h-7" />
                            My Profile
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-6">
                                {user && (
                                    <>
                                        <Avatar
                                            name={user.name}
                                            avatarUrl={user.avatar}
                                            size="lg"
                                        />
                                        <div>
                                            <h2 className="text-2xl font-bold text-foreground">
                                                {user.name || 'User'}
                                            </h2>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Mail className="w-4 h-4" />
                                                {user.email}
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground mt-1">
                                                <Calendar className="w-4 h-4" />
                                                Member since {new Date().getFullYear()}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            <Button
                                onClick={handleSignOut}
                                variant="destructive"
                                className="flex items-center gap-2"
                            >
                                Sign Out
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}