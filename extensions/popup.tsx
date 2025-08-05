import { useState, useEffect } from "react"

function IndexPopup() {
    const [savedJobs, setSavedJobs] = useState<any[]>([])

    useEffect(() => {
        loadSavedJobs()
    }, [])

    const loadSavedJobs = async () => {

        // Fetch from backend

        setSavedJobs([])
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
        <div style={{
            width: '400px',
            padding: '20px',
            fontFamily: 'Arial, sans-serif'
        }}>
            <h2 style={{ color: '#0066cc', margin: '0 0 16px 0' }}>
                📋 JobTracker Pro
            </h2>

            <p style={{ fontSize: '14px', color: '#666', margin: '0 0 20px 0' }}>
                Navigate to a LinkedIn job page and click the floating button to parse job details.
            </p>

            <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', margin: '0 0 12px 0' }}>
                    Saved Jobs ({savedJobs.length})
                </h3>

                {savedJobs.length === 0 ? (
                    <p style={{ fontSize: '14px', color: '#999' }}>
                        No jobs saved yet. Visit a LinkedIn job page to get started!
                    </p>
                ) : (
                    <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                        {savedJobs.slice(0, 5).map((job) => (
                            <div
                                key={job.id}
                                style={{
                                    padding: '12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    marginBottom: '8px',
                                    fontSize: '12px'
                                }}
                            >
                                <div style={{ fontWeight: 'bold', color: '#0066cc' }}>
                                    {job.title}
                                </div>
                                <div style={{ color: '#666' }}>
                                    {job.company} • {job.location}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
                {savedJobs.length > 0 && (
                    <>
                        <button
                            onClick={exportJobs}
                            style={{
                                flex: 1,
                                padding: '8px 12px',
                                backgroundColor: '#0066cc',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            📥 Export
                        </button>

                        <button
                            onClick={clearStorage}
                            style={{
                                flex: 1,
                                padding: '8px 12px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            🗑️ Clear
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}

export default IndexPopup