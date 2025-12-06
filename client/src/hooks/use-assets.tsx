import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { Asset } from "@shared/schema";

interface AssetsFilters {
  type?: string;
  category?: string;
  keywords?: string;
  sort?: string;
  page?: number;
}

export function useAssets(filters: AssetsFilters) {
  return useQuery<Asset[]>({
    queryKey: ["assets", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.type) params.append("type", filters.type);
      if (filters.category) params.append("category", filters.category);
      if (filters.keywords) params.append("keywords", filters.keywords);
      if (filters.sort) params.append("sort", filters.sort);
      if (filters.page) params.append("page", filters.page.toString());

      const response = await fetch(`/api/assets?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch assets");
      }
      return response.json();
    },
  });
}

export function useMarkInterested() {
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: async (assetId: string) => {
      const response = await fetch("/api/interested/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId }),
      });
      if (!response.ok) {
        throw new Error("Failed to mark as interested");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
}







