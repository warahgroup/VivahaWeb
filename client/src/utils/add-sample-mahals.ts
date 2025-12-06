import { collection, addDoc } from "firebase/firestore";
import { db } from "@/firebase";

/**
 * Add 2 sample mock Mahals to Firestore
 * Run this once to populate sample data
 */
export async function addSampleMahals() {
  const sampleMahals = [
    {
      name: "Royal Wedding Palace",
      location: "Mumbai, Maharashtra",
      capacity: 500,
      priceRange: {
        min: 50000,
        max: 150000,
      },
      images: [
        "https://via.placeholder.com/800x600/FF6B6B/FFFFFF?text=Royal+Wedding+Palace+1",
        "https://via.placeholder.com/800x600/FFEAA7/000000?text=Royal+Wedding+Palace+2",
        "https://via.placeholder.com/800x600/FF6B6B/FFFFFF?text=Royal+Wedding+Palace+3",
      ],
      thumbnail: "https://via.placeholder.com/800x600/FF6B6B/FFFFFF?text=Royal+Wedding+Palace",
      parking: "Parking available for 200 cars",
      gasAvailability: true,
      electricityBackup: true,
      ledLightSet: true,
      description: "A magnificent wedding palace located in the heart of Mumbai. This elegant venue features spacious halls, modern amenities, and traditional Indian architecture. Perfect for grand celebrations with state-of-the-art facilities including LED lighting, backup power, and ample parking space.",
      createdAt: new Date().toISOString(),
    },
    {
      name: "Grand Celebration Hall",
      location: "Delhi, NCR",
      capacity: 800,
      priceRange: {
        min: 75000,
        max: 200000,
      },
      images: [
        "https://via.placeholder.com/800x600/FFEAA7/000000?text=Grand+Celebration+Hall+1",
        "https://via.placeholder.com/800x600/FF6B6B/FFFFFF?text=Grand+Celebration+Hall+2",
        "https://via.placeholder.com/800x600/FFEAA7/000000?text=Grand+Celebration+Hall+3",
      ],
      thumbnail: "https://via.placeholder.com/800x600/FFEAA7/000000?text=Grand+Celebration+Hall",
      parking: "Valet parking available for 300+ vehicles",
      gasAvailability: true,
      electricityBackup: true,
      ledLightSet: true,
      description: "An expansive wedding hall in Delhi NCR, ideal for large gatherings. Features include multiple function rooms, premium catering facilities, and luxurious decor. The venue offers complete wedding planning support with professional staff, modern sound systems, and climate control for year-round comfort.",
      createdAt: new Date().toISOString(),
    },
  ];

  try {
    const mahalsCollection = collection(db, "mahals");
    const results = [];

    for (const mahal of sampleMahals) {
      const docRef = await addDoc(mahalsCollection, mahal);
      results.push({ id: docRef.id, name: mahal.name });
      console.log(`Added mahal: ${mahal.name} (ID: ${docRef.id})`);
    }

    return {
      success: true,
      message: `Successfully added ${results.length} sample mahals`,
      mahals: results,
    };
  } catch (error) {
    console.error("Error adding sample mahals:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to add sample mahals",
      error,
    };
  }
}

