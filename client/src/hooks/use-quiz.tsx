import { useQuery, useMutation } from "@tanstack/react-query";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { queryClient } from "@/lib/queryClient";
import type { QuizResponse } from "@shared/schema";

export function useQuizResponse(userId: string) {
  return useQuery<QuizResponse | null>({
    queryKey: ["quizResponse", userId],
    queryFn: async () => {
      if (!userId) return null;
      const userDocRef = doc(db, "users", userId);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        return docSnap.data().quizResponse || null;
      }
      return null;
    },
    enabled: !!userId,
  });
}

export function useSaveQuiz(userId: string) {
  return useMutation<{ success: boolean }, Error, QuizResponse>({
    mutationFn: async (quizData) => {
      if (!userId) throw new Error("User ID is required");
      const userDocRef = doc(db, "users", userId);
      await setDoc(userDocRef, { quizResponse: quizData }, { merge: true });
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizResponse", userId] });
    },
  });
}