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
import { useChatMessages, useSendMessage } from "@/hooks/use-chat";
import { useSavedItems, useAddSavedItem, useDeleteSavedItem, useUpdateSavedItem } from "@/hooks/use-saved-items";
import { useQuizResponse } from "@/hooks/use-quiz";
import { useProgress } from "@/hooks/use-progress";
import { Send, Share2, Loader2 } from "lucide-react";
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
  const [showPaywall, setShowPaywall] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const onboardingComplete = localStorage.getItem("vivaha-onboarding-complete");
    if (!onboardingComplete) {
      setTimeout(() => setShowOnboarding(true), 1000);
    }
  }, []);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    sendMessageMutation.mutate(
      { message: inputMessage, quizData: quizData || undefined },
      {
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Failed to send message",
            description: error.message || "Please try again.",
          });
        },
      }
    );
    
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

    addItemMutation.mutate(newItem, {
      onSuccess: () => {
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
      setShareDialogOpen(true);
    }
  };

  const handleReportClick = () => {
    setShowPaywall(true);
    trackEvent("click", "report", "view_paywall");
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
    if (activeTab === "chat") return [];
    return savedItems.filter((item) => item.type === activeTab);
  };

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
    <div className="flex h-screen bg-background">
      <div className="flex flex-1 flex-col">
        <ChatHeader
          onLogout={onLogout}
          onShare={handleShare}
          onReportClick={handleReportClick}
        />

        <div className="border-b" id="chat-tabs-container">
          <ChatTabs activeTab={activeTab} onTabChange={handleTabChange} />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4" id="chat-messages-container">
          {activeTab === "chat" ? (
            <>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-lg text-muted-foreground mb-2">Start planning your dream wedding!</p>
                  <p className="text-sm text-muted-foreground">Ask me anything about venues, vendors, budgets, or traditions.</p>
                </div>
              ) : (
                messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onLongPress={(e) => {
                      setContextMenu({
                        messageId: message.id,
                        x: e.clientX,
                        y: e.clientY,
                      });
                    }}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <SavedItemList
              items={getFilteredItems()}
              onDelete={handleItemDelete}
              onToggle={handleItemToggle}
              isLoading={itemsLoading}
            />
          )}
        </div>

        {activeTab === "chat" && (
          <div className="border-t p-4">
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
                disabled={sendMessageMutation.isPending}
                data-testid="input-chat-message"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!inputMessage.trim() || sendMessageMutation.isPending}
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

      {showPaywall && (
        <ReportPaywall
          open={showPaywall}
          onOpenChange={setShowPaywall}
        />
      )}
    </div>
  );
}
