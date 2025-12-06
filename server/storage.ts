import type { User, InsertUser, ChatMessage, SavedItem, QuizResponse, Progress, Asset } from "@shared/schema";
import { randomUUID } from "crypto";

// Vivaha wedding planning app storage interface
export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Quiz responses
  saveQuizResponse(userId: string, quiz: QuizResponse): Promise<void>;
  getQuizResponse(userId: string): Promise<QuizResponse | undefined>;
  
  // Chat messages
  getChatMessages(userId: string): Promise<ChatMessage[]>;
  addChatMessage(userId: string, message: ChatMessage): Promise<ChatMessage>;
  
  // Saved items (notes, reminders, confirmed, archived)
  getSavedItems(userId: string, type?: SavedItem["type"]): Promise<SavedItem[]>;
  addSavedItem(userId: string, item: SavedItem): Promise<SavedItem>;
  updateSavedItem(userId: string, itemId: string, updates: Partial<SavedItem>): Promise<SavedItem | undefined>;
  deleteSavedItem(userId: string, itemId: string): Promise<boolean>;
  
  // Progress tracking
  getProgress(userId: string): Promise<Progress>;
  
  // Assets
  getAssets(filters: { type?: string; category?: string; keywords?: string; sort?: string; page?: number }): Promise<Asset[]>;
  getAsset(id: string): Promise<Asset | undefined>;
  markInterested(assetId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private quizResponses: Map<string, QuizResponse>;
  private chatMessages: Map<string, ChatMessage[]>;
  private savedItems: Map<string, SavedItem[]>;
  private assets: Map<string, Asset>;

  constructor() {
    this.users = new Map();
    this.quizResponses = new Map();
    this.chatMessages = new Map();
    this.savedItems = new Map();
    this.assets = new Map();
    // Initialize with sample assets for demo
    this.initializeSampleAssets();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      rememberMeExpiry: null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async saveQuizResponse(userId: string, quiz: QuizResponse): Promise<void> {
    this.quizResponses.set(userId, quiz);
  }

  async getQuizResponse(userId: string): Promise<QuizResponse | undefined> {
    return this.quizResponses.get(userId);
  }

  async getChatMessages(userId: string): Promise<ChatMessage[]> {
    return this.chatMessages.get(userId) || [];
  }

  async addChatMessage(userId: string, message: ChatMessage): Promise<ChatMessage> {
    const messages = this.chatMessages.get(userId) || [];
    messages.push(message);
    this.chatMessages.set(userId, messages);
    return message;
  }

  async getSavedItems(userId: string, type?: SavedItem["type"]): Promise<SavedItem[]> {
    const items = this.savedItems.get(userId) || [];
    if (type) {
      return items.filter(item => item.type === type);
    }
    return items;
  }

  async addSavedItem(userId: string, item: SavedItem): Promise<SavedItem> {
    const items = this.savedItems.get(userId) || [];
    items.push(item);
    this.savedItems.set(userId, items);
    return item;
  }

  async updateSavedItem(userId: string, itemId: string, updates: Partial<SavedItem>): Promise<SavedItem | undefined> {
    const items = this.savedItems.get(userId) || [];
    const index = items.findIndex(item => item.id === itemId);
    
    if (index === -1) {
      return undefined;
    }
    
    items[index] = { ...items[index], ...updates };
    this.savedItems.set(userId, items);
    return items[index];
  }

  async deleteSavedItem(userId: string, itemId: string): Promise<boolean> {
    const items = this.savedItems.get(userId) || [];
    const filtered = items.filter(item => item.id !== itemId);
    
    if (filtered.length === items.length) {
      return false;
    }
    
    this.savedItems.set(userId, filtered);
    return true;
  }

  async getProgress(userId: string): Promise<Progress> {
    const items = await this.getSavedItems(userId, "confirmed");
    const confirmedCount = items.length;
    const score = Math.min(100, confirmedCount * 10);
    
    return {
      score,
      confirmedCount,
    };
  }

  async getAssets(filters: { type?: string; category?: string; keywords?: string; sort?: string; page?: number }): Promise<Asset[]> {
    let assets = Array.from(this.assets.values());
    
    // Filter by type
    if (filters.type) {
      assets = assets.filter(asset => asset.type === filters.type);
    }
    
    // Filter by category
    if (filters.category) {
      assets = assets.filter(asset => asset.category === filters.category);
    }
    
    // Filter by keywords
    if (filters.keywords) {
      const keywordLower = filters.keywords.toLowerCase();
      assets = assets.filter(asset => 
        asset.keywords.some(k => k.toLowerCase().includes(keywordLower)) ||
        asset.description?.toLowerCase().includes(keywordLower)
      );
    }
    
    // Sort
    if (filters.sort === "latest") {
      assets.sort((a, b) => {
        const aTime = typeof a.createdAt === "string" ? new Date(a.createdAt).getTime() : a.createdAt;
        const bTime = typeof b.createdAt === "string" ? new Date(b.createdAt).getTime() : b.createdAt;
        return bTime - aTime;
      });
    } else if (filters.sort === "oldest") {
      assets.sort((a, b) => {
        const aTime = typeof a.createdAt === "string" ? new Date(a.createdAt).getTime() : a.createdAt;
        const bTime = typeof b.createdAt === "string" ? new Date(b.createdAt).getTime() : b.createdAt;
        return aTime - bTime;
      });
    } else if (filters.sort === "most_interested") {
      assets.sort((a, b) => b.interestedCount - a.interestedCount);
    }
    
    // Pagination
    const page = filters.page || 1;
    const pageSize = 20;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    return assets.slice(start, end);
  }

  async getAsset(id: string): Promise<Asset | undefined> {
    return this.assets.get(id);
  }

  async markInterested(assetId: string): Promise<void> {
    const asset = this.assets.get(assetId);
    if (asset) {
      asset.interestedCount = (asset.interestedCount || 0) + 1;
      this.assets.set(assetId, asset);
    }
  }

  private initializeSampleAssets(): void {
    // Sample assets for demo - in production these would come from Pinterest metadata
    const sampleAssets: Asset[] = [
      {
        id: "asset-1",
        type: "reel",
        url: "https://videos.pexels.com/video-files/2692066/2692066-uhd_2560_1440_25fps.mp4",
        thumbnail: "https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=640",
        description: "Royal Sangeet Night with live band and twinkling lights",
        category: "Entertainment",
        keywords: ["wedding", "sangeet", "music", "stage"],
        createdAt: Date.now() - 86400000, // 1 day ago
        interestedCount: 152,
      },
      {
        id: "asset-2",
        type: "reel",
        url: "https://videos.pexels.com/video-files/1448735/1448735-hd_1920_1080_24fps.mp4",
        thumbnail: "https://images.pexels.com/photos/1444443/pexels-photo-1444443.jpeg?auto=compress&cs=tinysrgb&w=640",
        description: "Antique Car Baraat with dhol and choreographed welcome",
        category: "Ceremony",
        keywords: ["wedding", "baraat", "entrance", "dance"],
        createdAt: Date.now() - 172800000, // 2 days ago
        interestedCount: 205,
      },
      {
        id: "asset-3",
        type: "reel",
        url: "https://videos.pexels.com/video-files/3042423/3042423-uhd_2560_1440_25fps.mp4",
        thumbnail: "https://images.pexels.com/photos/154147/pexels-photo-154147.jpeg?auto=compress&cs=tinysrgb&w=640",
        description: "Neon Cocktail Afterparty with LED dance floor",
        category: "Party",
        keywords: ["wedding", "cocktail", "fusion", "party", "lighting"],
        createdAt: Date.now() - 259200000, // 3 days ago
        interestedCount: 176,
      },
    ];
    
    sampleAssets.forEach(asset => {
      this.assets.set(asset.id, asset);
    });
  }
}

export const storage = new MemStorage();
