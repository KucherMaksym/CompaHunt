'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import GoogleLogin from "@/components/GoogleLogin";
import Link from "next/link";

const signInSchema = z.object({
    email: z
        .email('Please enter a valid email address')
        .min(1, 'Email is required'),
    password: z
        .string()
        .min(1, 'Password is required')
        .min(6, 'Password must be at least 6 characters long')
})

type SignInFormData = z.infer<typeof signInSchema>

interface FormErrors {
    email?: string
    password?: string
    general?: string
}

export default function SignInPage() {
    const [formData, setFormData] = useState<SignInFormData>({
        email: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<FormErrors>({})

    const validateForm = (): boolean => {
        try {
            signInSchema.parse(formData)
            setErrors({})
            return true
        } catch (error) {
            if (error instanceof z.ZodError) {
                const fieldErrors: FormErrors = {}
                error.issues.forEach((err) => {
                    if (err.path[0]) {
                        fieldErrors[err.path[0] as keyof FormErrors] = err.message
                    }
                })
                setErrors(fieldErrors)
            }
            return false
        }
    }

    const handleCredentialsLogin = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setLoading(true)
        setErrors({})

        try {
            const result = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false
            })

            if (result?.ok) {
                window.location.href = '/dashboard'
            } else {
                setErrors({ general: 'Invalid email or password. Please try again.' })
            }
        } catch (error) {
            console.error('Login error:', error)
            setErrors({ general: 'An unexpected error occurred. Please try again.' })
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = () => {
        signIn('google', {
            callbackUrl: '/dashboard',
            redirect: true
        })
    }

    const handleInputChange = (field: keyof SignInFormData) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }))
        }
    }

    return (
        <div className={`h-app-height flex items-center justify-center w-full`}>
            <Card className={"w-full my-auto max-w-md mx-auto"}>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold mb-6 text-center text-foreground">
                        Sign In
                    </CardTitle>
                </CardHeader>

                {errors.general && (
                    <Alert className="mb-4 border-error">
                        <AlertDescription className="text-error">
                            {errors.general}
                        </AlertDescription>
                    </Alert>
                )}
                <CardContent>
                    <form onSubmit={handleCredentialsLogin} className="space-y-4" noValidate>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                autoComplete={"email"}
                                value={formData.email}
                                onChange={handleInputChange('email')}
                                className={`${errors.email ? 'border-error focus-visible:ring-error' : ''}`}
                                placeholder="Enter your email"
                                disabled={loading}
                            />
                            {errors.email && (
                                <p className="text-sm text-error mt-1">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={handleInputChange('password')}
                                className={`${errors.password ? 'border-error focus-visible:ring-error' : ''}`}
                                placeholder="Enter your password"
                                disabled={loading}
                            />
                            {errors.password && (
                                <p className="text-sm text-error mt-1">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col w-full">
                    <GoogleLogin handleGoogleLogin={handleGoogleLogin} loading={loading} />

                    <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            Don't have an account?{' '}
                            <Link href="/auth/signup" className="font-medium text-primary hover:underline">
                                Sign Up
                            </Link>
                        </p>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}