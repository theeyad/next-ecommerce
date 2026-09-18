"use client";

import { useMutation, useQueryClient, QueryKey } from "@tanstack/react-query";
import { toast } from "@/components/ui/toast";

interface MutationOptions<TData, TVariables> {
  action: (
    variables: TVariables,
  ) => Promise<{ success?: boolean; error?: string } | any>;
  keysToInvalidate?: QueryKey[];
  successMessage?: string;
  onSuccess?: (data: TData) => void;
  onError?: (error: string) => void;
}

/**
 * Reusable client mutation hook that executes a Server Action,
 * invalidates target TanStack Query client caches, and displays toast notifications.
**/
export function useAdminMutation<TData = any, TVariables = any>({
  action,
  keysToInvalidate = [],
  successMessage,
  onSuccess,
  onError,
}: MutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      const result = await action(variables);
      if (result?.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (data) => {
      keysToInvalidate.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });

      if (successMessage) {
        toast.add({
          title: successMessage,
          type: "success",
        });
      }

      onSuccess?.(data);
    },
    onError: (err: Error) => {
      toast.add({
        title: "Operation failed",
        description: err.message,
        type: "error",
      });
      onError?.(err.message);
    },
  });
}
