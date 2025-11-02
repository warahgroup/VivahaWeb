import { useState, useEffect, useRef } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase"; // Adjust path if needed (e.g., "../firebase")
import { useQueryClient } from "@tanstack/react-query";
import { ChatHeader } from "@/components/chat-header";
import { ChatTabs } from "@/components/chat-tabs";
import { ChatMessage } from "@/components/chat-message";
import { MessageContextMenu } from "@/components/message-context-menu";
import { SavedItemList } from "@/components/saved-item-list";
import { ProgressTracker } from "@/components/progress-tracker";
import { ReportPaywall } from "@/components/report-paywall";
import { OnboardingTour } from "@/components/onboarding-tour";
import { WelcomeForm } from "@/components/welcome-form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useChatMessages, useSendMessage } from "@/hooks/use-chat";
import { useSavedItems, useAddSavedItem, useDeleteSavedItem, useUpdateSavedItem } from "@/hooks/use-saved-items";
import { useQuizResponse } from "@/hooks/use-quiz";
import { useProgress } from "@/hooks/use-progress";
import { Send, Share2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChatMessage as ChatMessageType, SavedItem, QuizResponse } from "@shared/schema";
import { trackEvent } from "@/lib/analytics";

interface ChatPageProps {
  onLogout: () => void;
  userId: string;
}

export default function ChatPage({ onLogout, userId }: ChatPageProps) {
  const [activeTab, setActiveTab] = useState("chat");
  const [inputMessage, setInputMessage] = useState("");
  const [contextMenu, setContextMenu] = useState<{ messageId: string; x: number; y: number } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isWelcomeFormSubmitted, setIsWelcomeFormSubmitted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // React Query hooks
  const { data: messages = [], isLoading: messagesLoading } = useChatMessages(userId);
  const { data: savedItems = [], isLoading: itemsLoading } = useSavedItems(userId);
  const { data: quizData } = useQuizResponse(userId);
  const { data: progressData } = useProgress(userId);
  const sendMessageMutation = useSendMessage(userId);
  const addItemMutation = useAddSavedItem(userId);
  const deleteItemMutation = useDeleteSavedItem(userId);
  const updateItemMutation = useUpdateSavedItem(userId);

  const queryClient = useQueryClient();

  // Real-time listener for chat messages from Firestore
  useEffect(() => {
    if (!userId) return;

    const messagesCollection = collection(db, "users", userId, "chatMessages");
    const q = query(messagesCollection, orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const newMessages: ChatMessageType[] = [];
      querySnapshot.forEach((doc) => {
        newMessages.push({
          id: doc.id,
          ...doc.data(),
        } as ChatMessageType);
      });
      // Update React Query cache so useChatMessages hook reflects changes
      queryClient.setQueryData(["chatMessages", userId], newMessages);
    });

    return () => unsubscribe(); // Cleanup listener on unmount or userId change
  }, [userId, queryClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const onboardingComplete = localStorage.getItem("vivaha-onboarding-complete");
    if (!onboardingComplete) {
      setTimeout(() => setShowOnboarding(true), 1000);
    }
  }, []);

  const handleWelcomeFormSubmit = (name: string, phone: string, functionDate: string) => {
    // Format the date to be more readable
    const dateObj = new Date(functionDate);
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    // Create the message string
    const message = `My name is ${name}, my phone number is ${phone}, and my function date is ${formattedDate}.`;

    // Mark form as submitted
    setIsWelcomeFormSubmitted(true);

    // Optimistic UI: append the user's message immediately
    const optimisticMessage: ChatMessageType = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: message,
      timestamp: Date.now(),
    } as ChatMessageType;
    queryClient.setQueryData<ChatMessageType[] | undefined>(["chatMessages", userId], (old) => {
      const current = old || [];
      return [...current, optimisticMessage];
    });

    // Send to AI backend
    sendMessageMutation.mutate(
      { message, quizData: quizData || undefined },
      {
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Failed to send message",
            description: error.message || "Please try again.",
          });
          // Rollback optimistic message on error
          queryClient.setQueryData<ChatMessageType[] | undefined>(["chatMessages", userId], (old) => {
            const current = old || [];
            return current.filter((m) => !m.id.startsWith("temp-"));
          });
          // Reset form submission state on error
          setIsWelcomeFormSubmitted(false);
        },
      }
    );

    trackEvent("send", "chat", "welcome_form");
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Optimistic UI: append the user's message immediately so it doesn't disappear
    const optimisticMessage: ChatMessageType = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: inputMessage,
      timestamp: Date.now(),
    } as ChatMessageType;
    queryClient.setQueryData<ChatMessageType[] | undefined>(["chatMessages", userId], (old) => {
      const current = old || [];
      return [...current, optimisticMessage];
    });

    sendMessageMutation.mutate(
      { message: inputMessage, quizData: quizData || undefined },
      {
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Failed to send message",
            description: error.message || "Please try again.",
          });
          // Rollback optimistic message on error
          queryClient.setQueryData<ChatMessageType[] | undefined>(["chatMessages", userId], (old) => {
            const current = old || [];
            return current.filter((m) => !m.id.startsWith("temp-"));
          });
        },
      }
    );
    
    setInputMessage("");
    trackEvent("send", "chat", "message");
  };

  const handleContextMenuAction = (action: "note" | "reminder" | "confirmed" | "archived") => {
    if (!contextMenu) return;

    const message = messages.find((m) => m.id === contextMenu.messageId);
    if (!message) return;

    const newItem: SavedItem = {
      id: Date.now().toString(),
      type: action === "archived" ? "note" : action, // Archive saves as a note initially
      content: message.content,
      timestamp: Date.now(),
      originalMessageId: message.id,
    };

    addItemMutation.mutate(newItem, {
      onSuccess: () => {
        const labels = {
          note: "Note",
          reminder: "Reminder",
          confirmed: "Confirmed",
          archived: "Archived",
        };

        toast({
          title: `Saved as ${labels[action]}`,
          description: message.content.slice(0, 50) + "...",
        });

        trackEvent("save", action, "context_menu");
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Failed to save",
          description: error.message || "Please try again.",
        });
      },
    });

    setContextMenu(null);
  };

  const handleItemArchive = (itemId: string) => {
    const item = savedItems.find((i) => i.id === itemId);
    if (!item) return;

    updateItemMutation.mutate(
      { itemId, updates: { ...item, type: "archived" } },
      {
        onSuccess: () => {
          toast({ title: "Item archived" });
          trackEvent("archive", "item", item.type);
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Failed to archive",
            description: error.message || "Please try again.",
          });
        },
      }
    );
  };


  const handleItemDelete = (itemId: string) => {
    deleteItemMutation.mutate(itemId, {
      onSuccess: () => {
        toast({
          title: "Item deleted",
          description: "Successfully removed from your list.",
        });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Failed to delete",
          description: error.message || "Please try again.",
        });
      },
    });
  };

  const handleItemToggle = (itemId: string, completed: boolean) => {
    const item = savedItems.find((i) => i.id === itemId);
    if (!item) return;

    updateItemMutation.mutate(
      { itemId, updates: { ...item, completed } },
      {
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Failed to update",
            description: error.message || "Please try again.",
          });
        },
      }
    );
  };

  const handleShare = async () => {
    const shareText = `Check out Vivaha - Your AI Wedding Planning Assistant! Plan your dream Indian wedding with personalized recommendations.`;
    const shareUrl = window.location.origin;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Vivaha Wedding Planner",
          text: shareText,
          url: shareUrl,
        });
        trackEvent("share", "social", "web_share_api");
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          toast({
            variant: "destructive",
            title: "Failed to share",
            description: "Please try again.",
          });
        }
      }
    } else {
      alert("Sharing is only available on devices that support the Web Share API.");
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    trackEvent("click", "tab", tab);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem("vivaha-onboarding-complete", "true");
    trackEvent("complete", "onboarding", "tour");
  };

  // Filter saved items by type for current tab
  const getFilteredItems = (): SavedItem[] => {
    if (["chat", "report"].includes(activeTab)) return [];
    
    // Map tab names (plural) to item types (singular)
    const tabToTypeMap: Record<string, SavedItem["type"]> = {
      notes: "note",
      reminders: "reminder",
      confirmed: "confirmed",
    };
    
    const itemType = tabToTypeMap[activeTab];
    if (!itemType) return [];
    
    return savedItems.filter((item) => item.type === itemType && item.type !== "archived");
  };

  const confirmedItemsForProgress = savedItems
    .filter((item) => item.type === "confirmed")
    .map((item) => item.content);
    
  const notesForReport = savedItems
    .filter((item) => item.type === "note")
    .map((item) => item.content);

  const remindersForReport = savedItems
    .filter((item) => item.type === "reminder")
    .map((item) => item.content);

  const isSavedItemsTab = ["notes", "reminders", "confirmed"].includes(
    activeTab
  );


  // Loading state
  if (messagesLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your wedding plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh bg-background">
      <div className="flex flex-1 flex-col max-w-[110rem] mx-auto w-full">
        <ChatHeader onLogout={onLogout} />

        <div className="border-b" id="chat-tabs-container">
          <ChatTabs activeTab={activeTab} onTabChange={handleTabChange} />
        </div>

        <div
          className="flex-1 overflow-y-auto p-4 space-y-4 pb-28 sm:pb-32 lg:pb-6"
          id="chat-messages-container"
        >
          {activeTab === "chat" ? (
            <>
              {messages.length === 0 && !isWelcomeFormSubmitted ? (
                <WelcomeForm
                  onSubmit={handleWelcomeFormSubmit}
                  isSubmitting={sendMessageMutation.isPending}
                />
              ) : (
                messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}                    
                    onLongPress={(messageId, x, y) => setContextMenu({ messageId, x, y })}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </>
          ) : isSavedItemsTab ? (
            <SavedItemList
              items={getFilteredItems()}
              type={activeTab as "note" | "reminder" | "confirmed"}
              onDelete={handleItemDelete}
              onToggle={handleItemToggle}
              onArchive={handleItemArchive}
              onShare={handleShare}
            />
          ) : activeTab === "report" ? (
            <ReportPaywall
              notes={notesForReport}
              reminders={remindersForReport}
              confirmed={confirmedItemsForProgress}
            />
          ) : (
            null // Fallback for any unhandled activeTab (though all are covered)
          )}
        </div>

        {activeTab === "chat" && (
          <div
            className="sticky bottom-0 left-0 right-0 border-t p-3 sm:p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75"
            style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2"
            >
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about venues, vendors, budgets..."
                disabled={sendMessageMutation.isPending || (messages.length === 0 && !isWelcomeFormSubmitted)}
                data-testid="input-chat-message"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!inputMessage.trim() || sendMessageMutation.isPending || (messages.length === 0 && !isWelcomeFormSubmitted)}
                data-testid="button-send-message"
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        )}
      </div>

      <aside className="w-80 border-l bg-card/50 p-4 overflow-y-auto hidden lg:block">
        <ProgressTracker
          score={progressData?.score || 0}
          confirmedCount={progressData?.confirmedCount || 0}
          confirmedItems={confirmedItemsForProgress}
        />
      </aside>

      {contextMenu && (
        <MessageContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onAction={handleContextMenuAction}
        />
      )}

      {showOnboarding && (
        <OnboardingTour onComplete={handleOnboardingComplete} />
      )}
    </div>
  );
}