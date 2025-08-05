'use client'

import { useQuery } from '@tanstack/react-query'
import apiClient from "@/lib/api-client";
import dynamic from 'next/dynamic'
import {Button} from "@/components/ui/button";

const DynamicHome = dynamic(() => Promise.resolve(Home), {
    ssr: false
})

async function fetchApplications() {
    console.log("fetching applications");
    const response = await apiClient.getD<any>("/api/vacancies");
    return response || [];
}

function Home() {
    const { data: applications, isLoading, error } = useQuery({
        queryKey: ['applications'],
        queryFn: fetchApplications,
    })

    if (isLoading) return <div className="p-8">Loading...</div>
    if (error) return <div className="p-8 text-red-500">Error loading applications</div>

    return (
        <main className="min-h-screen bg-background">
            <div className="container mx-auto p-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-primary mb-2">Dashboard</h1>
                    <p className="text-secondary">Manage your job applications</p>
                </div>

                <div className="bg-background-surface rounded-lg shadow-xs p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-primary">
                            Applications ({applications?.length || 0})
                        </h2>
                        <Button>
                            Add Application
                        </Button>
                    </div>

                    {applications?.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-muted mb-4">
                                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-primary mb-1">No applications yet</h3>
                            <p className="text-secondary mb-4">Get started by adding your first job application!</p>
                            <Button>
                                Add Your First Application
                            </Button>
                            {/*<button className="bg-primary text-primary px-4 py-2 rounded-md text-sm font-medium transition-colors hover:brig"></button>*/}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {applications?.map((app: any) => (
                                <div key={app.id} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-primary text-lg">{app.title}</h3>
                                            <p className="text-secondary">{app.company.name}</p>
                                            {app.location && (
                                                <p className="text-sm text-tertiary">{app.location}</p>
                                            )}
                                        </div>
                                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                              {app.status}
                                          </span>
                                    </div>
                                    {app.salary && (
                                        <div className="mt-2">
                                            <span className="text-sm text-tertiary">Salary: </span>
                                            <span className="text-sm font-medium text-primary">
                                                ${app.salary.toLocaleString()}
                                              </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}

export default DynamicHome;