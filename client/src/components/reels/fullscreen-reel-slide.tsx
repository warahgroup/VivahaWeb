import { useEffect, useMemo, useRef, useState } from "react";
import { Bookmark, Eye, Heart, Share2 } from "lucide-react";
import type { WeddingReel } from "@/lib/reels-catalog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FullscreenReelSlideProps {
  reel: WeddingReel;
  liked: boolean;
  saved: boolean;
  onLike: () => void;
  onSave: () => void;
  onShare: () => void;
  onAddToAlbum?: () => void;
  onAddToWishlist?: () => void;
  isActive: boolean;
}

export function FullscreenReelSlide({
  reel,
  liked,
  saved,
  onLike,
  onSave,
  onShare,
  onAddToAlbum,
  onAddToWishlist,
  isActive,
}: FullscreenReelSlideProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [poster, setPoster] = useState<string | undefined>(reel.thumbnail || undefined);
  const [videoError, setVideoError] = useState(false);

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

    if (isActive) {
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
    }

    return () => {
      video.removeEventListener("error", handleError);
    };
  }, [isActive, reel.type, reel.url, videoError]);

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
            // ignore
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
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[2.5rem] bg-black/80">
      <div className="absolute inset-0">
        {reel.type === "video" && !videoError ? (
          <video
            ref={videoRef}
            key={reel.url}
            className="h-full w-full object-contain"
            src={reel.url}
            poster={poster ?? reel.thumbnail}
            preload="metadata"
            muted
            playsInline
            loop
            onError={() => setVideoError(true)}
          />
        ) : (
          <img
            className="h-full w-full object-contain"
            src={poster ?? reel.thumbnail ?? reel.url}
            alt={reel.title}
            loading="lazy"
          />
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/10 to-black/80" />

      <div className="absolute left-5 top-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white">
        <Badge className="bg-white/10 text-white backdrop-blur">AI Picks</Badge>
        {reel.type === "video" && (
          <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] text-white">
            Autoplay · Muted
          </span>
        )}
      </div>

      <div className="absolute right-5 top-1/2 flex -translate-y-1/2 flex-col items-center gap-6 text-white">
        <ActionButton
          icon={Heart}
          label="Like"
          count={likesDisplay}
          active={liked}
          onClick={onLike}
        />
        <ActionButton
          icon={Bookmark}
          label="Save"
          count={savesDisplay}
          active={saved}
          onClick={onSave}
        />
        <ActionButton
          icon={Share2}
          label="Share"
          onClick={onShare}
        />
        <div className="flex flex-col items-center text-xs text-white/70">
          <Eye className="h-4 w-4" />
          <span>{viewsDisplay.toLocaleString()}</span>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-6 pb-16 pt-24 text-white">
        <h3 className="text-2xl font-semibold drop-shadow-lg">{reel.title}</h3>
        <p className="max-w-xl text-sm text-white/80">{reel.description}</p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-white/70">
          <span>{reel.source}</span>
          <span className="text-white/50">•</span>
          <span className="uppercase tracking-wide">
            {new Date(reel.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-medium text-white/80">
          {reel.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/10 px-3 py-1"
            >
              #{tag}
            </span>
          ))}
        </div>
        {(onAddToAlbum || onAddToWishlist) && (
          <div className="mt-2 flex flex-wrap justify-end gap-4 text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
            {onAddToAlbum && (
              <Button
                variant="secondary"
                className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-[11px] tracking-wide text-white hover:bg-white/20"
                onClick={(event) => {
                  event.stopPropagation();
                  onAddToAlbum();
                }}
              >
                Add to My Album
              </Button>
            )}
            {onAddToWishlist && (
              <Button
                variant="secondary"
                className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-[11px] tracking-wide text-white hover:bg-white/20"
                onClick={(event) => {
                  event.stopPropagation();
                  onAddToWishlist();
                }}
              >
                Wishlist
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface ActionButtonProps {
  icon: typeof Heart;
  label: string;
  onClick: () => void;
  count?: number;
  active?: boolean;
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  count,
  active = false,
}: ActionButtonProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        size="icon"
        variant="secondary"
        className={`h-14 w-14 rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:border-white hover:bg-white/20 ${
          active ? "border-white bg-white/30" : ""
        }`}
        onClick={onClick}
      >
        <Icon className={`h-6 w-6 ${active ? "fill-current" : ""}`} />
        <span className="sr-only">{label}</span>
      </Button>
      {count !== undefined && (
        <span className="text-xs font-semibold text-white">
          {count.toLocaleString()}
        </span>
      )}
    </div>
  );
}


