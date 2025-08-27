import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {profileApi, UserProfileResponse} from '@/lib/api/profile';
import {ProfileFormData} from '@/lib/validation/profile';

// Query Keys
export const profileKeys = {
    all: ['profile'] as const,
    profile: () => [...profileKeys.all, 'data'] as const,
    exists: () => [...profileKeys.all, 'exists'] as const,
    formData: () => [...profileKeys.all, 'formData'] as const,
};

export function useProfile() {
    return useQuery({
        queryKey: profileKeys.profile(),
        queryFn: () => profileApi.getProfile(),
        staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
        retry: (failureCount, error: any) => {
            // Don't retry on 404 (profile doesn't exist)
            if (error?.status === 404) return false;
            return failureCount < 3;
        },
        refetchOnWindowFocus: false
    });
}

export function useProfileFormData() {
    return useQuery({
        queryKey: profileKeys.formData(),
        queryFn: () => profileApi.getProfileForForm(),
        staleTime: 5 * 60 * 1000,
        retry: (failureCount, error: any) => {
            if (error?.status === 404) return false;
            return failureCount < 3;
        },
        refetchOnWindowFocus: false,

    });
}

export function useProfileExists() {
    return useQuery({
        queryKey: profileKeys.exists(),
        queryFn: () => profileApi.checkProfileExists(),
        staleTime: 10 * 60 * 1000, // Consider data fresh for 10 minutes
    });
}

export function useCreateOrUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: ProfileFormData) => profileApi.createOrUpdateProfile(data),
        onSuccess: (data: UserProfileResponse) => {
            // Invalidate and refetch profile-related queries
            queryClient.invalidateQueries({queryKey: profileKeys.all});

            // Optimistically update the cache
            queryClient.setQueryData(profileKeys.profile(), data);
            queryClient.setQueryData(profileKeys.exists(), true);
        },
        onError: (error) => {
            console.error('Failed to save profile:', error);
        },
    });
}

export function useUpdateBasicProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Parameters<typeof profileApi.updateBasicProfile>[0]) =>
            profileApi.updateBasicProfile(data),
        onSuccess: (data: UserProfileResponse) => {
            // Update cached profile data
            queryClient.setQueryData(profileKeys.profile(), data);

            // Invalidate form data to trigger refresh
            queryClient.invalidateQueries({queryKey: profileKeys.formData()});
        },
        onError: (error) => {
            console.error('Failed to update basic profile:', error);
        },
    });
}

export function useProfileWithMutations() {
    const profile = useProfile();
    const createOrUpdate = useCreateOrUpdateProfile();
    const updateBasic = useUpdateBasicProfile();
    const profileExists = useProfileExists();

    return {
        // Data
        profile: profile.data,
        isLoading: profile.isLoading,
        isError: profile.isError,
        error: profile.error,
        exists: profileExists.data,

        // Mutations
        createOrUpdateProfile: createOrUpdate.mutate,
        updateBasicProfile: updateBasic.mutate,

        // Mutation states
        isCreatingOrUpdating: createOrUpdate.isPending,
        isUpdatingBasic: updateBasic.isPending,
        createOrUpdateError: createOrUpdate.error,
        updateBasicError: updateBasic.error,

        // Utils
        refetch: profile.refetch,
    };
}