import { useMemo, useState } from "react";
import type { WeddingReel } from "@/lib/reels-catalog";
import { WeddingReelsPanel } from "./wedding-reels-panel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { FullscreenReelSlide } from "./fullscreen-reel-slide";
import { SidebarPinterestReels } from "@/components/SidebarPinterestReels";

interface WeddingReelsSidebarProps {
  reels: WeddingReel[];
  likedIds: Set<string>;
  savedIds: Set<string>;
  onLike: (reelId: string) => void;
  onSave: (reelId: string) => void;
  onAddToAlbum: (reelId: string) => void;
  onAddToWishlist: (reelId: string) => void;
  onView: (reelId: string) => void;
  onShare: (reelId: string) => void;
  keywords: string[];
  suggestedTags: string[];
  activeTags: string[];
  onTagSelect: (tag: string) => void;
  analytics: Record<string, number>;
  reelLookup: Map<string, WeddingReel>;
  progressScore: number;
  confirmedCount: number;
  isLive: boolean;
  lastUpdated?: number;
}

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function WeddingReelsSidebar({
  reels,
  likedIds,
  savedIds,
  onLike,
  onSave,
  onAddToAlbum,
  onAddToWishlist,
  onView,
  onShare,
  keywords,
  suggestedTags,
  activeTags,
  onTagSelect,
  analytics,
  reelLookup,
  progressScore,
  confirmedCount,
  isLive,
  lastUpdated,
}: WeddingReelsSidebarProps) {
  const [selectedReel, setSelectedReel] = useState<WeddingReel | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openReel = (reel: WeddingReel) => {
    setSelectedReel(reel);
    setIsDialogOpen(true);
    onView(reel.id);
  };

  const progressCircle = useMemo(() => {
    const radius = 42;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progressScore / 100) * circumference;
    return { radius, circumference, offset };
  }, [progressScore]);

  const topAnalytics = useMemo(() => {
    return Object.entries(analytics)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [analytics]);

  const extractedKeywords = useMemo(() => {
    const unique = new Set<string>();
    for (const tag of activeTags) {
      if (tag) {
        unique.add(tag);
      }
    }
    for (const keyword of keywords) {
      if (keyword) {
        unique.add(keyword);
      }
    }
    return Array.from(unique);
  }, [activeTags, keywords]);

  return (
    <>
      <aside className="hidden h-screen w-[24rem] border-l border-border/60 bg-gradient-to-b from-background via-background/95 to-background/80 px-0 py-0 lg:flex lg:flex-col">
        <div className="flex h-full w-full flex-col overflow-hidden px-4 py-5">
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-5 pb-6">
              <div className="sticky top-0 z-20 bg-gradient-to-b from-background via-background to-background/90 pb-4">
                <header className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-xl shadow-primary/5 backdrop-blur">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                        Vivaha Pulse
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-foreground">
                        Wedding Readiness
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {confirmedCount} confirmed milestones • {progressScore}% complete
                      </p>
                    </div>
                    <div className="relative">
                      <svg className="h-24 w-24 -rotate-90 text-muted" viewBox="0 0 120 120">
                        <circle
                          cx="60"
                          cy="60"
                          r={progressCircle.radius}
                          stroke="currentColor"
                          strokeWidth="10"
                          fill="transparent"
                          opacity={0.25}
                        />
                        <circle
                          cx="60"
                          cy="60"
                          r={progressCircle.radius}
                          stroke="url(#reel-progress)"
                          strokeWidth="10"
                          fill="transparent"
                          strokeLinecap="round"
                          strokeDasharray={progressCircle.circumference}
                          strokeDashoffset={progressCircle.offset}
                        />
                        <defs>
                          <linearGradient id="reel-progress" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="hsl(var(--primary))" />
                            <stop offset="100%" stopColor="hsl(var(--primary) / 0.6)" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center rotate-90">
                        <span className="text-xl font-semibold text-foreground">
                          {progressScore}%
                        </span>
                      </div>
                    </div>
                  </div>
                </header>
              </div>

              <section className="rounded-2xl border border-border/60 bg-card/60 px-4 py-4 shadow-inner">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  <span>Realtime Feed</span>
                  <span className="ml-auto flex items-center gap-2 text-[11px] font-normal normal-case tracking-normal text-muted-foreground/80">
                    <span
                      className={`inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full ${isLive ? "bg-emerald-500" : "bg-amber-400"}`}
                      aria-hidden="true"
                    />
                    {isLive ? "Live" : "Offline cache"}
                  </span>
                </div>
                {lastUpdated && (
                  <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-muted-foreground/60">
                    Updated {formatTimeAgo(lastUpdated)}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {suggestedTags.map((tag) => {
                    const active = activeTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => onTagSelect(tag)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
                          active
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>
                {topAnalytics.length > 0 && (
                  <div className="mt-4 grid gap-2 text-xs text-muted-foreground">
                    <p className="font-semibold uppercase tracking-[0.24em] text-muted-foreground/80">
                      Most Watched
                    </p>
                    {topAnalytics.map(({ tag, count }) => (
                      <div key={tag} className="flex items-center justify-between rounded-xl bg-muted/30 px-3 py-2">
                        <span>#{tag}</span>
                        <span className="text-muted-foreground/70">{count} views</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <div className="flex flex-col gap-4">
                <WeddingReelsPanel
                  reels={reels}
                  likedIds={likedIds}
                  savedIds={savedIds}
                  onLike={onLike}
                  onSave={onSave}
                  onView={onView}
                  onShare={onShare}
                  onAddToAlbum={onAddToAlbum}
                  onAddToWishlist={onAddToWishlist}
                  onSelect={openReel}
                  keywords={keywords}
                  activeTags={activeTags}
                  className="w-full"
                />
                <SidebarPinterestReels searchKeywords={extractedKeywords} />
              </div>
            </div>
          </div>
        </div>
      </aside>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl border-0 bg-black/90 p-0 text-white sm:max-w-5xl">
          <DialogHeader className="flex items-center justify-between border-b border-white/10 px-6 py-4 text-left">
            <div>
              <DialogTitle className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
                Wedding Inspirations
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs text-white/70">
                Immerse in AI-curated reels based on your latest chat details.
              </DialogDescription>
            </div>
            <DialogClose asChild>
              <Button
                size="icon"
                variant="secondary"
                className="h-10 w-10 rounded-full border border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close inspiration</span>
              </Button>
            </DialogClose>
          </DialogHeader>
          <div className="h-[70vh] w-full p-6">
            {selectedReel && (
              <FullscreenReelSlide
                reel={selectedReel}
                liked={likedIds.has(selectedReel.id)}
                saved={savedIds.has(selectedReel.id)}
                onLike={() => onLike(selectedReel.id)}
                onSave={() => onSave(selectedReel.id)}
                onShare={() => onShare(selectedReel.id)}
                onAddToAlbum={() => onAddToAlbum(selectedReel.id)}
                onAddToWishlist={() => onAddToWishlist(selectedReel.id)}
                isActive
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

