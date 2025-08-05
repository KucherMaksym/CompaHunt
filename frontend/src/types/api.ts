export interface ApiClientConfig {
    baseURL?: string;
    timeout?: number;
    defaultHeaders?: Record<string, string>;
    retries?: number;
    retryDelay?: number;
}

export interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: any;
    params?: Record<string, string | number | boolean>;
    headers?: Record<string, string>;
    credentials?: RequestCredentials;
    cache?: RequestCache;
    next?: NextFetchRequestConfig;
}

export interface ApiResponse<T> {
    data: T;
    status: number;
    statusText: string;
    headers: Headers;
}

export class ApiError extends Error {
    public status: number;
    public statusText: string;
    public data: any;
    public url: string;

    constructor(message: string, status: number, statusText: string, data: any, url: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.statusText = statusText;
        this.data = data;
        this.url = url;
    }
}

export class ApiValidationError extends ApiError {
    public readonly validationErrors: Record<string, string>; // { email: "...", password: "..." }

    constructor(message: string, status: number, statusText: string, data: any, url:string) {
        super(message, status, statusText, data, url);
        this.name = 'ApiValidationError';
        this.validationErrors = data?.errors || {};
    }
}