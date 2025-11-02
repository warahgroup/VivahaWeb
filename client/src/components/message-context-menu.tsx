import { useEffect, useRef } from "react";
import { StickyNote, Clock, CheckCircle2, Archive, X } from "lucide-react";

interface MessageContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onAction: (action: "note" | "reminder" | "confirmed" | "archived") => void;
}

export function MessageContextMenu({ x, y, onClose, onAction }: MessageContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside as any);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside as any);
    };
  }, [onClose]);

  const actions = [
    { id: "note", label: "Save as Note", icon: StickyNote },
    { id: "reminder", label: "Save as Reminder", icon: Clock },
    { id: "confirmed", label: "Mark Confirmed", icon: CheckCircle2 },
    { id: "archived", label: "Archive", icon: Archive },
  ];

  // Adjust position to keep menu within viewport
  const adjustedX = Math.min(x, window.innerWidth - 220);
  const adjustedY = Math.min(y, window.innerHeight - 250);

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        ref={menuRef}
        className="fixed z-50 bg-popover border border-popover-border rounded-lg shadow-2xl overflow-hidden min-w-[200px]"
        style={{ left: adjustedX, top: adjustedY }}
        data-testid="context-menu"
      >
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => {
              onAction(action.id as any);
              onClose();
            }}
            data-testid={`context-menu-${action.id}`}
            className="w-full flex items-center gap-3 px-4 py-3 hover-elevate transition-colors text-left"
          >
            <action.icon className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-popover-foreground">
              {action.label}
            </span>
          </button>
        ))}
        <button
          onClick={onClose}
          data-testid="context-menu-cancel"
          className="w-full flex items-center gap-3 px-4 py-3 hover-elevate transition-colors text-left border-t"
        >
          <X className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            Cancel
          </span>
        </button>
      </div>
    </>
  );
}
