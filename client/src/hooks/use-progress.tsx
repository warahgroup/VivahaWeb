import { useQuery } from "@tanstack/react-query";
import type { Progress } from "@shared/schema";

export function useProgress(userId: string) {
  return useQuery<Progress>({
    queryKey: ["/api/progress", userId],
    enabled: !!userId,
  });
}
