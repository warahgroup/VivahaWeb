import { useQuery, useMutation } from "@tanstack/react-query";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/firebase";
import { queryClient } from "@/lib/queryClient";
import type { SavedItem } from "@shared/schema";

export function useSavedItems(userId: string, type?: SavedItem["type"]) {
  const queryKey = type ? ["savedItems", userId, type] : ["savedItems", userId];

  return useQuery<SavedItem[]>({
    queryKey,
    queryFn: async () => {
      const itemsCollection = collection(db, "users", userId, "savedItems");
      const q = type
        ? query(itemsCollection, where("type", "==", type))
        : itemsCollection;

      const querySnapshot = await getDocs(q);
      const items: SavedItem[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as SavedItem);
      });
      return items;
    },
    enabled: !!userId,
  });
}

export function useAddSavedItem(userId: string) {
  return useMutation<SavedItem, Error, SavedItem>({
    mutationFn: async (item) => {
      const itemsCollection = collection(db, "users", userId, "savedItems");
      const docRef = await addDoc(itemsCollection, item);
      return { ...item, id: docRef.id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedItems", userId] });
      queryClient.invalidateQueries({ queryKey: ["progress", userId] });
    },
  });
}

export function useDeleteSavedItem(userId: string) {
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: async (itemId) => {
      const itemDoc = doc(db, "users", userId, "savedItems", itemId);
      await deleteDoc(itemDoc);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedItems", userId] });
      queryClient.invalidateQueries({ queryKey: ["progress", userId] });
    },
  });
}

export function useUpdateSavedItem(userId: string) {
  return useMutation<SavedItem, Error, { itemId: string; updates: Partial<SavedItem> }>({
    mutationFn: async ({ itemId, updates }) => {
      const itemDoc = doc(db, "users", userId, "savedItems", itemId);
      await updateDoc(itemDoc, updates);
      return { id: itemId, ...updates } as SavedItem; // This is a partial return, but sufficient for mutation
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedItems", userId] });
      queryClient.invalidateQueries({ queryKey: ["progress", userId] });
    },
  });
}
