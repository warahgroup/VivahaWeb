import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase"; // Adjust path if needed (e.g., "../firebase")
import { useQueryClient } from "@tanstack/react-query";
import { ChatHeader } from "@/components/chat-header";
import { ChatTabs } from "@/components/chat-tabs";
import { ChatMessage } from "@/components/chat-message";
import { MessageContextMenu } from "@/components/message-context-menu";
import { SavedItemList } from "@/components/saved-item-list";
import { ReportPaywall } from "@/components/report-paywall";
import { OnboardingTour } from "@/components/onboarding-tour";
import { WelcomeForm } from "@/components/welcome-form";
import { SmartSuggestions } from "@/components/smart-suggestions";
import { TypingIndicator } from "@/components/typing-indicator";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useChatMessages, useSendMessage } from "@/hooks/use-chat";
import { useSavedItems, useAddSavedItem, useDeleteSavedItem, useUpdateSavedItem } from "@/hooks/use-saved-items";
import { useQuizResponse } from "@/hooks/use-quiz";
import { useSpellCorrection } from "@/hooks/use-spell-correction";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChatMessage as ChatMessageType, SavedItem, QuizResponse } from "@shared/schema";
import { trackEvent } from "@/lib/analytics";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWeddingReels } from "@/hooks/use-reels";
import { useRealtimeReels } from "@/hooks/use-reels-source";
import { WeddingReelsSidebar } from "@/components/reels/wedding-reels-sidebar";
import { MobileReelsExperience } from "@/components/reels/mobile-reels-experience";
import { WeddingReelsPanel } from "@/components/reels/wedding-reels-panel";
import { VivahaPulsePanel } from "@/components/vivaha-pulse-panel";
import { TikTokReelsFeed } from "@/components/reels/tiktok-reels-feed";
import { useMarkInterested } from "@/hooks/use-assets";

type ReelActionType = "reel_like" | "reel_save" | "reel_album" | "reel_wishlist";

interface OfflineAction {
  id: string;
  reelId: string;
  type: ReelActionType;
  operation: "add" | "delete";
  payload: SavedItem;
  clientId?: string;
}

const OFFLINE_QUEUE_KEY = "vivaha-reel-action-queue";

function loadOfflineQueue(): OfflineAction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? (JSON.parse(raw) as OfflineAction[]) : [];
  } catch {
    return [];
  }
}

function persistOfflineQueue(queue: OfflineAction[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // ignore quota errors
  }
}

interface ChatPageProps {
  onLogout: () => void;
  userId: string;
}

export default function ChatPage({ onLogout, userId }: ChatPageProps) {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("chat");
  const [inputMessage, setInputMessage] = useState("");
  const [contextMenu, setContextMenu] = useState<{ messageId: string; x: number; y: number } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isWelcomeFormSubmitted, setIsWelcomeFormSubmitted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { correctText } = useSpellCorrection();
  const [keywords, setKeywords] = useState<string[]>(["wedding"]);

  // React Query hooks
  const { data: messages = [], isLoading: messagesLoading } = useChatMessages(userId);
  const { data: savedItems = [] } = useSavedItems(userId);
  const { data: quizData } = useQuizResponse(userId);
  const sendMessageMutation = useSendMessage(userId);
  const addItemMutation = useAddSavedItem(userId);
  const deleteItemMutation = useDeleteSavedItem(userId);
  const updateItemMutation = useUpdateSavedItem(userId);

  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const { reels: realtimeReels, isLive: reelsLive, lastUpdated: reelsLastUpdated } = useRealtimeReels();
  const markInterestedMutation = useMarkInterested();
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [offlineQueue, setOfflineQueue] = useState<OfflineAction[]>(() => loadOfflineQueue());

  const updateOfflineQueue = useCallback((updater: (prev: OfflineAction[]) => OfflineAction[]) => {
    setOfflineQueue((prev) => {
      const next = updater(prev);
      persistOfflineQueue(next);
      return next;
    });
  }, []);

  const updateSavedItemsCache = useCallback(
    (updater: (items: SavedItem[]) => SavedItem[]) => {
      queryClient.setQueryData<SavedItem[]>(["savedItems", userId], (prev = []) => updater(prev));
    },
    [queryClient, userId]
  );
  const handleTagSelect = useCallback((tag: string) => {
    setActiveTags((prev) => {
      const exists = prev.includes(tag);
      if (exists) {
        return prev.filter((item) => item !== tag);
      }
      return [tag, ...prev].slice(0, 3);
    });
    trackEvent("click", "reel_tag", tag);
  }, []);

  const flushOfflineQueue = useCallback(async () => {
    if (typeof navigator !== "undefined" && !navigator.onLine) return;
    if (!offlineQueue.length) return;

    for (const action of offlineQueue) {
      try {
        if (action.operation === "add") {
          const result = await addItemMutation.mutateAsync(action.payload);
          updateSavedItemsCache((prev) =>
            prev.map((item) =>
              item.id === (action.clientId ?? action.payload.id) ? result : item
            )
          );
          trackEvent("sync", action.type, action.reelId);
        } else {
          await deleteItemMutation.mutateAsync(action.payload.id);
          updateSavedItemsCache((prev) =>
            prev.filter(
              (item) => item.id !== action.payload.id && item.id !== action.clientId
            )
          );
          trackEvent("sync_delete", action.type, action.reelId);
        }
        updateOfflineQueue((prev) => prev.filter((item) => item.id !== action.id));
      } catch (error) {
        console.error("Offline sync failed", error);
        toast({
          variant: "destructive",
          title: "Sync failed",
          description: "We'll retry when the connection improves.",
        });
        break;
      }
    }
  }, [
    offlineQueue,
    addItemMutation,
    deleteItemMutation,
    updateOfflineQueue,
    updateSavedItemsCache,
    toast,
  ]);

  useEffect(() => {
    if (!offlineQueue.length) return;
    void flushOfflineQueue();
  }, [offlineQueue, flushOfflineQueue]);

  useEffect(() => {
    const handleOnline = () => {
      void flushOfflineQueue();
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [flushOfflineQueue]);

  const reelLikeItems = useMemo(
    () => savedItems.filter((item) => item.type === "reel_like"),
    [savedItems]
  );

  const reelSaveItems = useMemo(
    () => savedItems.filter((item) => item.type === "reel_save"),
    [savedItems]
  );

  const latestMessage = useMemo(
    () => (messages.length > 0 ? messages[messages.length - 1] : null),
    [messages]
  );

  useEffect(() => {
    if (!latestMessage || typeof latestMessage.content !== "string") return;
    const words = latestMessage.content
      .split(/\s+/)
      .filter((word) => word.length > 3)
      .slice(-5);
    if (words.length > 0) {
      setKeywords(words);
    }
  }, [latestMessage]);

  const likedReelIdsFromStore = useMemo(
    () =>
      new Set(
        reelLikeItems.map((item) => item.reelId ?? item.content)
      ),
    [reelLikeItems]
  );

  const savedReelIdsFromStore = useMemo(
    () =>
      new Set(
        reelSaveItems.map((item) => item.reelId ?? item.content)
      ),
    [reelSaveItems]
  );

  const reelAlbumItems = useMemo(
    () => savedItems.filter((item) => item.type === "reel_album"),
    [savedItems]
  );

  const reelWishlistItems = useMemo(
    () => savedItems.filter((item) => item.type === "reel_wishlist"),
    [savedItems]
  );

  const {
    reels,
    keywords: reelKeywords,
    interactions: reelInteractions,
    toggleLike: toggleReelLikeLocal,
    toggleSave: toggleReelSaveLocal,
    markViewed: markReelViewed,
    analytics: reelAnalytics,
    suggestedTags,
  } = useWeddingReels({
    messages,
    limit: isMobile ? 8 : 10,
    likedIds: likedReelIdsFromStore,
    savedIds: savedReelIdsFromStore,
    reels: realtimeReels,
    boostTags: activeTags,
  });

  const likedReelIds = useMemo(
    () =>
      new Set(
        Object.entries(reelInteractions)
          .filter(([, value]) => value.liked)
          .map(([reelId]) => reelId)
      ),
    [reelInteractions]
  );

  const savedReelIds = useMemo(
    () =>
      new Set(
        Object.entries(reelInteractions)
          .filter(([, value]) => value.saved)
          .map(([reelId]) => reelId)
      ),
    [reelInteractions]
  );

  const reelById = useMemo(() => new Map(realtimeReels.map((reel) => [reel.id, reel])), [realtimeReels]);

  const upsertReelItem = (
    reelId: string,
    type: ReelActionType,
    existingItem?: SavedItem,
    overrides: Partial<SavedItem> = {}
  ) => {
    const reel = reelById.get(reelId);
    if (!reel) return;

    const isOnline = typeof navigator === "undefined" ? true : navigator.onLine;

    if (existingItem) {
      updateSavedItemsCache((prev) => prev.filter((item) => item.id !== existingItem.id));

      if (!isOnline) {
        updateOfflineQueue((prev) => [
          ...prev,
          {
            id: crypto.randomUUID ? crypto.randomUUID() : `queue-${existingItem.id}`,
            reelId,
            type: existingItem.type as ReelActionType,
            operation: "delete",
            payload: existingItem,
            clientId: existingItem.id,
          },
        ]);
        toast({
          title: "Queued for sync",
          description: "We'll update this like/save once you're back online.",
        });
        return;
      }

      deleteItemMutation.mutate(existingItem.id, {
        onSuccess: () => {
          trackEvent("delete", type, reelId);
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Failed to update",
            description: error.message || "Please try again.",
          });
          updateSavedItemsCache((prev) => [...prev, existingItem]);
        },
      });
      return;
    }

    const timestamp = Date.now();
    const clientId = `temp-${timestamp}-${reelId}`;
    const baseItem: SavedItem = {
      id: clientId,
      type,
      content: overrides.content ?? reel.name,
      timestamp,
      reelId,
      ...overrides,
    };

    updateSavedItemsCache((prev) => [...prev.filter((item) => item.id !== clientId), baseItem]);

    if (!isOnline) {
      updateOfflineQueue((prev) => [
        ...prev,
        {
          id: crypto.randomUUID ? crypto.randomUUID() : `${clientId}-queue`,
          reelId,
          type,
          operation: "add",
          payload: baseItem,
          clientId,
        },
      ]);
      toast({
        title: "Saved offline",
        description: "We'll sync this once your connection returns.",
      });
      return;
    }

    addItemMutation.mutate(baseItem, {
      onSuccess: (result) => {
        trackEvent("save", type, reelId);
        updateSavedItemsCache((prev) =>
          prev.map((item) => (item.id === clientId ? result : item))
        );
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Failed to update",
          description: error.message || "Please try again.",
        });
        updateSavedItemsCache((prev) => prev.filter((item) => item.id !== clientId));
      },
    });
  };

  const handleReelLike = (reelId: string) => {
    toggleReelLikeLocal(reelId);
    const existing = reelLikeItems.find(
      (item) => (item.reelId ?? item.content) === reelId
    );
    upsertReelItem(reelId, "reel_like", existing);
  };

  const handleReelSave = (reelId: string) => {
    toggleReelSaveLocal(reelId);
    const existing = reelSaveItems.find(
      (item) => (item.reelId ?? item.content) === reelId
    );
    upsertReelItem(reelId, "reel_save", existing);
  };

  const handleAddToAlbum = (reelId: string) => {
    const existing = reelAlbumItems.find(
      (item) => (item.reelId ?? item.content) === reelId
    );
    if (existing) {
      toast({
        title: "Already in My Album",
        description: "This reel is already part of your album collection.",
      });
      return;
    }
    upsertReelItem(reelId, "reel_album");
    if (typeof navigator === "undefined" || navigator.onLine) {
      toast({
        title: "Added to My Album",
        description: "Find it anytime in your saved reels.",
      });
    }
  };

  const handleAddToWishlist = (reelId: string) => {
    const existing = reelWishlistItems.find(
      (item) => (item.reelId ?? item.content) === reelId
    );
    if (existing) {
      toast({
        title: "Already on your Wishlist",
        description: "This reel is already in your wishlist.",
      });
      return;
    }
    upsertReelItem(reelId, "reel_wishlist");
    if (typeof navigator === "undefined" || navigator.onLine) {
      toast({
        title: "Wishlist updated",
        description: "Saved this reel to revisit later.",
      });
    }
  };

  const handleReelShare = async (reelId: string) => {
    const reel = reelById.get(reelId);
    if (!reel) return;

    const shareTitle = `Vivaha Wedding Reel · ${reel.title}`;
    const shareText = `${reel.description}\n\nTags: ${reel.tags
      .map((tag) => `#${tag}`)
      .join(" ")}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: reel.url,
        });
        trackEvent("share", "reel", reelId);
        toast({
          title: "Reel shared",
          description: "Sent via native share sheet.",
        });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(reel.url);
      trackEvent("copy", "reel_share", reelId);
      toast({
        title: "Link copied",
        description: "Reel URL copied to clipboard.",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Share failed",
        description: "Unable to copy reel link. Please try again.",
      });
    }
  };

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

  const handleSendMessage = (messageToSend?: string) => {
    const message = messageToSend || inputMessage;
    if (!message.trim()) return;

    // Optimistic UI: append the user's message immediately so it doesn't disappear
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

    sendMessageMutation.mutate(
      { message: message, quizData: quizData || undefined },
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

  const handleSuggestionClick = (suggestion: string) => {
    // Only fill the input field with the suggestion, don't auto-send
    setInputMessage(suggestion);
    // Focus the input after setting the value (optional, for better UX)
    setTimeout(() => {
      const input = document.querySelector('[data-testid="input-chat-message"]') as HTMLInputElement;
      if (input) {
        input.focus();
        // Move cursor to end of text
        input.setSelectionRange(suggestion.length, suggestion.length);
      }
    }, 0);
  };

  // Calculate message count (only user messages)
  const userMessageCount = messages.filter(m => m.role === "user").length;

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
    if (tab === "package") {
      // Navigate to packages page
      setLocation("/packages");
      trackEvent("click", "tab", "package");
      return;
    }
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
    if (["chat", "report", "reels"].includes(activeTab)) return [];
    
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

  const confirmedItemsForReport = savedItems
    .filter((item) => item.type === "confirmed")
    .map((item) => item.content);

  const confirmedCount = confirmedItemsForReport.length;
  const progressScore = Math.min(100, confirmedCount * 10);

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
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="flex w-full flex-1 flex-col overflow-hidden">
        <ChatHeader onLogout={onLogout} />

        <div className="border-b" id="chat-tabs-container">
          <ChatTabs activeTab={activeTab} onTabChange={handleTabChange} />
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className={`flex flex-1 flex-col overflow-hidden ${activeTab === "reels" ? "bg-black" : "bg-gray-100 dark:bg-black"}`}>
            <div
              className={`flex-1 overflow-y-auto ${
                activeTab === "reels" ? "" : "px-4 py-4 sm:px-6 sm:py-6 bg-gray-100 dark:bg-black"
              }`}
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
                    <>
                      {messages.map((message) => (
                        <ChatMessage
                          key={message.id}
                          message={message}
                          onLongPress={(messageId, x, y) => setContextMenu({ messageId, x, y })}
                        />
                      ))}
                      {/* Show typing indicator when AI is responding */}
                      {sendMessageMutation.isPending && <TypingIndicator />}
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </>
              ) : activeTab === "reels" ? (
                <TikTokReelsFeed
                  userId={userId}
                  onInterested={(assetId) => {
                    markInterestedMutation.mutate(assetId);
                    toast({
                      title: "Marked as interested",
                      description: "This reel has been saved to your interested list.",
                    });
                  }}
                  onMoreInfo={(assetId) => {
                    window.location.href = `/assets/${assetId}`;
                  }}
                  onShare={async (assetId) => {
                    try {
                      const shareUrl = `${window.location.origin}/assets/${assetId}`;
                      if (navigator.share) {
                        await navigator.share({
                          title: "Check out this wedding reel",
                          url: shareUrl,
                        });
                      } else {
                        await navigator.clipboard.writeText(shareUrl);
                        toast({
                          title: "Link copied",
                          description: "Share link copied to clipboard.",
                        });
                      }
                    } catch (error) {
                      console.error("Share failed:", error);
                    }
                  }}
                />
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
                  confirmed={confirmedItemsForReport}
                />
              ) : (
                null // Fallback for any unhandled activeTab (though all are covered)
              )}
            </div>

            {activeTab === "chat" && (
              <div
                className="flex-shrink-0 border-t bg-background px-3 pb-3 pt-3 sm:px-4 sm:pt-4"
                style={{
                  paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.5rem)",
                  boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.1)",
                }}
              >
                {/* Smart Suggestions */}
                <SmartSuggestions
                  inputText={inputMessage}
                  messageCount={userMessageCount}
                  onSuggestionClick={handleSuggestionClick}
                />
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={inputMessage}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      // Apply spell correction in real-time
                      const corrected = correctText(inputValue);
                      setInputMessage(corrected);
                    }}
                    placeholder="Ask about venues, vendors, budgets..."
                    disabled={
                      sendMessageMutation.isPending ||
                      (messages.length === 0 && !isWelcomeFormSubmitted)
                    }
                    data-testid="input-chat-message"
                    className="rounded-full border-gray-300 dark:border-gray-700 bg-background"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={
                      !inputMessage.trim() ||
                      sendMessageMutation.isPending ||
                      (messages.length === 0 && !isWelcomeFormSubmitted)
                    }
                    data-testid="button-send-message"
                    className="flex-shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
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

          {activeTab === "chat" && (
            <VivahaPulsePanel
              progressScore={progressScore}
              confirmedCount={confirmedCount}
            />
          )}

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
        <OnboardingTour onComplete={handleOnboardingComplete} />
      )}

      {activeTab === "reels" && isMobile && (
        <MobileReelsExperience
          reels={reels}
          likedIds={likedReelIds}
          savedIds={savedReelIds}
          onLike={handleReelLike}
          onSave={handleReelSave}
          onAddToAlbum={handleAddToAlbum}
          onAddToWishlist={handleAddToWishlist}
          onView={markReelViewed}
          onShare={handleReelShare}
          keywords={reelKeywords}
          suggestedTags={suggestedTags}
          activeTags={activeTags}
          onTagSelect={handleTagSelect}
        />
      )}
    </div>
  );
}