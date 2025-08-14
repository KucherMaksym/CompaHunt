import { Storage } from "@plasmohq/storage"

const storage = new Storage()

async function fetchAuthToken(): Promise<string | null> {
    console.log("Attempting to fetch auth token...")

    try {

        console.log("Making fetch request...")
        const response = await fetch("http://localhost:3000/api/extension/auth", {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        })

        console.log("Response status:", response.status)

        if (response.ok) {
            const data = await response.json()
            console.log("Token received:", data.token ? "✅" : "❌")

            await storage.set("authToken", data.token)
            await storage.set("user", data.user)
            return data.token
        } else {
            const errorText = await response.text()
            console.error("Failed to fetch token:", response.status, errorText)
        }
    } catch (error) {
        console.error("Fetch error:", error)
    }

    return null
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Received request", request)

    if (request.type === "GET_AUTH_TOKEN") {
        fetchAuthToken().then(sendResponse)
        return true
    }

    if (request.type === "SEND_JOB_DATA") {
        sendJobToServer(request.data).then(sendResponse)
        return true
    }
})

async function isTokenValid(token: string): Promise<boolean> {
    try {
        const response = await fetch("http://localhost:8080/api/auth/validate", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        return response.ok
    } catch (error) {
        console.error("Token validation failed:", error)
        return false
    }
}

async function getValidToken(): Promise<string | null> {
    let token = await storage.get("authToken")
    const tokenExpiry = await storage.get("tokenExpiry")
    
    // Check if token exists and hasn't expired
    if (token && tokenExpiry && Date.now() < tokenExpiry) {
        return token
    }
    
    // If token exists but might be expired, validate it
    if (token) {
        const isValid = await isTokenValid(token)
        if (isValid) {
            // Token is still valid, extend expiry
            await storage.set("tokenExpiry", Date.now() + 30 * 60 * 1000) // 30 minutes
            return token
        }
    }
    
    // Token invalid or expired, fetch new one
    await storage.remove("authToken")
    await storage.remove("tokenExpiry")
    token = await fetchAuthToken()
    
    if (token) {
        await storage.set("tokenExpiry", Date.now() + 30 * 60 * 1000) // 30 minutes
    }
    
    return token
}

async function sendJobToServer(jobData: any) {
    try {
        const token = await getValidToken()

        if (!token) {
            throw new Error("No auth token available")
        }

        const response = await fetch("http://localhost:8080/api/vacancies", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(jobData)
        })

        if (response.status === 401 || response.status === 403) {
            // Token became invalid during request, clear cache and retry once
            await storage.remove("authToken")
            await storage.remove("tokenExpiry")
            
            const newToken = await fetchAuthToken()
            if (newToken) {
                await storage.set("tokenExpiry", Date.now() + 30 * 60 * 1000)
                
                const retryResponse = await fetch("http://localhost:8080/api/vacancies", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${newToken}`
                    },
                    body: JSON.stringify(jobData)
                })
                
                return await retryResponse.json()
            }
        }

        return await response.json()
    } catch (error) {
        console.error("Failed to send job data:", error)
        throw error
    }
}