import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  rememberMeExpiry: timestamp("remember_me_expiry"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Quiz responses schema
export const quizResponseSchema = z.object({
  style: z.enum(["traditional", "fusion", "destination"]),
  budget: z.enum(["under15L", "15to25L", "over25L"]),
  guestCount: z.enum(["under100", "100to300", "over300"]),
});

export type QuizResponse = z.infer<typeof quizResponseSchema>;

// Chat message schema (use 'role' to align with client and Firestore)
export const chatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.number(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

// Saved item schema (for Notes, Reminders, Confirmed)
export const savedItemSchema = z.object({
  id: z.string(),
  type: z.enum(["note", "reminder", "confirmed", "archived"]),
  content: z.string(),
  timestamp: z.number(),
  originalMessageId: z.string().optional(),
});

export type SavedItem = z.infer<typeof savedItemSchema>;

// Authentication request/response schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  rememberMe: z.boolean().optional(),
});

export type LoginRequest = z.infer<typeof loginSchema>;

export const authResponseSchema = z.object({
  success: z.boolean(),
  user: z.object({
    id: z.string(),
    email: z.string(),
  }).optional(),
  message: z.string().optional(),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;

// Chat request/response schemas
export const chatRequestSchema = z.object({
  message: z.string(),
  quizData: quizResponseSchema.optional(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

export const chatResponseSchema = z.object({
  message: chatMessageSchema,
});

export type ChatResponse = z.infer<typeof chatResponseSchema>;

// Progress tracking
export const progressSchema = z.object({
  score: z.number().min(0).max(100),
  confirmedCount: z.number(),
});

export type Progress = z.infer<typeof progressSchema>;
