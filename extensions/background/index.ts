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

async function sendJobToServer(jobData: any, repeated: boolean = false) {
    try {
        let token = await storage.get("authToken")

        if (!token) {
            token = await fetchAuthToken()
        }

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

        if (response.status === 401 && !repeated) {
            // Expired Token
            await storage.remove("authToken")
            token = await fetchAuthToken()

            if (token) {
                return sendJobToServer(jobData, true)
            }
        }

        return await response.json()
    } catch (error) {
        console.error("Failed to send job data:", error)
        throw error
    }
}