import type { User, InsertUser, ChatMessage, SavedItem, QuizResponse, Progress } from "@shared/schema";
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private quizResponses: Map<string, QuizResponse>;
  private chatMessages: Map<string, ChatMessage[]>;
  private savedItems: Map<string, SavedItem[]>;

  constructor() {
    this.users = new Map();
    this.quizResponses = new Map();
    this.chatMessages = new Map();
    this.savedItems = new Map();
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
}

export const storage = new MemStorage();
