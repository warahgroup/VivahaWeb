export interface WeddingReel {
  id: string;
  name: string;
  title: string;
  description: string;
  type: "image" | "video";
  url: string;
  thumbnail: string;
  likes: number;
  views: number;
  saves: number;
  tags: string[];
  source: string;
  createdAt: string;
}

/**
 * Static catalog representing media available in cloud storage.
 * In production this would be hydrated from a storage API (e.g. Google Drive, S3).
 */
export const reelsCatalog: WeddingReel[] = [
  {
    id: "reel-heritage-sangeet-01",
    name: "royal-sangeet-night.mp4",
    title: "Royal Sangeet Night",
    description: "Live band, twinkling lights, and a royal stage setup for an unforgettable sangeet celebration.",
    type: "video",
    url: "https://videos.pexels.com/video-files/2692066/2692066-uhd_2560_1440_25fps.mp4",
    thumbnail: "https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=640",
    likes: 152,
    saves: 41,
    views: 3200,
    tags: ["wedding", "sangeet", "music", "stage", "entertainment"],
    source: "Vivaha Cloud › 2024 Jaipur Showcase",
    createdAt: "2024-03-18T09:00:00.000Z",
  },
  {
    id: "reel-traditional-mehndi-02",
    name: "intimate-mehndi-afternoon.jpg",
    title: "Intimate Mehndi Afternoon",
    description: "Pastel draping, jasmine florals, and individual artist stations for a relaxed mehndi ceremony.",
    type: "image",
    url: "https://images.pexels.com/photos/3014852/pexels-photo-3014852.jpeg?auto=compress&cs=tinysrgb&w=1200",
    thumbnail: "https://images.pexels.com/photos/3014852/pexels-photo-3014852.jpeg?auto=compress&cs=tinysrgb&w=480",
    likes: 98,
    saves: 55,
    views: 2640,
    tags: ["wedding", "mehndi", "henna", "floral", "daytime"],
    source: "Vivaha Cloud › Styled Shoot – Spring 2024",
    createdAt: "2024-04-02T14:20:00.000Z",
  },
  {
    id: "reel-destination-goa-03",
    name: "goa-sunset-varmala.jpg",
    title: "Goa Sunset Varmala",
    description: "Beachfront varmala moment with bohemian mandap, pampas florals, and sunset lighting.",
    type: "image",
    url: "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=1200",
    thumbnail: "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=480",
    likes: 184,
    saves: 72,
    views: 4120,
    tags: ["wedding", "destination", "beach", "varmala", "sunset"],
    source: "Vivaha Cloud › Destination Album – Goa 2023",
    createdAt: "2023-11-21T17:45:00.000Z",
  },
  {
    id: "reel-grand-baraat-04",
    name: "antique-car-baraat.mp4",
    title: "Antique Car Baraat",
    description: "Groom's arrival with dhol, antique convertible, and choreographed flash mob welcome.",
    type: "video",
    url: "https://videos.pexels.com/video-files/1448735/1448735-hd_1920_1080_24fps.mp4",
    thumbnail: "https://images.pexels.com/photos/1444443/pexels-photo-1444443.jpeg?auto=compress&cs=tinysrgb&w=640",
    likes: 205,
    saves: 63,
    views: 5325,
    tags: ["wedding", "baraat", "entrance", "dance", "music"],
    source: "Vivaha Cloud › Baraat Inspiration Vault",
    createdAt: "2024-06-05T07:30:00.000Z",
  },
  {
    id: "reel-luxury-decor-05",
    name: "lotus-mandap-install.jpg",
    title: "Lotus Mandap Install",
    description: "Ceiling full of lotus blooms, mirrored aisle, and cascading crystal chandeliers for mandap decor.",
    type: "image",
    url: "https://images.pexels.com/photos/1755325/pexels-photo-1755325.jpeg?auto=compress&cs=tinysrgb&w=1200",
    thumbnail: "https://images.pexels.com/photos/1755325/pexels-photo-1755325.jpeg?auto=compress&cs=tinysrgb&w=480",
    likes: 241,
    saves: 110,
    views: 6180,
    tags: ["wedding", "decor", "mandap", "floral", "luxury"],
    source: "Vivaha Cloud › Decor Lab",
    createdAt: "2024-05-11T12:00:00.000Z",
  },
  {
    id: "reel-budget-decor-06",
    name: "budget-friendly-haldi.jpg",
    title: "Budget-Friendly Haldi",
    description: "Turmeric backdrop with marigold hoops, brass urlis, and DIY seating for a vibrant haldi.",
    type: "image",
    url: "https://images.pexels.com/photos/2959192/pexels-photo-2959192.jpeg?auto=compress&cs=tinysrgb&w=1200",
    thumbnail: "https://images.pexels.com/photos/2959192/pexels-photo-2959192.jpeg?auto=compress&cs=tinysrgb&w=480",
    likes: 132,
    saves: 47,
    views: 2890,
    tags: ["wedding", "haldi", "budget", "decor", "marigold"],
    source: "Vivaha Cloud › Budget Playbook",
    createdAt: "2024-02-27T10:15:00.000Z",
  },
  {
    id: "reel-fusion-cocktail-07",
    name: "neon-cocktail-afterparty.mp4",
    title: "Neon Cocktail Afterparty",
    description: "Fusion cocktail party with neon signage, LED dance floor, and signature drinks bar.",
    type: "video",
    url: "https://videos.pexels.com/video-files/3042423/3042423-uhd_2560_1440_25fps.mp4",
    thumbnail: "https://images.pexels.com/photos/154147/pexels-photo-154147.jpeg?auto=compress&cs=tinysrgb&w=640",
    likes: 176,
    saves: 68,
    views: 3560,
    tags: ["wedding", "cocktail", "fusion", "party", "lighting"],
    source: "Vivaha Cloud › Fusion Wedding Diaries",
    createdAt: "2024-01-19T22:10:00.000Z",
  },
  {
    id: "reel-bridal-entry-08",
    name: "bridal-entry-phoolon-ki-chadar.jpg",
    title: "Bridal Entry with Phoolon ki Chadar",
    description: "Bridal walk-in under phoolon ki chadar with cold pyros and choreographed bridesmaids.",
    type: "image",
    url: "https://images.pexels.com/photos/2959197/pexels-photo-2959197.jpeg?auto=compress&cs=tinysrgb&w=1200",
    thumbnail: "https://images.pexels.com/photos/2959197/pexels-photo-2959197.jpeg?auto=compress&cs=tinysrgb&w=480",
    likes: 223,
    saves: 121,
    views: 6840,
    tags: ["wedding", "bridal entry", "family", "ceremony", "tradition"],
    source: "Vivaha Cloud › Signature Moments",
    createdAt: "2024-07-08T18:05:00.000Z",
  },
];


