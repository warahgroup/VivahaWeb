import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface LandingHeaderProps {
  onGetStarted: () => void;
}

export function LandingHeader({ onGetStarted }: LandingHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

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
          <Button
            onClick={onGetStarted}
            data-testid="button-get-started-header"
            className="font-medium"
          >
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
}
