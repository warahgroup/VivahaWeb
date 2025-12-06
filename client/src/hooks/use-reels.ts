import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChatMessage } from "@shared/schema";
import type { WeddingReel } from "@/lib/reels-catalog";

type InteractionState = {
  liked: boolean;
  saved: boolean;
  views: number;
  lastViewedAt?: number;
};

type InteractionMap = Record<string, InteractionState>;

const STORAGE_KEY = "vivaha-reels-interactions";
const HISTORY_KEY = "vivaha-reels-history";
const ANALYTICS_KEY = "vivaha-reels-analytics";

const KEYWORD_ALIASES: Record<string, string[]> = {
  music: ["dj", "band", "song", "dance", "sangeet"],
  decor: ["flowers", "mandap", "stage", "design"],
  budget: ["cost", "price", "affordable", "budget"],
  destination: ["goa", "jaipur", "udaipur", "kerala", "beach"],
  mehndi: ["henna", "mehendi"],
  haldi: ["turmeric"],
  bridal: ["bride", "bridal", "entry"],
  cocktail: ["party", "afterparty"],
  family: ["parents", "siblings", "friends"],
};

const DEFAULT_TAG_SUGGESTIONS = ["decor", "bridal", "venue", "mandap", "music", "timeline"];

function normaliseKeyword(token: string): string {
  const cleaned = token
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .trim();
  if (!cleaned) return "";

  for (const [keyword, aliases] of Object.entries(KEYWORD_ALIASES)) {
    if (aliases.includes(cleaned)) {
      return keyword;
    }
  }

  return cleaned;
}

function extractKeywords(messages: ChatMessage[]): string[] {
  const lastMessages = messages.slice(-12); // focus on recent context
  const tokens = lastMessages
    .flatMap((message) =>
      message.content
        .split(/\s+/)
        .map(normaliseKeyword)
        .filter(Boolean)
    )
    .filter((token) => token.length > 2);

  return Array.from(new Set(tokens));
}

function loadInteractionState(): InteractionMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as InteractionMap) : {};
  } catch {
    return {};
  }
}

function persistInteractionState(state: InteractionMap) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

type ViewHistoryEntry = {
  reelId: string;
  viewedAt: number;
};

function loadHistory(): ViewHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as ViewHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function persistHistory(history: ViewHistoryEntry[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // ignore quota errors
  }
}

type AnalyticsMap = Record<string, number>;

function loadAnalytics(): AnalyticsMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(ANALYTICS_KEY);
    return raw ? (JSON.parse(raw) as AnalyticsMap) : {};
  } catch {
    return {};
  }
}

function persistAnalytics(analytics: AnalyticsMap) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
  } catch {
    // ignore quota errors
  }
}

function scoreReel(
  reel: WeddingReel,
  keywords: string[],
  interactions: InteractionMap,
  popularityWeight: number,
  preferenceWeight: number,
  maxLikes: number,
  maxViews: number
): number {
  let keywordScore = 0;
  const matchedKeywords = reel.tags.filter((tag) => keywords.includes(tag));
  if (reel.tags.length) {
    keywordScore = matchedKeywords.length / reel.tags.length;
  }

  const popularityScore =
    ((reel.likes || 0) / (maxLikes || 1)) * 0.6 + ((reel.views || 0) / (maxViews || 1)) * 0.4;

  let preferenceScore = 0;
  const interaction = interactions[reel.id];
  if (interaction) {
    if (interaction.saved) preferenceScore += 0.4;
    if (interaction.liked) preferenceScore += 0.35;
    const viewFactor = Math.min(interaction.views, 5) / 5;
    preferenceScore += viewFactor * 0.25;
    if (interaction.lastViewedAt) {
      const hoursSinceView = (Date.now() - interaction.lastViewedAt) / (1000 * 60 * 60);
      const freshnessBoost = Math.max(0, 12 - hoursSinceView) / 12;
      preferenceScore += freshnessBoost * 0.2;
    }
  }

  // recency bonus based on creation (max 0.1)
  const ageInDays =
    (Date.now() - new Date(reel.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  const recencyScore = Math.max(0, 60 - ageInDays) / 60;

  const composite =
    0.5 * keywordScore +
    popularityWeight * popularityScore +
    preferenceWeight * preferenceScore +
    0.1 * recencyScore;

  return composite;
}

interface UseWeddingReelsOptions {
  messages: ChatMessage[];
  limit?: number;
  likedIds?: Set<string>;
  savedIds?: Set<string>;
  reels: WeddingReel[];
  boostTags?: string[];
}

export function useWeddingReels({
  messages,
  limit = 10,
  likedIds,
  savedIds,
  reels,
  boostTags = [],
}: UseWeddingReelsOptions) {
  const [interactions, setInteractions] = useState<InteractionMap>(() =>
    loadInteractionState()
  );
  const [viewHistory, setViewHistory] = useState<ViewHistoryEntry[]>(() => loadHistory());
  const [analytics, setAnalytics] = useState<AnalyticsMap>(() => loadAnalytics());

  useEffect(() => {
    persistInteractionState(interactions);
  }, [interactions]);

  const keywords = useMemo(() => {
    const base = extractKeywords(messages);
    const extras = boostTags
      .map((tag) => normaliseKeyword(tag))
      .filter(Boolean);
    return Array.from(new Set([...base, ...extras]));
  }, [messages, boostTags.join("|")]);

  const rankedReels = useMemo(() => {
    if (!reels.length) return [];

    const maxLikes = reels.reduce((acc, reel) => Math.max(acc, reel.likes || 0), 1);
    const maxViews = reels.reduce((acc, reel) => Math.max(acc, reel.views || 0), 1);

    const scored = reels.map((reel) => ({
      reel,
      score: scoreReel(reel, keywords, interactions, 0.3, 0.2, maxLikes, maxViews),
    }));

    const topByScore = scored.sort((a, b) => b.score - a.score);

    // Blend in popularity-forward picks for "For You" variety.
    const topByPopularity = reels
      .slice()
      .sort((a, b) => (b.likes || 0) + (b.views || 0) - ((a.likes || 0) + (a.views || 0)));

    const merged: WeddingReel[] = [];
    const seen = new Set<string>();

    topByScore.forEach(({ reel }) => {
      if (merged.length >= limit) return;
      merged.push(reel);
      seen.add(reel.id);
    });

    for (const reel of topByPopularity) {
      if (merged.length >= limit) break;
      if (!seen.has(reel.id)) {
        merged.push(reel);
        seen.add(reel.id);
      }
    }

    return merged.slice(0, limit);
  }, [keywords, interactions, reels, limit]);

  const updateInteraction = useCallback(
    (reelId: string, updater: (prev: InteractionState) => InteractionState) => {
      setInteractions((prev) => {
        const nextState = { ...prev };
        const current = nextState[reelId] ?? {
          liked: false,
          saved: false,
          views: 0,
        };
        nextState[reelId] = updater(current);
        return nextState;
      });
    },
    []
  );

  const toggleLike = useCallback(
    (reelId: string) => {
      updateInteraction(reelId, (prev) => ({
        ...prev,
        liked: !prev.liked,
      }));
    },
    [updateInteraction]
  );

  const toggleSave = useCallback(
    (reelId: string) => {
      updateInteraction(reelId, (prev) => ({
        ...prev,
        saved: !prev.saved,
      }));
    },
    [updateInteraction]
  );

  const markViewed = useCallback(
    (reelId: string) => {
      const now = Date.now();
      updateInteraction(reelId, (prev) => ({
        ...prev,
        views: prev.views + 1,
        lastViewedAt: now,
      }));

      setViewHistory((prev) => {
        const filtered = prev.filter((entry) => entry.reelId !== reelId);
        const next = [{ reelId, viewedAt: now }, ...filtered].slice(0, 10);
        persistHistory(next);
        return next;
      });

      setAnalytics((prev) => {
        const reel = reels.find((item) => item.id === reelId);
        if (!reel) return prev;
        const next = { ...prev };
        reel.tags.forEach((tag) => {
          next[tag] = (next[tag] || 0) + 1;
        });
        persistAnalytics(next);
        return next;
      });
    },
    [updateInteraction, reels]
  );

  useEffect(() => {
    if (!likedIds && !savedIds) return;

    setInteractions((prev) => {
      const nextState: InteractionMap = { ...prev };

      reels.forEach((reel) => {
        const current = nextState[reel.id] ?? {
          liked: false,
          saved: false,
          views: 0,
        };

        nextState[reel.id] = {
          ...current,
          liked: likedIds ? likedIds.has(reel.id) : current.liked,
          saved: savedIds ? savedIds.has(reel.id) : current.saved,
        };
      });

      return nextState;
    });
  }, [
    likedIds ? Array.from(likedIds).sort().join("|") : "",
    savedIds ? Array.from(savedIds).sort().join("|") : "",
    reels,
  ]);

  const suggestedTags = useMemo(() => {
    const analyticEntries = Object.entries(analytics)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    const combined = [...analyticEntries.map((item) => item.tag), ...DEFAULT_TAG_SUGGESTIONS];
    return Array.from(new Set(combined)).slice(0, 6);
  }, [analytics]);

  return {
    reels: rankedReels,
    keywords,
    interactions,
    toggleLike,
    toggleSave,
    markViewed,
    viewHistory,
    analytics,
    suggestedTags,
  };
}
