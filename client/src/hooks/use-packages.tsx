import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

export interface Package {
  id: string;
  name: string;
  image?: string;
  priceRange: {
    min: number;
    max: number;
  };
  realPrice?: number;
  offerPrice?: number;
  category?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  selectedBy?: string[]; // Array of user IDs who selected this package
  [key: string]: unknown;
}

export function usePackages() {
  return useQuery<Package[]>({
    queryKey: ["packages"],
    queryFn: async () => {
      const packagesCollection = collection(db, "packages");
      const querySnapshot = await getDocs(packagesCollection);
      const packages: Package[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        packages.push({
          id: doc.id,
          name: data.name || "",
          image: data.image || "",
          priceRange: data.priceRange || { min: 0, max: 0 },
          realPrice: data.realPrice,
          offerPrice: data.offerPrice,
          category: data.category || "",
          description: data.description || "",
          selectedBy: data.selectedBy || [],
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          ...data,
        });
      });
      
      return packages;
    },
  });
}

export function usePackage(id: string | undefined) {
  return useQuery<Package | null>({
    queryKey: ["package", id],
    queryFn: async () => {
      if (!id) return null;
      
      const packageDocRef = doc(db, "packages", id);
      const packageDoc = await getDoc(packageDocRef);
      
      if (!packageDoc.exists()) {
        return null;
      }
      
      const data = packageDoc.data();
      return {
        id: packageDoc.id,
        name: data.name || "",
        image: data.image || "",
        priceRange: data.priceRange || { min: 0, max: 0 },
        realPrice: data.realPrice,
        offerPrice: data.offerPrice,
        category: data.category || "",
        description: data.description || "",
        selectedBy: data.selectedBy || [],
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        ...data,
      };
    },
    enabled: !!id,
  });
}

