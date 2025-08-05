import { ApiClientConfig, RequestOptions, ApiResponse, ApiError, ApiValidationError } from '@/types/api';
import { getToken } from 'next-auth/jwt';
import {getRequestCookies} from "@/lib/serverApiUtils";

export class ApiClient {
    private config: Required<ApiClientConfig>;

    constructor(config: ApiClientConfig = {}) {
        this.config = {
            baseURL: (config.baseURL || (typeof window !== 'undefined' ? 'http://localhost:8080' : process.env.API_BASE_URL || 'http://localhost:8080')),
            timeout: config.timeout || 10000,
            defaultHeaders: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...config.defaultHeaders,
            },
            retries: config.retries || 3,
            retryDelay: config.retryDelay || 1000,
        };
    }

    private isServer(): boolean {
        return typeof window === 'undefined';
    }

    private buildURL(endpoint: string, params?: Record<string, string | number | boolean>): string {
        const baseURL = this.config.baseURL;
        const url = new URL(endpoint.startsWith('/') ? endpoint : `/${endpoint}`, baseURL);

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.append(key, String(value));
            });
        }

        return url.toString();
    }

    private async prepareHeaders(customHeaders?: Record<string, string>): Promise<Record<string, string>> {
        const headers: Record<string, string> = {
            ...this.config.defaultHeaders,
            ...customHeaders,
        };

        try {
            let jwtToken: string | null = null;

            if (this.isServer()) {
                const headers = await getRequestCookies();

                const tokenRes = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/jwt`, {
                    method: "GET",
                    headers: {
                        "Cookie": headers
                    }
                });

                const {token} = await tokenRes.json();

                if (token) {
                    jwtToken = token as any;
                }
            } else {
                const { getSession } = await import('next-auth/react');
                const session = await getSession();

                if (session) {
                    const tokenRes = await fetch('/api/auth/jwt');
                    if (tokenRes.ok) {
                        const { token } = await tokenRes.json();
                        jwtToken = token;
                    }
                }
            }

            if (jwtToken) {
                headers['Authorization'] = `Bearer ${jwtToken}`;
                console.log("✅ JWT token added to headers");
            } else {
                console.log("❌ No JWT token available");
            }
        } catch (error) {
            console.warn('Failed to get JWT token:', error);
        }

        return headers;
    }

    private prepareBody(body: any): string | FormData | null {
        if (!body) return null;

        if (body instanceof FormData) {
            return body;
        }

        if (typeof body === 'object') {
            return JSON.stringify(body);
        }

        return String(body);
    }

    private async handleResponse<T>(response: Response, url: string): Promise<ApiResponse<T>> {
        const isJson = response.headers.get('content-type')?.includes('application/json');

        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            let errorData: any = null;

            try {
                if (isJson) {
                    errorData = await response.json();
                    if (response.status === 400 && errorData && typeof errorData.errors === 'object') {
                        throw new ApiValidationError("Validation failed", response.status, response.statusText, errorData, url);
                    }

                    errorMessage = errorData.message || errorData.error || errorMessage;

                } else {
                    errorData = await response.text();
                    errorMessage = errorData || errorMessage;
                }
            } catch (error) {
                if (error instanceof ApiValidationError) {
                    throw error;
                }
                console.warn('Failed to parse error response:', error);
            }

            throw new ApiError(errorMessage, response.status, response.statusText, errorData, url);
        }

        let data: T = await this.parseResponseBody(response);

        return {
            data,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
        };
    }

    private async parseResponseBody<T>(response: Response): Promise<T> {
        const contentType = response.headers.get('content-type') || '';
        const text = await response.text();

        if (!text.trim()) {
            return null as unknown as T;
        }

        if (contentType.includes('application/json')) {
            try {
                return JSON.parse(text);
            } catch {
                return text as unknown as T;
            }
        }

        try {
            return JSON.parse(text);
        } catch {
            return text as unknown as T;
        }
    }

    private async executeRequest<T>(url: string, options: RequestInit): Promise<ApiResponse<T>> {
        let lastError: Error;

        for (let attempt = 0; attempt <= this.config.retries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);
                return await this.handleResponse<T>(response, url);

            } catch (error) {
                lastError = error as Error;

                if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
                    throw error;
                }

                if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
                    throw error;
                }

                if (attempt < this.config.retries) {
                    console.warn(`Request attempt ${attempt + 1} failed, retrying...`, error);
                    await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * (attempt + 1)));
                }
            }
        }

        throw lastError!;
    }

    public async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
        const {
            method = 'GET',
            body,
            params,
            headers: customHeaders,
            credentials = 'include',
            cache,
            next,
        } = options;

        try {
            const url = this.buildURL(endpoint, params);
            const headers = await this.prepareHeaders(customHeaders);
            const preparedBody = this.prepareBody(body);

            if (process.env.NODE_ENV === 'development') {
                console.log(`[${this.isServer() ? 'Server' : 'Client'}] ${method} ${url}`, {
                    hasAuth: !!headers['Authorization'],
                    bodyType: preparedBody ? typeof preparedBody : 'none'
                });
            }

            if (preparedBody instanceof FormData) {
                delete headers['Content-Type'];
            }

            const fetchOptions: RequestInit = {
                method,
                headers,
                body: preparedBody,
                credentials,
                cache,
                next,
            };

            return await this.executeRequest<T>(url, fetchOptions);

        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error('API request failed:', {
                    endpoint,
                    method: options.method || 'GET',
                    error: error instanceof Error ? error.message : error
                });
            }
            throw error;
        }
    }

    public async get<T = any>(endpoint: string, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...options, method: 'GET' });
    }

    public async post<T = any>(endpoint: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...options, method: 'POST', body });
    }

    public async put<T = any>(endpoint: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...options, method: 'PUT', body });
    }

    public async patch<T = any>(endpoint: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
    }

    public async delete<T = any>(endpoint: string, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    }

    // Methods to get only data
    public async getData<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const response = await this.request<T>(endpoint, options);
        return response.data;
    }

    public async getD<T = any>(endpoint: string, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
        return this.getData<T>(endpoint, { ...options, method: 'GET' });
    }

    public async postD<T = any>(endpoint: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
        return this.getData<T>(endpoint, { ...options, method: 'POST', body });
    }

    public async putD<T = any>(endpoint: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
        return this.getData<T>(endpoint, { ...options, method: 'PUT', body });
    }

    public async patchD<T = any>(endpoint: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
        return this.getData<T>(endpoint, { ...options, method: 'PATCH', body });
    }

    public async deleteD<T = any>(endpoint: string, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
        return this.getData<T>(endpoint, { ...options, method: 'DELETE' });
    }
}

export const apiClient = new ApiClient({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
    defaultHeaders: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
    timeout: 15000,
    retries: 2,
    retryDelay: 1000,
});

export default apiClient;