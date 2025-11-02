import { useState } from "react";
import { Search, Trash2, Archive, Share2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { SavedItem } from "@shared/schema";

interface SavedItemListProps {
  items: Array<SavedItem & { completed?: boolean }>;
  type: "note" | "reminder" | "confirmed";
  onDelete: (id: string) => void;
  onToggle?: (id: string, completed: boolean) => void;
  onArchive: (id: string) => void;
  onShare: () => void;
}

export function SavedItemList({ items, type, onDelete, onToggle, onArchive, onShare }: SavedItemListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [swipingId, setSwipingId] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState(0);

  const filteredItems = items.filter((item) =>
    item.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTouchStart = (e: React.TouchEvent<HTMLLIElement>, id: string) => {
    setTouchStart(e.touches[0].clientX);
    setSwipingId(id);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLLIElement>) => {
    if (!swipingId) return;
    const currentX = e.touches[0].clientX;
    const diff = touchStart - currentX;

    if (diff > 100) {
      onDelete(swipingId);
      setSwipingId(null);
    }
  };

  const handleTouchEnd = () => {
    setSwipingId(null);
  };

  const typeLabels: Record<"note" | "reminder" | "confirmed", string> = {
    note: "Notes",
    reminder: "Reminders",
    confirmed: "Confirmed Items",
  };

  // Fallback for invalid type prop
  const label = typeLabels[type] || "Items";

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={`Search ${label.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid={`input-search-${label.toLowerCase()}`}
            className="pl-10 rounded-full"
          />
        </div>
        {filteredItems.length > 0 && (
          <Button
            size="icon"
            variant="outline"
            onClick={onShare}
            data-testid={`button-share-${type}`}
          >
            <Share2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">
            {searchQuery ? "No results found" : `No ${label.toLowerCase()} yet`}
          </h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery
              ? "Try a different search term"
              : `Long-press chat messages to save them as ${label.toLowerCase()}`}
          </p>
        </div>
      ) : (
        <ul className="space-y-2" data-testid={`list-${type}`}>
          {filteredItems.map((item) => (
            <li
              key={item.id}
              className="bg-card border border-card-border rounded-lg p-4 hover-elevate transition-all group"
              onTouchStart={(e) => handleTouchStart(e, item.id)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              data-testid={`item-${type}-${item.id}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 flex items-start gap-3">
                  {type === "reminder" && onToggle && (
                    <Checkbox
                      id={`item-checkbox-${item.id}`}
                      className="mt-1"
                      checked={item.completed ?? false}
                      onCheckedChange={(checked) => onToggle(item.id, !!checked)}
                    />
                  )}
                  <p className="text-sm text-card-foreground leading-relaxed">
                    {item.content}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(item.timestamp).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onArchive(item.id)}
                  data-testid={`button-archive-${item.id}`}
                >
                  <Archive className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onDelete(item.id)}
                  data-testid={`button-delete-${item.id}`}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
              <div className="md:hidden text-xs text-muted-foreground mt-2">
                ← Swipe left to delete
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}