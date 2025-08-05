'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {useAuth} from "@/hooks/useAuth";
import {signOut} from "next-auth/react";
import Avatar from "@/components/ui/Avatar";
import {Button} from "@/components/ui/button";

export default function ProfilePage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-y-2 border-primary"></div>
      </div>
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
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-background-surface shadow-xs rounded-lg">
          {/* Header */}
          <div className="px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {user &&
                    <>
                    <Avatar name={user.name} avatarUrl={user.avatar} />
                    <div>
                      <h1 className="text-2xl font-bold text-primary">
                        {user.name || user.email}
                      </h1>
                      <p className="text-secondary">{user.email}</p>
                    </div>
                    </>
                }
              </div>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                Sign Out
              </button>
            </div>
            <div>
              <Button onClick={() => router.push("/dashboard")} >
                Go to dashboard
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}