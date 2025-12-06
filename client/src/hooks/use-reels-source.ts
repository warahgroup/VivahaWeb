import { useEffect, useMemo, useState } from "react";
import type { WeddingReel } from "@/lib/reels-catalog";
import { reelsCatalog } from "@/lib/reels-catalog";
import { realtimeDb } from "@/firebase";
import { onValue, ref } from "firebase/database";

const REELS_CACHE_KEY = "vivaha-reels-realtime-cache";

function loadCache(): WeddingReel[] | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(REELS_CACHE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as WeddingReel[];
  } catch {
    return null;
  }
}

function persistCache(reels: WeddingReel[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(REELS_CACHE_KEY, JSON.stringify(reels));
  } catch {
    // ignore quota errors
  }
}

export interface ReelSource {
  reels: WeddingReel[];
  isLive: boolean;
  lastUpdated?: number;
}

/**
 * Subscribe to the Firebase Realtime Database for live reel updates.
 * Falls back to cached content (or static catalog) when offline.
 */
export function useRealtimeReels(): ReelSource {
  const [reels, setReels] = useState<WeddingReel[]>(() => loadCache() ?? reelsCatalog);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    const stored = localStorage.getItem(`${REELS_CACHE_KEY}-updated`);
    return stored ? Number(stored) : undefined;
  });

  useEffect(() => {
    const reelsRef = ref(realtimeDb, "reels");
    const unsubscribe = onValue(
      reelsRef,
      (snapshot) => {
        const value = snapshot.val();
        if (!value) {
          setIsLive(false);
          return;
        }

        const next: WeddingReel[] = Object.values(value) as WeddingReel[];
        if (next.length) {
          setReels(next);
          setIsLive(true);
          const now = Date.now();
          setLastUpdated(now);
          persistCache(next);
          localStorage.setItem(`${REELS_CACHE_KEY}-updated`, String(now));
        }
      },
      () => {
        setIsLive(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const sortedReels = useMemo(() => {
    return reels
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [reels]);

  return {
    reels: sortedReels.length ? sortedReels : reelsCatalog,
    isLive,
    lastUpdated,
  };
}













