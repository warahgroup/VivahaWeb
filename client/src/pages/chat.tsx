import { useState, useEffect, useRef } from "react";
import { ChatHeader } from "@/components/chat-header";
import { ChatTabs } from "@/components/chat-tabs";
import { ChatMessage } from "@/components/chat-message";
import { MessageContextMenu } from "@/components/message-context-menu";
import { SavedItemList } from "@/components/saved-item-list";
import { ProgressTracker } from "@/components/progress-tracker";
import { ReportPaywall } from "@/components/report-paywall";
import { OnboardingTour } from "@/components/onboarding-tour";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Send, Share2 } from "lucide-react";
import type { ChatMessage as ChatMessageType, SavedItem, QuizResponse } from "@shared/schema";
import { trackEvent } from "@/lib/analytics";

interface ChatPageProps {
  onLogout: () => void;
  userId: string;
}

export default function ChatPage({ onLogout, userId }: ChatPageProps) {
  const [activeTab, setActiveTab] = useState("chat");
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [contextMenu, setContextMenu] = useState<{ messageId: string; x: number; y: number } | null>(null);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved data
    const stored = localStorage.getItem("vivaha-chat-messages");
    if (stored) {
      setMessages(JSON.parse(stored));
    } else {
      // Initialize with welcome message
      const quizData = localStorage.getItem("vivaha-quiz");
      const welcomeMessage = getWelcomeMessage(quizData ? JSON.parse(quizData) : null);
      setMessages([welcomeMessage]);
    }

    const storedItems = localStorage.getItem("vivaha-saved-items");
    if (storedItems) {
      setSavedItems(JSON.parse(storedItems));
    }

    // Check if onboarding needed
    const onboardingComplete = localStorage.getItem("vivaha-onboarding-complete");
    if (!onboardingComplete) {
      setTimeout(() => setShowOnboarding(true), 1000);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getWelcomeMessage = (quizData: QuizResponse | null): ChatMessageType => {
    let content = "Welcome to Vivaha Chat Bot! I'm here to help you plan your dream Indian wedding. How can I assist you today?";
    
    if (quizData) {
      const styleText = quizData.style === "traditional" ? "traditional ceremonies" :
                       quizData.style === "fusion" ? "fusion wedding with modern elements" :
                       "destination wedding at an exotic location";
      content = `Welcome! I see you're planning a ${styleText}. I'm excited to help you create your perfect celebration! What would you like to know?`;
    }

    return {
      id: Date.now().toString(),
      sender: "bot",
      content,
      timestamp: Date.now(),
    };
  };

  const getBotResponse = (userMessage: string): string => {
    const lower = userMessage.toLowerCase();
    const quizData = localStorage.getItem("vivaha-quiz");
    const quiz: QuizResponse | null = quizData ? JSON.parse(quizData) : null;

    // Budget-related
    if (lower.includes("budget") || lower.includes("cost") || lower.includes("price")) {
      return "The average Indian wedding costs around ₹20-25 lakhs. This typically breaks down as:\n• Catering: 40% (₹8-10L)\n• Decor & Venue: 20% (₹4-5L)\n• Photography: 15% (₹3L)\n• Outfits & Jewelry: 15% (₹3L)\n• Other: 10% (₹2L)\n\nWould you like a detailed breakdown for your budget range?";
    }

    // Venue-related
    if (lower.includes("venue") || lower.includes("location") || lower.includes("place")) {
      return quiz?.style === "destination"
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
      return quiz?.style === "fusion"
        ? "For fusion weddings, trending themes blend traditional marigold garlands with modern LED installations, pastel color palettes with gold accents, and floral walls mixed with contemporary art. What's your color preference?"
        : "Popular decor elements include marigold garlands, floral mandaps, traditional rangoli, fairy lights, and hanging jasmine. Colors range from vibrant reds and golds to elegant pastels. What style resonates with you?";
    }

    // Default response
    return "That's a great question! I'm here to help with venue selection, vendor recommendations, budget planning, ceremony timelines, decor themes, and all aspects of Indian wedding planning. What specific area would you like guidance on?";
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      sender: "user",
      content: inputMessage,
      timestamp: Date.now(),
    };

    const botMessage: ChatMessageType = {
      id: (Date.now() + 1).toString(),
      sender: "bot",
      content: getBotResponse(inputMessage),
      timestamp: Date.now() + 500,
    };

    const newMessages = [...messages, userMessage, botMessage];
    setMessages(newMessages);
    localStorage.setItem("vivaha-chat-messages", JSON.stringify(newMessages));
    
    setInputMessage("");
    trackEvent("send", "chat", "message");
  };

  const handleContextMenuAction = (action: "note" | "reminder" | "confirmed" | "archive") => {
    if (!contextMenu) return;

    const message = messages.find((m) => m.id === contextMenu.messageId);
    if (!message) return;

    const newItem: SavedItem = {
      id: Date.now().toString(),
      type: action,
      content: message.content,
      timestamp: Date.now(),
      originalMessageId: message.id,
    };

    const updated = [...savedItems, newItem];
    setSavedItems(updated);
    localStorage.setItem("vivaha-saved-items", JSON.stringify(updated));

    const labels = {
      note: "Note",
      reminder: "Reminder",
      confirmed: "Confirmed",
      archive: "Archive",
    };

    toast({
      title: `Saved as ${labels[action]}`,
      description: message.content.slice(0, 50) + "...",
    });

    trackEvent("save", "chat", action);
    setContextMenu(null);
  };

  const handleDeleteItem = (id: string) => {
    const updated = savedItems.filter((item) => item.id !== id);
    setSavedItems(updated);
    localStorage.setItem("vivaha-saved-items", JSON.stringify(updated));
    toast({ title: "Item deleted" });
  };

  const handleArchiveItem = (id: string) => {
    const updated = savedItems.map((item) =>
      item.id === id ? { ...item, type: "archived" as const } : item
    );
    setSavedItems(updated);
    localStorage.setItem("vivaha-saved-items", JSON.stringify(updated));
    toast({ title: "Item archived" });
  };

  const handleShare = async (type: "note" | "reminder" | "confirmed") => {
    const items = savedItems.filter((item) => item.type === type);
    const text = `My ${type}s:\n\n${items.map((item, i) => `${i + 1}. ${item.content}`).join("\n")}`;

    if (navigator.share) {
      try {
        await navigator.share({ text });
        trackEvent("share", "list", type);
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(text);
      toast({ title: "Copied to clipboard" });
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    trackEvent("click", "tab", tab);
  };

  const notes = savedItems.filter((item) => item.type === "note");
  const reminders = savedItems.filter((item) => item.type === "reminder");
  const confirmed = savedItems.filter((item) => item.type === "confirmed");
  const score = Math.min(100, confirmed.length * 10);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ChatHeader onLogout={onLogout} />
      <ChatTabs activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-6 h-full flex gap-6">
          <div className="flex-1 flex flex-col min-w-0">
            {activeTab === "chat" && (
              <>
                <div
                  className="flex-1 overflow-y-auto mb-4 space-y-4"
                  data-testid="chat-container"
                >
                  {messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      onLongPress={(id, x, y) => setContextMenu({ messageId: id, x, y })}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    data-testid="input-chat-message"
                  />
                  <Button
                    onClick={handleSendMessage}
                    data-testid="button-send-message"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}

            {activeTab === "notes" && (
              <SavedItemList
                items={notes}
                type="note"
                onDelete={handleDeleteItem}
                onArchive={handleArchiveItem}
                onShare={() => handleShare("note")}
              />
            )}

            {activeTab === "reminders" && (
              <SavedItemList
                items={reminders}
                type="reminder"
                onDelete={handleDeleteItem}
                onArchive={handleArchiveItem}
                onShare={() => handleShare("reminder")}
              />
            )}

            {activeTab === "confirmed" && (
              <SavedItemList
                items={confirmed}
                type="confirmed"
                onDelete={handleDeleteItem}
                onArchive={handleArchiveItem}
                onShare={() => handleShare("confirmed")}
              />
            )}

            {activeTab === "report" && (
              <ReportPaywall
                notes={notes.map((n) => n.content)}
                reminders={reminders.map((r) => r.content)}
                confirmed={confirmed.map((c) => c.content)}
              />
            )}
          </div>

          <div className="hidden lg:block w-80">
            <ProgressTracker score={score} confirmedItems={confirmed.map((c) => c.content)} />
          </div>
        </div>
      </div>

      {contextMenu && (
        <MessageContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onAction={handleContextMenuAction}
        />
      )}

      {showOnboarding && (
        <OnboardingTour onComplete={() => setShowOnboarding(false)} />
      )}
    </div>
  );
}
