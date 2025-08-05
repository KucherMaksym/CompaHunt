// pages/auth/signup.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { signIn } from "next-auth/react"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import GoogleLogin from "@/components/GoogleLogin";

const signUpSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z
        .email('Please enter a valid email address')
        .min(1, 'Email is required'),
    password: z
        .string()
        .min(1, 'Password is required')
        .min(6, 'Password must be at least 6 characters long'),
})

type SignUpFormData = z.infer<typeof signUpSchema>

interface FormErrors {
    name?: string
    email?: string
    password?: string
    general?: string
}

export default function SignUpPage() {
    const [formData, setFormData] = useState<SignUpFormData>({
        name: '',
        email: '',
        password: '',
    })
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<FormErrors>({})
    const router = useRouter()

    const handleGoogleLogin = () => {
        signIn('google', {
            callbackUrl: '/dashboard',
            redirect: true
        })
    }

    const validateForm = (): boolean => {
        try {
            signUpSchema.parse(formData)
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) {
            return
        }

        setLoading(true)
        setErrors({})

        try {
            const result = await signIn('credentials', {
                redirect: false,
                ...formData,
                action: 'register'
            })

            if (result?.error) {
                setErrors({ general: result.error });
            } else if (result?.ok) {
                router.push('/dashboard');
            }
        } catch (error) {
            console.error('An unexpected error occurred:', error)
            setErrors({ general: 'An unexpected error occurred. Please try again.' })
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (field: keyof SignUpFormData) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }))
        }
    }

    return (
        <div className="h-app-height flex items-center justify-center w-full">
            <Card className="w-full my-auto max-w-md mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold mb-6 text-center text-foreground">
                        Create your account
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    {errors.general && (
                        <Alert className="mb-4 border-error">
                            <AlertDescription className="text-error">
                                {errors.general}
                            </AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium">
                                Full name
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                autoComplete="name"
                                value={formData.name}
                                onChange={handleInputChange('name')}
                                className={`${errors.name ? 'border-error focus-visible:ring-error' : ''}`}
                                placeholder="Enter your full name"
                                disabled={loading}
                            />
                            {errors.name && (
                                <p className="text-sm text-error mt-1">{errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                autoComplete="email"
                                value={formData.email}
                                onChange={handleInputChange('email')}
                                className={`${errors.email ? 'border-error focus-visible:ring-error' : ''}`}
                                placeholder="Enter your email"
                                disabled={loading}
                            />
                            {errors.email && (
                                <p className="text-sm text-error mt-1">{errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                autoComplete="new-password"
                                value={formData.password}
                                onChange={handleInputChange('password')}
                                className={`${errors.password ? 'border-error focus-visible:ring-error' : ''}`}
                                placeholder="Enter your password"
                                disabled={loading}
                            />
                            {errors.password && (
                                <p className="text-sm text-error mt-1">{errors.password}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring"
                        >
                            {loading ? 'Creating account...' : 'Sign Up'}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col w-full">
                    <GoogleLogin handleGoogleLogin={handleGoogleLogin} loading={loading} />

                    <div className="mt-6 w-full text-center">
                        <p className="text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link href="/auth/signin" className="font-medium text-primary hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}