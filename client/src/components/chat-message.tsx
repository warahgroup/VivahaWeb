// /components/chat-message.tsx (Fixed: Use 'role' instead of 'sender' for alignment and colors; user on right (blue), AI on left (gray))
import { useState, useRef, useEffect } from "react";
import { Bot, User } from "lucide-react";
import type { ChatMessage as ChatMessageType } from "@shared/schema";

interface ChatMessageProps {
  message: ChatMessageType;
  onLongPress: (messageId: string, x: number, y: number) => void;
}

export function ChatMessage({ message, onLongPress }: ChatMessageProps) {
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const timer = setTimeout(() => {
      const touch = e.touches[0];
      onLongPress(message.id, touch.clientX, touch.clientY);
    }, 800);
    setPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onLongPress(message.id, e.clientX, e.clientY);
  };

  // Fixed: Use 'role' from schema instead of 'sender'
  const isBot = message.role === "assistant";

  // Minimal-safe markdown: bold via **text** and newline support
  const formatMessage = (text: string): string => {
    const escapeHtml = (s: string) =>
      s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const escaped = escapeHtml(text);
    const withBold = escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    return withBold.replace(/\n/g, "<br/>");
  };

  return (
    <div
      ref={messageRef}
      className={`flex gap-2 mb-3 ${isBot ? "justify-start" : "justify-end"}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onContextMenu={handleContextMenu}
      data-testid={`message-${message.role}-${message.id}`}
    >
      {isBot && (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
          <Bot className="w-5 h-5 text-gray-600" />
        </div>
      )}
      <div
        className={`max-w-[75%] md:max-w-[60%] px-3 py-2 rounded-2xl ${
          isBot
            ? "bg-gray-200 text-gray-900 rounded-tl-none"
            : "bg-primary text-primary-foreground rounded-tr-none"
        }`}
      >
        <p
          className="text-sm leading-relaxed whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
        />
      </div>
      {!isBot && (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-primary-foreground" />
        </div>
      )}
    </div>
  );
}