import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { ChatMessage, ChatResponse, QuizResponse } from "@shared/schema";

export function useChatMessages(userId: string) {
  return useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/messages", userId],
    queryFn: async () => {
      const response = await fetch(`/api/chat/messages/${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      return response.json();
    },
    enabled: !!userId,
  });
}

export function useSendMessage(userId: string) {
  return useMutation<ChatResponse, Error, { message: string; quizData?: QuizResponse }>({
    mutationFn: async (data) => {
      return apiRequest("POST", "/api/chat/message", { userId, ...data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages", userId] });
    },
  });
}
