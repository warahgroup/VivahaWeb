import { useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase";
import type { Package } from "./use-packages";

interface CreatePackageData {
  name: string;
  priceRange: {
    min: number;
    max: number;
  };
  image?: string;
  category?: string;
  description?: string;
  realPrice?: number;
  offerPrice?: number;
}

interface UpdatePackageData {
  id: string;
  name: string;
  priceRange: {
    min: number;
    max: number;
  };
  image?: string;
  category?: string;
  description?: string;
  realPrice?: number;
  offerPrice?: number;
}

/**
 * Create a new package
 */
export function useCreatePackage() {
  const queryClient = useQueryClient();

  return useMutation<Package, Error, CreatePackageData>({
    mutationFn: async (data) => {
      const packageData = {
        name: data.name,
        priceRange: data.priceRange,
        image: data.image || "",
        category: data.category || "",
        description: data.description || "",
        realPrice: data.realPrice,
        offerPrice: data.offerPrice,
        selectedBy: [],
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "packages"), packageData);

      return {
        id: docRef.id,
        ...packageData,
      } as Package;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
    },
  });
}

/**
 * Update an existing package
 */
export function useUpdatePackage() {
  const queryClient = useQueryClient();

  return useMutation<Package, Error, UpdatePackageData>({
    mutationFn: async (data) => {
      const packageDoc = doc(db, "packages", data.id);
      
      const packageData = {
        name: data.name,
        priceRange: data.priceRange,
        image: data.image || "",
        category: data.category || "",
        description: data.description || "",
        realPrice: data.realPrice,
        offerPrice: data.offerPrice,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(packageDoc, packageData);

      return {
        id: data.id,
        ...packageData,
      } as Package;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
    },
  });
}

/**
 * Delete a package
 */
export function useDeletePackage() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; name: string }>({
    mutationFn: async ({ id }) => {
      const packageDoc = doc(db, "packages", id);
      await deleteDoc(packageDoc);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
    },
  });
}


