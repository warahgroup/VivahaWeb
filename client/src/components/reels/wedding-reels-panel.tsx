import { Sparkles } from "lucide-react";
import type { WeddingReel } from "@/lib/reels-catalog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ReelCard } from "./reel-card";

interface WeddingReelsPanelProps {
  reels: WeddingReel[];
  likedIds: Set<string>;
  savedIds: Set<string>;
  onLike: (reelId: string) => void;
  onSave: (reelId: string) => void;
  onView: (reelId: string) => void;
  onShare: (reelId: string) => void;
  onAddToAlbum?: (reelId: string) => void;
  onAddToWishlist?: (reelId: string) => void;
  onSelect?: (reel: WeddingReel) => void;
  keywords: string[];
  activeTags?: string[];
  className?: string;
  compact?: boolean;
}

export function WeddingReelsPanel({
  reels,
  likedIds,
  savedIds,
  onLike,
  onSave,
  onView,
  onShare,
  onAddToAlbum,
  onAddToWishlist,
  onSelect,
  keywords,
  activeTags,
  className,
  compact = true,
}: WeddingReelsPanelProps) {
  const keywordLabel = [...new Set([...(activeTags ?? []), ...keywords])];

  return (
    <div className={`flex h-full flex-col gap-5 ${className ?? ""}`}>
      <header className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary">
            <Sparkles className="h-4 w-4" />
            Vivaha Reels
          </div>
          <h3 className="mt-1 text-xl font-semibold text-foreground">
            Wedding Inspiration Feed
          </h3>
          <p className="text-xs text-muted-foreground">
            AI tuned these picks using your chat and preferences:{" "}
            {keywordLabel.length > 0 ? keywordLabel.map((keyword) => `#${keyword}`).join(" ● ") : "explore popular ideas"}
          </p>
        </div>
      </header>

      <ScrollArea className="h-full pr-2">
        <div className="flex flex-col gap-5 pb-10">
          {reels.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
              Start chatting about venues, decor, or rituals and Vivaha will surface matching reels automatically.
            </div>
          ) : (
            reels.map((reel) => (
              <ReelCard
                key={reel.id}
                reel={reel}
                liked={likedIds.has(reel.id)}
                saved={savedIds.has(reel.id)}
                onLike={() => onLike(reel.id)}
                onSave={() => onSave(reel.id)}
                onView={() => onView(reel.id)}
                onShare={() => onShare(reel.id)}
                onSelect={onSelect}
                onAddToAlbum={onAddToAlbum ? () => onAddToAlbum(reel.id) : undefined}
                onAddToWishlist={onAddToWishlist ? () => onAddToWishlist(reel.id) : undefined}
                layout={compact ? "compact" : "expanded"}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}


