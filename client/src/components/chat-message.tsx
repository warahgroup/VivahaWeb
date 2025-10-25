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

  const isBot = message.sender === "bot";

  return (
    <div
      ref={messageRef}
      className={`flex gap-3 mb-4 ${isBot ? "justify-start" : "justify-end"}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onContextMenu={handleContextMenu}
      data-testid={`message-${message.sender}-${message.id}`}
    >
      {isBot && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Bot className="w-5 h-5 text-primary" />
        </div>
      )}
      <div
        className={`max-w-[75%] md:max-w-[60%] px-4 py-3 rounded-lg ${
          isBot
            ? "bg-card text-card-foreground rounded-tl-none"
            : "bg-primary text-primary-foreground rounded-tr-none"
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
      </div>
      {!isBot && (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-primary-foreground" />
        </div>
      )}
    </div>
  );
}
