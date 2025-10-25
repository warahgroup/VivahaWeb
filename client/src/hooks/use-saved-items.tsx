import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { SavedItem } from "@shared/schema";

export function useSavedItems(userId: string, type?: SavedItem["type"]) {
  const queryKey = type
    ? ["/api/items", userId, type]
    : ["/api/items", userId];

  return useQuery<SavedItem[]>({
    queryKey,
    queryFn: async () => {
      const url = type
        ? `/api/items/${userId}?type=${type}`
        : `/api/items/${userId}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch items");
      }
      return response.json();
    },
    enabled: !!userId,
  });
}

export function useAddSavedItem(userId: string) {
  return useMutation<SavedItem, Error, SavedItem>({
    mutationFn: async (item) => {
      return apiRequest("POST", `/api/items/${userId}`, item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/progress", userId] });
    },
  });
}

export function useDeleteSavedItem(userId: string) {
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: async (itemId) => {
      return apiRequest("DELETE", `/api/items/${userId}/${itemId}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/progress", userId] });
    },
  });
}

export function useUpdateSavedItem(userId: string) {
  return useMutation<SavedItem, Error, { itemId: string; updates: Partial<SavedItem> }>({
    mutationFn: async ({ itemId, updates }) => {
      return apiRequest("PATCH", `/api/items/${userId}/${itemId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/progress", userId] });
    },
  });
}
