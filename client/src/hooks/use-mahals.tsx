import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

export interface Mahal {
  id: string;
  name: string;
  thumbnail: string;
  priceRange: {
    min: number;
    max: number;
  };
  capacity: number | string;
  location: string;
  images?: string[];
  parking?: string;
  gasAvailability?: boolean | string;
  electricityBackup?: boolean | string;
  ledLightSet?: boolean | string;
  description?: string;
  arrangementOrder?: number;
  [key: string]: unknown; // Allow other fields from Firestore
}

export function useMahals() {
  return useQuery<Mahal[]>({
    queryKey: ["mahals"],
    queryFn: async () => {
      const mahalsCollection = collection(db, "mahals");
      const querySnapshot = await getDocs(mahalsCollection);
      const mahals: Mahal[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        mahals.push({
          id: doc.id,
          name: data.name || "",
          thumbnail: data.thumbnail || data.image || "",
          priceRange: data.priceRange || { min: 0, max: 0 },
          capacity: data.capacity || "",
          location: data.location || "",
          arrangementOrder: data.arrangementOrder ?? 999,
          ...data,
        });
      });
      
      // Sort by arrangementOrder (ascending), then by name if order is the same
      mahals.sort((a, b) => {
        const orderA = a.arrangementOrder ?? 999;
        const orderB = b.arrangementOrder ?? 999;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        return a.name.localeCompare(b.name);
      });
      
      return mahals;
    },
  });
}

export function useMahal(id: string | undefined) {
  return useQuery<Mahal | null>({
    queryKey: ["mahal", id],
    queryFn: async () => {
      if (!id) return null;
      
      const mahalDoc = doc(db, "mahals", id);
      const mahalSnapshot = await getDoc(mahalDoc);
      
      if (!mahalSnapshot.exists()) {
        return null;
      }
      
      const data = mahalSnapshot.data();
      return {
        id: mahalSnapshot.id,
        name: data.name || "",
        thumbnail: data.thumbnail || data.image || "",
        priceRange: data.priceRange || { min: 0, max: 0 },
        capacity: data.capacity || "",
        location: data.location || "",
        images: data.images || data.image ? (Array.isArray(data.images) ? data.images : [data.images || data.thumbnail]) : [],
        parking: data.parking || "",
        gasAvailability: data.gasAvailability ?? data.gas ?? "",
        electricityBackup: data.electricityBackup ?? data.electricity ?? "",
        ledLightSet: data.ledLightSet ?? data.led ?? "",
        description: data.description || "",
        ...data,
      };
    },
    enabled: !!id,
  });
}

