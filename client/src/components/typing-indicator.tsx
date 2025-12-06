import { Bot } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex gap-2 mb-3 justify-start">
      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
        <Bot className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </div>
      <div className="max-w-[75%] md:max-w-[60%] px-3 py-2 rounded-2xl bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none">
        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-600 dark:text-gray-400">typing</span>
          <div className="flex gap-0.5">
            <span className="w-1.5 h-1.5 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1.5 h-1.5 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1.5 h-1.5 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
      </div>
    </div>
  );
}

