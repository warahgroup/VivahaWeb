import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import type { 
  LoginRequest, 
  AuthResponse, 
  ChatRequest, 
  ChatResponse, 
  QuizResponse, 
  SavedItem 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password, rememberMe } = req.body as LoginRequest;
      
      let user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Auto-create user on first login (MVP behavior)
        user = await storage.createUser({ email, password });
      }
      
      // Simple password check (in production, use proper hashing)
      if (user.password !== password) {
        const response: AuthResponse = {
          success: false,
          message: "Invalid credentials",
        };
        return res.status(401).json(response);
      }
      
      // Update remember me expiry if requested
      if (rememberMe) {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 7);
        user.rememberMeExpiry = expiry;
      }
      
      const response: AuthResponse = {
        success: true,
        user: {
          id: user.id,
          email: user.email,
        },
      };
      
      res.json(response);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // Quiz routes
  app.post("/api/quiz", async (req, res) => {
    try {
      const { userId, quizData } = req.body as { userId: string; quizData: QuizResponse };
      await storage.saveQuizResponse(userId, quizData);
      res.json({ success: true });
    } catch (error) {
      console.error("Quiz save error:", error);
      res.status(500).json({ success: false, message: "Failed to save quiz" });
    }
  });

  app.get("/api/quiz/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const quiz = await storage.getQuizResponse(userId);
      res.json(quiz || null);
    } catch (error) {
      console.error("Quiz fetch error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch quiz" });
    }
  });

  // Chat routes
  app.get("/api/chat/messages/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      let messages = await storage.getChatMessages(userId);
      
      // Initialize with welcome message if empty
      if (messages.length === 0) {
        const quiz = await storage.getQuizResponse(userId);
        const welcomeContent = quiz
          ? `Welcome! I see you're planning a ${getQuizStyleText(quiz.style)} wedding. I'm excited to help you create your perfect celebration! What would you like to know?`
          : "Welcome to Vivaha Chat Bot! I'm here to help you plan your dream Indian wedding. How can I assist you today?";
        
        const welcomeMessage: import("@shared/schema").ChatMessage = {
          id: Date.now().toString(),
          sender: "bot",
          content: welcomeContent,
          timestamp: Date.now(),
        };
        
        await storage.addChatMessage(userId, welcomeMessage);
        messages = [welcomeMessage];
      }
      
      res.json(messages);
    } catch (error) {
      console.error("Chat fetch error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch messages" });
    }
  });

  app.post("/api/chat/message", async (req, res) => {
    try {
      const { userId, message, quizData } = req.body as { 
        userId: string; 
        message: string; 
        quizData?: QuizResponse 
      };
      
      // Store user message
      const userMessage: import("@shared/schema").ChatMessage = {
        id: Date.now().toString(),
        sender: "user",
        content: message,
        timestamp: Date.now(),
      };
      await storage.addChatMessage(userId, userMessage);
      
      // Generate and store bot response
      const botResponse = generateBotResponse(message, quizData);
      const botMessage: import("@shared/schema").ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        content: botResponse,
        timestamp: Date.now() + 500,
      };
      await storage.addChatMessage(userId, botMessage);
      
      const chatResponse: ChatResponse = {
        message: botMessage,
      };
      
      res.json(chatResponse);
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ success: false, message: "Failed to send message" });
    }
  });

  // Saved items routes
  app.get("/api/items/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { type } = req.query;
      
      const items = await storage.getSavedItems(
        userId, 
        type as SavedItem["type"] | undefined
      );
      
      res.json(items);
    } catch (error) {
      console.error("Items fetch error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch items" });
    }
  });

  app.post("/api/items/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const item = req.body as SavedItem;
      
      const saved = await storage.addSavedItem(userId, item);
      res.json(saved);
    } catch (error) {
      console.error("Item save error:", error);
      res.status(500).json({ success: false, message: "Failed to save item" });
    }
  });

  app.patch("/api/items/:userId/:itemId", async (req, res) => {
    try {
      const { userId, itemId } = req.params;
      const updates = req.body as Partial<SavedItem>;
      
      const updated = await storage.updateSavedItem(userId, itemId, updates);
      
      if (!updated) {
        return res.status(404).json({ success: false, message: "Item not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Item update error:", error);
      res.status(500).json({ success: false, message: "Failed to update item" });
    }
  });

  app.delete("/api/items/:userId/:itemId", async (req, res) => {
    try {
      const { userId, itemId } = req.params;
      const success = await storage.deleteSavedItem(userId, itemId);
      
      if (!success) {
        return res.status(404).json({ success: false, message: "Item not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Item delete error:", error);
      res.status(500).json({ success: false, message: "Failed to delete item" });
    }
  });

  // Progress routes
  app.get("/api/progress/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const progress = await storage.getProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Progress fetch error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch progress" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function for quiz style text
function getQuizStyleText(style: string): string {
  switch (style) {
    case "traditional":
      return "traditional ceremonies";
    case "fusion":
      return "fusion wedding with modern elements";
    case "destination":
      return "destination wedding at an exotic location";
    default:
      return "special";
  }
}

// Bot response generator based on keywords
function generateBotResponse(message: string, quizData?: QuizResponse): string {
  const lower = message.toLowerCase();

  // Budget-related
  if (lower.includes("budget") || lower.includes("cost") || lower.includes("price")) {
    return "The average Indian wedding costs around ₹20-25 lakhs. This typically breaks down as:\n• Catering: 40% (₹8-10L)\n• Decor & Venue: 20% (₹4-5L)\n• Photography: 15% (₹3L)\n• Outfits & Jewelry: 15% (₹3L)\n• Other: 10% (₹2L)\n\nWould you like a detailed breakdown for your budget range?";
  }

  // Venue-related
  if (lower.includes("venue") || lower.includes("location") || lower.includes("place")) {
    return quizData?.style === "destination"
      ? "For destination weddings, popular choices include Jaipur palaces, Goa beaches, Udaipur lake resorts, and Kerala backwaters. Each offers unique cultural experiences and can accommodate 200-500+ guests. Need specific venue recommendations?"
      : "Great venues for 200-500 guests include heritage hotels, banquet halls, farmhouses, and temple gardens. I can help you find venues in your preferred city. Which location are you considering?";
  }

  // Vendor-related
  if (lower.includes("vendor") || lower.includes("photographer") || lower.includes("caterer") || lower.includes("decorator")) {
    return "We have a curated network of trusted wedding vendors:\n• Photographers & Videographers\n• Caterers (North/South Indian cuisine specialists)\n• Decorators (traditional & modern themes)\n• Mehndi artists\n• DJs & Live bands\n• Makeup artists\n\nWhich vendors would you like recommendations for?";
  }

  // Timeline-related
  if (lower.includes("timeline") || lower.includes("when") || lower.includes("how long")) {
    return "The ideal wedding planning timeline is 6-8 months:\n• 6-8 months: Book venue & vendors\n• 4-5 months: Send invitations, finalize decor\n• 2-3 months: Menu tasting, outfit fittings\n• 1 month: Final confirmations & rehearsals\n• 1 week: Last-minute coordination\n\nWhere are you in this timeline?";
  }

  // Traditions-related
  if (lower.includes("tradition") || lower.includes("ceremony") || lower.includes("ritual") || lower.includes("mehndi") || lower.includes("haldi") || lower.includes("sangeet")) {
    return "Traditional Indian wedding ceremonies include:\n• Mehndi: Henna application with music & dancing\n• Haldi: Turmeric paste ceremony for blessing\n• Sangeet: Musical evening with performances\n• Wedding Day: Baraat, Varmala, Pheras, Vidaai\n\nWould you like detailed planning guidance for any ceremony?";
  }

  // Decor-related
  if (lower.includes("decor") || lower.includes("decoration") || lower.includes("theme") || lower.includes("flowers")) {
    return quizData?.style === "fusion"
      ? "For fusion weddings, trending themes blend traditional marigold garlands with modern LED installations, pastel color palettes with gold accents, and floral walls mixed with contemporary art. What's your color preference?"
      : "Popular decor elements include marigold garlands, floral mandaps, traditional rangoli, fairy lights, and hanging jasmine. Colors range from vibrant reds and golds to elegant pastels. What style resonates with you?";
  }

  // Default response
  return "That's a great question! I'm here to help with venue selection, vendor recommendations, budget planning, ceremony timelines, decor themes, and all aspects of Indian wedding planning. What specific area would you like guidance on?";
}
