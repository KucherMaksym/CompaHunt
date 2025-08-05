'use client'

import Link from 'next/link'
import {useRouter, useSearchParams} from 'next/navigation'
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";

export default function AuthError() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')
    const router = useRouter();

    const getErrorMessage = (error: string | null) => {
        switch (error) {
            case 'Configuration':
                return 'There is a problem with the server configuration.'
            case 'AccessDenied':
                return 'Access denied. You do not have permission to sign in.'
            case 'Verification':
                return 'The verification token has expired or has already been used.'
            case 'Default':
            default:
                return 'An error occurred during authentication.'
        }
    }

    return (
        <div className="h-app-height flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <Card>
                <CardHeader className={"text-center"}>
                    <div className="mx-auto h-12 w-12 text-error">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-primary">
                        Authentication Error
                    </h2>
                </CardHeader>

                <CardContent>
                    <p className="mt-2 text-center text-sm text-secondary">
                        {getErrorMessage(error)}
                    </p>
                </CardContent>

                <CardFooter className="mt-8 space-y-4 flex-col w-full">
                    <Button className={"w-full"} variant={"default"} onClick={() => router.push("/auth/signin")}>
                        Try signing in again
                    </Button>

                    <Button className={"w-full"} variant={"secondary"} onClick={() => router.push("/")}>
                        Go back home
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}