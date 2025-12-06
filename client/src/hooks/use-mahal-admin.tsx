import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, updateDoc, deleteDoc, getDoc } from "firebase/firestore";
import { ref, listAll, deleteObject } from "firebase/storage";
import { db, storage } from "@/firebase";
import type { Mahal } from "./use-mahals";
import { uploadMahalImages, sanitizeFolderName } from "./use-mahal-storage";

interface UpdateMahalData {
  id: string;
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
  images?: File[];
  existingImages?: string[];
}

/**
 * Delete all files in a Storage folder
 */
async function deleteStorageFolder(folderPath: string): Promise<void> {
  try {
    const folderRef = ref(storage, folderPath);
    const listResult = await listAll(folderRef);
    
    // Delete all files in the folder
    const deletePromises = listResult.items.map((itemRef) => deleteObject(itemRef));
    await Promise.all(deletePromises);
  } catch (error) {
    // If folder doesn't exist, that's okay
    console.warn(`Folder ${folderPath} not found or already deleted:`, error);
  }
}

/**
 * Update an existing mahal
 */
export function useUpdateMahal() {
  const queryClient = useQueryClient();

  return useMutation<Mahal, Error, UpdateMahalData>({
    mutationFn: async (data) => {
      let imageUrls = data.existingImages || [];

      // If new images are provided, upload them
      if (data.images && data.images.length > 0) {
        // Delete old images folder if name changed
        const oldMahalDoc = await getDoc(doc(db, "mahals", data.id));
        if (oldMahalDoc.exists()) {
          const oldData = oldMahalDoc.data();
          if (oldData.name !== data.name) {
            const oldFolderName = sanitizeFolderName(oldData.name);
            await deleteStorageFolder(`mahals/${oldFolderName}`);
          }
        }

        // Upload new images
        const newImageUrls = await uploadMahalImages(data.name, data.images);
        imageUrls = newImageUrls;
      }

      // Update Firestore document
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
        updatedAt: new Date().toISOString(),
      };

      const mahalDoc = doc(db, "mahals", data.id);
      await updateDoc(mahalDoc, mahalData);

      return {
        id: data.id,
        ...mahalData,
      } as Mahal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mahals"] });
      queryClient.invalidateQueries({ queryKey: ["mahal"] });
    },
  });
}

/**
 * Delete a mahal and its Storage folder
 */
export function useDeleteMahal() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; name: string }>({
    mutationFn: async ({ id, name }) => {
      // Delete Firestore document
      const mahalDoc = doc(db, "mahals", id);
      await deleteDoc(mahalDoc);

      // Delete Storage folder
      const folderName = sanitizeFolderName(name);
      await deleteStorageFolder(`mahals/${folderName}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mahals"] });
    },
  });
}

