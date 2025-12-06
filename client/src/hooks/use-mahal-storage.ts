import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase";

/**
 * Sanitize mahal name to create a valid folder name
 * Converts to lowercase, replaces spaces with underscores, removes special characters
 */
export function sanitizeFolderName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

/**
 * Upload images to Firebase Storage
 * Structure: mahals/mahalName/mahalname_1.jpg
 */
export async function uploadMahalImages(
  mahalName: string,
  images: File[]
): Promise<string[]> {
  const folderName = sanitizeFolderName(mahalName);
  const uploadPromises = images.map(async (image, index) => {
    const fileName = `${folderName}_${index + 1}.jpg`;
    const storageRef = ref(storage, `mahals/${folderName}/${fileName}`);

    await uploadBytes(storageRef, image);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  });

  return Promise.all(uploadPromises);
}






