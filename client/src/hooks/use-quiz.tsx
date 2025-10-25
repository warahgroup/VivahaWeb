import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { QuizResponse } from "@shared/schema";

export function useQuizResponse(userId: string) {
  return useQuery<QuizResponse | null>({
    queryKey: ["/api/quiz", userId],
    queryFn: async () => {
      const response = await fetch(`/api/quiz/${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch quiz");
      }
      return response.json();
    },
    enabled: !!userId,
  });
}

export function useSaveQuiz(userId: string) {
  return useMutation<{ success: boolean }, Error, QuizResponse>({
    mutationFn: async (quizData) => {
      return apiRequest("POST", "/api/quiz", { userId, quizData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quiz", userId] });
    },
  });
}
