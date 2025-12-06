import { useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/firebase";
import type { Mahal } from "./use-mahals";

interface CreateMahalData {
  name: string;
  location: string;
  capacity: number | string;
  priceRange: {
    min: number;
    max: number;
  };
  parking?: string;
  gasAvailability?: boolean | string;
  electricityBackup?: boolean | string;
  ledLightSet?: boolean | string;
  description?: string;
  arrangementOrder?: number;
  imageUrls: string[];
}

/**
 * Create a new mahal in Firestore with uploaded image URLs
 */
export function useCreateMahal() {
  const queryClient = useQueryClient();

  return useMutation<Mahal, Error, CreateMahalData>({
    mutationFn: async (data) => {
      console.log("[useCreateMahal] Starting create for mahal:", data.name);

      // Step 1: Use provided URLs directly (no uploads)
      const imageUrls = data.imageUrls.filter((url) => Boolean(url?.trim()));
      console.log("[useCreateMahal] Received image URLs:", imageUrls);

      // Step 2: Create mahal document in Firestore with image URLs
      const mahalData = {
        name: data.name,
        location: data.location,
        capacity: data.capacity,
        priceRange: data.priceRange,
        images: imageUrls,
        thumbnail: imageUrls[0] || "",
        parking: data.parking || "",
        gasAvailability: data.gasAvailability ?? "",
        electricityBackup: data.electricityBackup ?? "",
        ledLightSet: data.ledLightSet ?? "",
        description: data.description || "",
        arrangementOrder: data.arrangementOrder ?? 999,
        createdAt: new Date().toISOString(),
      };

      console.log("[useCreateMahal] Writing mahal to Firestore:", mahalData);
      const docRef = await addDoc(collection(db, "mahals"), mahalData);
      console.log("[useCreateMahal] Firestore write successful, id:", docRef.id);

      return {
        id: docRef.id,
        ...mahalData,
      } as Mahal;
    },
    onError: (error) => {
      console.error("[useCreateMahal] Error creating mahal:", error);
    },
    onSuccess: () => {
      // Ensure mahal lists refresh after a successful create
      queryClient.invalidateQueries({ queryKey: ["mahals"] });
    },
  });
}

