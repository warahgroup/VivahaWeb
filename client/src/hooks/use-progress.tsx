import { useQuery } from "@tanstack/react-query";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import type { Progress } from "@shared/schema";

export function useProgress(userId: string) {
  return useQuery<Progress>({
    queryKey: ["progress", userId],
    queryFn: async () => {
      const itemsCollection = collection(db, "users", userId, "savedItems");
      const q = query(itemsCollection, where("type", "==", "confirmed"));
      const querySnapshot = await getDocs(q);
      const confirmedItems = querySnapshot.docs.length;
      // Assuming score is derived from confirmed count; adjust formula as needed (e.g., based on your app logic)
      const score = confirmedItems * 10; // Example: 10 points per confirmed item
      return { confirmedCount: confirmedItems, score };
    },
    enabled: !!userId,
  });
}