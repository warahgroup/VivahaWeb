import { useQuery } from "@tanstack/react-query";
import type { Progress } from "@shared/schema";

export function useProgress(userId: string) {
  return useQuery<Progress>({
    queryKey: ["/api/progress", userId],
    queryFn: async () => {
      const response = await fetch(`/api/progress/${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch progress");
      }
      return response.json();
    },
    enabled: !!userId,
  });
}
