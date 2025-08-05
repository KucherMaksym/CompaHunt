import apiClient, {ApiClient, ApiResponse, RequestOptions} from "@/lib/api-client";
import {ApiError} from "@/types/api";

export const createTypedApiClient = <T extends Record<string, any>>(baseURL?: string) => {
    return new ApiClient({ baseURL }) as ApiClient & {
        get: <K extends keyof T>(endpoint: K, options?: Omit<RequestOptions, 'method' | 'body'>) => Promise<ApiResponse<T[K]>>;
        post: <K extends keyof T>(endpoint: K, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>) => Promise<ApiResponse<T[K]>>;
        put: <K extends keyof T>(endpoint: K, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>) => Promise<ApiResponse<T[K]>>;
        delete: <K extends keyof T>(endpoint: K, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>) => Promise<ApiResponse<T[K]>>;
    };
};

// React Hook
export const useApiClient = () => {
    return apiClient;
};

// Error Handler
export const handleApiError = (error: unknown): string => {
    if (error instanceof ApiError) {
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unknown error occurred';
};