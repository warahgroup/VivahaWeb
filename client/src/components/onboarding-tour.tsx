import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface OnboardingTourProps {
  onComplete: () => void;
}

const tourSteps = [
  {
    target: "chat-container",
    title: "Welcome to Vivaha Chat!",
    description: "This is your AI wedding planning assistant. Ask questions and get personalized recommendations based on your quiz responses.",
    position: "center" as const,
  },
  {
    target: "message-bot",
    title: "Long-press to Save",
    description: "Touch and hold any message (or right-click on desktop) to save it as a note, reminder, or confirmed task.",
    position: "top" as const,
  },
  {
    target: "button-theme-toggle",
    title: "Dark Mode Toggle",
    description: "Switch between light and dark themes for comfortable viewing any time of day.",
    position: "bottom" as const,
  },
];

export function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const step = tourSteps[currentStep];
    
    if (step.position === "center") {
      setPosition({
        top: window.innerHeight / 2,
        left: window.innerWidth / 2,
      });
    } else {
      const element = document.querySelector(`[data-testid="${step.target}"]`);
      if (element) {
        const rect = element.getBoundingClientRect();
        setPosition({
          top: step.position === "top" ? rect.top - 10 : rect.bottom + 10,
          left: rect.left + rect.width / 2,
        });
      }
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem("vivaha-onboarding-complete", "true");
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem("vivaha-onboarding-complete", "true");
    onComplete();
  };

  const step = tourSteps[currentStep];

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 animate-in fade-in" />
      <div
        className="fixed z-50 bg-popover border border-popover-border rounded-lg shadow-2xl p-6 max-w-sm animate-in fade-in slide-in-from-bottom-4"
        style={{
          left: `${position.left}px`,
          top: `${position.top}px`,
          transform: "translate(-50%, -50%)",
        }}
        data-testid="onboarding-tooltip"
      >
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-lg text-popover-foreground">
            {step.title}
          </h3>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleSkip}
            data-testid="button-skip-tour"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          {step.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            {currentStep + 1} of {tourSteps.length}
          </span>
          <Button
            onClick={handleNext}
            data-testid="button-tour-next"
          >
            {currentStep < tourSteps.length - 1 ? "Next" : "Got it!"}
          </Button>
        </div>
      </div>
    </>
  );
}
