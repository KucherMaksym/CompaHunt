import React, { useState, useEffect } from "react"
import { LinkedInJobParser } from "~/lib/linkedin-parser"
import type { JobData, ParseResult } from "~/lib/types"
import "./compahunt-styles.css"

const LinkedInOverlay = () => {
    const [isVisible, setIsVisible] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [lastParsedData, setLastParsedData] = useState<JobData | null>(null)
    const [showResult, setShowResult] = useState(false)

  // Check if we're on a valid LinkedIn job page
    useEffect(() => {
        const checkJobPage = () => {
            const isJobPage = window.location.href.includes('linkedin.com/jobs/')
            setIsVisible(isJobPage)
        }

        checkJobPage()

        // Listen for URL changes (SPA navigation)
        const observer = new MutationObserver(checkJobPage)
        observer.observe(document.body, { childList: true, subtree: true })

        return () => observer.disconnect()
    }, [])

    const handleParse = async () => {
        setIsLoading(true)
        setShowResult(false)

        try {
            // Wait a bit for page to fully load
            // await new Promise(resolve => setTimeout(resolve, 1000))

            const parser = new LinkedInJobParser()
            const result: ParseResult = parser.parseJobPage()

            if (result.success && result.data) {
                setLastParsedData({ manual: false,  ...result.data })
                setShowResult(true)

                // Save to browser storage

                // TODO: send api POST request
                // await chrome.storage.local.set({
                //     [`job_${Date.now()}`]: result.data
                // })

                console.log('✅ Job data parsed successfully:', result.data)
            } else {
                console.error('❌ Parsing failed:', result.error)
                alert(`Parsing failed: ${result.error}`)
            }
        } catch (error) {
            console.error('❌ Error during parsing:', error)
            alert(`Error: ${(error as Error).message}`)
        } finally {
            setIsLoading(false)
        }
    }

    const closeResult = () => {
        setShowResult(false)
        setLastParsedData(null)
    }

    const saveApplication = async () => {
        const jobData = {};

        try {
            const response = await chrome.runtime.sendMessage({
                type: "SEND_JOB_DATA",
                data: lastParsedData
            })

            console.log("Job saved successfully:", response)
        } catch (error) {
            console.error("Failed to save job:", error)
        }
    }

    if (!isVisible) return null

    return (
        <>
            {/* Floating Action Button */}
            <div
                style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: 10000,
                    backgroundColor: 'var(--compahunt-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '60px',
                    height: '60px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0, 102, 204, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    transition: 'all 0.3s ease',
                    fontFamily: 'Arial, sans-serif'
                }}
                onClick={handleParse}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#0052a3'
                    e.currentTarget.style.transform = 'scale(1.1)'
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--compahunt-primary)'
                    e.currentTarget.style.transform = 'scale(1)'
                }}
                title="Parse LinkedIn Job"
            >
                {isLoading ? '⏳' : '📋'}
            </div>

            {/* Results Modal */}
            {showResult && lastParsedData && (
                <div
                    style={{
                        position: 'fixed',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 10001,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'Arial, sans-serif'
                    }}
                    onClick={closeResult}
                >
                    <div
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '24px',
                            maxWidth: '600px',
                            maxHeight: '80vh',
                            overflow: 'auto',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                            position: 'relative'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            style={{
                                position: 'absolute',
                                top: '12px',
                                right: '12px',
                                background: 'none',
                                border: 'none',
                                fontSize: '24px',
                                cursor: 'pointer',
                                color: '#666'
                            }}
                            onClick={closeResult}
                        >
                            ×
                        </button>

                        <h3 style={{ color: 'var(--compahunt-primary)', marginTop: '0', marginBottom: '20px' }}>
                            📋 Parsed Job Data
                        </h3>

                        <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                            <p><strong>Title:</strong> {lastParsedData.title}</p>
                            <p><strong>Company:</strong> {lastParsedData.company}</p>
                            <p><strong>Location:</strong> {lastParsedData.location}</p>

                            {lastParsedData.jobType && (
                                <p><strong>Job Type:</strong> {lastParsedData.jobType}</p>
                            )}

                            {lastParsedData.experienceLevel && (
                                <p><strong>Experience:</strong> {lastParsedData.experienceLevel}</p>
                            )}

                            {lastParsedData.salary && (
                                <p><strong>Salary:</strong> {lastParsedData.salary.range}</p>
                            )}

                            <p><strong>Remoteness:</strong> {lastParsedData.remoteness}</p>

                            {lastParsedData.skills.length > 0 && (
                                <div>
                                    <strong>Skills Found:</strong>
                                    <div style={{ marginTop: '8px' }}>
                                        {lastParsedData.skills.map((skill, index) => (
                                            <span
                                                key={index}
                                                style={{
                                                    display: 'inline-block',
                                                    backgroundColor: '#e8f4fd',
                                                    color: 'var(--compahunt-primary)',
                                                    padding: '4px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    margin: '2px',
                                                    border: '1px solid #d0e8f0'
                                                }}
                                            >
                                            {skill}
                                          </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {lastParsedData.requirements.length > 0 && (
                                <div style={{ marginTop: '16px' }}>
                                    <strong>Requirements:</strong>
                                    <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                                        {lastParsedData.requirements.slice(0, 3).map((req, index) => (
                                            <li key={index} style={{ marginBottom: '4px' }}>
                                                {req}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                <strong>URL:</strong>
                                <div style={{ fontSize: '12px', color: '#666', wordBreak: 'break-all' }}>
                                    {lastParsedData.url}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '20px', textAlign: 'center' }}>
                            <button
                                style={{
                                    backgroundColor: 'var(--compahunt-primary)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 24px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                                onClick={() => {
                                    navigator.clipboard.writeText(JSON.stringify(lastParsedData, null, 2))
                                    alert('Job data copied to clipboard!')
                                }}
                            >
                                📋 Copy JSON
                            </button>
                            <button
                                style={{
                                    backgroundColor: 'var(--compahunt-primary)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 24px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                                onClick={saveApplication}
                            >
                                test request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default LinkedInOverlay