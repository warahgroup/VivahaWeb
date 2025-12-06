"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Heart, Plus, Link as LinkIcon } from "lucide-react"

import { usePinterestFeed } from "@/hooks/usePinterestFeed"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

type SidebarPinterestReelsProps = {
  searchKeywords: string[]
}

export function SidebarPinterestReels({ searchKeywords }: SidebarPinterestReelsProps) {
  const query = useMemo(() => {
    if (searchKeywords.length === 0) return "wedding inspiration"
    return searchKeywords.join(" ")
  }, [searchKeywords])

  const { items } = usePinterestFeed(query)
  const [activeIndex, setActiveIndex] = useState(0)

  const handlePressStart = (href?: string) => {
    if (!href) return;
    return window.setTimeout(() => {
      window.open(href, "_blank", "noopener,noreferrer");
    }, 3000);
  };

  const handlePressCancel = (timerId?: number) => {
    if (timerId) {
      window.clearTimeout(timerId);
    }
  };

  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-border/60 bg-background/80 p-4 shadow-inner backdrop-blur">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">
            Pinterest Pulse
          </p>
          <h3 className="mt-1 text-lg font-semibold text-foreground">
            Pinboard Reels
          </h3>
          <p className="text-xs text-muted-foreground">
            Curated for <span className="font-medium text-primary">{query}</span>
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
          Beta
        </span>
      </header>

      <ScrollArea className="flex-1">
        <div className="flex h-full snap-y snap-mandatory flex-col gap-8 pb-16">
          {items.length === 0 ? (
            <div className="flex h-[60vh] items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
              No pins yet. Start chatting about venues, decor, or rituals to unlock curated reels.
            </div>
          ) : (
            items.map((item, index) => {
              const id = (item.id as string) ?? `${item.title}-${index}`
              const image =
                (item.image as string) ??
                (item.thumbnail as string) ??
                (item.cover as string) ??
                undefined
              const title = String(item.title ?? "Curated inspiration")
              const href = typeof item.url === "string" ? item.url : undefined

              let pressTimer: number | undefined;

              const handleMouseDown = () => {
                pressTimer = handlePressStart(href);
              };

              const handleMouseUp = () => {
                handlePressCancel(pressTimer);
                pressTimer = undefined;
              };

              const handleTouchStart = () => {
                pressTimer = handlePressStart(href);
              };

              const handleTouchEnd = () => {
                handlePressCancel(pressTimer);
                pressTimer = undefined;
              };

              return (
                <motion.article
                  key={id}
                  className="relative h-[80vh] snap-start overflow-hidden rounded-2xl shadow-lg"
                  onMouseEnter={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  onTouchCancel={handleTouchEnd}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: index === activeIndex ? 1 : 0.7, y: index === activeIndex ? 0 : 20 }}
                  transition={{ duration: 0.6 }}
                >
                  {image ? (
                    <motion.img
                      src={image}
                      alt={title}
                      className="h-full w-full object-cover"
                      initial={{ scale: 1.05 }}
                      animate={{ scale: index === activeIndex ? 1 : 1.02 }}
                      transition={{ duration: 0.8 }}
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 text-xs font-semibold uppercase tracking-wide text-primary">
                      Pin Preview
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent p-4 text-white">
                    <h4 className="text-lg font-semibold leading-tight line-clamp-3">{title}</h4>
                    {item.description && (
                      <p className="mt-2 text-sm text-white/80 line-clamp-3">
                        {String(item.description)}
                      </p>
                    )}

                    <div className="mt-4 flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="bg-white/10 text-white hover:bg-white/20"
                      >
                        <Heart className="mr-2 h-4 w-4" />
                        Like
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="bg-white/10 text-white hover:bg-white/20"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add to Album
                      </Button>
                      {href && (
                        <Button
                          asChild
                          size="sm"
                          variant="secondary"
                          className="bg-white/10 text-white hover:bg-white/20"
                        >
                          <a href={href} target="_blank" rel="noopener noreferrer">
                            <LinkIcon className="mr-2 h-4 w-4" />
                            View Source
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.article>
              )
            })
          )}
        </div>
      </ScrollArea>
    </div>
  )
}


