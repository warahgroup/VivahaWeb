import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { Asset } from "@shared/schema";
import { Heart, Info, Share2, Volume2, VolumeX, Search, Filter, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TikTokReelsFeedProps {
  userId: string;
  onInterested: (assetId: string) => void;
  onMoreInfo: (assetId: string) => void;
  onShare: (assetId: string) => void;
}

export function TikTokReelsFeed({ userId, onInterested, onMoreInfo, onShare }: TikTokReelsFeedProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [interestedIds, setInterestedIds] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Filters
  const [category, setCategory] = useState<string>("all");
  const [keywords, setKeywords] = useState<string>("");
  const [sort, setSort] = useState<string>("latest");
  const [searchInput, setSearchInput] = useState("");

  // Get unique categories from assets
  const categories = useMemo(() => {
    const cats = new Set<string>();
    assets.forEach(asset => {
      if (asset.category) cats.add(asset.category);
    });
    return Array.from(cats);
  }, [assets]);

  // Fetch assets
  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("type", "reel");
      if (category && category !== "all") params.append("category", category);
      if (keywords) params.append("keywords", keywords);
      if (sort) params.append("sort", sort);

      const response = await fetch(`/api/assets?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setAssets(data);
        setActiveIndex(0);
      }
    } catch (error) {
      console.error("Failed to fetch assets:", error);
    } finally {
      setLoading(false);
    }
  }, [category, keywords, sort]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // Handle search
  const handleSearch = useCallback(() => {
    setKeywords(searchInput);
  }, [searchInput]);

  // Intersection Observer for auto-play/pause
  useEffect(() => {
    if (!containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.getAttribute("data-index") || "0", 10);
          const video = videoRefs.current.get(index);

          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            setActiveIndex(index);
            video?.play().catch(() => {
              // Auto-play failed, user interaction required
            });
          } else {
            video?.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    const children = containerRef.current.children;
    Array.from(children).forEach((child) => {
      observerRef.current?.observe(child);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [assets]);

  // Set video refs
  const setVideoRef = useCallback((index: number, element: HTMLVideoElement | null) => {
    if (element) {
      videoRefs.current.set(index, element);
      element.muted = muted;
      // Preload next video
      if (index === activeIndex && assets[index + 1]) {
        const nextVideo = document.createElement("video");
        nextVideo.src = assets[index + 1].url;
        nextVideo.preload = "auto";
      }
    } else {
      videoRefs.current.delete(index);
    }
  }, [muted, activeIndex, assets]);

  // Update muted state for all videos
  useEffect(() => {
    videoRefs.current.forEach((video) => {
      video.muted = muted;
    });
  }, [muted]);

  // Handle scroll
  const handleScroll = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;

    const scrollAmount = e.deltaY;
    container.scrollBy({ top: scrollAmount, behavior: "smooth" });
  }, []);

  // Handle double tap to like
  const handleDoubleTap = useCallback((assetId: string) => {
    if (!interestedIds.has(assetId)) {
      setInterestedIds(prev => new Set(prev).add(assetId));
      onInterested(assetId);
    }
  }, [interestedIds, onInterested]);

  // Format date
  const formatDate = useCallback((createdAt: string | number) => {
    const date = typeof createdAt === "string" ? new Date(createdAt) : new Date(createdAt);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return date.toLocaleDateString();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading reels...</p>
        </div>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No reels found. Try adjusting your filters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-black">
      {/* Filters Bar */}
      <div className="sticky top-0 z-50 flex items-center gap-2 border-b border-white/10 bg-black/80 px-4 py-3 backdrop-blur">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search keywords..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[140px] bg-white/10 border-white/20 text-white">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[140px] bg-white/10 border-white/20 text-white">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="most_interested">Most Interested</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reels Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto snap-y snap-mandatory scrollbar-hide"
        onWheel={handleScroll}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {assets.map((asset, index) => (
          <div
            key={asset.id}
            data-index={index}
            className="relative h-screen w-full snap-start snap-always flex items-center justify-center bg-black"
          >
            {/* Video */}
            <video
              ref={(el) => setVideoRef(index, el)}
              src={asset.url}
              poster={asset.thumbnail}
              className="h-full w-full object-cover"
              loop
              playsInline
              muted={muted}
              preload={index <= activeIndex + 1 ? "auto" : "none"}
              onError={(e) => {
                console.error("Video load error:", e);
              }}
            />

            {/* Overlays - Bottom Left */}
            <div className="absolute bottom-20 left-4 right-20 text-white">
              {asset.category && (
                <span className="inline-block mb-2 px-2 py-1 text-xs font-semibold uppercase bg-primary/80 rounded">
                  {asset.category}
                </span>
              )}
              {asset.description && (
                <p className="text-sm font-medium mb-2 line-clamp-2">
                  {asset.description}
                </p>
              )}
              {asset.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {asset.keywords.slice(0, 3).map((keyword) => (
                    <span
                      key={keyword}
                      className="px-2 py-0.5 text-xs bg-white/20 rounded-full"
                    >
                      #{keyword}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-white/60">{formatDate(asset.createdAt)}</p>
            </div>

            {/* Action Buttons - Bottom Right */}
            <div className="absolute bottom-20 right-4 flex flex-col gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full bg-black/50 hover:bg-black/70 text-white"
                onClick={() => {
                  if (!interestedIds.has(asset.id)) {
                    setInterestedIds(prev => new Set(prev).add(asset.id));
                    onInterested(asset.id);
                  }
                }}
              >
                <Heart
                  className={`h-6 w-6 ${
                    interestedIds.has(asset.id) ? "fill-red-500 text-red-500" : ""
                  }`}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full bg-black/50 hover:bg-black/70 text-white"
                onClick={() => onMoreInfo(asset.id)}
              >
                <Info className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full bg-black/50 hover:bg-black/70 text-white"
                onClick={() => onShare(asset.id)}
              >
                <Share2 className="h-6 w-6" />
              </Button>
            </div>

            {/* Sound Toggle - Top Right */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setMuted(!muted)}
            >
              {muted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>

            {/* Double tap overlay for like */}
            <div
              className="absolute inset-0 touch-none"
              onDoubleClick={() => handleDoubleTap(asset.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

