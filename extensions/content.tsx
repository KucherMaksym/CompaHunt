import React, { useState, useEffect } from "react"
import { LinkedInJobParser } from "~/lib/linkedin-parser"
import type { JobData, ParseResult } from "~/lib/types"
import toast from "~/lib/toast"
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
        if (!lastParsedData) {
            toast.error("No job data to save");
            return;
        }

        // // Show loading toast
        // const loadingToastId = toast.info("Saving vacancy...", {
        //     duration: 0, // Don't auto-dismiss
        //     title: "Saving"
        // });

        try {
            const response = await chrome.runtime.sendMessage({
                type: "SEND_JOB_DATA",
                data: lastParsedData
            });

            // Dismiss loading toast
            if (response && response.success) {
                toast.success(response.message || "Vacancy saved successfully!", {
                    title: "Success",
                    duration: 4000,
                    action: {
                        label: "View",
                        onClick: () => {
                            // Open CompaHunt dashboard
                            window.open('http://localhost:3000/dashboard', '_blank');
                        }
                    }
                });
                
                // Close the modal after successful save
                closeResult();
                
            } else {
                // Handle different error types based on status
                const errorType = response?.status === 401 ? 'warning' : 'error';
                const title = response?.status === 401 ? 'Authentication Required' : 'Save Failed';
                
                toast.custom({
                    type: errorType,
                    title: title,
                    description: response?.message || "Failed to save vacancy",
                    duration: 6000,
                    action: response?.status === 401 ? {
                        label: "Login",
                        onClick: () => {
                            window.open('http://localhost:3000/auth/signin', '_blank');
                        }
                    } : undefined
                });
            }
            
            console.log("Server response:", response);
            
        } catch (error) {
            // Dismiss loading toast
            toast.error("Network error. Please check your connection.", {
                title: "Connection Error",
                duration: 5000
            });
            
            console.error("Failed to save job:", error);
        }
    }

    if (!isVisible) return null

    return (
        <>
            {/* Floating Action Button */}
            <div
                className="compahunt-fab"
                style={{
                    position: 'fixed',
                    top: '20px',
                    right: '-20px',
                    zIndex: 1000,
                    backgroundColor: 'var(--compahunt-primary)',
                    color: 'white',
                    // border: 'none',
                    borderRadius: '16px',
                    width: '52px',
                    height: '52px',
                    cursor: 'pointer',
                    boxShadow: 'var(--compahunt-shadow-xl)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    fontFamily: 'var(--compahunt-font-family)',
                    backdropFilter: 'blur(20px)',
                    background: 'linear-gradient(135deg, var(--compahunt-primary) 0%, #0052a3 100%)',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    overflow: 'hidden',
                    // position: 'relative'
                }}
                onClick={handleParse}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 102, 204, 0.5)'
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1) translateY(0px)'
                    e.currentTarget.style.boxShadow = 'var(--compahunt-shadow-xl)'
                }}
                title="Parse LinkedIn Job"
            >
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)',
                    pointerEvents: 'none'
                }} />
                {isLoading ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{animation: 'spin 1s linear infinite'}}>
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="28.27" strokeDashoffset="14.14" opacity="0.8"/>
                    </svg>
                ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                        <polyline points="14,2 14,8 20,8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10,9 9,9 8,9"/>
                    </svg>
                )}
            </div>

            {/* Results Modal */}
            {showResult && lastParsedData && (
                <div
                    className="compahunt-modal-overlay"
                    style={{
                        position: 'fixed',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, rgba(0, 103, 255, 0.1) 0%, rgba(0, 0, 0, 0.6) 100%)',
                        zIndex: 1001,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'var(--compahunt-font-family)',
                        animation: 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onClick={closeResult}
                >
                    <div
                        className="compahunt-modal-content"
                        style={{
                            backgroundColor: 'var(--compahunt-card)',
                            borderRadius: '20px',
                            padding: '32px',
                            maxWidth: '680px',
                            maxHeight: '85vh',
                            overflow: 'auto',
                            boxShadow: 'var(--compahunt-shadow-xl), 0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            position: 'relative',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            animation: 'modalSlideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            width: '90%',
                            color: 'var(--compahunt-card-foreground)',
                            backdropFilter: 'blur(20px)',
                            isolation: 'isolate'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            className="compahunt-close-btn"
                            style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                                background: 'rgba(var(--compahunt-muted-foreground), 0.1)',
                                border: 'none',
                                borderRadius: '8px',
                                width: '32px',
                                height: '32px',
                                cursor: 'pointer',
                                color: 'var(--compahunt-muted-foreground)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease',
                                fontSize: '18px'
                            }}
                            onClick={closeResult}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--compahunt-destructive)'
                                e.currentTarget.style.color = 'white'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(var(--compahunt-muted-foreground), 0.1)'
                                e.currentTarget.style.color = 'var(--compahunt-muted-foreground)'
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>

                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px', 
                            marginTop: '0', 
                            marginBottom: '24px',
                            paddingBottom: '16px',
                            borderBottom: '2px solid var(--compahunt-border)'
                        }}>
                            <div style={{
                                backgroundColor: 'var(--compahunt-primary)',
                                borderRadius: '12px',
                                padding: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                                    <polyline points="14,2 14,8 20,8"/>
                                    <path d="M8 13h8"/>
                                    <path d="M8 17h8"/>
                                </svg>
                            </div>
                            <h3 style={{ 
                                color: 'var(--compahunt-card-foreground)', 
                                margin: '0',
                                fontSize: '24px',
                                fontWeight: '600',
                                letterSpacing: '-0.025em'
                            }}>
                                Job Analysis Complete
                            </h3>
                        </div>

                        <div style={{ fontSize: '15px', lineHeight: '1.7', color: 'var(--compahunt-card-foreground)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                <div style={{ padding: '16px', backgroundColor: 'var(--compahunt-muted)', borderRadius: '12px', border: '1px solid var(--compahunt-border)' }}>
                                    <div style={{ fontSize: '12px', color: 'var(--compahunt-muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Position</div>
                                    <div style={{ fontWeight: '600', fontSize: '16px', color: 'var(--compahunt-card-foreground)' }}>{lastParsedData.title}</div>
                                </div>
                                <div style={{ padding: '16px', backgroundColor: 'var(--compahunt-muted)', borderRadius: '12px', border: '1px solid var(--compahunt-border)' }}>
                                    <div style={{ fontSize: '12px', color: 'var(--compahunt-muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Company</div>
                                    <div style={{ fontWeight: '600', fontSize: '16px', color: 'var(--compahunt-card-foreground)' }}>{lastParsedData.company}</div>
                                </div>
                                <div style={{ padding: '16px', backgroundColor: 'var(--compahunt-muted)', borderRadius: '12px', border: '1px solid var(--compahunt-border)' }}>
                                    <div style={{ fontSize: '12px', color: 'var(--compahunt-muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Location</div>
                                    <div style={{ fontWeight: '600', fontSize: '16px', color: 'var(--compahunt-card-foreground)' }}>{lastParsedData.location}</div>
                                </div>
                                <div style={{ padding: '16px', backgroundColor: 'var(--compahunt-muted)', borderRadius: '12px', border: '1px solid var(--compahunt-border)' }}>
                                    <div style={{ fontSize: '12px', color: 'var(--compahunt-muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Work Style</div>
                                    <div style={{ fontWeight: '600', fontSize: '16px', color: 'var(--compahunt-card-foreground)' }}>{lastParsedData.remoteness}</div>
                                </div>
                                {lastParsedData.jobType && (
                                    <div style={{ padding: '16px', backgroundColor: 'var(--compahunt-muted)', borderRadius: '12px', border: '1px solid var(--compahunt-border)' }}>
                                        <div style={{ fontSize: '12px', color: 'var(--compahunt-muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Job Type</div>
                                        <div style={{ fontWeight: '600', fontSize: '16px', color: 'var(--compahunt-card-foreground)' }}>{lastParsedData.jobType}</div>
                                    </div>
                                )}
                                {lastParsedData.experienceLevel && (
                                    <div style={{ padding: '16px', backgroundColor: 'var(--compahunt-muted)', borderRadius: '12px', border: '1px solid var(--compahunt-border)' }}>
                                        <div style={{ fontSize: '12px', color: 'var(--compahunt-muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Experience</div>
                                        <div style={{ fontWeight: '600', fontSize: '16px', color: 'var(--compahunt-card-foreground)' }}>{lastParsedData.experienceLevel}</div>
                                    </div>
                                )}
                                {lastParsedData.salary && (
                                    <div style={{ padding: '16px', backgroundColor: 'var(--compahunt-success)', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.2)', gridColumn: 'span 2' }}>
                                        <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Salary Range</div>
                                        <div style={{ fontWeight: '600', fontSize: '18px', color: 'white' }}>{lastParsedData.salary.range}</div>
                                    </div>
                                )}
                            </div>

                            {lastParsedData.skills.length > 0 && (
                                <div style={{ marginBottom: '24px' }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '8px', 
                                        marginBottom: '12px'
                                    }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--compahunt-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                                            <path d="M2 17l10 5 10-5"/>
                                            <path d="M2 12l10 5 10-5"/>
                                        </svg>
                                        <strong style={{ color: 'var(--compahunt-card-foreground)', fontSize: '16px' }}>Skills Identified</strong>
                                        <span style={{ 
                                            backgroundColor: 'var(--compahunt-primary)', 
                                            color: 'white', 
                                            borderRadius: '10px', 
                                            padding: '2px 8px', 
                                            fontSize: '11px', 
                                            fontWeight: '600' 
                                        }}>
                                            {lastParsedData.skills.length}
                                        </span>
                                    </div>
                                    <div style={{ 
                                        display: 'flex', 
                                        flexWrap: 'wrap', 
                                        gap: '8px',
                                        padding: '16px',
                                        backgroundColor: 'var(--compahunt-muted)',
                                        borderRadius: '12px',
                                        border: '1px solid var(--compahunt-border)'
                                    }}>
                                        {lastParsedData.skills.map((skill, index) => (
                                            <span
                                                key={index}
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    backgroundColor: 'var(--compahunt-primary)',
                                                    color: 'white',
                                                    padding: '6px 12px',
                                                    borderRadius: '16px',
                                                    fontSize: '13px',
                                                    fontWeight: '500',
                                                    boxShadow: '0 2px 4px rgba(0, 103, 255, 0.2)',
                                                    transition: 'transform 0.2s ease',
                                                    cursor: 'default'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0px)'}
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {lastParsedData.requirements.length > 0 && (
                                <div style={{ marginBottom: '24px' }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '8px', 
                                        marginBottom: '12px'
                                    }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--compahunt-warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 12l2 2 4-4"/>
                                            <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                                            <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                                            <path d="M12 21c0-1-1-3-3-3s-3 2-3 3 1 3 3 3 3-2 3-3"/>
                                            <path d="M12 3c0 1 1 3 3 3s3-2 3-3-1-3-3-3-3 2-3 3"/>
                                        </svg>
                                        <strong style={{ color: 'var(--compahunt-card-foreground)', fontSize: '16px' }}>Key Requirements</strong>
                                    </div>
                                    <div style={{ 
                                        padding: '16px',
                                        backgroundColor: 'var(--compahunt-muted)',
                                        borderRadius: '12px',
                                        border: '1px solid var(--compahunt-border)'
                                    }}>
                                        {lastParsedData.requirements.slice(0, 4).map((req, index) => (
                                            <div key={index} style={{ 
                                                display: 'flex', 
                                                alignItems: 'flex-start', 
                                                gap: '12px', 
                                                marginBottom: index < lastParsedData.requirements.slice(0, 4).length - 1 ? '12px' : '0',
                                                fontSize: '14px',
                                                lineHeight: '1.6'
                                            }}>
                                                <div style={{
                                                    width: '6px',
                                                    height: '6px',
                                                    borderRadius: '50%',
                                                    backgroundColor: 'var(--compahunt-primary)',
                                                    marginTop: '8px',
                                                    flexShrink: 0
                                                }} />
                                                <span style={{ color: 'var(--compahunt-card-foreground)' }}>{req}</span>
                                            </div>
                                        ))}
                                        {lastParsedData.requirements.length > 4 && (
                                            <div style={{ 
                                                marginTop: '12px', 
                                                fontSize: '12px', 
                                                color: 'var(--compahunt-muted-foreground)',
                                                fontStyle: 'italic'
                                            }}>
                                                +{lastParsedData.requirements.length - 4} more requirements
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div style={{ 
                                marginTop: '20px', 
                                padding: '16px', 
                                backgroundColor: 'var(--compahunt-muted)', 
                                borderRadius: '12px',
                                border: '1px solid var(--compahunt-border)'
                            }}>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px', 
                                    marginBottom: '8px'
                                }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--compahunt-muted-foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                                    </svg>
                                    <strong style={{ fontSize: '14px', color: 'var(--compahunt-card-foreground)' }}>Source URL</strong>
                                </div>
                                <div style={{ 
                                    fontSize: '12px', 
                                    color: 'var(--compahunt-muted-foreground)', 
                                    wordBreak: 'break-all',
                                    fontFamily: 'monospace',
                                    backgroundColor: 'var(--compahunt-background)',
                                    padding: '8px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--compahunt-border)'
                                }}>
                                    {lastParsedData.url}
                                </div>
                            </div>
                        </div>

                        <div style={{ 
                            marginTop: '32px', 
                            display: 'flex', 
                            gap: '12px',
                            justifyContent: 'center',
                            paddingTop: '24px',
                            borderTop: '1px solid var(--compahunt-border)'
                        }}>
                            {/*<button*/}
                            {/*    className="compahunt-btn-secondary"*/}
                            {/*    style={{*/}
                            {/*        backgroundColor: 'var(--compahunt-muted)',*/}
                            {/*        color: 'var(--compahunt-card-foreground)',*/}
                            {/*        border: '1px solid var(--compahunt-border)',*/}
                            {/*        padding: '12px 20px',*/}
                            {/*        borderRadius: '10px',*/}
                            {/*        cursor: 'pointer',*/}
                            {/*        fontSize: '14px',*/}
                            {/*        fontWeight: '500',*/}
                            {/*        display: 'flex',*/}
                            {/*        alignItems: 'center',*/}
                            {/*        gap: '8px',*/}
                            {/*        transition: 'all 0.2s ease'*/}
                            {/*    }}*/}
                            {/*    onClick={() => {*/}
                            {/*        navigator.clipboard.writeText(JSON.stringify(lastParsedData, null, 2))*/}
                            {/*        toast.success('Job data copied to clipboard!', { duration: 2000 })*/}
                            {/*    }}*/}
                            {/*    onMouseEnter={(e) => {*/}
                            {/*        e.currentTarget.style.backgroundColor = 'var(--compahunt-border)'*/}
                            {/*        e.currentTarget.style.transform = 'translateY(-1px)'*/}
                            {/*    }}*/}
                            {/*    onMouseLeave={(e) => {*/}
                            {/*        e.currentTarget.style.backgroundColor = 'var(--compahunt-muted)'*/}
                            {/*        e.currentTarget.style.transform = 'translateY(0px)'*/}
                            {/*    }}*/}
                            {/*>*/}
                            {/*    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">*/}
                            {/*        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>*/}
                            {/*        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>*/}
                            {/*    </svg>*/}
                            {/*    Copy JSON*/}
                            {/*</button>*/}
                            <button
                                className="compahunt-btn-primary"
                                style={{
                                    background: 'linear-gradient(135deg, var(--compahunt-success) 0%, #16a34a 100%)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 24px',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                                }}
                                onClick={saveApplication}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)'
                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.4)'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0px)'
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.3)'
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                                    <polyline points="17,21 17,13 7,13 7,21"/>
                                    <polyline points="7,3 7,8 15,8"/>
                                </svg>
                                Save to CompaHunt
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default LinkedInOverlay