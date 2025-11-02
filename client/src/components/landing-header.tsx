import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

interface LandingHeaderProps {
  onGetStarted: () => void;
}

export function LandingHeader({ onGetStarted }: LandingHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md border-b"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary">
            Vivaha
          </h1>
          {/* Desktop actions */}
          <div className="hidden sm:flex items-center gap-3">
            <Button
              onClick={onGetStarted}
              data-testid="button-get-started-header"
              className="font-medium"
            >
              Get Started
            </Button>
          </div>

          {/* Mobile menu */}
          <div className="sm:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col gap-3 mt-8">
                  <Button
                    onClick={onGetStarted}
                    data-testid="button-get-started-header-mobile"
                    className="font-medium w-full"
                  >
                    Get Started
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
