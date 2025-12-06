import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Heart, Bookmark, Play, Share2, Eye } from "lucide-react";
import type { WeddingReel } from "@/lib/reels-catalog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ReelCardProps {
  reel: WeddingReel;
  liked: boolean;
  saved: boolean;
  onLike: () => void;
  onSave: () => void;
  onView: () => void;
  onShare: () => void;
  onSelect?: (reel: WeddingReel) => void;
  onAddToAlbum?: () => void;
  onAddToWishlist?: () => void;
  layout?: "compact" | "expanded";
}

export function ReelCard({
  reel,
  liked,
  saved,
  onLike,
  onSave,
  onView,
  onShare,
  onSelect,
  onAddToAlbum,
  onAddToWishlist,
  layout = "compact",
}: ReelCardProps) {
  const hasMarkedView = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [poster, setPoster] = useState<string | undefined>(reel.thumbnail || undefined);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    if (!hasMarkedView.current) {
      onView();
      hasMarkedView.current = true;
    }
  }, [onView]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reel.type !== "video") return;

    const handleError = () => {
      setVideoError(true);
    };

    video.addEventListener("error", handleError);

    if (!reel.url) {
      setVideoError(true);
      video.pause();
      return () => {
        video.removeEventListener("error", handleError);
      };
    }

    if (videoError) {
      video.pause();
      return () => {
        video.removeEventListener("error", handleError);
      };
    }

    if (isHovering) {
      const attemptPlay = async () => {
        try {
          await video.play();
        } catch (error) {
          if (!video.muted) {
            video.muted = true;
            try {
              await video.play();
            } catch {
              setVideoError(true);
            }
          } else {
            setVideoError(true);
          }
        }
      };

      void attemptPlay();
    } else {
      video.pause();
      video.currentTime = 0;
    }

    return () => {
      video.removeEventListener("error", handleError);
    };
  }, [isHovering, reel.type, reel.url, videoError]);

  useEffect(() => {
    setPoster(reel.thumbnail || undefined);
    setVideoError(false);
  }, [reel.id, reel.thumbnail]);

  useEffect(() => {
    if (poster || reel.type !== "video" || !reel.url) return;
    let cancelled = false;
    const video = document.createElement("video");
    video.src = reel.url;
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;
    video.addEventListener(
      "loadeddata",
      () => {
        if (cancelled) return;
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext("2d");
        if (context) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          try {
            const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
            setPoster(dataUrl);
          } catch {
            // ignore canvas taint errors
          }
        }
      },
      { once: true }
    );
    video.load();
    return () => {
      cancelled = true;
      video.pause();
      video.removeAttribute("src");
    };
  }, [poster, reel.type, reel.url]);

  const handleSelect = useCallback(() => {
    if (onSelect) {
      onSelect(reel);
    }
  }, [onSelect, reel]);

  const likesDisplay = useMemo(
    () => reel.likes + (liked ? 1 : 0),
    [reel.likes, liked]
  );
  const savesDisplay = useMemo(
    () => reel.saves + (saved ? 1 : 0),
    [reel.saves, saved]
  );
  const viewsDisplay = useMemo(() => reel.views, [reel.views]);

  return (
    <article
      className="group relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handleSelect}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={(event) => {
        if (!onSelect) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleSelect();
        }
      }}
    >
      <div className="relative aspect-[9/16] w-full overflow-hidden bg-muted">
        {reel.type === "video" && !videoError ? (
          <video
            ref={videoRef}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            src={reel.url}
            poster={poster ?? reel.thumbnail}
            preload="metadata"
            loop
            muted
            playsInline
            onError={() => setVideoError(true)}
          />
        ) : (
          <img
            className="h-full w-full object-cover"
            src={poster ?? reel.thumbnail ?? reel.url}
            alt={reel.title}
            loading="lazy"
          />
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        <div className="absolute right-3 top-3 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white shadow-lg backdrop-blur">
          ❤️ {likesDisplay.toLocaleString()} • 💾 {savesDisplay.toLocaleString()}
        </div>

        <div className="absolute left-4 top-4 flex items-center gap-2">
          <Badge className="bg-primary/90 text-primary-foreground shadow-md">
            AI Recommends
          </Badge>
          {reel.type === "video" && (
            <span className="flex items-center gap-1 rounded-full bg-black/40 px-3 py-1 text-xs text-white backdrop-blur">
              <Play className="h-3 w-3" />
              Video
            </span>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h4 className="text-lg font-semibold text-white drop-shadow">
            {reel.title}
          </h4>
          <p className="mt-2 line-clamp-3 text-sm text-white/80">
            {reel.description}
          </p>
          <p className="mt-3 text-xs text-white/60">{reel.source}</p>
        </div>
      </div>

      <div
        className={`flex items-center justify-between px-4 py-3 ${
          layout === "expanded" ? "sm:px-6 sm:py-4" : ""
        }`}
      >
        <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
          {reel.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-muted px-3 py-1 font-medium text-foreground/70"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={onLike}
            className={`rounded-full border ${
              liked ? "border-transparent bg-rose-600 text-white" : "border-border"
            } hover:bg-rose-600/90 hover:text-white`}
            aria-pressed={liked}
            aria-label={liked ? "Unlike reel" : "Like reel"}
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onSave}
            className={`rounded-full border ${
              saved ? "border-transparent bg-emerald-600 text-white" : "border-border"
            } hover:bg-emerald-600/90 hover:text-white`}
            aria-pressed={saved}
            aria-label={saved ? "Unsave reel" : "Save reel"}
          >
            <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onShare}
            className="rounded-full border border-border hover:bg-primary/10"
            aria-label="Share reel"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 pb-4 text-[11px] font-medium text-muted-foreground sm:px-6">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {viewsDisplay.toLocaleString()}
          </span>
        </div>
        <span className="text-muted-foreground/70">{reel.name}</span>
      </div>

      {(onAddToAlbum || onAddToWishlist) && (
        <div className="flex flex-wrap gap-3 border-t border-border/60 px-4 py-3 sm:px-6">
          {onAddToAlbum && (
            <Button
              variant="outline"
              onClick={(event) => {
                event.stopPropagation();
                onAddToAlbum();
              }}
              className="flex-1 rounded-2xl border-primary/40 text-sm text-primary hover:bg-primary/10"
            >
              Add to My Album
            </Button>
          )}
          {onAddToWishlist && (
            <Button
              variant="outline"
              onClick={(event) => {
                event.stopPropagation();
                onAddToWishlist();
              }}
              className="flex-1 rounded-2xl border-primary/40 text-sm text-primary hover:bg-primary/10"
            >
              Wishlist
            </Button>
          )}
        </div>
      )}
    </article>
  );
}


