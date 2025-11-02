import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme-provider";
import { Moon, Sun, LogOut } from "lucide-react";

interface ChatHeaderProps {
  onLogout: () => void;
}

export function ChatHeader({ onLogout }: ChatHeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="border-b bg-background/95 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        <h1 className="font-serif text-xl md:text-2xl font-bold text-primary">
          Vivaha Chat Bot
        </h1>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
            className="toggle-elevate"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onLogout}
            data-testid="button-logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}