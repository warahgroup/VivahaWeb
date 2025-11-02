import { useQuery, useMutation } from "@tanstack/react-query";
import { collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";
import { queryClient } from "@/lib/queryClient";
import type { ChatMessage, ChatResponse, QuizResponse } from "@shared/schema";
import { useEffect } from "react";

// Worker response type
interface WorkerResponse {
  response: string;
  conversation_id: string;
}

// Fetch messages from Firestore with real-time updates
// Note: This returns an empty array initially; the real-time listener in your Chat component (e.g., chat.tsx) will populate the cache via setQueryData.
export function useChatMessages(userId: string) {
  return useQuery<ChatMessage[]>({
    queryKey: ["chatMessages", userId],
    queryFn: async () => {
      // Placeholder: onSnapshot in component handles real-time population.
      // Returning empty prevents initial fetch error.
      return [];
    },
    enabled: !!userId,
    staleTime: Infinity, // No re-fetch needed with real-time listener
  });
}

// Send message and save to Firestore
export function useSendMessage(userId: string) {
  return useMutation<
    ChatResponse,
    Error,
    { message: string; quizData?: QuizResponse }
  >({
    mutationFn: async ({ message, quizData }) => {
      const messagesCollection = collection(db, "users", userId, "chatMessages");
      
      try {
        // 1. Save user message to Firestore
        await addDoc(messagesCollection, {
          role: "user",
          content: message,
          timestamp: Date.now(),
        });

        // Prepare message with quiz context
        const fullMessage = quizData
          ? `${JSON.stringify(quizData)} | ${message}`
          : message;

        // POST to Worker (expects user_id and message)
        const response = await fetch(
          "https://vivagabot.warahgroup.workers.dev/chat",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId, message: fullMessage }),
          }
        );

        if (!response.ok) {
          throw new Error(`Worker error: ${response.status} - ${response.statusText}`);
        }

        const data: { reply?: string } = await response.json();

        // 2. Save AI response to Firestore
        const aiMessageDoc = await addDoc(messagesCollection, {
          role: "assistant",
          content: data.reply ?? "",
          timestamp: Date.now() + 1,
        });

        // Return AI response
        return {
          id: aiMessageDoc.id,
          role: "assistant",
          content: data.reply ?? "",
          timestamp: Date.now() + 1,
        };
      } catch (error) {
        throw error as Error; // Re-throw for onError handling
      }
    },
    // Avoid invalidating; a refetch would set [] from queryFn and clear UI until onSnapshot runs.
    onError: (error) => {
      console.error("Send message error:", error);
    },
  });
}