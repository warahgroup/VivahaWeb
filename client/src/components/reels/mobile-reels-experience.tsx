import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import type { WeddingReel } from "@/lib/reels-catalog";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { FullscreenReelSlide } from "./fullscreen-reel-slide";

interface MobileReelsExperienceProps {
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
}

export function MobileReelsExperience({
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
}: MobileReelsExperienceProps) {
  const [open, setOpen] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasViewed, setHasViewed] = useState<Set<string>>(new Set());
  const revealSwipeRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const dismissSwipeRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const [showHandleHint, setShowHandleHint] = useState(true);

  const orderedReels = useMemo(() => reels ?? [], [reels]);

  useEffect(() => {
    if (orderedReels.length === 0) {
      setActiveIndex(0);
      return;
    }
    if (activeIndex >= orderedReels.length) {
      setActiveIndex(0);
    }
  }, [orderedReels, activeIndex]);

  useEffect(() => {
    if (!open) {
      setHasViewed(new Set());
      return;
    }
    const body = document.body;
    const prevOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!carouselApi) return;
    const handleSelect = () => {
      setActiveIndex(carouselApi.selectedScrollSnap());
    };

    carouselApi.on("select", handleSelect);
    carouselApi.on("reInit", handleSelect);
    handleSelect();

    return () => {
      carouselApi.off("select", handleSelect);
      carouselApi.off("reInit", handleSelect);
    };
  }, [carouselApi]);

  useEffect(() => {
    if (!open) return;
    const current = orderedReels[activeIndex];
    if (!current) return;
    if (!hasViewed.has(current.id)) {
      onView(current.id);
      setHasViewed((prev) => {
        const next = new Set(prev);
        next.add(current.id);
        return next;
      });
    }
  }, [open, activeIndex, orderedReels, onView, hasViewed]);

  useEffect(() => {
    if (open) {
      revealSwipeRef.current = null;
      return;
    }

    const handleTouchStart = (event: TouchEvent) => {
      if (open) return;
      const touch = event.touches[0];
      if (!touch) return;
      if (touch.clientX < window.innerWidth * 0.6) return;
      revealSwipeRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (open) return;
      const start = revealSwipeRef.current;
      if (!start) return;
      const touch = event.changedTouches[0];
      if (!touch) return;
      const deltaX = touch.clientX - start.x;
      const deltaY = Math.abs(touch.clientY - start.y);
      const duration = Date.now() - start.time;
      if (duration < 600 && deltaX <= -80 && deltaY < 80) {
        setOpen(true);
      }
      revealSwipeRef.current = null;
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [open]);

  const handleDismissTouchStart = useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;
    dismissSwipeRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  }, []);

  const handleDismissTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      const start = dismissSwipeRef.current;
      dismissSwipeRef.current = null;
      if (!start) return;
      const touch = event.changedTouches[0];
      if (!touch) return;
      const deltaX = touch.clientX - start.x;
      const deltaY = Math.abs(touch.clientY - start.y);
      const duration = Date.now() - start.time;
      if (duration < 600 && deltaX >= 80 && deltaY < 80) {
        setOpen(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!showHandleHint) return;
    const timer = window.setTimeout(() => setShowHandleHint(false), 4000);
    return () => window.clearTimeout(timer);
  }, [showHandleHint]);


  const handleLike = useCallback(
    (reelId: string) => {
      onLike(reelId);
      requestAnimationFrame(() => {
        carouselApi?.scrollNext();
      });
    },
    [onLike, carouselApi]
  );

  const handleSave = useCallback(
    (reelId: string) => {
      onSave(reelId);
      requestAnimationFrame(() => {
        carouselApi?.scrollNext();
      });
    },
    [onSave, carouselApi]
  );

  const handleShare = useCallback(
    (reelId: string) => {
      onShare(reelId);
    },
    [onShare]
  );

  const handleAddToAlbum = useCallback(
    (reelId: string) => {
      onAddToAlbum(reelId);
      requestAnimationFrame(() => {
        carouselApi?.scrollNext();
      });
    },
    [onAddToAlbum, carouselApi]
  );

  const handleAddToWishlist = useCallback(
    (reelId: string) => {
      onAddToWishlist(reelId);
      requestAnimationFrame(() => {
        carouselApi?.scrollNext();
      });
    },
    [onAddToWishlist, carouselApi]
  );

  return (
    <>
      {!open && (
        <button
          type="button"
          className={`fixed top-1/2 right-0 z-40 flex -translate-y-1/2 items-center gap-2 rounded-l-full bg-primary px-3 py-2 text-xs font-semibold uppercase tracking-widest text-primary-foreground shadow-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/60 sm:hidden ${
            showHandleHint ? "" : "opacity-80"
          }`}
          onClick={() => setOpen(true)}
          aria-label="Open AI Reels feed"
        >
          <Sparkles className="h-4 w-4" />
          <span>Reels</span>
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md sm:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative flex h-full w-full flex-col"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              onTouchStart={handleDismissTouchStart}
              onTouchEnd={handleDismissTouchEnd}
              onTouchCancel={handleDismissTouchEnd}
            >
              <header className="flex items-center justify-between px-5 pt-6 text-white">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
                    Vivaha Reels
                  </p>
                  <h2 className="text-2xl font-semibold">Wedding Inspirations</h2>
                  <p className="mt-1 text-xs text-white/70">
                    {keywords.length > 0
                      ? `AI matched: ${keywords.map((kw) => `#${kw}`).join("  ")}`
                      : "Chat about decor, venues, or rituals to personalise your feed"}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-10 w-10 rounded-full border border-white/30 bg-white/10 text-white backdrop-blur"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close reels</span>
                </Button>
              </header>

              <div className="mt-3 flex flex-wrap gap-2 px-5">
                {suggestedTags.map((tag) => {
                  const active = activeTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => onTagSelect(tag)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
                        active
                          ? "bg-primary text-primary-foreground shadow-lg"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>

              <div className="relative mt-4 flex-1 overflow-hidden px-2 pb-6 min-h-[26rem]">
                {orderedReels.length === 0 ? (
                  <div className="flex h-full items-center justify-center rounded-[2.5rem] border border-dashed border-white/25 bg-white/5 px-6 text-center text-sm text-white/70">
                    Start chatting about floral mandaps, ceremonies, or venues to unlock personalised reels.
                  </div>
                ) : (
                  <Carousel
                    orientation="vertical"
                    opts={{
                      loop: true,
                      align: "start",
                      watchDrag: true,
                    }}
                    setApi={setCarouselApi}
                    className="h-full min-h-[26rem]"
                  >
                    <CarouselContent className="h-full min-h-[26rem]">
                      {orderedReels.map((reel, index) => (
                        <CarouselItem key={reel.id} className="h-full min-h-[26rem] basis-full pt-0">
                          <FullscreenReelSlide
                            reel={reel}
                            liked={likedIds.has(reel.id)}
                            saved={savedIds.has(reel.id)}
                            onLike={() => handleLike(reel.id)}
                            onSave={() => handleSave(reel.id)}
                            onShare={() => handleShare(reel.id)}
                            onAddToAlbum={() => handleAddToAlbum(reel.id)}
                            onAddToWishlist={() => handleAddToWishlist(reel.id)}
                            isActive={activeIndex === index}
                          />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                )}
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

