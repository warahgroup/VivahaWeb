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

      // 1. Save user message to Firestore (so chat history persists even if assistant is offline)
      await addDoc(messagesCollection, {
        role: "user",
        content: message,
        timestamp: Date.now(),
      });

      // Prepare payload enriched with quiz context
      const fullMessage = quizData
        ? `${JSON.stringify(quizData)} | ${message}`
        : message;

      const workerUrl =
        import.meta.env.VITE_CHAT_WORKER_URL ??
        "https://vivagabot.warahgroup.workers.dev/chat";

      let assistantContent = "";
      let usedFallback = false;

      if (workerUrl) {
        try {
          const response = await fetch(workerUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId, message: fullMessage }),
          });

          if (response.ok) {
            const data: { reply?: string } = await response.json();
            assistantContent = (data.reply ?? "").trim();
          } else {
            const errorBody = await response.text().catch(() => "");
            console.error("Worker responded with error", response.status, errorBody);
            usedFallback = true;
          }
        } catch (error) {
          console.error("Worker request failed", error);
          usedFallback = true;
        }
      } else {
        usedFallback = true;
      }

      if (!assistantContent) {
        usedFallback = true;
        assistantContent = buildFallbackAssistantReply(message);
      }

      // 2. Save Assistant response (from worker or fallback) to Firestore
      const timestamp = Date.now() + 1;
      const aiMessageDoc = await addDoc(messagesCollection, {
        role: "assistant",
        content: assistantContent,
        timestamp,
        source: usedFallback ? "fallback" : "worker",
      });

      return {
        id: aiMessageDoc.id,
        role: "assistant",
        content: assistantContent,
        timestamp,
      };
    },
    // Avoid invalidating; a refetch would set [] from queryFn and clear UI until onSnapshot runs.
    onError: (error) => {
      console.error("Send message error:", error);
    },
  });
}

function buildFallbackAssistantReply(message: string) {
  const keywords = message
    .split(/\s+/)
    .map((word) => word.replace(/[^a-z0-9]/gi, "").toLowerCase())
    .filter((word) => word.length > 3)
    .slice(-3);

  const focus = keywords.length
    ? keywords.map((word) => `#${word}`).join(" · ")
    : "wedding inspiration";

  return [
    "I'm still lining up a detailed response, but here's something to explore right now:",
    `• Dive into the reels curated for ${focus}.`,
    "• Tap the Pinterest board to discover vendor-ready visuals.",
    "",
    "I'll sync a fuller answer as soon as the assistant is back online.",
  ].join("\n");
}