import React, { useEffect, useState } from "react"
import "./compahunt-styles.css"

interface Job {
  id: number;
  title: string;
  company: CompanyResponse;
  location: string;
  jobType: string;
  experienceLevel: string;
  description: string,
  requirements: string[];
  skills: string[];
  status: VacancyStatus;
  appliedAt: string;
  postedDate: string;
  applicantCount: number;
  url: string;
  salary: Salary;
  remoteness: String;
  industry: String;
  benefits: String;
  experience: String;
  createdAt: String;
  updatedAt: String;
  lastUpdated: String;
}

class Salary {
  range: string;
  currency: string;
  period: string;
  type: string;
  location: string;
}

enum VacancyStatus {
  APPLIED = "APPLIED",
  VIEWED = "VIEWED",
  PHONE_SCREEN = "PHONE_SCREEN",
  INTERVIEW = "INTERVIEW",
  OFFER = "OFFER",
  REJECTED = "REJECTED",
  ARCHIVED = "ARCHIVED"
}

interface CompanyResponse {
  id: number;
  name: string;
  description: string;
  websiteUrl: string;
  logoUrl: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

function IndexPopup() {
  const [savedJobs, setSavedJobs] = useState<Job[]>([])
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    error: null
  })

  useEffect(() => {
    loadRecentJobs()
  }, [])

  const loadRecentJobs = async () => {
    try {
      setAuth(prev => ({ ...prev, isLoading: true, error: null }))

      // Get auth token from background script
      const response = await chrome.runtime.sendMessage({ type: "GET_AUTH_TOKEN" })
      const token = response || null

      if (!token) {
        setAuth({
          isAuthenticated: false,
          isLoading: false,
          error: "Not authenticated. Please log in to the web app first."
        })
        return
      }

      // Fetch recent vacancies from backend
      const vacancyResponse = await fetch("http://localhost:8080/api/vacancies/recent", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })

      if (vacancyResponse.ok) {
        const jobs = await vacancyResponse.json()
        setSavedJobs(jobs)
        setAuth({
          isAuthenticated: true,
          isLoading: false,
          error: null
        })
      } else if (vacancyResponse.status === 401) {
        setAuth({
          isAuthenticated: false,
          isLoading: false,
          error: "Authentication expired. Please log in to the web app again."
        })
      } else {
        throw new Error(`Failed to fetch jobs: ${vacancyResponse.status}`)
      }
    } catch (error) {
      console.error("Failed to load recent jobs:", error)
      setAuth({
        isAuthenticated: false,
        isLoading: false,
        error: "Failed to load jobs. Please try again later."
      })
    }
  }

  const clearStorage = async () => {
    await chrome.storage.local.clear()
    setSavedJobs([])
  }

  const exportJobs = () => {
    const dataStr = JSON.stringify(savedJobs, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement('a')
    link.href = url
    link.download = `jobtracker-export-${new Date().toISOString().split('T')[0]}.json`
    link.click()
  }

    return (
        <div className="compahunt-font-family compahunt-p-4" style={{ width: '400px', backgroundColor: 'var(--compahunt-background)', color: 'var(--compahunt-foreground)' }}>
            <h2 className="compahunt-text-primary compahunt-m-0 compahunt-mb-2">
                📋 JobTracker Pro
            </h2>

            <p className="compahunt-text-sm compahunt-text-muted compahunt-m-0" style={{ marginBottom: '20px' }}>
                Navigate to a LinkedIn job page and click the floating button to parse job details.
            </p>

            <div style={{ marginBottom: '20px' }}>
                <h3 className="compahunt-text-base compahunt-m-0 compahunt-mb-2">
                    Saved Jobs ({savedJobs.length})
                </h3>

        {auth.isLoading ? (
          <p className="compahunt-text-sm compahunt-text-muted">
            Loading...
          </p>
        ) : auth.error ? (
          <div>
            <p className="compahunt-text-sm compahunt-text-destructive compahunt-mb-2">
              {auth.error}
            </p>
            <button
              onClick={loadRecentJobs}
              className="compahunt-btn compahunt-btn-primary compahunt-btn-xs compahunt-transition-colors"
            >
              Retry
            </button>
          </div>
        ) : savedJobs.length === 0 ? (
          <p className="compahunt-text-sm compahunt-text-muted">
            No jobs saved yet. Visit a LinkedIn job page to get started!
          </p>
        ) : (
          <div className="compahunt-max-h-200 compahunt-overflow-auto">
            {savedJobs.map((job) => (
              <div
                key={job.id}
                className="compahunt-card compahunt-p-3 compahunt-rounded-md compahunt-mb-2 compahunt-text-xs"
              >
                <div 
                  className={`compahunt-font-bold compahunt-text-primary ${job.url && "compahunt-hover-cursor-pointer"}`} 
                  onClick={job.url ? () => window.open(job.url) : undefined}
                >
                  {job.title}
                </div>
                <div className="compahunt-text-muted">
                  {job.company.name} • {job.location}
                </div>
                <div className="compahunt-text-xs compahunt-text-muted compahunt-mt-1">
                  Status: {job.status} • Applied: {new Date(job.appliedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default IndexPopup